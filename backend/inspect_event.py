import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL'])[os.environ.get('DB_NAME', 'eventa')]

async def main():
    doc = await db.events.find_one({"source": {"$ne": "seed"}})
    print(doc)

asyncio.run(main())
