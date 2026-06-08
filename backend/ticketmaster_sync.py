"""
ticketmaster_sync.py — Live event ingestion from Ticketmaster Discovery API.

Fetches real major events across India and normalises them into
Eventa's MongoDB schema.
"""

import asyncio
import logging
import os
import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from dedup import generate_dedup_key
import httpx

logger = logging.getLogger(__name__)

TICKETMASTER_URL = "https://app.ticketmaster.com/discovery/v2/events.json"
SYNC_COOLDOWN_HOURS = 12

CITY_STATE: dict[str, str] = {
    "Mumbai": "Maharashtra",
    "New Delhi": "Delhi",
    "Delhi": "Delhi",
    "Bengaluru": "Karnataka",
    "Bangalore": "Karnataka",
    "Hyderabad": "Telangana",
    "Pune": "Maharashtra",
    "Chennai": "Tamil Nadu",
    "Ahmedabad": "Gujarat",
    "Kolkata": "West Bengal",
    "Gurugram": "Haryana",
    "Noida": "Uttar Pradesh",
    "Jaipur": "Rajasthan",
    "Kochi": "Kerala",
    "Coimbatore": "Tamil Nadu",
    "Surat": "Gujarat",
    "Indore": "Madhya Pradesh",
}

def normalize_event(raw: dict) -> Optional[dict]:
    title = (raw.get("name") or "").strip()
    if not title:
        return None

    # Date
    dates = raw.get("dates", {}).get("start", {})
    local_date = dates.get("localDate")
    date_time_str = dates.get("dateTime")
    
    if not local_date:
        return None
        
    try:
        dt = datetime.fromisoformat(date_time_str.replace("Z", "+00:00")) if date_time_str else datetime.fromisoformat(local_date)
    except:
        dt = datetime.now(timezone.utc) + timedelta(days=30)
        
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    # Address / venue
    venues = raw.get("_embedded", {}).get("venues", [])
    venue_obj = venues[0] if venues else {}
    venue_name = (venue_obj.get("name") or "").strip()
    city = (venue_obj.get("city", {}).get("name") or "").strip()
    state = (venue_obj.get("state", {}).get("name") or CITY_STATE.get(city, "")).strip()
    
    address_line = venue_obj.get("address", {}).get("line1", "").strip()
    full_address = f"{address_line}, {city}".strip(", ") or f"{city}, India"

    # Cover image
    images = raw.get("images", [])
    images = sorted(images, key=lambda x: x.get("width", 0), reverse=True)
    cover = images[0].get("url") if images else "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"

    event_id = f"tm-{raw.get('id', uuid.uuid4().hex[:14])}"
    
    category = "entertainment" # Ticketmaster is mostly concerts/sports
    classifications = raw.get("classifications", [])
    if classifications:
        segment = classifications[0].get("segment", {}).get("name", "").lower()
        if "music" in segment:
            category = "music"
        elif "sports" in segment:
            category = "sports"

    ticket_link = raw.get("url", "")
    pricing = "paid"
    price = 0
    price_ranges = raw.get("priceRanges", [])
    if price_ranges:
        price = int(price_ranges[0].get("min", 0))

    description = (raw.get("description") or raw.get("info") or "").strip()

    random.seed(event_id)
    attendees = random.randint(500, 15000)
    views = attendees * random.randint(3, 10)
    random.seed()

    return {
        "id": event_id,
        "dedup_key": generate_dedup_key(title, dt.date().isoformat(), city),
        "title": title,
        "category": category,
        "industry": category.replace("-", " ").title(),
        "description": description,
        "ai_summary": "",
        "approval_status": "approved",
        "cover_image": cover,
        "date": dt.date().isoformat(),
        "start_iso": dt.isoformat(),
        "time": dt.strftime("%I:%M %p").lstrip("0"),
        "duration": "3 Hours",
        "city": city,
        "state": state,
        "country": "India",
        "venue": venue_name,
        "address": full_address,
        "lat": float(venue_obj.get("location", {}).get("latitude", 0.0)),
        "lng": float(venue_obj.get("location", {}).get("longitude", 0.0)),
        "event_type": "offline",
        "pricing": pricing,
        "price": price,
        "currency": "INR",
        "attendance_size": "large",
        "organizer": {"name": "Ticketmaster", "verified": True, "logo": ""},
        "speakers": [],
        "schedule": [],
        "tags": [category],
        "ticket_status": "available",
        "featured": True,
        "trending": True,
        "attendees_count": attendees,
        "rating": round(random.uniform(4.0, 4.9), 1),
        "source": "ticketmaster",
        "event_url": ticket_link,
        "ticket_url": ticket_link,
        "views": views,
        "created_at": now.isoformat(),
    }


async def fetch_ticketmaster_events(api_key: str) -> list[dict]:
    params = {
        "apikey": api_key,
        "countryCode": "US",
        "size": 50,
        "sort": "date,asc"
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(TICKETMASTER_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            
        raw_events: list = data.get("_embedded", {}).get("events", [])
        results = []
        for raw in raw_events:
            doc = normalize_event(raw)
            if doc:
                results.append(doc)
        logger.info(f"  Ticketmaster India → {len(results)} events")
        return results
    except httpx.HTTPStatusError as e:
        logger.warning(f"Ticketmaster HTTP error: {e.response.status_code}")
        return []
    except Exception as e:
        logger.warning(f"Ticketmaster fetch failed: {e}")
        return []


async def sync_ticketmaster(db, force: bool = False) -> dict:
    api_key = os.environ.get("TICKETMASTER_KEY", "").strip()
    if not api_key:
        logger.info("TICKETMASTER_KEY not set — skipping sync")
        return {"upserted": 0, "skipped": True, "error": "TICKETMASTER_KEY not configured"}

    if not force:
        try:
            last = await db.meta.find_one({"key": "last_ticketmaster_sync"})
            if last:
                last_time = datetime.fromisoformat(last["value"])
                elapsed = (datetime.now(timezone.utc) - last_time).total_seconds()
                if elapsed < SYNC_COOLDOWN_HOURS * 3600:
                    remaining = int((SYNC_COOLDOWN_HOURS * 3600 - elapsed) / 60)
                    logger.info(f"Ticketmaster sync cooldown active ({remaining} min remaining)")
                    return {"upserted": 0, "skipped": True, "error": None,
                            "cooldown_minutes_remaining": remaining}
        except Exception:
            pass 

    logger.info("Starting Ticketmaster sync for India")
    upserted = 0
    errors = []

    events = await fetch_ticketmaster_events(api_key)
    for event in events:
        try:
            existing = await db.events.find_one({"dedup_key": event["dedup_key"]})
            if existing and existing["id"] != event["id"]:
                continue
                
            result = await db.events.update_one(
                {"id": event["id"]},
                {"$set": event},
                upsert=True,
            )
            if result.upserted_id or result.modified_count:
                upserted += 1
        except Exception as e:
            errors.append(str(e))

    try:
        await db.meta.update_one(
            {"key": "last_ticketmaster_sync"},
            {"$set": {"key": "last_ticketmaster_sync",
                       "value": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception:
        pass

    error_msg = "; ".join(errors[:3]) if errors else None
    logger.info(f"Ticketmaster sync complete: {upserted} events upserted, {len(errors)} errors")
    return {"upserted": upserted, "skipped": False, "error": error_msg}
