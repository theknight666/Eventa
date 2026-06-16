import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from ai_category import infer_category_ai
from dotenv import load_dotenv

load_dotenv()

async def process_event(ev, db, sem, counter):
    async with sem:
        new_cat = await infer_category_ai(ev['title'], ev.get('description', ''))
        
        if ev.get('category') != new_cat:
            await db.events.update_one(
                {"_id": ev["_id"]},
                {"$set": {
                    "category": new_cat,
                    "industry": new_cat.replace("-", " ").title(),
                    "tags": [new_cat]
                }}
            )
            counter["updated"] += 1
            print(f"[{counter['updated']}] Updated '{ev['title'][:30]}...' -> {new_cat}")
            
        counter["processed"] += 1
        if counter["processed"] % 50 == 0:
            print(f"Processed {counter['processed']} events...")

async def main():
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['eventa']
    
    print("Updating categories for existing events using strict AI rules...")
    events = await db.events.find({}).to_list(length=None)
    
    sem = asyncio.Semaphore(15)
    counter = {"processed": 0, "updated": 0}
    
    tasks = []
    for ev in events:
        tasks.append(process_event(ev, db, sem, counter))
        
    await asyncio.gather(*tasks)
            
    print(f"\nDone! Processed {len(events)} events, updated {counter['updated']}.")

if __name__ == "__main__":
    asyncio.run(main())
