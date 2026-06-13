import time
import requests

url = "https://eventa-a492.onrender.com/api/admin/force-migrate-coords"

print("Waiting for deployment...")
while True:
    try:
        res = requests.get(url)
        if res.status_code == 200:
            print("Success!", res.json())
            break
        else:
            print("Not ready yet (status: ", res.status_code, "). Retrying in 10s...")
    except Exception as e:
        print("Error:", e, "- Retrying in 10s...")
    time.sleep(10)
