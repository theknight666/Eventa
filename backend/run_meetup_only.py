import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from meetup_sync import sync_meetup_cities

logging.basicConfig(level=logging.INFO)

async def main():
    print("Starting huge Meetup sync...")
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    await sync_meetup_cities(db, force=True)
    print("Meetup sync complete.")

if __name__ == "__main__":
    asyncio.run(main())
