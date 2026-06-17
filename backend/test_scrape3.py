import asyncio, json
import httpx
from bs4 import BeautifulSoup

async def test_scrape():
    url = "https://allevents.in/chandigarh/phone-case-painting/3900030147584628"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
    
    soup = BeautifulSoup(res.text, "html.parser")
    print(soup.title.string if soup.title else "No title")
    print("Content length:", len(res.text))
    
asyncio.run(test_scrape())
