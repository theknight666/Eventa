import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import os
import sys
from dotenv import load_dotenv

from scraper_sync import sync_all_cities
from eb_sync import sync_eb_cities
from luma_sync import sync_luma_cities
from meetup_sync import sync_meetup_cities
from townscript_sync import sync_ts_cities

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    if len(sys.argv) < 2:
        print("Usage: python run_single_sync.py <platform>")
        print("Platforms: meetup, eventbrite, luma, townscript, allevents")
        sys.exit(1)
        
    platform = sys.argv[1].lower()
    
    mongo_url = os.environ.get("MONGO_URL")
    if not mongo_url:
        raise ValueError("MONGO_URL environment variable is not set!")
        
    db = AsyncIOMotorClient(mongo_url).eventa
    print(f"Starting dedicated cloud sync for platform: {platform}")
    
    try:
        if platform == "meetup":
            await sync_meetup_cities(db, force=True)
        elif platform == "eventbrite":
            await sync_eb_cities(db, force=True)
        elif platform == "luma":
            await sync_luma_cities(db, force=True)
        elif platform == "townscript":
            await sync_ts_cities(db, force=True)
        elif platform == "allevents":
            await sync_all_cities(db, force=True)
        else:
            print(f"Unknown platform: {platform}")
            sys.exit(1)
            
        print(f"--- Dedicated Sync for {platform} complete! ---")
    except Exception as e:
        logger.error(f"Error during {platform} sync: {e}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
