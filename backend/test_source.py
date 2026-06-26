import asyncio
from scraper_sync import scrape_event_page

async def run():
    # An allevents URL, maybe we can test a known one, or just let it test the logic
    # on our debug html file. Actually, let's just test our logic directly on a known URL.
    # url = "https://allevents.in/new-delhi/dil-da-mamla-gurdas-maan-live-in-concert/3900030235838353"
    url = "https://allevents.in/new-delhi/delhi-startup-mixer-2026/80001231231" # Example
    
    # Let's test the local debug HTML
    from bs4 import BeautifulSoup
    from scraper_sync import _detect_original_source
    import json
    
    # inject external link
    html = open('allevents_debug.html', 'r', encoding='utf-8').read()
    html = html.replace('href="https://allevents.in/new-delhi/concerts"', 'href="https://meetup.com/some-group/events/12345/"')
    soup = BeautifulSoup(html, "html.parser")
    ld_script = soup.find('script', type='application/ld+json')
    data = json.loads(ld_script.string)
    if isinstance(data, list):
        data = data[0]
    
    source, orig = _detect_original_source(url, url, data, soup)
    print("Source:", source)
    print("Original:", orig)

if __name__ == "__main__":
    asyncio.run(run())
