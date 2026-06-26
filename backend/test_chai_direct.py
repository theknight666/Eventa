import asyncio
from meetup_sync import scrape_meetup_event
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    print("Scraping Chai pe charchaa")
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    
    event_data = await scrape_meetup_event("https://www.meetup.com/chai-pe-charchaa/events/315315196/", "gurugram")
    if event_data:
        print("Got event data. Upserting...")
        await db.events.update_one(
            {"id": event_data["id"]},
            {"$set": event_data},
            upsert=True
        )
        print("Upsert complete.")
    else:
        print("Failed to scrape event data.")
        
asyncio.run(test())
