"""
luma_sync.py — Live event ingestion via web crawling for Luma.
"""

import asyncio
import logging
import json
import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from cities import CITY_COORDS
from dedup import generate_dedup_key
from category_utils import infer_category
from organizer_utils import extract_organizer_name
from traction_utils import extract_attendees_from_jsonld
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

IMG_DEFAULT = ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"]

CITY_STATE = {
    "Mumbai": "Maharashtra", "New Delhi": "Delhi", "Bengaluru": "Karnataka",
    "Hyderabad": "Telangana", "Pune": "Maharashtra", "Chennai": "Tamil Nadu",
    "Ahmedabad": "Gujarat", "Kolkata": "West Bengal", "Gurugram": "Haryana",
    "Noida": "Uttar Pradesh", "Jaipur": "Rajasthan", "Surat": "Gujarat",
    "Indore": "Madhya Pradesh", "Kochi": "Kerala", "Chandigarh": "Chandigarh",
    "Lucknow": "Uttar Pradesh", "Varanasi": "Uttar Pradesh", "Goa": "Goa",
    "Nagpur": "Maharashtra", "Vadodara": "Gujarat", "Coimbatore": "Tamil Nadu"
}

CITIES = [
    "mumbai", "bengaluru", "new-delhi", "pune", "hyderabad", "chennai",
    "kolkata", "ahmedabad", "jaipur", "gurugram", "noida", "surat",
    "indore", "kochi", "chandigarh", "lucknow", "varanasi", "goa",
    "nagpur", "vadodara", "coimbatore"
]

SYNC_COOLDOWN_HOURS = 6

def _stable_id(link: str, title: str) -> str:
    key = link.strip() if link.strip() else title.strip()
    hex_id = uuid.uuid5(uuid.NAMESPACE_URL, key).hex[:14]
    return f"luma-{hex_id}"

