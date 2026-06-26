import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

async def check():
    now = datetime.now(timezone.utc)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    query = {"start_iso": {"$gte": start_of_today.isoformat()}}
    
    count = await db.events.count_documents(query)
    print(f'Future events: {count}')

asyncio.run(check())
