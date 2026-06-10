import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    MONGO_URL = input("Enter your MongoDB Atlas Connection String: ")
    
    if not MONGO_URL.startswith("mongodb"):
        print("Invalid connection string.")
        return

    print("Connecting to Atlas...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['eventa']
    
    total_events = await db.events.count_documents({})
    print(f"Total events in database: {total_events}")
    
    # We found that the SERP scraper used the 'source': 'serpapi' field!
    serp_query = {'source': 'serpapi'}
    
    serp_count = await db.events.count_documents(serp_query)
    print(f"Found {serp_count} SERP events based on the 'source: serpapi' flag.")
    
    if serp_count > 0:
        confirm = input(f"Do you want to delete these {serp_count} events? (y/n): ")
        if confirm.lower() == 'y':
            res = await db.events.delete_many(serp_query)
            print(f"Successfully deleted {res.deleted_count} SERP events!")
        else:
            print("Operation cancelled.")
    else:
        print("No SERP events found.")

if __name__ == "__main__":
    asyncio.run(main())
