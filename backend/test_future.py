import asyncio
import datetime
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    start = datetime.datetime.now(datetime.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    future = await db.events.count_documents({'start_iso': {'$gte': start.isoformat()}})
    print(f'Future events: {future}')

if __name__ == '__main__':
    asyncio.run(test())
