import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def setup_indexes():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'eventa')]
    
    print("Creating indexes on 'events' collection...")
    
    # Overview / Stats query index
    await db.events.create_index([
        ("approval_status", 1),
        ("start_iso", 1),
        ("category", 1)
    ])
    
    # Featured Events index
    await db.events.create_index([
        ("approval_status", 1),
        ("start_iso", 1),
        ("featured", 1)
    ])
    
    # Trending Events index
    await db.events.create_index([
        ("approval_status", 1),
        ("start_iso", 1),
        ("trending", 1)
    ])
    
    # Discover / Location-based index
    await db.events.create_index([
        ("approval_status", 1),
        ("start_iso", 1),
        ("city", 1),
        ("category", 1)
    ])
    
    # Text search index for 'q'
    # Check if a text index already exists
    indexes = await db.events.index_information()
    has_text_index = any('text' in idx.get('key', [])[0] for name, idx in indexes.items() if 'key' in idx)
    
    if not has_text_index:
        try:
            await db.events.create_index([
                ("title", "text"),
                ("city", "text"),
                ("category", "text")
            ])
            print("Created text index.")
        except Exception as e:
            print(f"Text index creation skipped/failed: {e}")
            
    print("Indexes created successfully!")
    print(await db.events.index_information())

if __name__ == "__main__":
    asyncio.run(setup_indexes())
