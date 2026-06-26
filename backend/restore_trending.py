import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def main():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'eventa')]
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Reset all trending to False first to ensure we don't have stale ones
    await db.events.update_many({}, {"$set": {"trending": False}})
    
    # Find future events, sorted by views and attendees
    cursor = db.events.find({"start_iso": {"$gte": now}}).sort([("views", -1), ("attendees_count", -1)]).limit(50)
    top_events = await cursor.to_list(None)
    
    if top_events:
        ids = [ev["_id"] for ev in top_events]
        result = await db.events.update_many({"_id": {"$in": ids}}, {"$set": {"trending": True}})
        print(f"Set trending=True for {result.modified_count} events.")
    else:
        print("No future events found.")

if __name__ == "__main__":
    asyncio.run(main())
