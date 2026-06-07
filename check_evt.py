import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]

async def f():
    r = await db.events.find_one({'id': 'evt-016'})
    print(r)

asyncio.run(f())
