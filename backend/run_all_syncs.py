import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import os
from dotenv import load_dotenv

from scraper_sync import sync_all_cities
from eb_sync import sync_eb_cities
from luma_sync import sync_luma_cities
from meetup_sync import sync_meetup_cities
from townscript_sync import sync_ts_cities

load_dotenv()

logging.basicConfig(level=logging.INFO)

async def main():
    mongo_url = os.environ.get("MONGO_URL")
    if not mongo_url:
        raise ValueError("MONGO_URL environment variable is not set!")
        
    db = AsyncIOMotorClient(mongo_url).eventa
    print('Starting full massive cloud sync pipeline...')
    
    # Run sequentially to prevent memory/rate limit issues on GitHub Actions
    # force=True ignores the 6-hour cooldowns
    print("--- Running Luma Sync ---")
    await sync_luma_cities(db, force=True)
    
    print("--- Running Townscript Sync ---")
    await sync_ts_cities(db, force=True)
    
    print("--- Running Eventbrite Sync ---")
    await sync_eb_cities(db, force=True)
    
    print("--- Running Meetup Sync ---")
    await sync_meetup_cities(db, force=True)
    
    print("--- Running AllEvents Sync ---")
    await sync_all_cities(db, force=True) 
    
    print('All massive syncs complete! Database successfully populated.')

if __name__ == '__main__':
    asyncio.run(main())
