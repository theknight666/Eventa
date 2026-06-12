import asyncio
import httpx
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(".env")

mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get("DB_NAME", "eventa")]

async def geocode(address_or_city: str):
    """Geocodes a string to [lng, lat] using Nominatim."""
    url = f"https://nominatim.openstreetmap.org/search?q={address_or_city}&format=json&limit=1"
    headers = {"User-Agent": "EventaApp/1.0 (admin@eventa.in)"}
    try:
        async with httpx.AsyncClient() as http_client:
            resp = await http_client.get(url, headers=headers, timeout=10)
            data = resp.json()
            if data and len(data) > 0:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                return [lon, lat]
    except Exception as e:
        logger.error(f"Geocoding error for {address_or_city}: {e}")
    return None

async def run():
    cursor = db.events.find({})
    events = [doc async for doc in cursor]
    logger.info(f"Found {len(events)} events to process.")

    updated_count = 0

    for event in events:
        # Check if already has valid location point
        loc = event.get("location", {})
        if loc.get("type") == "Point" and event.get("lat") != 0.0:
            continue

        address_query = event.get("address")
        city = event.get("city")
        coords = None
        
        if address_query:
            coords = await geocode(address_query)
            
        if not coords and city:
            logger.info(f"Falling back to city for {event['title']}")
            coords = await geocode(city)
        
        if coords:
            lng, lat = coords
            await db.events.update_one(
                {"_id": event["_id"]},
                {"$set": {
                    "lat": lat,
                    "lng": lng,
                    "location": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                }}
            )
            updated_count += 1
            logger.info(f"Geocoded: {event['title']} -> {lat}, {lng}")
        else:
            logger.warning(f"Could not geocode: {address_query} or {city}")
        
        # Respect Nominatim rate limit (1 req/sec)
        await asyncio.sleep(1.2)

    logger.info(f"Successfully updated {updated_count} events.")
    
    # Create index
    logger.info("Creating 2dsphere index on events collection...")
    await db.events.create_index([("location", "2dsphere")])
    logger.info("Done.")

if __name__ == "__main__":
    asyncio.run(run())
