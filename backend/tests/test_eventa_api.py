"""Backend API tests for Eventa V1 (no-auth event discovery)."""
import os
# pyrefly: ignore [missing-import]
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE:
    # fallback to local frontend env file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
BASE = (BASE or "").rstrip("/")
API = f"{BASE}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---- Health & metadata ----
class TestMeta:
    def test_root(self, s):
        r = s.get(f"{API}/", timeout=20)
        assert r.status_code == 200
        assert "Eventa" in r.json().get("message", "")

    def test_stats(self, s):
        r = s.get(f"{API}/stats", timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ["events_this_week", "cities_covered", "registered_attendees", "active_organizers", "total_events"]:
            assert k in d, f"missing {k}"
        assert d["total_events"] >= 20
        assert d["cities_covered"] >= 5
        assert d["registered_attendees"] > 0

    def test_categories(self, s):
        r = s.get(f"{API}/categories", timeout=20)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list) and len(cats) >= 18
        # ensure count populated for at least one category
        assert any(c.get("count", 0) > 0 for c in cats)

    def test_cities(self, s):
        r = s.get(f"{API}/cities", timeout=20)
        assert r.status_code == 200
        cities = r.json()
        assert isinstance(cities, list) and len(cities) >= 5
        names = [c["name"] for c in cities]
        assert "Mumbai" in names


# ---- Events listing ----
class TestEvents:
    def test_list_all(self, s):
        r = s.get(f"{API}/events", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert "events" in d and "total" in d
        assert d["total"] >= 20
        # ensure _id excluded
        assert all("_id" not in e for e in d["events"])

    def test_filter_city_mumbai(self, s):
        r = s.get(f"{API}/events", params={"city": "Mumbai"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] > 0
        assert all(e["city"] == "Mumbai" for e in d["events"])

    def test_filter_category(self, s):
        r = s.get(f"{API}/events", params={"category": "technology"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] > 0
        assert all(e["category"] == "technology" for e in d["events"])

    def test_filter_event_type(self, s):
        r = s.get(f"{API}/events", params={"event_type": "hybrid"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert all(e["event_type"] == "hybrid" for e in d["events"])

    def test_filter_pricing_free(self, s):
        r = s.get(f"{API}/events", params={"pricing": "free"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert all(e["pricing"] == "free" for e in d["events"])

    def test_filter_size_mega(self, s):
        r = s.get(f"{API}/events", params={"size": "mega"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert all(e["attendance_size"] == "mega" for e in d["events"])

    def test_filter_search_q(self, s):
        r = s.get(f"{API}/events", params={"q": "Mumbai"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] > 0

    def test_sort_popular(self, s):
        r = s.get(f"{API}/events", params={"sort": "popular"}, timeout=20)
        assert r.status_code == 200
        evs = r.json()["events"]
        if len(evs) >= 2:
            assert evs[0]["attendees_count"] >= evs[1]["attendees_count"]

    def test_sort_rating(self, s):
        r = s.get(f"{API}/events", params={"sort": "rating"}, timeout=20)
        assert r.status_code == 200
        evs = r.json()["events"]
        if len(evs) >= 2:
            assert evs[0]["rating"] >= evs[1]["rating"]

    def test_date_filter_month(self, s):
        r = s.get(f"{API}/events", params={"date_filter": "month"}, timeout=20)
        assert r.status_code == 200
        assert r.json()["total"] > 0

    def test_trending(self, s):
        r = s.get(f"{API}/events", params={"trending": "true"}, timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] > 0
        assert all(e["trending"] is True for e in d["events"])


# ---- Event detail + related + AI summary ----
class TestEventDetail:
    def test_get_event(self, s):
        r = s.get(f"{API}/events/evt-001", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "evt-001"
        assert "_id" not in d
        assert d["title"]
        assert isinstance(d.get("speakers"), list)
        assert isinstance(d.get("schedule"), list) and len(d["schedule"]) > 0

    def test_get_event_404(self, s):
        r = s.get(f"{API}/events/evt-999", timeout=20)
        assert r.status_code == 404

    def test_related_events(self, s):
        r = s.get(f"{API}/events/evt-001/related", timeout=20)
        assert r.status_code == 200
        rel = r.json()
        assert isinstance(rel, list)
        assert all(e["id"] != "evt-001" for e in rel)

    def test_summarize(self, s):
        r = s.post(f"{API}/events/evt-002/summarize", timeout=60)
        assert r.status_code == 200, f"body={r.text}"
        d = r.json()
        assert "summary" in d and isinstance(d["summary"], str)
        assert len(d["summary"]) > 20


# ---- Recommendations ----
class TestRecs:
    def test_recommend_basic(self, s):
        r = s.post(f"{API}/recommendations", json={"interests": ["technology", "ai"], "saved_ids": [], "city": "Bengaluru", "limit": 6}, timeout=60)
        assert r.status_code == 200, f"body={r.text}"
        d = r.json()
        assert "events" in d
        assert 1 <= len(d["events"]) <= 6

    def test_recommend_excludes_saved(self, s):
        r = s.post(f"{API}/recommendations", json={"interests": ["startup"], "saved_ids": ["evt-003"], "limit": 6}, timeout=60)
        assert r.status_code == 200
        ids = [e["id"] for e in r.json()["events"]]
        assert "evt-003" not in ids

    def test_recommend_empty(self, s):
        r = s.post(f"{API}/recommendations", json={"interests": [], "saved_ids": [], "limit": 4}, timeout=30)
        assert r.status_code == 200
        assert len(r.json()["events"]) <= 4
