import httpx
import asyncio

async def test():
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        r1 = await client.get('https://www.meetup.com/find/?location=in--gurugram&source=EVENTS')
        print('gurugram:', r1.status_code, len(r1.text))
        r2 = await client.get('https://www.meetup.com/find/?location=in--gurgaon&source=EVENTS')
        print('gurgaon:', r2.status_code, len(r2.text))

if __name__ == "__main__":
    asyncio.run(test())
