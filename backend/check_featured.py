import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

async def check():
    featured = await db.events.count_documents({"featured": True})
    print(f'Featured events: {featured}')

asyncio.run(check())
