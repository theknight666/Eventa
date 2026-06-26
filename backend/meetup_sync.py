"""
meetup_sync.py — Live event ingestion via web crawling & JSON-LD extraction for Meetup.

Discovers event URLs from Meetup city pages, fetches the page content,
and extracts precise Schema.org JSON-LD data to normalize events into Eventa's MongoDB schema.
"""

import asyncio
import logging
import json
import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from cities import CITY_COORDS, CITIES, CITY_STATE, CITY_ALIASES
from dedup import generate_dedup_key
from category_utils import infer_category
from organizer_utils import extract_organizer_name
from traction_utils import extract_attendees_from_jsonld, extract_attendees_from_html
from tenacity import retry, stop_after_attempt, wait_exponential
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# Fallback images matching scraper_sync
IMG_DEFAULT = ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"]

SYNC_COOLDOWN_HOURS = 6

def _stable_id(link: str, title: str) -> str:
    key = link.strip() if link.strip() else title.strip()
    hex_id = uuid.uuid5(uuid.NAMESPACE_URL, key).hex[:14]
    return f"meetup-{hex_id}"

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def fetch_meetup_urls(city: str) -> list[str]:
    """Crawl Meetup city page with multiple keywords to find all event URLs."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
    links = set()
    keywords = [
        "", "tech", "business", "health", "music", "art", "education", "social", "sports", 
        "food", "drink", "party", "network", "club", "fitness", "yoga", "language", "culture", 
        "writing", "design", "data", "ai", "crypto", "spiritual", "meditation", "community", 
        "meetup", "online", "workshop", "class", "free", "weekend", "fun", "friends", "startup", 
        "investor", "marketing", "sales", "women", "men", "singles", "dating", "career", "jobs", 
        "hiring", "coffee", "chai", "tea", "books", "reading", "movie", "film", "comedy", 
        "standup", "theater", "dance", "photography", "outdoors", "hiking", "adventure", 
        "travel", "pet", "dog", "cat", "gaming", "board games", "video games", "esports", 
        "vr", "ar", "robotics", "engineering", "science", "math", "history", "philosophy", 
        "psychology", "self-improvement", "leadership", "management", "entrepreneurship", 
        "real estate", "finance", "investing", "trading", "stocks", "options", "forex", 
        "taxes", "accounting", "legal", "law", "politics", "activism", "volunteer", 
        "charity", "nonprofit", "sustainability", "environment", "climate", "nature", 
        "gardening", "farming", "agriculture", "cooking", "baking", "vegan", "vegetarian", 
        "keto", "paleo", "gluten-free", "diet", "nutrition", "weight loss", "martial arts"
    ]
    aliases = CITY_ALIASES.get(city, [city])
    
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            for alias in aliases:
                for keyword in keywords:
                    for page in range(1, 51): # Fetch up to 50 pages per keyword
                        url = f"https://www.meetup.com/find/?location=in--{alias}&source=EVENTS&keywords={keyword}&page={page}"
                        resp = await client.get(url, headers=headers)
                        soup = BeautifulSoup(resp.text, "html.parser")
                        
                        # Track if we found events on this page
                        found_on_page = False
                        
                        # 1. Parse a tags
                        for a in soup.find_all("a"):
                            href = a.get("href", "")
                            if href and "/events/" in href and "meetup.com" in href:
                                clean_url = href.split("?")[0]
                                if clean_url not in links:
                                    links.add(clean_url)
                                    found_on_page = True
                            
                        # 2. Parse __APOLLO_STATE__ for hidden/loaded events
                        script = soup.find("script", id="__NEXT_DATA__")
                        if script:
                            try:
                                data = json.loads(script.string)
                                apollo = data.get("props", {}).get("pageProps", {}).get("__APOLLO_STATE__", {})
                                for k, v in apollo.items():
                                    if k.startswith("Event:"):
                                        event_url = v.get("eventUrl")
                                        if event_url:
                                            eu = event_url.split("?")[0]
                                            if eu not in links:
                                                links.add(eu)
                                                found_on_page = True
                            except Exception as e:
                                logger.warning(f"Error parsing apollo state for {city} - {keyword}: {e}")
                                
                        if not found_on_page:
                            break
                            
                        await asyncio.sleep(0.5)
    except Exception as e:
        logger.warning(f"Failed to fetch urls for {city} from meetup: {e}")
    
    return list(links)

async def scrape_meetup_event(url: str, city: str) -> Optional[dict]:
    """Visit URL and extract JSON-LD."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            soup = BeautifulSoup(resp.text, "html.parser")
            
            ld_scripts = soup.find_all('script', type='application/ld+json')
            event_data = None
            
            for ld in ld_scripts:
                try:
                    data = json.loads(ld.string)
                    if isinstance(data, list):
                        for item in data:
                            if 'Event' in item.get('@type', ''):
                                event_data = item
                                break
                    elif 'Event' in data.get('@type', ''):
                        event_data = data
                except Exception:
                    continue
                if event_data:
                    break
                    
            if not event_data:
                return None
                
            title = event_data.get("name")
            if not title:
                return None
                
            # Date
            start_date_str = event_data.get("startDate")
            now = datetime.now(timezone.utc)
            try:
                dt = datetime.fromisoformat(start_date_str)
            except:
                dt = now + timedelta(days=random.randint(1, 14))
                
            # Location
            loc = event_data.get("location", {})
            venue = "Online"
            address = city.title()
            event_type = "offline"
            
            # Meetup can be online or offline
            if event_data.get("eventAttendanceMode") == "https://schema.org/OnlineEventAttendanceMode":
                event_type = "online"
            elif event_data.get("eventAttendanceMode") == "https://schema.org/MixedEventAttendanceMode":
                event_type = "hybrid"
                
            if isinstance(loc, dict):
                if loc.get("@type") == "VirtualLocation":
                    venue = "Online Event"
                    event_type = "online"
                else:
                    venue = loc.get("name", venue)
                    addr_obj = loc.get("address", {})
                    if isinstance(addr_obj, dict):
                        address = addr_obj.get("streetAddress", address)
                        address_locality = addr_obj.get("addressLocality", "")
                        if not address and address_locality:
                            address = address_locality
                    elif isinstance(addr_obj, str):
                        address = addr_obj
                        
            # Pricing
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
            
            # Organizer — extract the REAL organizer name
            org_name = extract_organizer_name(jsonld_data=event_data, soup=soup, source_url=url)
                
            img = event_data.get("image", IMG_DEFAULT[0])
            if isinstance(img, list) and img:
                img = img[0]
                
            desc = event_data.get("description", "")
            
            # Category inference
            category = infer_category(title, desc)
                
            event_id = _stable_id(url, title)
            # Extract REAL attendee count from source data
            attendees = extract_attendees_from_jsonld(event_data)
            if attendees == 0:
                attendees = extract_attendees_from_html(soup, source="meetup")
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
                "attendance_size": "small" if attendees < 50 else "medium",
                "organizer": {"name": org_name, "verified": False, "logo": ""},
                "speakers": [],
                "schedule": [],
                "tags": [category],
                "ticket_status": "available",
                "featured": False,
                "trending": False,
                "attendees_count": attendees,
                "rating": 0,
                "source": "meetup",
                "event_url": url,
                "ticket_url": url,
                "views": 0,
                "created_at": now.isoformat(),
            }
    except Exception as e:
        logger.warning(f"Failed to scrape {url}: {e}")
        return None

