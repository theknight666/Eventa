import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import uuid

load_dotenv('backend/.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

SAMPLE_NAMES = [
    "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Iyer", "Vikram Singh",
    "Sneha Reddy", "Arjun Nair", "Kavya Rao", "Aditya Gupta", "Ishita Joshi",
    "Karthik Menon", "Neha Verma", "Siddharth Bose", "Pooja Desai", "Rahul Khanna",
    "Meera Pillai", "Aniket Kulkarni", "Divya Agarwal", "Manish Tiwari", "Riya Kapoor",
]

async def main():
    events = await db.events.find({}).to_list(None)
    for event in events:
        if event.get("source") == "serpapi":
            random.seed(event["id"])
            attendees = random.randint(50, 5000)
            views = attendees * random.randint(3, 10)
            random.seed()
            await db.events.update_one({"id": event["id"]}, {"$set": {"attendees_count": attendees, "views": views}})
        elif event.get("source") == "organizer":
            # Just do something similar to _seed_event_traction
            random.seed(event["id"])
            n_regs = random.randint(6, 26)
            n_views = n_regs * random.randint(8, 16)
            random.seed()
            await db.events.update_one({"id": event["id"]}, {"$set": {"views": n_views, "attendees_count": n_regs}})
            
            # optionally insert fake registrations if needed, but maybe just setting the counts is enough
    print("Restored realistic attendees and views to all events.")

if __name__ == "__main__":
    asyncio.run(main())
