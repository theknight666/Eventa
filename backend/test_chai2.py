import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    cursor = db.events.find({'title': {'$regex': 'charcha', '$options': 'i'}})
    found = False
    async for e in cursor:
        print(f"- {e['title']} ({e.get('city')})")
        found = True
    if not found:
        print("No chai at all")
        
asyncio.run(test())
