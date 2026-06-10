import re

def generate_dedup_key(title: str, date: str, city: str) -> str:
    """Generate a stable deduplication key from an event's title, date, and city."""
    title_lower = (title or "").lower()
    title_no_year = re.sub(r'20\d{2}', '', title_lower)
    t = re.sub(r'[^a-z0-9]', '', title_no_year)
    c = re.sub(r'[^a-z0-9]', '', (city or "").lower())
    d = (date or "")[:7]
    return f"{t}_{c}_{d}"

async def deduplicate_database(db):
    """
    Scans the database, assigns dedup_keys to all events,
    and removes any duplicates found.
    """
    cursor = db.events.find({})
    seen = {}
    to_delete = []
    updates = []

    async for event in cursor:
        key = generate_dedup_key(event.get("title"), event.get("date"), event.get("city"))
        if key in seen:
            # We keep the first one seen (or we could prefer 'organizer' source if we sorted first)
            # But scanning is random, so we just delete the subsequent ones.
            to_delete.append(event["id"])
        else:
            seen[key] = event["id"]
            # We also update the document to have the dedup_key
            updates.append((event["id"], key))
            
    # Delete duplicates
    if to_delete:
        await db.events.delete_many({"id": {"$in": to_delete}})
        
    # Add dedup_key to existing events
    for event_id, key in updates:
        await db.events.update_one({"id": event_id}, {"$set": {"dedup_key": key}})
        
    return len(to_delete)

async def check_duplicate_exists(db, title: str, date: str, city: str, exclude_event_id: str = None) -> bool:
    """
    Check if an event already exists using the dedup_key.
    """
    key = generate_dedup_key(title, date, city)
    query = {"dedup_key": key}
    if exclude_event_id:
        query["id"] = {"$ne": exclude_event_id}
        
    existing = await db.events.find_one(query)
    return bool(existing)
