import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from meetup_sync import sync_meetup_cities

load_dotenv('.env')

async def main():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'eventa')]
    
    print("Testing meetup sync...")
    # Just force the sync to see if it works
    result = await sync_meetup_cities(db, force=True)
    print(f"Result: {result}")

if __name__ == '__main__':
    asyncio.run(main())
