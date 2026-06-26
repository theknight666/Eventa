import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    count = await db.events.count_documents({})
    print('Total events in DB:', count)
    
    pipeline = [{'$group': {'_id': '$source', 'count': {'$sum': 1}}}]
    async for doc in db.events.aggregate(pipeline):
        print(doc.get('_id'), ':', doc.get('count'))

asyncio.run(test())
