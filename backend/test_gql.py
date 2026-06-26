
import asyncio, httpx

async def test():
    query = '''
    query($lat: Float!, $lon: Float!, $first: Int) {
      keywordSearch(
        input: {
          lat: $lat,
          lon: $lon,
          source: EVENTS
        }
        first: $first
      ) {
        count
        edges {
          node {
            id
            eventUrl
            title
          }
        }
      }
    }
    '''.replace('', '')
    async with httpx.AsyncClient() as client:
        resp = await client.post('https://www.meetup.com/gql', json={
            'query': query,
            'variables': {
                'lat': 19.0760,
                'lon': 72.8777,
                'first': 50
            }
        })
        print(resp.status_code)
        print(resp.text[:500])

asyncio.run(test())

