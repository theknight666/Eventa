import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

db = AsyncIOMotorClient('mongodb://localhost:27017').eventa

async def run():
    doc = await db.attendees.find_one()
    print("One doc:", doc)
    doc2 = await db.attendees.find_one({'email': 'yupppitsmukul@gmail.com'})
    print("Target doc:", doc2)

asyncio.run(run())
