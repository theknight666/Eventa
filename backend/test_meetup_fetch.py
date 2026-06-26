import httpx
import asyncio

async def main():
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        r1 = await client.get('https://www.meetup.com/find/?location=in--bangalore&source=EVENTS&keywords=')
        r2 = await client.get('https://www.meetup.com/find/?location=in--bengaluru&source=EVENTS&keywords=')
        print('bangalore:', len(r1.text))
        print('bengaluru:', len(r2.text))

if __name__ == "__main__":
    asyncio.run(main())
