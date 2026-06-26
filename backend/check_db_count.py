import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

async def count():
    count = await db.events.count_documents({})
    print(f'Total events: {count}')
    sources = await db.events.aggregate([{'$group': {'_id': '$source', 'count': {'$sum': 1}}}]).to_list(100)
    for s in sources:
        print(f"{s['_id']}: {s['count']}")

asyncio.run(count())
