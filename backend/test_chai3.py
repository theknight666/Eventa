import asyncio
from meetup_sync import fetch_meetup_urls, _process_url
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    print("Fetching URLs for 'chai pe charchaa'")
    db = AsyncIOMotorClient('mongodb+srv://eventa_admin:eventa@cluster0.imuwfa9.mongodb.net/?appName=Cluster0').eventa
    # We monkeypatch fetch_meetup_urls to search specifically for this query
    import httpx
    from bs4 import BeautifulSoup
    import json
    
    links = set()
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient() as c:
        url = "https://www.meetup.com/find/?location=in--gurugram&source=EVENTS&keywords=chai%20pe%20charchaa"
        resp = await c.get(url, headers=headers)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        for a in soup.find_all("a"):
            href = a.get("href", "")
            if "/events/" in href and "meetup.com" in href:
                links.add(href.split("?")[0])
                
        script = soup.find("script", id="__NEXT_DATA__")
        if script:
            data = json.loads(script.string)
            apollo = data.get("props", {}).get("pageProps", {}).get("__APOLLO_STATE__", {})
            for k, v in apollo.items():
                if k.startswith("Event:"):
                    event_url = v.get("eventUrl")
                    if event_url:
                        links.add(event_url.split("?")[0])
                        
    print(f"Found {len(links)} links")
    for link in links:
        print(f"Processing {link}")
        await _process_url(link, "gurugram", db)
    
asyncio.run(test())
