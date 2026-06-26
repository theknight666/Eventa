import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

async def check():
    docs = await db.events.find().sort("_id", -1).limit(5).to_list(5)
    for d in docs:
        print(f"ID: {d.get('_id')}, Source: {d.get('source')}, Title: {d.get('title')}, Created At: {d.get('_id').generation_time if d.get('_id') else 'Unknown'}")

asyncio.run(check())
