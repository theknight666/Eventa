import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_index():
    db = AsyncIOMotorClient("mongodb://localhost:27017").eventa
    try:
        await db.events.create_index([("location", "2dsphere")])
        print("Index created successfully!")
    except Exception as e:
        print(f"Index creation failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_index())
