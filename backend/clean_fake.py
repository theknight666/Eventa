import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient('mongodb://localhost:27017')
db = client.eventa

async def main():
    res1 = await db.registrations.delete_many({'email': {'$regex': '@example\\.com$'}})
    res2 = await db.views.delete_many({})
    
    async for ev in db.events.find():
        rc = await db.registrations.count_documents({'event_id': ev['id']})
        vc = await db.views.count_documents({'event_id': ev['id']})
        await db.events.update_one({'_id': ev['_id']}, {'$set': {'views': vc, 'attendees_count': rc}})
    print(f'Deleted {res1.deleted_count} fake regs, {res2.deleted_count} views.')

asyncio.run(main())
