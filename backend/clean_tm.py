import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    db = AsyncIOMotorClient('mongodb://localhost:27017')['eventa']
    res = await db.events.delete_many({'source': 'ticketmaster'})
    print(f'Deleted TM events: {res.deleted_count}')

asyncio.run(main())
