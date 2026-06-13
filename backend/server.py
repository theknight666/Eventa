from fastapi import FastAPI, APIRouter, HTTPException, Header, Request
from fastapi.responses import JSONResponse

from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import re
import json
import uuid
import random
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from xml.sax.saxutils import escape

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

from scraper_sync import sync_all_cities
from meetup_sync import sync_meetup_cities
from eb_sync import sync_eb_cities
from luma_sync import sync_luma_cities
from townscript_sync import sync_ts_cities
from dedup import generate_dedup_key, deduplicate_database, check_duplicate_exists

# Default cover image for organizer-created events
_DEFAULT_COVER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"


def _sched():
    """Default schedule template for organizer-created events."""
    return [
        {"time": "09:00 AM", "title": "Registration & Welcome Networking", "desc": "Check-in, badge collection and morning coffee with fellow attendees."},
        {"time": "10:00 AM", "title": "Opening Keynote", "desc": "Setting the stage with industry vision and the year ahead."},
        {"time": "11:30 AM", "title": "Panel: The Road Ahead", "desc": "Leaders debate the biggest opportunities and challenges."},
        {"time": "01:00 PM", "title": "Networking Lunch", "desc": "Curated lunch with structured introductions."},
        {"time": "02:30 PM", "title": "Deep-Dive Workshops", "desc": "Hands-on breakout sessions across multiple tracks."},
        {"time": "04:30 PM", "title": "Fireside Chat & Closing", "desc": "Closing conversation followed by cocktails and connections."},
    ]

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'eventa')]

app = FastAPI(title="Eventa — India Event Discovery")

cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",")] if cors_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

CATEGORIES = [
    {"id": "startup", "label": "Startup", "icon": "Rocket"},
    {"id": "business", "label": "Business", "icon": "Briefcase"},
    {"id": "technology", "label": "Technology", "icon": "Cpu"},
    {"id": "ai", "label": "AI & Automation", "icon": "Sparkles"},
    {"id": "finance", "label": "Finance", "icon": "TrendingUp"},
    {"id": "marketing", "label": "Marketing", "icon": "Megaphone"},
    {"id": "import-export", "label": "Import / Export", "icon": "Ship"},
    {"id": "manufacturing", "label": "Manufacturing", "icon": "Factory"},
    {"id": "real-estate", "label": "Real Estate", "icon": "Building2"},
    {"id": "healthcare", "label": "Healthcare", "icon": "HeartPulse"},
    {"id": "education", "label": "Education", "icon": "GraduationCap"},
    {"id": "entertainment", "label": "Entertainment", "icon": "Clapperboard"},
    {"id": "sports", "label": "Sports", "icon": "Trophy"},
    {"id": "government", "label": "Government", "icon": "Landmark"},
    {"id": "networking", "label": "Networking", "icon": "Users"},
    {"id": "ecommerce", "label": "E-commerce", "icon": "ShoppingBag"},
    {"id": "sustainability", "label": "Sustainability", "icon": "Leaf"},
    {"id": "creator", "label": "Creator Economy", "icon": "Video"},
    {"id": "music", "label": "Music Festivals", "icon": "Music"},
    {"id": "hr", "label": "HR & Recruitment", "icon": "UserPlus"},
    {"id": "legal", "label": "Legal & Compliance", "icon": "Scale"},
]

