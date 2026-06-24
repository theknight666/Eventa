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

from cities import CITY_COORDS, CITIES, CITY_STATE, CITY_ALIASES
from dedup import generate_dedup_key
from category_utils import infer_category
from organizer_utils import extract_organizer_name
from traction_utils import extract_attendees_from_jsonld, extract_attendees_from_html
from tenacity import retry, stop_after_attempt, wait_exponential
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Fallback images matching serpapi_sync
IMG_DEFAULT = ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"]

SYNC_COOLDOWN_HOURS = 6

def _stable_id(link: str, title: str, source_platform: str = "ae") -> str:
    # Use the link as the primary stable identifier. Fallback to title.
    key = link.strip() if link.strip() else title.strip()
    hex_id = uuid.uuid5(uuid.NAMESPACE_URL, key).hex[:14]
    if source_platform == "townscript":
        prefix = "ts"
    else:
        prefix = source_platform if source_platform in ("meetup", "eventbrite", "luma") else "ae"
    return f"{prefix}-{hex_id}"

def _detect_original_source(direct_url: str, url: str, data: dict, soup) -> tuple[str, str]:
    """Detect the original source platform and URL."""
    potential_urls = []
    if direct_url and direct_url != url and "allevents.in" not in direct_url:
        potential_urls.append(direct_url)
        
    data_url = data.get("url")
    if data_url and isinstance(data_url, str) and "allevents.in" not in data_url:
        potential_urls.append(data_url)
        
    org = data.get("organizer", {})
    if isinstance(org, dict):
        org_url = org.get("url")
        if org_url and isinstance(org_url, str) and "allevents.in" not in org_url:
            potential_urls.append(org_url)
    elif isinstance(org, list) and len(org) > 0 and isinstance(org[0], dict):
        org_url = org[0].get("url")
        if org_url and isinstance(org_url, str) and "allevents.in" not in org_url:
            potential_urls.append(org_url)
            
    offers = data.get("offers")
    if isinstance(offers, dict):
        offer_url = offers.get("url")
        if offer_url and isinstance(offer_url, str) and "allevents.in" not in offer_url:
            potential_urls.append(offer_url)
            
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "allevents.in" not in href:
            if any(p in href for p in ["meetup.com", "eventbrite.com", "lu.ma", "townscript.com", "insider.in", "bookmyshow.com", "ticketmaster"]):
                potential_urls.append(href)
                
    for u in potential_urls:
        u_lower = u.lower()
        if "meetup.com" in u_lower:
            return "meetup", u
        elif "eventbrite.com" in u_lower or "eventbrite.co" in u_lower:
            return "eventbrite", u
        elif "lu.ma" in u_lower or "luma.com" in u_lower:
            return "luma", u
        elif "townscript.com" in u_lower:
            return "townscript", u
        elif "insider.in" in u_lower:
            return "insider", u
        elif "bookmyshow.com" in u_lower:
            return "bookmyshow", u
            
    if potential_urls:
        return "scraper", potential_urls[0]
        
    return "scraper", url

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def fetch_urls(city: str) -> list[str]:
    """Crawl allevents.in city page to find event URLs using pagination."""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    links = []
    
    aliases = CITY_ALIASES.get(city, [city])
    
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            for alias in aliases:
                page = 1
                while True:
                    url = f"https://allevents.in/{alias}/all?page={page}"
                    resp = await client.get(url, headers=headers)
                    
                    # If it redirected to a page without "?page=", it means the paginated page doesn't exist
                    if "?page=" not in str(resp.url) and page > 1:
                        logger.info(f"[{alias}] Redirected to {resp.url}, stopping pagination.")
                        break
                        
                    soup = BeautifulSoup(resp.text, "html.parser")
                    
                    page_links = []
                    for a in soup.select(".event-card a"):
                        href = a.get("href", "")
                        if href and "allevents.in" in href:
                            page_links.append(href)
                            
                    if not page_links:
                        logger.info(f"[{alias}] No more events found on page {page}. Stopping pagination.")
                        break
                        
                    # Check if we are stuck in a redirect loop returning the same page
                    new_links = [l for l in page_links if l not in links]
                    if not new_links and page > 1:
                        logger.info(f"[{alias}] Redirect loop detected (no new links on page {page}). Stopping.")
                        break
                        
                    links.extend(new_links)
                    
                    if page >= 1000:
                        logger.warning(f"[{alias}] Reached maximum safety limit of 1000 pages. Stopping.")
                        break
                        
                    page += 1
                    await asyncio.sleep(0.1)  # Speed up pagination
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
            
            # Check offers for direct URL overrides
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
            
            # Detect original source and override direct_url
            source_platform, original_url = _detect_original_source(direct_url, url, data, soup)
            
            # Organizer — extract the REAL organizer name using the original_url
            org_name = extract_organizer_name(jsonld_data=data, soup=soup, source_url=original_url)
                
            img = data.get("image", IMG_DEFAULT[0])
            if isinstance(img, list) and img:
                img = img[0]
                
            desc = data.get("description", "")
            
            # Category inference
            category = infer_category(title, desc)
                
            event_id = _stable_id(original_url, title, source_platform)
            # Extract REAL attendee count from source data
            attendees = extract_attendees_from_jsonld(data)
            if attendees == 0:
                attendees = extract_attendees_from_html(soup, source=source_platform)
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
                "source": source_platform,
                "event_url": original_url,
                "ticket_url": original_url,
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

    sem = asyncio.Semaphore(20)

    async def _process_url(url, city):
        async with sem:
            try:
                await asyncio.sleep(0.1)
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
