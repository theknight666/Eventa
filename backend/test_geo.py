import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.eventa

async def test_query():
    print("Testing New Delhi events...")
    # 1. Total events in New Delhi
    count = await db.events.count_documents({"city": "New Delhi"})
    print(f"Total events in New Delhi (string match): {count}")
    
    # 2. Count events with non-zero lat/lng in New Delhi
    count_valid = await db.events.count_documents({"city": "New Delhi", "lat": {"$ne": 0.0}})
    print(f"Total events in New Delhi with real coords: {count_valid}")
    
    # 3. Geo query for New Delhi (28.6, 77.2)
    lat = 28.58
    lng = 77.05
    radius_km = 50
    query = {
        "location": {
            "$geoWithin": {
                "$centerSphere": [[lng, lat], radius_km / 6378.1]
            }
        }
    }
    geo_count = await db.events.count_documents(query)
    print(f"Events within 50km of Dwarka {lat}, {lng}: {geo_count}")

    # 4. Same geo query but nearSphere
    query2 = {
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "$maxDistance": radius_km * 1000
            }
        }
    }
    try:
        ns_count = await db.events.count_documents(query2)
        print(f"Events using $nearSphere: {ns_count}")
    except Exception as e:
        print(f"$nearSphere failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_query())
