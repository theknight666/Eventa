import asyncio
import httpx

async def test():
    query = """
    query($query: String!) {
      keywordSearch(input: {first: 10, query: $query}) {
        edges {
          node {
            id
            title
            eventUrl
            dateTime
          }
        }
      }
    }
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as c:
        resp = await c.post("https://www.meetup.com/gql", json={"query": query, "variables": {"query": "Chai"}}, headers=headers)
        print(resp.json())

asyncio.run(test())