CITIES = [
    {"name": "Mumbai", "state": "Maharashtra", "image": "https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&w=900"},
    {"name": "New Delhi", "state": "Delhi", "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Bengaluru", "state": "Karnataka", "image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Hyderabad", "state": "Telangana", "image": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Pune", "state": "Maharashtra", "image": "https://images.unsplash.com/photo-1625731023276-2a2d6b2c1a4f?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Chennai", "state": "Tamil Nadu", "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Ahmedabad", "state": "Gujarat", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Kolkata", "state": "West Bengal", "image": "https://images.unsplash.com/photo-1558431382-27e303142255?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Jaipur", "state": "Rajasthan", "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Gurugram", "state": "Haryana", "image": "https://images.unsplash.com/photo-1580974852861-c381510bc98a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Noida", "state": "Uttar Pradesh", "image": "https://images.unsplash.com/photo-1667849357658-0ceb68ab3066?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"},
    {"name": "Surat", "state": "Gujarat", "image": "/images/surat.png"},
    {"name": "Varanasi", "state": "Uttar Pradesh", "image": "/images/varanasi.png"},
    {"name": "Indore", "state": "Madhya Pradesh", "image": "/images/indore.png"},
]


@app.on_event("startup")
async def on_startup():
    async def init_db_tasks():
        duplicates_removed = await deduplicate_database(db)
        if duplicates_removed > 0:
            logger.info(f"Removed {duplicates_removed} duplicate events from database.")
        await db.events.update_many({"approval_status": {"$exists": False}}, {"$set": {"approval_status": "approved"}})
        # Create 2dsphere index for geospatial queries
        await db.events.create_index([("location", "2dsphere")])

    asyncio.create_task(init_db_tasks())
    
    # Kick off consolidated live-event scraper sync in the background
    asyncio.create_task(_background_all_scrapers())
    
    # Kick off periodic deduplication process
    asyncio.create_task(_background_dedup())


async def _background_all_scrapers():
    """Run all scrapers sequentially in a continuous loop in the background."""
    while True:
        try:
            res_ae = await sync_all_cities(db)
            res_meetup = await sync_meetup_cities(db)
            res_eb = await sync_eb_cities(db)
            res_luma = await sync_luma_cities(db)
            res_ts = await sync_ts_cities(db)
            
            logger.info(
                f"Scraper cycle complete. Upserted: "
                f"AE({res_ae.get('upserted',0)}), Meetup({res_meetup.get('upserted',0)}), "
                f"EB({res_eb.get('upserted',0)}), Luma({res_luma.get('upserted',0)}), "
                f"TS({res_ts.get('upserted',0)})"
            )
        except Exception as e:
            logger.error(f"Background scraper orchestrator error: {e}")
        
        # Each individual scraper tracks its own 6-hour cooldown in the DB
        # so this loop can run frequently (e.g. hourly) to catch off-cycle resets.
        await asyncio.sleep(3600)


async def _background_dedup():
    """Run deduplication continuously every 30 minutes."""
    while True:
        await asyncio.sleep(1800)  # 30 minutes
        try:
            removed = await deduplicate_database(db)
            if removed > 0:
                logger.info(f"Periodic dedup removed {removed} duplicate events.")
        except Exception as e:
            logger.error(f"Periodic dedup error: {e}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our team has been notified.", "error_type": type(exc).__name__, "error_msg": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )


# ----------------------- Models -----------------------
class RecommendRequest(BaseModel):
    interests: List[str] = []
    saved_ids: List[str] = []
    city: Optional[str] = None
    limit: int = 6


# ----------------------- Helpers -----------------------
def clean(doc):
    doc.pop("_id", None)
    return doc


async def llm_complete(system: str, prompt: str, max_tokens: int = 600) -> str:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=EMERGENT_LLM_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"llm error: {e}")
        raise Exception("openai not available or failed")


# ----------------------- Routes -----------------------
@api_router.get("/")
async def root():
    return {"message": "Eventa API live"}


# -------------------- Attendee / Saved Events --------------------

class AttendeeRegisterReq(BaseModel):
    name: str
    email: str
    password: Optional[str] = None

class AttendeeLoginReq(BaseModel):
    name: Optional[str] = None
    email: str
    password: Optional[str] = None

class ToggleSavedReq(BaseModel):
    event_id: str
    save: bool

class AttendeePreferencesReq(BaseModel):
    city: Optional[str] = None
    interests: List[str] = []

class BulkEventsReq(BaseModel):
    ids: List[str]

class ForgotPasswordReq(BaseModel):
    email: str

class ResetPasswordReq(BaseModel):
    email: str
    token: str
    new_password: str

