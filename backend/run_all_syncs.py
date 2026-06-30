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
    
    sync_tasks = [
        ("Luma", sync_luma_cities),
        ("Townscript", sync_ts_cities),
        ("Eventbrite", sync_eb_cities),
        ("Meetup", sync_meetup_cities),
        ("AllEvents", sync_all_cities)
    ]
    
    for name, sync_func in sync_tasks:
        print(f"--- Running {name} Sync ---")
        try:
            await sync_func(db, force=True)
        except Exception as e:
            logging.error(f"Error during {name} sync: {e}")
            print(f"Continuing with next sync...")
            
    print('All massive syncs complete! Database successfully populated.')

if __name__ == '__main__':
    asyncio.run(main())
