import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

async def check():
    docs = await db.events.find({}, {"start_iso": 1, "date": 1, "title": 1}).to_list(10)
    for d in docs:
        print(d)

asyncio.run(check())
