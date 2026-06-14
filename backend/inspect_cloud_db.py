import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import json
from bson import json_util

import os

async def main():
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['eventa']
    
    print("Fetching 5 random events from Atlas to inspect their structure...")
    events = await db.events.find({}).limit(5).to_list(length=5)
    
    for i, ev in enumerate(events):
        print(f"\n--- Event {i+1} ---")
        print(json.dumps(ev, default=json_util.default, indent=2))
        
if __name__ == "__main__":
    asyncio.run(main())
