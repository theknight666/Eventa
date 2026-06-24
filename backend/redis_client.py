import os
import json
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(redis_url, decode_responses=True)

class AsyncRedisCache:
    def __init__(self, ttl_seconds=300):
        self.ttl = ttl_seconds

    async def get(self, key):
        try:
            val = await redis_client.get(key)
            if val:
                return json.loads(val)
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None

    async def set(self, key, value):
        try:
            val = json.dumps(value, default=str)
            await redis_client.setex(key, self.ttl, val)
        except Exception as e:
            print(f"Redis set error: {e}")

api_cache = AsyncRedisCache(ttl_seconds=300)
