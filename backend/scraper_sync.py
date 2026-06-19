"""
scraper_sync.py — Live event ingestion via web crawling & JSON-LD extraction.

Discovers event URLs from allevents.in, fetches the page content,
and extracts precise Schema.org JSON-LD data to normalize events into Eventa's MongoDB schema.
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
from traction_utils import extract_attendees_from_jsonld, extract_attendees_from_html
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# Fallback images matching serpapi_sync
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
    return f"live-{hex_id}"

async def fetch_urls(city: str) -> list[str]:
    """Crawl allevents.in city page to find event URLs using pagination."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    links = []
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            for page in range(1, 6):  # Scrape up to 5 pages
                url = f"https://allevents.in/{city}/all?page={page}"
                resp = await client.get(url, headers=headers)
                soup = BeautifulSoup(resp.text, "html.parser")
                
                page_links = []
                for a in soup.select(".event-card a"):
                    href = a.get("href", "")
                    if href and "allevents.in" in href:
                        page_links.append(href)
                        
                if not page_links:
                    break
                    
                links.extend(page_links)
                await asyncio.sleep(1)  # Pacing between pages
    except Exception as e:
        logger.warning(f"Failed to fetch urls for {city}: {e}")
    
    return list(set(links))

async def scrape_event_page(url: str, city: str) -> Optional[dict]:
    """Visit URL and extract JSON-LD."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            soup = BeautifulSoup(resp.text, "html.parser")
            
            ld_script = soup.find('script', type='application/ld+json')
            if not ld_script:
                return None
                
            try:
                data = json.loads(ld_script.string)
            except Exception:
                return None
                
            if isinstance(data, list):
                data = data[0]
                
            title = data.get("name")
            if not title:
                return None
                
            # Date
            start_date_str = data.get("startDate")
            now = datetime.now(timezone.utc)
            try:
                dt = datetime.fromisoformat(start_date_str)
            except:
                dt = now + timedelta(days=random.randint(1, 14))
                
            # Location
            loc = data.get("location", {})
            venue = "Online"
            address = city.title()
            if isinstance(loc, dict):
                venue = loc.get("name", venue)
                addr_obj = loc.get("address", {})
                if isinstance(addr_obj, dict):
                    address = addr_obj.get("streetAddress", address)
                elif isinstance(addr_obj, str):
                    address = addr_obj
                    
            # Pricing
            price = 0
            pricing = "free"
            offers = data.get("offers")
            direct_url = url
            
            if isinstance(offers, dict):
                p = offers.get("price")
                u = offers.get("url")
                if u and "allevents.in" not in u:
                    direct_url = u
                    
                if p and str(p) != "0":
                    pricing = "paid"
                    try: price = int(float(p))
                    except: pass
            elif isinstance(offers, list) and len(offers) > 0:
                p = offers[0].get("price")
                u = offers[0].get("url")
                if u and "allevents.in" not in u:
                    direct_url = u
                    
                if p and str(p) != "0":
                    pricing = "paid"
                    try: price = int(float(p))
                    except: pass
            
            # Organizer — extract the REAL organizer name
            org_name = extract_organizer_name(jsonld_data=data, soup=soup, source_url=url)
            
            # Extract org URL for direct linking
            org = data.get("organizer")
            org_url = None
            if isinstance(org, dict):
                org_url = org.get("url")
            elif isinstance(org, list) and len(org) > 0 and isinstance(org[0], dict):
                org_url = org[0].get("url")
                
            if org_url and "allevents.in" not in org_url and direct_url == url:
                direct_url = org_url
            
            # Also check the main event URL
            data_url = data.get("url")
            if data_url and "allevents.in" not in data_url and direct_url == url:
                direct_url = data_url
                
            img = data.get("image", IMG_DEFAULT[0])
            if isinstance(img, list) and img:
                img = img[0]
                
            desc = data.get("description", "")
            
            # Category inference
            category = infer_category(title, desc)
                
            event_id = _stable_id(url, title)
            # Extract REAL attendee count from source data
            attendees = extract_attendees_from_jsonld(data)
            if attendees == 0:
                attendees = extract_attendees_from_html(soup, source="scraper")
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
                "event_type": "offline",
                "pricing": pricing,
                "price": price,
                "currency": "INR",
                "attendance_size": "medium",
                "organizer": {"name": org_name, "verified": False, "logo": ""},
                "speakers": [],
                "schedule": [],
                "tags": [category],
                "ticket_status": "available",
                "featured": False,
                "trending": False,
                "attendees_count": attendees,
                "rating": 0,
                "source": "scraper",
                "event_url": direct_url,
                "ticket_url": direct_url,
                "views": 0,
                "created_at": now.isoformat(),
            }
    except Exception as e:
        logger.warning(f"Failed to scrape {url}: {e}")
        return None

async def sync_all_cities(db, force: bool = False) -> dict:
    """Orchestrates scraping flow."""
    if not force:
        try:
            last = await db.meta.find_one({"key": "last_scraper_sync"})
            if last:
                last_time = datetime.fromisoformat(last["value"])
                elapsed = (datetime.now(timezone.utc) - last_time).total_seconds()
                if elapsed < SYNC_COOLDOWN_HOURS * 3600:
                    remaining = int((SYNC_COOLDOWN_HOURS * 3600 - elapsed) / 60)
                    logger.info(f"Scraper cooldown active ({remaining} min remaining)")
                    return {"upserted": 0, "skipped": True, "error": None}
        except Exception:
            pass

    logger.info(f"Starting Scraper sync for {len(CITIES)} cities...")
    upserted = 0
    errors = []

    sem = asyncio.Semaphore(5)

    async def _process_url(url, city):
        async with sem:
            try:
                await asyncio.sleep(random.uniform(0.5, 1.5))
                event = await scrape_event_page(url, city)
                if not event:
                    return None
                    
                existing = await db.events.find_one({"dedup_key": event["dedup_key"]})
                if existing and existing["id"] != event["id"]:
                    return None
                    
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
                result = await db.events.update_one(
                    {"id": event["id"]},
                    {"$set": set_data, "$setOnInsert": set_on_insert},
                    upsert=True,
                )
                if result.upserted_id or result.modified_count:
                    return event["id"]
            except Exception as e:
                errors.append(str(e))
            return None

    tasks = []
    for city in CITIES:
        urls = await fetch_urls(city)
        logger.info(f"Discovered {len(urls)} events in {city}")
        for url in urls:
            tasks.append(_process_url(url, city))
            
    logger.info(f"Beginning concurrent scrape of {len(tasks)} events...")
    results = await asyncio.gather(*tasks)
    upserted = len([r for r in results if r])

    try:
        await db.meta.update_one(
            {"key": "last_scraper_sync"},
            {"$set": {"key": "last_scraper_sync", "value": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception:
        pass

    logger.info(f"Scraper sync complete: {upserted} events upserted")
    return {"upserted": upserted, "skipped": False, "error": None}
