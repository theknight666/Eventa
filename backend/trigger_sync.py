import httpx
import sys

BASE_URL = "https://eventa-a492.onrender.com"
ADMIN_PASS = "MySecureEventaAdminPass!99"

def run_sync():
    print(f"Logging into {BASE_URL}/api/admin/login...")
    
    with httpx.Client() as client:
        # 1. Login to get the JWT token
        resp = client.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASS})
        if resp.status_code != 200:
            print(f"Login failed! Status: {resp.status_code}")
            print(resp.text)
            sys.exit(1)
            
        data = resp.json()
        token = data.get("token")
        print("Login successful! Got admin token.")
        
        # 2. Trigger the sync
        print("Triggering sync-all endpoint...")
        headers = {"x-admin-key": token}
        sync_resp = client.post(f"{BASE_URL}/api/admin/sync-all?force=true", headers=headers)
        
        print(f"Sync Response Code: {sync_resp.status_code}")
        print(sync_resp.text)

if __name__ == "__main__":
    run_sync()