@api_router.post("/attendee/register")
async def attendee_register(req: AttendeeRegisterReq):
    attendee = await db.attendees.find_one({"email": req.email})
    if attendee:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_attendee = {
        "email": req.email,
        "name": req.name,
        "saved_events": [],
        "preferences": {"city": None, "interests": []},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    if req.password:
        new_attendee["password_hash"] = get_password_hash(req.password)
        
    await db.attendees.insert_one(new_attendee)
    return clean(new_attendee)

@api_router.post("/attendee/login")
async def attendee_login(req: AttendeeLoginReq):
    attendee = await db.attendees.find_one({
        "$or": [{"email": req.email}, {"name": req.email}]
    })
    
    if not attendee:
        if not req.password and req.name:
            # Google auto-register
            new_attendee = {
                "email": req.email,
                "name": req.name,
                "saved_events": [],
                "preferences": {"city": None, "interests": []},
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.attendees.insert_one(new_attendee)
            return clean(new_attendee)
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if req.password:
        if not attendee.get("password_hash") or not verify_password(req.password, attendee["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    return clean(attendee)

@api_router.post("/attendee/forgot-password")
async def attendee_forgot_password(req: ForgotPasswordReq):
    attendee = await db.attendees.find_one({"email": req.email})
    if not attendee:
        return {"ok": True, "token": "dummy-token"}
    token = uuid.uuid4().hex
    await db.attendees.update_one({"email": req.email}, {"$set": {"reset_token": token}})
    return {"ok": True, "token": token}

@api_router.post("/attendee/reset-password")
async def attendee_reset_password(req: ResetPasswordReq):
    attendee = await db.attendees.find_one({"email": req.email, "reset_token": req.token})
    if not attendee:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    await db.attendees.update_one(
        {"email": req.email},
        {"$set": {"password_hash": get_password_hash(req.new_password)}, "$unset": {"reset_token": ""}}
    )
    return {"ok": True}

@api_router.put("/attendee/{email}/preferences")
async def update_attendee_preferences(email: str, req: AttendeePreferencesReq):
    import urllib.parse
    decoded_email = urllib.parse.unquote(email)
    attendee = await db.attendees.find_one({"email": decoded_email})
    if not attendee:
        raise HTTPException(status_code=404, detail="Attendee not found")
        
    preferences = {"city": req.city, "interests": req.interests}
    await db.attendees.update_one(
        {"email": decoded_email},
        {"$set": {"preferences": preferences}}
    )
    return {"status": "ok", "preferences": preferences}

@api_router.get("/attendee/{email}/saved")
async def get_attendee_saved(email: str):
    attendee = await db.attendees.find_one({"email": email})
    if not attendee:
        return {"saved": []}
    return {"saved": attendee.get("saved_events", [])}

@api_router.post("/attendee/{email}/saved")
async def toggle_attendee_saved(email: str, req: ToggleSavedReq):
    if req.save:
        await db.attendees.update_one(
            {"email": email},
            {"$addToSet": {"saved_events": req.event_id}},
            upsert=True
        )
    else:
        await db.attendees.update_one(
            {"email": email},
            {"$pull": {"saved_events": req.event_id}}
        )
    return {"status": "ok"}

@api_router.get("/attendee/{email}/history")
async def get_attendee_history(email: str):
    cursor = db.registrations.find({"email": email}).sort([("created_at", -1)])
    regs = [clean(d) async for d in cursor]
    event_ids = [r["event_id"] for r in regs]
    
    if not event_ids:
        return {"history": []}
        
    events_cursor = db.events.find({"id": {"$in": event_ids}})
    events_by_id = {e["id"]: clean(e) async for e in events_cursor}
    
    history = []
    for r in regs:
        ev = events_by_id.get(r["event_id"])
        if ev:
            history.append({
                "registration_id": r.get("id"),
                "registered_at": r.get("created_at"),
                "event": ev
            })
    return {"history": history}


@api_router.post("/events/bulk")
async def get_bulk_events(req: BulkEventsReq):
    if not req.ids:
        return {"events": []}
    cursor = db.events.find({"id": {"$in": req.ids}})
    docs = [clean(d) async for d in cursor]
    return {"events": docs}


# -------------------- Admin / Debug --------------------

@api_router.get("/events/sources")
async def event_sources():
    """Return event counts broken down by source."""
    pipeline = [{"$group": {"_id": "$source", "count": {"$sum": 1}}}]
    breakdown = {}
    async for row in db.events.aggregate(pipeline):
        breakdown[row["_id"] or "seed"] = row["count"]
    total = await db.events.count_documents({})
    meta = await db.meta.find_one({"key": "last_scraper_sync"})
    last_sync = meta["value"] if meta else None
    
    return {
        "total": total,
        "by_source": breakdown,
        "last_scraper_sync": last_sync,
    }


@api_router.post("/admin/sync-all")
async def admin_sync_all(force: bool = False):
    """Manually trigger all live-event scrapers.
    Pass ?force=true to bypass the cooldown.
    """
    res_ae = await sync_all_cities(db, force=force)
    res_meetup = await sync_meetup_cities(db, force=force)
    res_eb = await sync_eb_cities(db, force=force)
    res_luma = await sync_luma_cities(db, force=force)
    res_ts = await sync_ts_cities(db, force=force)
    
    return {
        "allevents": res_ae,
        "meetup": res_meetup,
        "eventbrite": res_eb,
        "luma": res_luma,
        "townscript": res_ts
    }


@api_router.get("/categories")
async def get_categories():
    counts = {}
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    async for row in db.events.aggregate(pipeline):
        counts[row["_id"]] = row["count"]
    return [{**c, "count": counts.get(c["id"], 0)} for c in CATEGORIES]


@api_router.get("/cities")
async def get_cities():
    counts = {}
    pipeline = [{"$group": {"_id": "$city", "count": {"$sum": 1}}}]
    async for row in db.events.aggregate(pipeline):
        counts[row["_id"]] = row["count"]
    return [{**c, "count": counts.get(c["name"], 0)} for c in CITIES]


@api_router.get("/sitemap.xml")
async def get_sitemap():
    # Base URL of the frontend
    base_url = "https://eventa.in"
    
    # Static routes
    urls = [
        f"{base_url}/",
        f"{base_url}/organizer",
    ]
    
    # Dynamic events
    events = db.events.find({"approval_status": "approved"}, {"id": 1})
    async for event in events:
        urls.append(f"{base_url}/events/{event['id']}")
        
    # Organizers
    organizers = db.organizers.find({}, {"slug": 1})
    async for org in organizers:
        urls.append(f"{base_url}/org/{org['slug']}")

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    for url in urls:
        xml_lines.append(f"  <url><loc>{escape(url)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>")
        
    xml_lines.append("</urlset>")
    
    return Response(content="\n".join(xml_lines), media_type="application/xml")

@api_router.get("/overview")
async def get_overview():
    now = datetime.now(timezone.utc)
    week = (now + timedelta(days=7)).isoformat()
    events_this_week = await db.events.count_documents({"start_iso": {"$lte": week}})
    total = await db.events.count_documents({})
    cities = len(await db.events.distinct("city"))
    organizers = await db.organizers.count_documents({})
    agg = db.events.aggregate([{"$group": {"_id": None, "att": {"$sum": "$attendees_count"}}}])
    attendees = 0
    async for row in agg:
        attendees = row["att"]
    return {
        "events_this_week": max(events_this_week, 0),
        "cities_covered": cities,
        "registered_attendees": attendees,
        "active_organizers": organizers,
        "total_events": total,
    }


@api_router.get("/events")
async def list_events(
    q: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    event_type: Optional[str] = None,
    pricing: Optional[str] = None,
    size: Optional[str] = None,
    date_filter: Optional[str] = None,
    industries: Optional[str] = None,
    featured: Optional[bool] = None,
    trending: Optional[bool] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[int] = None,
    sort: str = "date",
    limit: int = 60,
    skip: int = 0,
):
    query = {"approval_status": "approved"}
    if category:
        query["category"] = category
    if city:
        query["city"] = city
    if state:
        query["state"] = state
    if event_type:
        query["event_type"] = event_type
    if pricing:
        query["pricing"] = pricing
    if size:
        query["attendance_size"] = size
    if featured is not None:
        query["featured"] = featured
    if industries:
        ind_list = [i for i in industries.split(",") if i]
        if ind_list:
            query["category"] = {"$in": ind_list}
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [
            {"title": rx}, {"city": rx}, {"industry": rx}, {"venue": rx},
            {"organizer.name": rx}, {"tags": rx}, {"speakers.name": rx},
        ]
    if date_filter:
        now = datetime.now(timezone.utc)
        start = now
        if date_filter == "today":
            end = now.replace(hour=23, minute=59, second=59)
        elif date_filter == "tomorrow":
            start = (now + timedelta(days=1)).replace(hour=0, minute=0)
            end = start.replace(hour=23, minute=59, second=59)
        elif date_filter == "week":
            end = now + timedelta(days=7)
        elif date_filter == "month":
            end = now + timedelta(days=30)
        else:
            end = None
        if end is not None:
            query["start_iso"] = {"$gte": start.isoformat(), "$lte": end.isoformat()}
    else:
        # Default behavior: hide expired events (events that started before today 00:00:00)
        now = datetime.now(timezone.utc)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query["start_iso"] = {"$gte": start_of_today.isoformat()}
            
    if lat is not None and lng is not None and radius_km is not None:
        # MongoDB $nearSphere query (distance in meters)
        query["location"] = {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "$maxDistance": radius_km * 1000
            }
        }
        # When using $nearSphere, MongoDB automatically sorts by distance
        sort = "distance"

    sort_field = {"date": ("start_iso", 1), "popular": ("attendees_count", -1), "rating": ("rating", -1)}.get(sort)
    
    try:
        cursor = db.events.find(query)
        if sort_field:
            cursor = cursor.sort([sort_field])
        cursor = cursor.skip(skip).limit(limit)
        docs = [clean(d) async for d in cursor]
        total = await db.events.count_documents(query)
    except Exception as e:
        logger.error(f"Geo query failed, falling back: {e}")
        # Remove location from query and try again
        if "location" in query:
            del query["location"]
        cursor = db.events.find(query)
        if sort_field:
            cursor = cursor.sort([sort_field])
        cursor = cursor.skip(skip).limit(limit)
        docs = [clean(d) async for d in cursor]
        total = await db.events.count_documents(query)
        
    return {"events": docs, "total": total}


@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    doc = await db.events.find_one({"id": event_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    return clean(doc)


@api_router.get("/events/{event_id}/related")
async def related_events(event_id: str):
    doc = await db.events.find_one({"id": event_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    cursor = db.events.find({
        "id": {"$ne": event_id},
        "$or": [{"category": doc["category"]}, {"city": doc["city"]}],
    }).limit(4)
    return [clean(d) async for d in cursor]


@api_router.post("/events/{event_id}/summarize")
async def summarize_event(event_id: str):
    doc = await db.events.find_one({"id": event_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    if doc.get("ai_summary"):
        return {"summary": doc["ai_summary"], "cached": True}
    try:
        speakers = ", ".join([f"{s['name']} ({s['title']})" for s in doc.get("speakers", [])])
        prompt = (
            f"Write a crisp, premium 2-sentence highlight for attendees about this event.\n"
            f"Title: {doc['title']}\nCategory: {doc['industry']}\nCity: {doc['city']}\n"
            f"Venue: {doc['venue']}\nSpeakers: {speakers}\nAbout: {doc['description']}\n"
            f"Focus on why a professional should attend. No markdown, no preamble."
        )
        summary = await llm_complete(
            "You are an expert event copywriter for India's top event platform. Be concise and compelling.",
            prompt, max_tokens=200,
        )
        summary = summary.strip()
        await db.events.update_one({"id": event_id}, {"$set": {"ai_summary": summary}})
        return {"summary": summary, "cached": False}
    except Exception as e:
        logger.error(f"summarize error: {e}")
        # Graceful fallback so the UI never breaks
        fallback = doc.get("description", "")[:240]
        return {"summary": fallback, "cached": False, "fallback": True}


@api_router.post("/recommendations")
async def recommendations(req: RecommendRequest):
    req.limit = max(1, min(req.limit, 20))
    # candidate pool
    candidates = [clean(d) async for d in db.events.find({"approval_status": "approved"}).limit(60)]
    by_id = {e["id"]: e for e in candidates}

    # local scoring
    def score(e):
        s = 0
        if req.interests:
            if e["category"] in req.interests:
                s += 5
            s += sum(2 for t in e.get("tags", []) if t.lower() in [i.lower() for i in req.interests])
        if req.city and e["city"] == req.city:
            s += 3
        if e["id"] in req.saved_ids:
            s -= 100  # exclude already saved
        s += e.get("rating", 0)
        s += min(e.get("attendees_count", 0) / 10000, 3)
        return s

    ranked = sorted([e for e in candidates if e["id"] not in req.saved_ids], key=score, reverse=True)
    local_top = ranked[: req.limit]

    # Try AI re-ranking for a more intelligent selection
    if EMERGENT_LLM_KEY and (req.interests or req.saved_ids):
        try:
            pool = ranked[:20]
            listing = "\n".join([f"{e['id']} | {e['title']} | {e['industry']} | {e['city']} | tags: {', '.join(e.get('tags', []))}" for e in pool])
            prompt = (
                f"User interests: {', '.join(req.interests) or 'general professional'}\n"
                f"Preferred city: {req.city or 'any'}\n\n"
                f"From the events below, pick the {req.limit} best matches.\n{listing}\n\n"
                f'Return ONLY a JSON array of event ids in ranked order, e.g. ["evt-001","evt-005"].'
            )
            raw = await llm_complete(
                "You are a precise event recommendation engine. Output strictly valid JSON.",
                prompt, max_tokens=200,
            )
            match = re.search(r"\[.*\]", raw, re.DOTALL)
            if match:
                ids = json.loads(match.group(0))
                picked = [by_id[i] for i in ids if i in by_id and i not in req.saved_ids]
                if picked:
                    local_top = picked[: req.limit]
        except Exception as e:
            logger.warning(f"AI rerank fallback: {e}")

    return {"events": local_top}


# ======================= ORGANIZER PORTAL =======================
SAMPLE_NAMES = [
    "Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Iyer", "Vikram Singh",
    "Sneha Reddy", "Arjun Nair", "Kavya Rao", "Aditya Gupta", "Ishita Joshi",
    "Karthik Menon", "Neha Verma", "Siddharth Bose", "Pooja Desai", "Rahul Khanna",
    "Meera Pillai", "Aniket Kulkarni", "Divya Agarwal", "Manish Tiwari", "Riya Kapoor",
]


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").strip().lower()).strip("-")
    return s or "organizer"


class OrganizerRegisterReq(BaseModel):
    name: str
    email: str
    password: Optional[str] = None

class OrganizerLogin(BaseModel):
    name: Optional[str] = None
    email: str
    password: Optional[str] = None


class EventInput(BaseModel):
    title: str
    category: str
    industry: Optional[str] = ""
    description: str = ""
    cover_image: Optional[str] = ""
    date: str
    time: str = "10:00 AM"
    city: str
    state: str = ""
    venue: str = ""
    address: str = ""
    event_type: str = "offline"
    pricing: str = "free"
    price: int = 0
    attendance_size: str = "medium"
    tags: List[str] = []


class RegisterInput(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""


def _start_iso_from(date_str: str) -> str:
    try:
        d = datetime.fromisoformat(date_str)
    except Exception:
        d = datetime.now(timezone.utc) + timedelta(days=7)
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.replace(hour=9, minute=0, second=0, microsecond=0).isoformat()


def _build_organizer_event(inp: EventInput, org) -> dict:
    cat_industry = inp.industry or inp.category.replace("-", " ").title()
    return {
        "id": f"org-{uuid.uuid4().hex[:10]}",
        "dedup_key": generate_dedup_key(inp.title, inp.date, inp.city),
        "title": inp.title,
        "category": inp.category,
        "industry": cat_industry,
        "description": inp.description,
        "ai_summary": "",
        "approval_status": "pending",
        "cover_image": inp.cover_image or _DEFAULT_COVER,
        "date": inp.date,
        "start_iso": _start_iso_from(inp.date),
        "time": inp.time,
        "duration": "Full day" if inp.attendance_size in ("large", "mega") else "Evening",
        "city": inp.city,
        "state": inp.state,
        "country": "India",
        "venue": inp.venue,
        "address": inp.address or f"{inp.venue}, {inp.city}, {inp.state}, India".strip(", "),
        "lat": 0.0, "lng": 0.0,
        "location": {"type": "Point", "coordinates": [0.0, 0.0]},
        "event_type": inp.event_type,
        "pricing": inp.pricing,
        "price": inp.price if inp.pricing == "paid" else 0,
        "currency": "INR",
        "attendance_size": inp.attendance_size,
        "organizer": {"name": org["name"], "verified": org.get("verified", False), "logo": ""},
        "speakers": [],
        "schedule": _sched(),
        "tags": inp.tags,
        "ticket_status": "available",
        "featured": False,
        "trending": False,
        "attendees_count": 0,
        "rating": 4.6,
        "owner_slug": org["slug"],
        "source": "organizer",
        "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }





@api_router.post("/organizer/register")
async def organizer_register(body: OrganizerRegisterReq):
    slug = slugify(body.name)
    org = await db.organizers.find_one({"email": body.email})
    if org:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_org = {
        "slug": slug, "name": body.name.strip(), "email": body.email or "",
        "verified": False, "verification_status": "none",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if body.password:
        new_org["password_hash"] = get_password_hash(body.password)
        
    await db.organizers.insert_one(new_org)
    return clean(new_org)

@api_router.post("/organizer/login")
async def organizer_login(body: OrganizerLogin):
    org = await db.organizers.find_one({
        "$or": [{"email": body.email}, {"name": body.email}]
    })
    if not org:
        if not body.password and body.name:
            # Google auto-register
            slug = slugify(body.name)
            new_org = {
                "slug": slug, "name": body.name.strip(), "email": body.email or "",
                "verified": False, "verification_status": "none",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.organizers.insert_one(new_org)
            return clean(new_org)
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if body.password:
        if not org.get("password_hash") or not verify_password(body.password, org["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    return clean(dict(org))

@api_router.post("/organizer/forgot-password")
async def organizer_forgot_password(req: ForgotPasswordReq):
    org = await db.organizers.find_one({"email": req.email})
    if not org:
        return {"ok": True, "token": "dummy-token"}
    token = uuid.uuid4().hex
    await db.organizers.update_one({"email": req.email}, {"$set": {"reset_token": token}})
    return {"ok": True, "token": token}

@api_router.post("/organizer/reset-password")
async def organizer_reset_password(req: ResetPasswordReq):
    org = await db.organizers.find_one({"email": req.email, "reset_token": req.token})
    if not org:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    await db.organizers.update_one(
        {"email": req.email},
        {"$set": {"password_hash": get_password_hash(req.new_password)}, "$unset": {"reset_token": ""}}
    )
    return {"ok": True}


@api_router.get("/organizer/{slug}")
async def get_organizer(slug: str):
    org = await db.organizers.find_one({"slug": slug})
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
    return clean(org)


@api_router.post("/organizer/{slug}/request-verification")
async def request_verification(slug: str):
    org = await db.organizers.find_one({"slug": slug})
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
    await db.organizers.update_one({"slug": slug}, {"$set": {"verification_status": "pending"}})
    return {"verification_status": "pending"}


@api_router.get("/organizer/{slug}/events")
async def organizer_events(slug: str):
    cursor = db.events.find({"owner_slug": slug}).sort([("created_at", -1)])
    return [clean(d) async for d in cursor]


@api_router.post("/organizer/{slug}/events")
async def create_event(slug: str, inp: EventInput):
    org = await db.organizers.find_one({"slug": slug})
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
        
    if await check_duplicate_exists(db, inp.title, inp.date, inp.city):
        raise HTTPException(status_code=400, detail="An event with this title, city, and date already exists.")
        
    event = _build_organizer_event(inp, org)
    await db.events.insert_one(dict(event))
    fresh = await db.events.find_one({"id": event["id"]})
    return clean(fresh)


@api_router.put("/organizer/{slug}/events/{event_id}")
async def update_event(slug: str, event_id: str, inp: EventInput):
    existing = await db.events.find_one({"id": event_id, "owner_slug": slug})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if await check_duplicate_exists(db, inp.title, inp.date, inp.city, exclude_event_id=event_id):
        raise HTTPException(status_code=400, detail="Another event with this title, city, and date already exists.")
        
    updates = {
        "dedup_key": generate_dedup_key(inp.title, inp.date, inp.city),
        "title": inp.title, "category": inp.category,
        "industry": inp.industry or inp.category.replace("-", " ").title(),
        "description": inp.description, "cover_image": inp.cover_image or existing["cover_image"],
        "date": inp.date, "start_iso": _start_iso_from(inp.date), "time": inp.time,
        "city": inp.city, "state": inp.state, "venue": inp.venue,
        "address": inp.address or f"{inp.venue}, {inp.city}, {inp.state}, India".strip(", "),
        "event_type": inp.event_type, "pricing": inp.pricing,
        "price": inp.price if inp.pricing == "paid" else 0,
        "attendance_size": inp.attendance_size, "tags": inp.tags,
    }
    await db.events.update_one({"id": event_id}, {"$set": updates})
    fresh = await db.events.find_one({"id": event_id})
    return clean(fresh)


@api_router.delete("/organizer/{slug}/events/{event_id}")
async def delete_event(slug: str, event_id: str):
    res = await db.events.delete_one({"id": event_id, "owner_slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.registrations.delete_many({"event_id": event_id})
    await db.views.delete_many({"event_id": event_id})
    return {"deleted": True}


@api_router.get("/organizer/{slug}/dashboard")
async def organizer_dashboard(slug: str):
    org = await db.organizers.find_one({"slug": slug})
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
    events = [clean(d) async for d in db.events.find({"owner_slug": slug})]
    event_titles = {e["id"]: e["title"] for e in events}
    total_views = await db.views.count_documents({"owner_slug": slug})
    total_regs = await db.registrations.count_documents({"owner_slug": slug})
    revenue = 0
    for e in events:
        if e.get("pricing") == "paid":
            c = await db.registrations.count_documents({"event_id": e["id"]})
            revenue += c * e.get("price", 0)

    # 14-day timeseries
    days = [(datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat() for i in range(13, -1, -1)]
    vmap = {d: 0 for d in days}
    rmap = {d: 0 for d in days}
    async for row in db.views.aggregate([{"$match": {"owner_slug": slug}}, {"$group": {"_id": "$date", "c": {"$sum": 1}}}]):
        if row["_id"] in vmap:
            vmap[row["_id"]] = row["c"]
    async for row in db.registrations.aggregate([{"$match": {"owner_slug": slug}}, {"$group": {"_id": "$date", "c": {"$sum": 1}}}]):
        if row["_id"] in rmap:
            rmap[row["_id"]] = row["c"]
    timeseries = [{"date": d, "views": vmap[d], "registrations": rmap[d]} for d in days]

    recent = []
    async for r in db.registrations.find({"owner_slug": slug}).sort([("created_at", -1)]).limit(12):
        recent.append({
            "id": r.get("id"), "name": r.get("name"), "email": r.get("email"),
            "event": event_titles.get(r.get("event_id"), "—"), "created_at": r.get("created_at"),
        })

    return {
        "organizer": clean(org),
        "stats": {
            "total_events": len(events),
            "total_views": total_views,
            "total_registrations": total_regs,
            "revenue": revenue,
        },
        "timeseries": timeseries,
        "recent_registrations": recent,
    }


# ======================= ADMIN PORTAL =======================
from fastapi import Header

def get_admin_key(x_admin_key: str = Header(None)):
    secret = os.environ.get("ADMIN_SECRET", "superadmin123")
    if not x_admin_key or x_admin_key != secret:
        raise HTTPException(status_code=401, detail="Unauthorized Admin")
    return True

class AdminLoginReq(BaseModel):
    password: str

@api_router.post("/admin/login")
async def admin_login(req: AdminLoginReq):
    secret = os.environ.get("ADMIN_SECRET", "superadmin123")
    if req.password == secret:
        return {"token": secret}
    raise HTTPException(status_code=401, detail="Invalid admin password")

@api_router.get("/admin/events/pending")
async def admin_pending_events(x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    cursor = db.events.find({"approval_status": "pending"}).sort([("created_at", -1)])
    return [clean(d) async for d in cursor]

@api_router.get("/admin/events/all")
async def admin_all_events(x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    cursor = db.events.find({}).sort([("created_at", -1)]).limit(100)
    return [clean(d) async for d in cursor]

@api_router.put("/admin/events/{event_id}/approve")
async def admin_approve_event(event_id: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.events.update_one({"id": event_id}, {"$set": {"approval_status": "approved"}})
    return {"status": "ok"}

@api_router.put("/admin/events/{event_id}/reject")
async def admin_reject_event(event_id: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.events.update_one({"id": event_id}, {"$set": {"approval_status": "rejected"}})
    return {"status": "ok"}

@api_router.put("/admin/events/{event_id}/feature")
async def admin_feature_event(event_id: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.events.update_one({"id": event_id}, {"$set": {"featured": True}})
    return {"status": "ok"}

@api_router.put("/admin/events/{event_id}/unfeature")
async def admin_unfeature_event(event_id: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.events.update_one({"id": event_id}, {"$set": {"featured": False}})
    return {"status": "ok"}


@api_router.delete("/admin/events/{event_id}")
async def admin_delete_event(event_id: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.events.delete_one({"id": event_id})
    return {"status": "ok"}

@api_router.get("/admin/organizers/pending")
async def admin_pending_organizers(x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    cursor = db.organizers.find({"verification_status": "pending"}).sort([("created_at", -1)])
    return [clean(d) async for d in cursor]

@api_router.get("/admin/organizers/all")
async def admin_all_organizers(x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    cursor = db.organizers.find({}).sort([("created_at", -1)]).limit(100)
    return [clean(d) async for d in cursor]

@api_router.get("/admin/organizers/verified")
async def admin_verified_organizers(x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    cursor = db.organizers.find({"verified": True}).sort([("created_at", -1)]).limit(100)
    return [clean(d) async for d in cursor]

@api_router.put("/admin/organizers/{slug}/verify")
async def admin_verify_organizer(slug: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.organizers.update_one({"slug": slug}, {"$set": {"verification_status": "verified", "verified": True}})
    await db.events.update_many({"owner_slug": slug}, {"$set": {"organizer.verified": True}})
    return {"status": "ok"}

@api_router.put("/admin/organizers/{slug}/reject")
async def admin_reject_organizer(slug: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.organizers.update_one({"slug": slug}, {"$set": {"verification_status": "rejected", "verified": False}})
    await db.events.update_many({"owner_slug": slug}, {"$set": {"organizer.verified": False}})
    return {"status": "ok"}

@api_router.delete("/admin/organizers/{slug}")
async def admin_delete_organizer(slug: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    await db.organizers.delete_one({"slug": slug})
    await db.events.delete_many({"owner_slug": slug})
    return {"status": "ok"}


from fastapi.responses import Response

@api_router.get("/admin/events/{event_id}/registrations/csv")
async def admin_export_registrations(event_id: str, x_admin_key: str = Header(None)):
    get_admin_key(x_admin_key)
    cursor = db.registrations.find({"event_id": event_id}).sort([("created_at", -1)])
    
    import csv
    import io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Registration ID", "Name", "Email", "Phone", "Registration Date"])
    
    async for reg in cursor:
        writer.writerow([
            reg.get("id", ""),
            reg.get("name", ""),
            reg.get("email", ""),
            reg.get("phone", ""),
            reg.get("created_at", "")
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=registrations_{event_id}.csv"}
    )


@api_router.post("/events/{event_id}/view")
async def track_view(event_id: str):
    ev = await db.events.find_one({"id": event_id}, {"owner_slug": 1})
    if not ev:
        return {"ok": False}
    now = datetime.now(timezone.utc)
    await db.views.insert_one({"event_id": event_id, "owner_slug": ev.get("owner_slug"),
                               "created_at": now.isoformat(), "date": now.date().isoformat()})
    await db.events.update_one({"id": event_id}, {"$inc": {"views": 1}})
    return {"ok": True}


@api_router.post("/events/{event_id}/register")
async def register_attendee(event_id: str, body: RegisterInput):
    ev = await db.events.find_one({"id": event_id})
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    now = datetime.now(timezone.utc)
    await db.registrations.insert_one({
        "id": str(uuid.uuid4()), "event_id": event_id, "owner_slug": ev.get("owner_slug"),
        "name": body.name, "email": body.email, "phone": body.phone,
        "created_at": now.isoformat(), "date": now.date().isoformat(),
    })
    await db.events.update_one({"id": event_id}, {"$inc": {"attendees_count": 1}})
    return {"ok": True, "message": "Registration confirmed"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
