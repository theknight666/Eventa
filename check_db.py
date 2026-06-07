import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def main():
    events = await db.events.find({}).to_list(length=100)
    print("Total events:", await db.events.count_documents({}))
    print("Events with attendees_count == 0:", await db.events.count_documents({"attendees_count": 0}))
    print("Events with attendees_count > 0:", await db.events.count_documents({"attendees_count": {"$gt": 0}}))
    print("Total registrations:", await db.registrations.count_documents({}))
    for i, e in enumerate(events[:5]):
        print(f"Event {i} ID: {e['id']} Attendees: {e.get('attendees_count')}")

asyncio.run(main())
