import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from category_utils import infer_category
from dotenv import load_dotenv

load_dotenv()

async def main():
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['eventa']
    
    print("Updating categories for existing events based on new rules...")
    events = await db.events.find({}).to_list(length=None)
    
    updated = 0
    for ev in events:
        new_cat = infer_category(ev['title'], ev.get('description', ''))
        if ev.get('category') != new_cat:
            await db.events.update_one(
                {"_id": ev["_id"]},
                {"$set": {
                    "category": new_cat,
                    "industry": new_cat.replace("-", " ").title()
                }}
            )
            updated += 1
            # print(f"Updated '{ev['title']}' -> {new_cat}")
            
    print(f"\nDone! Updated {updated} events.")

if __name__ == "__main__":
    asyncio.run(main())
