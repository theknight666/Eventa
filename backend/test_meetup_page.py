import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r1 = await client.get('https://www.meetup.com/find/?location=in--bengaluru&source=EVENTS')
        r2 = await client.get('https://www.meetup.com/find/?location=in--bengaluru&source=EVENTS&page=2')
        print(len(r1.text), len(r2.text))

if __name__ == '__main__':
    asyncio.run(test())
