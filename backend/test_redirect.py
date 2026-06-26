import httpx
import asyncio

async def run():
    client = httpx.AsyncClient(follow_redirects=True)
    resp = await client.get('https://allevents.in/go.php?event_id=3900030235838353&data=Wng1UzVQZVJWTEhrL0RNS1gwbGpFRDU5N1hrdFlKenVhU1ZFeS9zSEdWMmZqQzg3SWo3RTUvZHBTSE5NekxXYWxyS0ZOZnUxaktOSys1SWdERUp1L3lMSUZKbEZlQk9nME9FR1krTGpmQ1hXbE9aM2FsWWNrclZ3ei9UVStIN0Q=&ref=exit-page')
    print('Final URL:', resp.url)

asyncio.run(run())
