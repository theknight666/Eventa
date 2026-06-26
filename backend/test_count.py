import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    total = await db.events.count_documents({})
    print(f"Total events in database right now: {total}")

if __name__ == '__main__':
    asyncio.run(test())
