import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

async def get_cities():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client.eventa
    
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    cities = await db.events.distinct('city', {
        'approval_status': 'approved', 
        'start_iso': {'$gte': start.isoformat()}
    })
    
    print("Found", len(cities), "cities:")
    print(", ".join(sorted(cities)))

if __name__ == "__main__":
    asyncio.run(get_cities())
