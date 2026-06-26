import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    e = await db.events.find_one({'title': {'$regex': 'chai pe charchaa', '$options': 'i'}})
    print(e['title'] if e else 'Not found: chai pe charchaa')
    
    e2 = await db.events.find_one({'title': {'$regex': 'chai', '$options': 'i'}})
    print(e2['title'] if e2 else 'Not found: chai')

if __name__ == '__main__':
    asyncio.run(test())
