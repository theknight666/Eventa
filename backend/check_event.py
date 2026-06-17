import asyncio, os, sys, motor.motor_asyncio
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv('c:\\Users\\yuppp\\Downloads\\Eventa-main\\backend\\.env')
client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv('MONGO_URL'))
db = client.eventa

async def main():
    docs = await db.events.find({'title': {'$regex': 'Phone Case Painting', '$options': 'i'}}).to_list(length=None)
    for d in docs:
        print(f"Event: {d.get('title')}")
        print(f"Organizer: {d.get('organizer')}")
        print("---")

asyncio.run(main())
