import asyncio
from meetup_sync import fetch_meetup_urls
from luma_sync import fetch_luma_events_for_city

async def test():
    urls = await fetch_meetup_urls('gurugram')
    print('Meetup:', len(urls))
    
    events = await fetch_luma_events_for_city('gurugram')
    print('Luma:', len(events))

if __name__ == '__main__':
    asyncio.run(test())
