import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def main():
    e = await db.events.find_one({"id": "live-ca7b60af5fb452"})
    import pprint
    pprint.pprint(e)

asyncio.run(main())
