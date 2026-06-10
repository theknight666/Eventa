import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Ensure backend directory is in path so we can import dedup
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dedup import deduplicate_database

async def main():
    db = AsyncIOMotorClient('mongodb://localhost:27017')['eventa']
    count = await deduplicate_database(db)
    print(f"Successfully removed {count} duplicate events using the new logic!")

if __name__ == '__main__':
    asyncio.run(main())
