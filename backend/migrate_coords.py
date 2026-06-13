import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from cities import CITY_COORDS

import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.eventa

async def migrate():
    print("Starting migration of existing event coordinates...")
    events_cursor = db.events.find({})
    updated = 0
    skipped = 0

    async for event in events_cursor:
        city = event.get("city", "")
        if city in CITY_COORDS:
            lat, lng = CITY_COORDS[city]
            if event.get("lat") == 0.0 and event.get("lng") == 0.0:
                await db.events.update_one(
                    {"_id": event["_id"]},
                    {"$set": {
                        "lat": lat,
                        "lng": lng,
                        "location": {"type": "Point", "coordinates": [lng, lat]}
                    }}
                )
                updated += 1
            else:
                skipped += 1
        else:
            skipped += 1

    print(f"Migration complete. Updated {updated} events. Skipped {skipped} events.")

if __name__ == "__main__":
    asyncio.run(migrate())
