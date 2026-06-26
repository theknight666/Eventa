import asyncio
import httpx
from bs4 import BeautifulSoup

async def search_ae(query):
    headers = {"User-Agent": "Mozilla/5.0"}
    print(f"Searching AllEvents for: {query}")
    async with httpx.AsyncClient(timeout=10) as c:
        resp = await c.get(f"https://allevents.in/search/events?q={query.replace(' ', '%20')}", headers=headers)
        soup = BeautifulSoup(resp.text, 'html.parser')
        events = soup.select(".event-card a")
        if not events:
            print(f"No events found for {query} on AllEvents")
        for a in events:
            title = a.get('title', '')
            if not title:
                title = a.text.strip().replace('\n', ' ')
            print(f" - {title} ({a.get('href')})")

async def test():
    await search_ae("Chai pe charchaa")
    await search_ae("Chai pe charcha")

asyncio.run(test())
