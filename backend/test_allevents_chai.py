import httpx
from bs4 import BeautifulSoup
import asyncio

async def test():
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient() as c:
        resp = await c.get("https://allevents.in/search/events?q=Chai%20pe%20charchaa", headers=headers)
        soup = BeautifulSoup(resp.text, 'html.parser')
        events = soup.select(".event-card a")
        for a in events:
            print("Found:", a.get('href'))

asyncio.run(test())
