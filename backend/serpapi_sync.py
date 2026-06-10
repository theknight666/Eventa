"""
serpapi_sync.py — Live event ingestion from SerpApi's Google Events engine.

Fetches real events across major Indian cities and normalises them into
Eventa's MongoDB schema.  Called on server startup (with a 6-hour cooldown)
and via the /api/admin/sync endpoint.
"""

import asyncio
import logging
import os
import re
import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from dedup import generate_dedup_key
import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Static lookup tables
# ---------------------------------------------------------------------------

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

# Premium cover images keyed by category
IMG_FALLBACK: dict[str, list[str]] = {
    "startup": [
        "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1559136555-9ce7b5fda2d6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "technology": [
        "https://images.unsplash.com/photo-1558008258-3256797b43f3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "business": [
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "ai": [
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "music": [
        "https://images.pexels.com/photos/13230484/pexels-photo-13230484.jpeg?auto=compress&cs=tinysrgb&w=1400",
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "networking": [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "finance": [
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "healthcare": [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1538108149393-fbbd81895907?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "education": [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "marketing": [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "sports": [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
    "entertainment": [
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    ],
}
IMG_DEFAULT = ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"]

# Indian cities to query × (search term, Eventa category)
CITIES = [
    "Mumbai", "New Delhi", "Bengaluru", "Hyderabad",
    "Pune", "Chennai", "Ahmedabad", "Kolkata",
    "Jaipur", "Gurugram", "Noida", "Surat",
]

QUERIES: list[tuple[str, str]] = [
    ("startup conference summit",   "startup"),
    ("technology conference summit","technology"),
    ("business summit expo",        "business"),
    ("AI machine learning summit",  "ai"),
    ("music festival concert",      "music"),
    ("professional networking",     "networking"),
    ("finance investment summit",   "finance"),
    ("healthcare medical conference","healthcare"),
]

SERPAPI_URL = "https://serpapi.com/search.json"
SYNC_COOLDOWN_HOURS = 6          # minimum gap between automatic syncs


# ---------------------------------------------------------------------------
# Date parsing
# ---------------------------------------------------------------------------

def _parse_date(when_str: str) -> Optional[datetime]:
    """Parse a SerpApi `date.when` string (e.g. 'Sat, Jun 7 · 9 AM') to UTC datetime."""
    if not when_str:
        return None
    # Strip time-range suffixes like " – 6 PM" and dot separators
    cleaned = re.split(r'[-–—]', when_str)[0].replace("·", " ").strip()
    try:
        import dateparser
        dt = dateparser.parse(
            cleaned,
            settings={
                "PREFER_DATES_FROM": "future",
                "TIMEZONE": "Asia/Kolkata",
                "TO_TIMEZONE": "UTC",
                "RETURN_AS_TIMEZONE_AWARE": True,
            },
        )
        return dt
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Normaliser
# ---------------------------------------------------------------------------

def _stable_id(link: str, title: str) -> str:
    """Generate a deterministic event ID from URL (or title as fallback)."""
    key = link.strip() if link.strip() else title.strip()
    hex_id = uuid.uuid5(uuid.NAMESPACE_URL, key).hex[:14]
    return f"live-{hex_id}"


def _infer_pricing(ticket_info: list) -> tuple[str, int]:
    """Return (pricing_label, price_inr) from ticket_info array."""
    for ti in ticket_info:
        info = (ti.get("info") or "").lower()
        if "free" in info:
            return "free", 0
        # look for a rupee amount
        import re
        m = re.search(r"[\u20b9₹rs\.]\s*(\d[\d,]*)", info, re.IGNORECASE)
        if m:
            price = int(m.group(1).replace(",", ""))
            return "paid", price
        if any(c.isdigit() for c in info):
            return "paid", 0
    return "free", 0


def normalize_event(raw: dict, city: str, category: str) -> Optional[dict]:
    """Map a SerpApi events_results item → Eventa event document."""
    title = (raw.get("title") or "").strip()
    if not title:
        return None

    # Date
    when = raw.get("date", {}).get("when", "")
    dt = _parse_date(when)
    now = datetime.now(timezone.utc)
    if dt is None or dt < now:
        # If date is unclear/past, place it 30 days ahead as a best guess
        dt = now + timedelta(days=30)

    # Address / venue
    addr_arr: list = raw.get("address", [])
    venue_obj: dict = raw.get("venue", {}) or {}
    venue_name = (venue_obj.get("name") or "").strip()
    if not venue_name and addr_arr:
        venue_name = addr_arr[0].strip()
    full_address = ", ".join(a.strip() for a in addr_arr if a.strip()) or f"{city}, India"

    # State lookup
    state = CITY_STATE.get(city, "")

    # Cover image
    event_id = _stable_id(raw.get("link", ""), title)
    
    # Always use premium curated images instead of low-quality thumbnails
    random.seed(event_id)
    images_list = IMG_FALLBACK.get(category, IMG_DEFAULT)
    cover = random.choice(images_list)
    random.seed()

    # Ticket / pricing
    ticket_info: list = raw.get("ticket_info") or []
    pricing, price = _infer_pricing(ticket_info)
    ticket_link = ticket_info[0].get("link", "") if ticket_info else ""

    # Description
    description = (raw.get("description") or "").strip()

    attendees = random.randint(15, 850)
    views = attendees * random.randint(3, 12)

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
        "duration": "Full day",
        "city": city,
        "state": state,
        "country": "India",
        "venue": venue_name,
        "address": full_address,
        "lat": 0.0,
        "lng": 0.0,
        "event_type": "offline",
        "pricing": pricing,
        "price": price,
        "currency": "INR",
        "attendance_size": "medium",
        "organizer": {"name": "External Organizer", "verified": False, "logo": ""},
        "speakers": [],
        "schedule": [],
        "tags": [category],
        "ticket_status": "available",
        "featured": False,
        "trending": False,
        "attendees_count": attendees,
        "rating": round(random.uniform(3.8, 4.9), 1),
        "source": "serpapi",
        "event_url": raw.get("link", ""),
        "ticket_url": ticket_link,
        "views": views,
        "created_at": now.isoformat(),
    }


# ---------------------------------------------------------------------------
# Fetcher
# ---------------------------------------------------------------------------

async def fetch_events_for_query(
    city: str, query: str, category: str, api_key: str
) -> list[dict]:
    """Call SerpApi for one city + query pair and return normalised events."""
    params = {
        "engine": "google_events",
        "q": f"{query} in {city} India",
        "hl": "en",
        "gl": "in",
        "api_key": api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(SERPAPI_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        raw_events: list = data.get("events_results", [])
        results = []
        for raw in raw_events:
            doc = normalize_event(raw, city, category)
            if doc:
                results.append(doc)
        logger.info(f"  SerpApi [{city}][{query}] → {len(results)} events")
        return results
    except httpx.HTTPStatusError as e:
        logger.warning(f"SerpApi HTTP error for '{query} in {city}': {e.response.status_code}")
        return []
    except Exception as e:
        logger.warning(f"SerpApi fetch failed for '{query} in {city}': {e}")
        return []


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

async def sync_all_cities(db, force: bool = False) -> dict:
    """
    Fetch live events from SerpApi for all cities × queries and upsert into MongoDB.

    Returns a summary dict: {"upserted": int, "skipped": bool, "error": str|None}
    """
    api_key = os.environ.get("SERPAPI_KEY", "").strip()
    if not api_key:
        logger.info("SERPAPI_KEY not set — skipping live event sync")
        return {"upserted": 0, "skipped": True, "error": "SERPAPI_KEY not configured"}

    # Enforce cooldown to conserve API credits
    if not force:
        try:
            last = await db.meta.find_one({"key": "last_serpapi_sync"})
            if last:
                last_time = datetime.fromisoformat(last["value"])
                elapsed = (datetime.now(timezone.utc) - last_time).total_seconds()
                if elapsed < SYNC_COOLDOWN_HOURS * 3600:
                    remaining = int((SYNC_COOLDOWN_HOURS * 3600 - elapsed) / 60)
                    logger.info(f"SerpApi sync cooldown active ({remaining} min remaining)")
                    return {"upserted": 0, "skipped": True, "error": None,
                            "cooldown_minutes_remaining": remaining}
        except Exception:
            pass  # If meta check fails, proceed anyway

    logger.info(f"Starting SerpApi sync: {len(CITIES)} cities × {len(QUERIES)} queries")
    upserted = 0
    errors = []

    for city in CITIES:
        for query, category in QUERIES:
            events = await fetch_events_for_query(city, query, category, api_key)
            for event in events:
                try:
                    # check if a duplicate already exists with a different id
                    existing = await db.events.find_one({"dedup_key": event["dedup_key"]})
                    if existing and existing["id"] != event["id"]:
                        # A duplicate exists (maybe from an organizer or a different URL).
                        # Skip adding this live event to avoid duplicates.
                        continue
                        
                    set_data = {k: v for k, v in event.items() if k not in ("attendees_count", "views", "created_at")}
                    set_on_insert = {
                        "attendees_count": event["attendees_count"],
                        "views": event["views"],
                        "created_at": event["created_at"],
                    }
                    result = await db.events.update_one(
                        {"id": event["id"]},
                        {"$set": set_data, "$setOnInsert": set_on_insert},
                        upsert=True,
                    )
                    if result.upserted_id or result.modified_count:
                        upserted += 1
                except Exception as e:
                    errors.append(str(e))
            # Gentle pacing — avoid hammering SerpApi
            await asyncio.sleep(0.3)

    # Record sync timestamp
    try:
        await db.meta.update_one(
            {"key": "last_serpapi_sync"},
            {"$set": {"key": "last_serpapi_sync",
                       "value": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception:
        pass

    error_msg = "; ".join(errors[:3]) if errors else None
    logger.info(f"SerpApi sync complete: {upserted} events upserted, {len(errors)} errors")
    return {"upserted": upserted, "skipped": False, "error": error_msg}
