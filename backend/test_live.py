import requests

url = "https://eventa-a492.onrender.com/api/events"

# Test 1: Just city
res = requests.get(url, params={"city": "New Delhi"})
print("City only:", len(res.json().get("events", [])))

# Test 2: Geo query (Dwarka)
res2 = requests.get(url, params={"lat": 28.58, "lng": 77.05, "radius_km": 50, "limit": 15})
print("Geo query (Dwarka):", len(res2.json().get("events", [])))

# Test 3: Geo query + city
res3 = requests.get(url, params={"city": "New Delhi", "lat": 28.58, "lng": 77.05, "radius_km": 50})
print("Geo + city:", len(res3.json().get("events", [])))

# Test 4: Is there an error?
if not res2.ok:
    print("Error geo query:", res2.text)
