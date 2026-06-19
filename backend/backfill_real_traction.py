"""
backfill_real_traction.py — One-time script to fix existing fake data.

Resets all scraped events in the database to use REAL data:
- attendees_count → actual Eventa registration count
- rating → computed traction score from real signals
- views → actual view count from db.views collection

Run this once after deploying the updated scrapers.

Usage:
    python backfill_real_traction.py
"""

import asyncio
import os
import logging
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def backfill():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'eventa')]
    
    from traction_utils import compute_traction_score
    
    # Only process scraped events (not organizer-created ones)
    scraped_sources = ["scraper", "meetup", "eventbrite", "luma", "townscript"]
    
    total = await db.events.count_documents({"source": {"$in": scraped_sources}})
    logger.info(f"Found {total} scraped events to backfill")
    
    updated = 0
    cursor = db.events.find({"source": {"$in": scraped_sources}})
    
    async for event in cursor:
        event_id = event["id"]
        
        # 1. Get REAL registration count from Eventa
        real_registrations = await db.registrations.count_documents({"event_id": event_id})
        
        # 2. Get REAL view count from Eventa
        real_views = await db.views.count_documents({"event_id": event_id})
        
        # 3. Compute traction score from real data
        is_verified = event.get("organizer", {}).get("verified", False)
        source = event.get("source", "")
        
        score = compute_traction_score(
            registrations=real_registrations,
            views=real_views,
            is_verified_organizer=is_verified,
            source=source,
        )
        
        # 4. Update the event
        updates = {
            "attendees_count": real_registrations,
            "rating": score,
            "views": real_views,
        }
        
        await db.events.update_one(
            {"_id": event["_id"]},
            {"$set": updates}
        )
        updated += 1
        
        if updated % 100 == 0:
            logger.info(f"Progress: {updated}/{total} events updated")
    
    logger.info(f"Backfill complete: {updated} events updated with real data")
    
    # Also process organizer-created events (reset rating to traction score)
    org_total = await db.events.count_documents({"source": "organizer"})
    logger.info(f"Found {org_total} organizer events to update traction scores")
    
    org_updated = 0
    async for event in db.events.find({"source": "organizer"}):
        event_id = event["id"]
        real_registrations = await db.registrations.count_documents({"event_id": event_id})
        real_views = await db.views.count_documents({"event_id": event_id})
        is_verified = event.get("organizer", {}).get("verified", False)
        
        score = compute_traction_score(
            registrations=real_registrations,
            views=real_views,
            is_verified_organizer=is_verified,
            source="organizer",
        )
        
        await db.events.update_one(
            {"_id": event["_id"]},
            {"$set": {"rating": score}}
        )
        org_updated += 1
    
    logger.info(f"Organizer events updated: {org_updated}")
    logger.info(f"Total events processed: {updated + org_updated}")
    
    # Store backfill metadata
    await db.meta.update_one(
        {"key": "last_traction_backfill"},
        {"$set": {
            "key": "last_traction_backfill",
            "value": datetime.now(timezone.utc).isoformat(),
            "scraped_events": updated,
            "organizer_events": org_updated,
        }},
        upsert=True,
    )
    
    client.close()


if __name__ == "__main__":
    asyncio.run(backfill())
