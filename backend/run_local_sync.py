
import asyncio
import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
from motor.motor_asyncio import AsyncIOMotorClient
from scraper_sync import sync_all_cities
from eb_sync import fetch_eb_events_for_city
from luma_sync import fetch_luma_events_for_city

async def main():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    print('Starting local sync using NEW code...')
    
    # Run the main massive scraper sync, force=True to ignore cooldown
    await sync_all_cities(db, force=True)
    print('Sync complete!')

if __name__ == '__main__':
    asyncio.run(main())

