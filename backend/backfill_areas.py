import asyncio
import os
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv('.env')

async def backfill():
    db = AsyncIOMotorClient(os.environ['MONGO_URL'])[os.environ.get('DB_NAME', 'eventa')]
    
    # Find events without an area that have valid coordinates
    query = {
        "area": {"$exists": False},
        "lat": {"$nin": [0.0, 0, None]},
        "lng": {"$nin": [0.0, 0, None]}
    }
    
    total = await db.events.count_documents(query)
    logger.info(f"Found {total} events to backfill.")
    
    cursor = db.events.find(query)
    
    async with httpx.AsyncClient() as client:
        count = 0
        async for ev in cursor:
            lat = ev.get("lat")
            lng = ev.get("lng")
            
            try:
                url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}"
                res = await client.get(url, headers={"User-Agent": "Eventa/1.0"})
                if res.status_code == 200:
                    data = res.json()
                    addr = data.get("address", {})
                    area = addr.get("suburb") or addr.get("neighbourhood") or addr.get("town")
                    
                    if area:
                        await db.events.update_one({"_id": ev["_id"]}, {"$set": {"area": area}})
                        logger.info(f"Updated {ev['id']} with area: {area}")
                    else:
                        # Mark it as checked so we don't try again repeatedly if no area exists
                        await db.events.update_one({"_id": ev["_id"]}, {"$set": {"area": None}})
                        logger.info(f"No area found for {ev['id']}, marked as None")
                else:
                    logger.error(f"Failed to geocode {ev['id']}: HTTP {res.status_code}")
            except Exception as e:
                logger.error(f"Error geocoding {ev['id']}: {e}")
                
            count += 1
            if count % 10 == 0:
                logger.info(f"Progress: {count}/{total}")
                
            # Nominatim limits 1 request per second
            await asyncio.sleep(1.1)
            
    logger.info("Backfill complete.")

if __name__ == "__main__":
    asyncio.run(backfill())
