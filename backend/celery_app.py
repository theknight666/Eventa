import os
import asyncio
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
from pathlib import Path
import logging
from motor.motor_asyncio import AsyncIOMotorClient

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
mongo_url = os.environ.get('MONGO_URL', "mongodb://localhost:27017")
db_name = os.environ.get('DB_NAME', 'eventa')

celery = Celery(
    "eventa_worker",
    broker=redis_url,
    backend=redis_url,
)

celery.conf.update(
    timezone="UTC",
    beat_schedule={
        "scrape-all-cities-hourly": {
            "task": "celery_app.run_scrapers",
            "schedule": crontab(minute=0),  # Every hour at minute 0
        },
        "deduplicate-every-30-mins": {
            "task": "celery_app.run_dedup",
            "schedule": crontab(minute="0,30"),  # Every 30 mins
        },
    }
)

# Import scrapers and dedup logic
from scraper_sync import sync_all_cities
from meetup_sync import sync_meetup_cities
from eb_sync import sync_eb_cities
from luma_sync import sync_luma_cities
from townscript_sync import sync_ts_cities
from dedup import deduplicate_database
import re

async def _run_scrapers():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
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

async def _run_dedup():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    try:
        removed = await deduplicate_database(db)
        if removed > 0:
            logger.info(f"Periodic dedup removed {removed} duplicate events.")
    except Exception as e:
        logger.error(f"Periodic dedup error: {e}")

@celery.task
def run_scrapers():
    asyncio.run(_run_scrapers())

@celery.task
def run_dedup():
    asyncio.run(_run_dedup())
