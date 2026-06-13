import asyncio
import re
from motor.motor_asyncio import AsyncIOMotorClient

import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.eventa

def generate_slug(title, city, start_iso, existing_slugs):
    base = f"{title or 'event'} {city or ''} {start_iso[:4] if start_iso else ''}".strip()
    slug = re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')
    
    if not slug:
        slug = "event"
        
    final_slug = slug
    counter = 1
    while final_slug in existing_slugs:
        final_slug = f"{slug}-{counter}"
        counter += 1
        
    existing_slugs.add(final_slug)
    return final_slug

async def migrate():
    print("Starting migration of existing events to add SEO slugs...")
    events_cursor = db.events.find({})
    updated = 0
    skipped = 0
    
    existing_slugs = set()
    
    # First, collect any existing slugs
    async for event in db.events.find({"slug": {"$exists": True}}):
        if event.get("slug"):
            existing_slugs.add(event["slug"])

    async for event in events_cursor:
        if not event.get("slug"):
            slug = generate_slug(
                event.get("title", ""),
                event.get("city", ""),
                event.get("start_iso", ""),
                existing_slugs
            )
            await db.events.update_one(
                {"_id": event["_id"]},
                {"$set": {"slug": slug}}
            )
            updated += 1
        else:
            skipped += 1

    # Also create an index for slugs
    try:
        await db.events.create_index("slug", unique=True)
        print("Created unique index on 'slug'")
    except Exception as e:
        print(f"Warning: Could not create unique index on slug: {e}")

    print(f"Migration complete. Updated {updated} events. Skipped {skipped} events.")

if __name__ == "__main__":
    asyncio.run(migrate())
