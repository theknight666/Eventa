import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def main():
    db = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))['eventa']
    res = await db.meta.delete_many({"key": {"$in": ["last_luma_sync", "last_scraper_sync"]}})
    print(f"Deleted sync cooldowns. Matched: {res.deleted_count}")

asyncio.run(main())