async def sync_meetup_cities(db, force: bool = False) -> dict:
    """Orchestrates scraping flow for Meetup."""
    if not force:
        try:
            last = await db.meta.find_one({"key": "last_meetup_sync"})
            if last:
                last_time = datetime.fromisoformat(last["value"])
                elapsed = (datetime.now(timezone.utc) - last_time).total_seconds()
                if elapsed < SYNC_COOLDOWN_HOURS * 3600:
                    remaining = int((SYNC_COOLDOWN_HOURS * 3600 - elapsed) / 60)
                    logger.info(f"Meetup Scraper cooldown active ({remaining} min remaining)")
                    return {"upserted": 0, "skipped": True, "error": None}
        except Exception:
            pass

    logger.info(f"Starting Meetup sync for {len(CITIES)} cities...")
    upserted = 0
    errors = []

    sem = asyncio.Semaphore(5)

    async def _process_url(url, city):
        async with sem:
            try:
                await asyncio.sleep(random.uniform(0.5, 1.5))
                event = await scrape_meetup_event(url, city)
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
                    
                set_data = {k: v for k, v in event.items() if k not in ("attendees_count", "views", "created_at", "trending")}
                set_on_insert = {
                    "attendees_count": event["attendees_count"],
                    "views": event["views"],
                    "created_at": event["created_at"],
                    "trending": event.get("trending", False),
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

    for city in CITIES:
        urls = await fetch_meetup_urls(city)
        logger.info(f"Discovered {len(urls)} Meetup events in {city}")
        city_tasks = [_process_url(url, city) for url in urls]
        logger.info(f"Beginning concurrent Meetup scrape of {len(city_tasks)} events for {city}...")
        results = await asyncio.gather(*city_tasks)
        upserted += len([r for r in results if r])

    try:
        await db.meta.update_one(
            {"key": "last_meetup_sync"},
            {"$set": {"key": "last_meetup_sync", "value": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
    except Exception:
        pass

    logger.info(f"Meetup sync complete: {upserted} events upserted")
    return {"upserted": upserted, "skipped": False, "error": None}
