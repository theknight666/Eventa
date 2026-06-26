import time
from geopy.geocoders import Nominatim

city_list = [
    "mumbai", "new-delhi", "bengaluru", "hyderabad", "pune", "chennai",
    "kolkata", "ahmedabad", "jaipur", "gurugram", "noida", "surat",
    "indore", "kochi", "chandigarh", "lucknow", "varanasi", "goa",
    "nagpur", "vadodara", "coimbatore",
    "kanpur", "thane", "bhopal", "visakhapatnam", "pimpri-chinchwad",
    "patna", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad",
    "meerut", "rajkot", "kalyan-dombivli", "vasai-virar", "srinagar",
    "aurangabad", "dhanbad", "amritsar", "navi-mumbai", "allahabad",
    "howrah", "ranchi", "gwalior", "jabalpur", "vijayawada", "jodhpur",
    "madurai", "raipur", "kota", "guwahati", "solapur", "hubli-dharwad",
    "bareilly", "moradabad", "mysore", "aligarh", "jalandhar",
    "tiruchirappalli", "bhubaneswar", "salem", "thiruvananthapuram"
]

state_map = {
    "mumbai": "Maharashtra", "new-delhi": "Delhi", "bengaluru": "Karnataka",
    "hyderabad": "Telangana", "pune": "Maharashtra", "chennai": "Tamil Nadu",
    "kolkata": "West Bengal", "ahmedabad": "Gujarat", "jaipur": "Rajasthan",
    "gurugram": "Haryana", "noida": "Uttar Pradesh", "surat": "Gujarat",
    "indore": "Madhya Pradesh", "kochi": "Kerala", "chandigarh": "Chandigarh",
    "lucknow": "Uttar Pradesh", "varanasi": "Uttar Pradesh", "goa": "Goa",
    "nagpur": "Maharashtra", "vadodara": "Gujarat", "coimbatore": "Tamil Nadu",
    "kanpur": "Uttar Pradesh", "thane": "Maharashtra", "bhopal": "Madhya Pradesh",
    "visakhapatnam": "Andhra Pradesh", "pimpri-chinchwad": "Maharashtra",
    "patna": "Bihar", "ghaziabad": "Uttar Pradesh", "ludhiana": "Punjab",
    "agra": "Uttar Pradesh", "nashik": "Maharashtra", "faridabad": "Haryana",
    "meerut": "Uttar Pradesh", "rajkot": "Gujarat", "kalyan-dombivli": "Maharashtra",
    "vasai-virar": "Maharashtra", "srinagar": "Jammu and Kashmir",
    "aurangabad": "Maharashtra", "dhanbad": "Jharkhand", "amritsar": "Punjab",
    "navi-mumbai": "Maharashtra", "allahabad": "Uttar Pradesh", "howrah": "West Bengal",
    "ranchi": "Jharkhand", "gwalior": "Madhya Pradesh", "jabalpur": "Madhya Pradesh",
    "vijayawada": "Andhra Pradesh", "jodhpur": "Rajasthan", "madurai": "Tamil Nadu",
    "raipur": "Chhattisgarh", "kota": "Rajasthan", "guwahati": "Assam",
    "solapur": "Maharashtra", "hubli-dharwad": "Karnataka", "bareilly": "Uttar Pradesh",
    "moradabad": "Uttar Pradesh", "mysore": "Karnataka", "aligarh": "Uttar Pradesh",
    "jalandhar": "Punjab", "tiruchirappalli": "Tamil Nadu", "bhubaneswar": "Odisha",
    "salem": "Tamil Nadu", "thiruvananthapuram": "Kerala"
}

aliases = {
    "gurugram": ["gurugram", "gurgaon"],
    "bengaluru": ["bengaluru", "bangalore"],
    "mumbai": ["mumbai", "bombay"],
    "pune": ["pune", "poona"],
    "kolkata": ["kolkata", "calcutta"],
    "chennai": ["chennai", "madras"],
    "thiruvananthapuram": ["thiruvananthapuram", "trivandrum"],
    "varanasi": ["varanasi", "banaras"],
    "mysore": ["mysore", "mysuru"],
    "kochi": ["kochi", "cochin"],
    "new-delhi": ["new-delhi", "delhi"]
}

geolocator = Nominatim(user_agent="eventa_bot_script")

city_coords = {}

for city in city_list:
    try:
        search_term = city.replace("-", " ") + ", India"
        location = geolocator.geocode(search_term)
        if location:
            city_coords[city] = (round(location.latitude, 4), round(location.longitude, 4))
        else:
            print(f"Failed: {city}")
            city_coords[city] = (0.0, 0.0)
    except Exception as e:
        print(f"Error {city}: {e}")
        city_coords[city] = (0.0, 0.0)
    time.sleep(1.1)  # Rate limiting

with open("backend/cities.py", "w") as f:
    f.write("CITIES = [\n")
    for city in city_list:
        f.write(f'    "{city}",\n')
    f.write("]\n\n")

    f.write("CITY_STATE = {\n")
    for city, state in state_map.items():
        f.write(f'    "{city}": "{state}",\n')
    f.write("}\n\n")

    f.write("CITY_ALIASES = {\n")
    for city, a in aliases.items():
        f.write(f'    "{city}": {a},\n')
    f.write("}\n\n")

    f.write("CITY_COORDS = {\n")
    for city, coords in city_coords.items():
        f.write(f'    "{city.replace("-", " ").title()}": {coords},\n')
    f.write("}\n")
