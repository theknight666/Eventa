import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(".env")

async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ.get("DB_NAME", "eventa")]
    
    free = await db.events.count_documents({"pricing": "free"})
    paid = await db.events.count_documents({"pricing": "paid"})
    print(f"Free events total: {free}")
    print(f"Paid events total: {paid}")
    
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    upcoming_free = await db.events.count_documents({"pricing": "free", "start_iso": {"$gte": start_of_today.isoformat()}})
    upcoming_paid = await db.events.count_documents({"pricing": "paid", "start_iso": {"$gte": start_of_today.isoformat()}})
    
    print(f"Upcoming Free events: {upcoming_free}")
    print(f"Upcoming Paid events: {upcoming_paid}")

if __name__ == "__main__":
    asyncio.run(main())