async def fetch_luma_events_for_city(city: str) -> list[dict]:
    """Crawl Luma city page to extract JSON-LD and NEXT_DATA event items directly."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
    events_data = []
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            url = f"https://lu.ma/{city}"
            resp = await client.get(url, headers=headers)
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # 1. Parse JSON-LD (if any)
            lds = soup.find_all('script', type='application/ld+json')
            for ld in lds:
                try:
                    data = json.loads(ld.string)
                    if isinstance(data, list):
                        for item in data:
                            if item.get('@type') == 'Event':
                                events_data.append(item)
                    elif isinstance(data, dict):
                        if data.get('@type') == 'Event':
                            events_data.append(data)
                        elif 'itemListElement' in data:
                            for el in data['itemListElement']:
                                if 'item' in el:
                                    item = el['item']
                                    if isinstance(item, dict) and item.get('@type') == 'Event':
                                        events_data.append(item)
                except Exception:
                    pass
                    
            # 2. Parse __NEXT_DATA__
            script = soup.find('script', id='__NEXT_DATA__')
            if script:
                try:
                    data = json.loads(script.string)
                    events = data.get('props', {}).get('pageProps', {}).get('initialData', {}).get('data', {}).get('events', [])
                    for ev in events:
                        # Append as a special wrapped dict to indicate it's from NEXT_DATA
                        events_data.append({"__luma_native": True, "data": ev})
                except Exception as e:
                    logger.warning(f"Error parsing luma NEXT_DATA: {e}")
                    
    except Exception as e:
        logger.warning(f"Failed to fetch urls for {city} from luma: {e}")
    
    return events_data

async def scrape_luma_event(event_data: dict, city: str) -> Optional[dict]:
    """Format Luma JSON-LD or NEXT_DATA to Eventa schema."""
    try:
        now = datetime.now(timezone.utc)
        
        # Handle __NEXT_DATA__ native Luma event format
        if event_data.get("__luma_native"):
            ev = event_data["data"]
            title = ev.get("name")
            if not title: return None
            
            url = f"https://lu.ma/{ev.get('url')}" if ev.get("url") else ""
            dt_str = ev.get("start_at")
            try:
                dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            except:
                dt = now + timedelta(days=random.randint(1, 14))
                
            venue = "Luma Venue"
            address = city.title()
            event_type = "offline"
            
            geo = ev.get("geo_address_info", {})
            if geo:
                venue = geo.get("address", venue)
                address = geo.get("full_address", address)
                
            if ev.get("location_type") == "online":
                event_type = "online"
                venue = "Online Event"
                
            price = 0
            pricing = "free"
            ticket_info = ev.get("ticket_info", {})
            if ticket_info and not ticket_info.get("is_free"):
                pricing = "paid"
                cents = ticket_info.get("price", {}).get("cents", 0)
                if cents:
                    price = int(cents / 100)
                    
            img = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"
            if ev.get("social_image_url"):
                img = ev.get("social_image_url")
                
            desc = ""
            
            hosts = ev.get("hosts", [])
            org_name = hosts[0].get("name", "Luma Host") if hosts else "Luma Host"
            attendees = ev.get("guest_count", 0)
            
        else:
            # Handle standard JSON-LD
            title = event_data.get("name")
            if not title: return None
            url = event_data.get("url", "")
            start_date_str = event_data.get("startDate")
            try: dt = datetime.fromisoformat(start_date_str)
            except: dt = now + timedelta(days=random.randint(1, 14))
                
            loc = event_data.get("location", {})
            venue = "Luma Venue"
            address = city.title()
            event_type = "offline"
            
            if event_data.get("eventAttendanceMode") == "https://schema.org/OnlineEventAttendanceMode":
                event_type = "online"
                venue = "Online Event"
            
            if isinstance(loc, dict):
                if loc.get("@type") == "VirtualLocation":
                    venue = "Online Event"
                    event_type = "online"
                else:
                    venue = loc.get("name", venue)
                    addr_obj = loc.get("address", {})
                    if isinstance(addr_obj, dict):
                        address = addr_obj.get("streetAddress", address)
                        if not address: address = addr_obj.get("addressLocality", city.title())
                    elif isinstance(addr_obj, str): address = addr_obj
                        
            price = 0
            pricing = "free"
            offers = event_data.get("offers")
            if isinstance(offers, dict):
                p = offers.get("price")
                if p and str(p) != "0":
                    pricing = "paid"
                    try: price = int(float(p))
                    except: pass
            elif isinstance(offers, list) and len(offers) > 0:
                p = offers[0].get("price")
                if p and str(p) != "0":
                    pricing = "paid"
                    try: price = int(float(p))
                    except: pass
            
            org_name = extract_organizer_name(jsonld_data=event_data, source_url=url)
            img = event_data.get("image", IMG_DEFAULT[0])
            if isinstance(img, list) and img: img = img[0]
            desc = event_data.get("description", "")
            attendees = extract_attendees_from_jsonld(event_data)
            
        category = infer_category(title, desc)
        event_id = _stable_id(url, title)
        
        formatted_city = city.replace("-", " ").title()
        
        lat, lng = CITY_COORDS.get(formatted_city, (0.0, 0.0))
        
        return {
            "id": event_id,
            "dedup_key": generate_dedup_key(title, dt.date().isoformat(), formatted_city),
            "title": title,
            "category": category,
            "industry": category.replace("-", " ").title(),
            "description": desc,
            "ai_summary": "",
            "approval_status": "approved",
            "cover_image": img,
            "date": dt.date().isoformat(),
            "start_iso": dt.isoformat(),
            "time": dt.strftime("%I:%M %p").lstrip("0"),
            "duration": "Evening",
            "city": formatted_city,
            "state": CITY_STATE.get(formatted_city, ""),
            "country": "India",
            "venue": venue,
            "address": address,
            "lat": lat, "lng": lng,
            "location": {"type": "Point", "coordinates": [lng, lat]},
            "event_type": event_type,
            "pricing": pricing,
            "price": price,
            "currency": "INR",
            "attendance_size": "small",
            "organizer": {"name": org_name, "verified": False, "logo": ""},
            "speakers": [],
            "schedule": [],
            "tags": [category],
            "ticket_status": "available",
            "featured": False,
            "trending": False,
            "attendees_count": attendees,
            "rating": 0,
            "source": "luma",
            "event_url": url,
            "ticket_url": url,
            "views": 0,
            "created_at": now.isoformat(),
        }
    except Exception as e:
        logger.warning(f"Failed to parse luma event: {e}")
        return None

async def sync_luma_cities(db, force: bool = False) -> dict:
    if not force:
        try:
            last = await db.meta.find_one({"key": "last_luma_sync"})
            if last:
                last_time = datetime.fromisoformat(last["value"])
                elapsed = (datetime.now(timezone.utc) - last_time).total_seconds()
                if elapsed < SYNC_COOLDOWN_HOURS * 3600:
                    remaining = int((SYNC_COOLDOWN_HOURS * 3600 - elapsed) / 60)
                    logger.info(f"Luma Scraper cooldown active ({remaining} min remaining)")
                    return {"upserted": 0, "skipped": True, "error": None}
        except Exception:
            pass

    logger.info(f"Starting Luma sync for {len(CITIES)} cities...")
    upserted = 0
    errors = []

    for city in CITIES:
        try:
            await asyncio.sleep(random.uniform(1.0, 2.0))
            events_data = await fetch_luma_events_for_city(city)
            logger.info(f"Discovered {len(events_data)} Luma events in {city}")
            for item in events_data:
                event = await scrape_luma_event(item, city)
                if not event:
                    continue
                
                existing = await db.events.find_one({"dedup_key": event["dedup_key"]})
                if existing and existing["id"] != event["id"]:
                    continue
                    
                existing_event = await db.events.find_one({"id": event["id"]})
                if not existing_event:
                    from ai_category import infer_category_ai
                    cat = await infer_category_ai(event["title"], event["description"])
                    event["category"] = cat
                    event["industry"] = cat.replace("-", " ").title()
                    event["tags"] = [cat]
                else:
                    event["category"] = existing_event.get("category", event["category"])
                    event["industry"] = existing_event.get("industry", event["industry"])
                    event["tags"] = existing_event.get("tags", event["tags"])
                    
                set_data = {k: v for k, v in event.items() if k not in ("attendees_count", "views", "created_at")}
                set_on_insert = {
                    "attendees_count": event["attendees_count"],
                    "views": event["views"],
                    "created_at": event["created_at"],
                }
                await db.events.update_one(
                    {"id": event["id"]},
                    {"$set": set_data, "$setOnInsert": set_on_insert},
                    upsert=True,
                )
                upserted += 1
        except Exception as e:
            errors.append(str(e))

    try:
        await db.meta.update_one(
            {"key": "last_luma_sync"},
            {"$set": {"key": "last_luma_sync", "value": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception:
        pass

    logger.info(f"Luma sync complete: {upserted} events upserted")
    return {"upserted": upserted, "skipped": False, "error": None}
