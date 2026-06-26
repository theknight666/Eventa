import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

from luma_sync import sync_luma_cities

async def test():
    print("Testing Luma Sync...")
    res = await sync_luma_cities(db, force=True)
    print("Result:", res)

if __name__ == "__main__":
    asyncio.run(test())
