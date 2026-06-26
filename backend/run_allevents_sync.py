import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from scraper_sync import sync_all_cities

logging.basicConfig(level=logging.INFO)

async def main():
    print("Starting allevents.in sync...")
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    await sync_all_cities(db)
    print("AllEvents sync complete!")

if __name__ == '__main__':
    asyncio.run(main())
