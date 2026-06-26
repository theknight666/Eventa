import asyncio
import httpx
import json

async def test():
    query = """
    query($first: Int, $lat: Float, $lon: Float, $query: String) {
      keywordSearch(input: {first: $first, lat: $lat, lon: $lon, query: $query}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            eventUrl
          }
        }
      }
    }
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Content-Type": "application/json",
        "Accept": "*/*"
    }
    async with httpx.AsyncClient(follow_redirects=True) as c:
        resp = await c.post("https://www.meetup.com/gql", json={"query": query, "variables": {"first": 100, "lat": 28.4595, "lon": 77.0266, "query": ""}}, headers=headers)
        print(resp.status_code)
        try:
            print(json.dumps(resp.json(), indent=2)[:500])
        except:
            print("Response:", resp.text[:500])

asyncio.run(test())
