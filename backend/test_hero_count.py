import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import json

async def test():
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    
    now = datetime.now(timezone.utc)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # We need category_ids, but I can just query without it to see if it makes a difference, 
    # or read from db.categories or server.py
    # Since I don't have category_ids loaded easily, I will just do the status and start_iso
    total = await db.events.count_documents({
        "approval_status": "approved", 
        "start_iso": {"$gte": start_of_today.isoformat()},
    })
    
    total_db = await db.events.count_documents({})
    
    print(f"Hero Count (Approved & Future): {total}")
    print(f"Total DB Count: {total_db}")

asyncio.run(test())
