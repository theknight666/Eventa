import asyncio
import os
import re
import logging
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'eventa')]

# Import scrapers and dedup logic
from scraper_sync import sync_all_cities
from meetup_sync import sync_meetup_cities
from eb_sync import sync_eb_cities
from luma_sync import sync_luma_cities
from townscript_sync import sync_ts_cities
from dedup import deduplicate_database

async def _background_all_scrapers():
    """Run all scrapers sequentially in a continuous loop in the background."""
    while True:
        try:
            res_ae = await sync_all_cities(db)
            res_meetup = await sync_meetup_cities(db)
            res_eb = await sync_eb_cities(db)
            res_luma = await sync_luma_cities(db)
            res_ts = await sync_ts_cities(db)
            
            # Auto-generate slugs for any newly fetched events
            existing_slugs = set()
            async for ev in db.events.find({"slug": {"$exists": True}}):
                if ev.get("slug"): existing_slugs.add(ev["slug"])

            async for ev in db.events.find({"slug": {"$exists": False}}):
                base = f"{ev.get('title') or 'event'} {ev.get('city') or ''} {str(ev.get('start_iso', ''))[:4]}".strip()
                slug = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')
                if not slug: slug = "event"
                final_slug = slug
                counter = 1
                while final_slug in existing_slugs:
                    final_slug = f"{slug}-{counter}"
                    counter += 1
                existing_slugs.add(final_slug)
                await db.events.update_one({"_id": ev["_id"]}, {"$set": {"slug": final_slug}})
            
            logger.info(
                f"Scraper cycle complete. Upserted: "
                f"AE({res_ae.get('upserted',0)}), Meetup({res_meetup.get('upserted',0)}), "
                f"EB({res_eb.get('upserted',0)}), Luma({res_luma.get('upserted',0)}), "
                f"TS({res_ts.get('upserted',0)})"
            )
        except Exception as e:
            logger.error(f"Background scraper orchestrator error: {e}")
        
        # Each individual scraper tracks its own 6-hour cooldown in the DB
        # so this loop can run frequently (e.g. hourly) to catch off-cycle resets.
        await asyncio.sleep(3600)

async def _background_dedup():
    """Run deduplication continuously every 30 minutes."""
    while True:
        await asyncio.sleep(1800)  # 30 minutes
        try:
            removed = await deduplicate_database(db)
            if removed > 0:
                logger.info(f"Periodic dedup removed {removed} duplicate events.")
        except Exception as e:
            logger.error(f"Periodic dedup error: {e}")

async def main():
    logger.info("Starting background worker...")
    
    # Run both loops concurrently
    await asyncio.gather(
        _background_all_scrapers(),
        _background_dedup()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker stopped by user.")
