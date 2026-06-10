import requests
import time

print("Waiting for Render to deploy...")
start = time.time()
while time.time() - start < 300:
    res = requests.options(
        'https://eventa-a492.onrender.com/api/recommendations', 
        headers={
            'Origin': 'https://eventa.seoplanet.in', 
            'Access-Control-Request-Method': 'POST'
        }
    )
    if res.status_code == 200:
        print("\nSuccess! Server updated and CORS is fixed!")
        break
    print('.', end='', flush=True)
    time.sleep(5)
else:
    print("\nTimeout waiting for deploy.")
