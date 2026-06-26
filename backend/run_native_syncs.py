
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from eb_sync import sync_eb_cities
from luma_sync import sync_luma_cities
from meetup_sync import sync_meetup_cities

logging.basicConfig(level=logging.INFO)

async def main():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    print('Starting native syncs (Eventbrite, Luma, Meetup) concurrently...')
    await asyncio.gather(
        sync_eb_cities(db, force=True),
        sync_luma_cities(db, force=True),
        sync_meetup_cities(db, force=True)
    )
    print('Native syncs complete!')

if __name__ == '__main__':
    asyncio.run(main())

