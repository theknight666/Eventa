import asyncio
import pprint
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    db = AsyncIOMotorClient('mongodb://localhost:27017')['eventa']
    doc = await db.events.find_one({'source': 'ticketmaster'})
    if doc:
        pprint.pprint(doc)
    else:
        print("No ticketmaster events found.")
    count = await db.events.count_documents({'source': 'ticketmaster'})
    print(f'Total TM events: {count}')

asyncio.run(main())
