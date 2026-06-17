import asyncio, json
import httpx
from bs4 import BeautifulSoup

async def test_scrape():
    url = "https://allevents.in/chandigarh/phone-case-painting/3900030147584628"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
    
    soup = BeautifulSoup(res.text, "html.parser")
    
    # Try to find elements that might contain the organizer name
    for el in soup.find_all(class_=lambda c: c and "organizer" in c.lower()):
        print("Class:", el.get("class"))
        print("Text:", el.get_text(strip=True)[:100])
        print("---")
        
    for el in soup.find_all(class_=lambda c: c and "organiser" in c.lower()):
        print("Class:", el.get("class"))
        print("Text:", el.get_text(strip=True)[:100])
        print("---")
        
    for el in soup.find_all(text=lambda t: t and "Hosted by" in t):
        print("Hosted by:", el.parent)

asyncio.run(test_scrape())
