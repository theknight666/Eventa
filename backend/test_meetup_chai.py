import asyncio
from meetup_sync import fetch_meetup_urls

async def test():
    u = await fetch_meetup_urls("Chai pe charchaa", "gurugram", 28.4595, 77.0266)
    print("URLs:", u)

asyncio.run(test())
