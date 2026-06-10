import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ.get('DB_NAME', 'eventa')]

async def run():
    july_events = await db.events.count_documents({"date": {"$regex": "-07-09"}})
    print(f"Events on July 9: {july_events}")
    
    docs = await db.events.find({"date": {"$regex": "-07-09"}}, {"date": 1, "title": 1, "source": 1}).to_list(10)
    for d in docs:
        print(d)

asyncio.run(run())
