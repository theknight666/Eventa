import asyncio, json
import httpx
from bs4 import BeautifulSoup
from organizer_utils import extract_organizer_name

async def test_scrape():
    url = "https://allevents.in/chandigarh/phone-case-painting/3900030147584628"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
    
    soup = BeautifulSoup(res.text, "html.parser")
    
    jsonld_data = None
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string)
            if isinstance(data, list):
                data = data[0]
            if data.get("@type") == "Event":
                jsonld_data = data
                break
        except Exception:
            pass
            
    print("JSON-LD Organizer:", jsonld_data.get("organizer") if jsonld_data else "No JSON-LD")
    
    real_name = extract_organizer_name(jsonld_data, soup)
    print("Extracted Real Name:", repr(real_name))

asyncio.run(test_scrape())
