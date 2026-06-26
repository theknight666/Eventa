import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('.env')
db = AsyncIOMotorClient(os.environ['MONGO_URL']).eventa

async def count():
    approved = await db.events.count_documents({"approval_status": "approved"})
    missing = await db.events.count_documents({"approval_status": {"$exists": False}})
    other = await db.events.count_documents({"approval_status": {"$nin": ["approved"], "$exists": True}})
    
    print(f'Approved: {approved}')
    print(f'Missing approval_status: {missing}')
    print(f'Other status: {other}')

asyncio.run(count())
