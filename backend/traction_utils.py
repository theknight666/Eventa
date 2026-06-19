"""
traction_utils.py — Real attendee count extraction and traction scoring.

Extracts REAL attendee/RSVP/registration counts from source platform
JSON-LD and HTML data. When real data is not available, returns 0
instead of fabricating numbers.

Also provides traction scoring based on real signals (registrations,
views, organizer verification) to replace fake ratings.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)


def extract_attendees_from_jsonld(data: dict) -> int:
    """
    Extract real attendee/registration count from JSON-LD structured data.
    
    Checks multiple Schema.org properties that platforms use:
    - maximumAttendeeCapacity — total capacity
    - remainingAttendeeCapacity — spots left (capacity - sold)
    - numberOfAttendees — some platforms provide this directly
    - offers.inventoryLevel — ticket inventory
    - offers.availability — if "SoldOut", indicates high attendance
    
    Returns the extracted count, or 0 if not available.
    """
    if not data:
        return 0
    
    # Direct attendee count (rare but most accurate)
    for key in ("numberOfAttendees", "attendeeCount", "attendees"):
        val = data.get(key)
        if val is not None:
            try:
                count = int(float(str(val)))
                if count > 0:
                    return count
            except (ValueError, TypeError):
                pass
    
    # Try to compute from capacity - remaining
    capacity = 0
    remaining = 0
    
    cap_val = data.get("maximumAttendeeCapacity")
    if cap_val is not None:
        try:
            capacity = int(float(str(cap_val)))
        except (ValueError, TypeError):
            pass
    
    rem_val = data.get("remainingAttendeeCapacity")
    if rem_val is not None:
        try:
            remaining = int(float(str(rem_val)))
        except (ValueError, TypeError):
            pass
    
    if capacity > 0 and remaining >= 0:
        sold = capacity - remaining
        if sold > 0:
            return sold
    
    # Check offers for inventory information
    offers = data.get("offers")
    if offers:
        offer_list = [offers] if isinstance(offers, dict) else offers if isinstance(offers, list) else []
        for offer in offer_list:
            if not isinstance(offer, dict):
                continue
            
            # Check if sold out
            avail = offer.get("availability", "")
            if isinstance(avail, str) and "SoldOut" in avail:
                # Event sold out — use capacity if known
                if capacity > 0:
                    return capacity
            
            # Check inventory level
            inv = offer.get("inventoryLevel")
            if inv is not None:
                try:
                    inv_val = int(float(str(inv)))
                    if capacity > 0 and inv_val >= 0:
                        sold = capacity - inv_val
                        if sold > 0:
                            return sold
                except (ValueError, TypeError):
                    pass
    
    # If we only have capacity and no sold info, return 0 (don't fabricate)
    return 0


def extract_attendees_from_html(soup, source: str = "") -> int:
    """
    Extract real attendee/registration count from HTML page content.
    
    Uses platform-specific selectors and text patterns to find
    real attendance numbers embedded in the page.
    
    Args:
        soup: BeautifulSoup object of the event page
        source: The source platform (e.g., 'scraper', 'meetup', 'eventbrite', 'luma', 'townscript')
    
    Returns the extracted count, or 0 if not available.
    """
    if not soup:
        return 0
    
    count = 0
    
    # Platform-specific extraction
    if source in ("meetup", ""):
        count = _extract_meetup_attendees(soup)
        if count > 0:
            return count
    
    if source in ("scraper", ""):
        count = _extract_allevents_attendees(soup)
        if count > 0:
            return count
    
    if source in ("eventbrite", ""):
        count = _extract_eventbrite_attendees(soup)
        if count > 0:
            return count
    
    if source in ("luma", ""):
        count = _extract_luma_attendees(soup)
        if count > 0:
            return count
    
    if source in ("townscript", ""):
        count = _extract_townscript_attendees(soup)
        if count > 0:
            return count
    
    # Generic fallback — look for common patterns in any page
    count = _extract_generic_attendees(soup)
    return count


def _parse_count_text(text: str) -> int:
    """Parse a human-readable count string to an integer.
    
    Handles formats like: "1,234", "1.2K", "500+", "2k", etc.
    """
    if not text:
        return 0
    
    text = text.strip().replace(",", "").replace("+", "").strip()
    
    # Handle K/k suffix (e.g., "1.2K" -> 1200)
    k_match = re.match(r'^(\d+(?:\.\d+)?)\s*[kK]$', text)
    if k_match:
        return int(float(k_match.group(1)) * 1000)
    
    # Handle M suffix
    m_match = re.match(r'^(\d+(?:\.\d+)?)\s*[mM]$', text)
    if m_match:
        return int(float(m_match.group(1)) * 1000000)
    
    # Plain number
    try:
        return int(float(text))
    except (ValueError, TypeError):
        return 0


def _extract_meetup_attendees(soup) -> int:
    """Extract attendee count from Meetup event pages."""
    # Meetup shows "X attendees" or "X going" 
    selectors = [
        "[data-testid='attendee-count']",
        "[class*='attendee'] [class*='count']",
        "[class*='rsvp'] [class*='count']",
        "[class*='going-count']",
    ]
    
    for sel in selectors:
        try:
            el = soup.select_one(sel)
            if el:
                count = _parse_count_text(el.get_text(strip=True))
                if count > 0:
                    return count
        except Exception:
            continue
    
    # Text pattern search: "123 attendees" or "123 going"
    return _find_count_near_keyword(soup, ["attendees", "going", "RSVPs", "members going"])


def _extract_allevents_attendees(soup) -> int:
    """Extract attendee count from AllEvents.in pages."""
    selectors = [
        ".interested-count",
        ".going-count",
        "[class*='interested']",
        "[class*='going']",
        ".event-meta .count",
    ]
    
    for sel in selectors:
        try:
            el = soup.select_one(sel)
            if el:
                count = _parse_count_text(el.get_text(strip=True))
                if count > 0:
                    return count
        except Exception:
            continue
    
    return _find_count_near_keyword(soup, ["interested", "going", "attending", "people interested"])


def _extract_eventbrite_attendees(soup) -> int:
    """Extract attendee count from Eventbrite pages."""
    selectors = [
        "[data-testid='social-proof']",
        "[class*='social-proof']",
        ".eds-text-color--ui-800",
    ]
    
    for sel in selectors:
        try:
            el = soup.select_one(sel)
            if el:
                text = el.get_text(strip=True)
                # Eventbrite shows "X people interested" or "X sold"
                match = re.search(r'(\d[\d,]*)', text)
                if match:
                    count = _parse_count_text(match.group(1))
                    if count > 0:
                        return count
        except Exception:
            continue
    
    return _find_count_near_keyword(soup, ["followers", "interested", "sold", "registered"])


def _extract_luma_attendees(soup) -> int:
    """Extract attendee count from Luma pages."""
    selectors = [
        "[class*='guest-count']",
        "[class*='attendee']",
        "[class*='rsvp']",
    ]
    
    for sel in selectors:
        try:
            el = soup.select_one(sel)
            if el:
                count = _parse_count_text(el.get_text(strip=True))
                if count > 0:
                    return count
        except Exception:
            continue
    
    return _find_count_near_keyword(soup, ["guests", "registered", "attending", "spots taken"])


def _extract_townscript_attendees(soup) -> int:
    """Extract attendee count from Townscript pages."""
    selectors = [
        "[class*='registration-count']",
        "[class*='bookings']",
        "[class*='sold']",
    ]
    
    for sel in selectors:
        try:
            el = soup.select_one(sel)
            if el:
                count = _parse_count_text(el.get_text(strip=True))
                if count > 0:
                    return count
        except Exception:
            continue
    
    return _find_count_near_keyword(soup, ["registrations", "bookings", "tickets sold", "registered"])


def _extract_generic_attendees(soup) -> int:
    """Generic attendee extraction using text patterns."""
    return _find_count_near_keyword(soup, [
        "attendees", "attending", "going", "interested",
        "registered", "registrations", "guests", "participants",
        "RSVPs", "tickets sold", "bookings",
    ])


def _find_count_near_keyword(soup, keywords: list) -> int:
    """
    Find a numeric count near any of the given keywords in the page text.
    
    Looks for patterns like "123 attendees" or "attendees: 123".
    """
    if not soup:
        return 0
    
    # Build regex patterns
    keywords_pattern = "|".join(re.escape(k) for k in keywords)
    
    patterns = [
        # "123 attendees" or "1,234 going"
        re.compile(r'(\d[\d,]*(?:\.\d+)?[kKmM]?)\s*(?:\+\s*)?(?:' + keywords_pattern + r')', re.IGNORECASE),
        # "attendees: 123" or "going: 1,234"
        re.compile(r'(?:' + keywords_pattern + r')\s*[:\-–]\s*(\d[\d,]*(?:\.\d+)?[kKmM]?)', re.IGNORECASE),
    ]
    
    # Search in text-heavy elements
    for el in soup.find_all(['span', 'div', 'p', 'strong', 'a', 'h3', 'h4', 'li'], limit=300):
        text = el.get_text(strip=True)
        if not text or len(text) > 200:
            continue
        
        for pattern in patterns:
            match = pattern.search(text)
            if match:
                count = _parse_count_text(match.group(1))
                if count > 0:
                    return count
    
    return 0


def compute_traction_score(
    registrations: int = 0,
    views: int = 0,
    is_verified_organizer: bool = False,
    source: str = "",
) -> float:
    """
    Compute a traction score (0.0 - 5.0) based on REAL engagement signals.
    
    This replaces the fake random.uniform(3.8, 4.9) ratings.
    The score is based entirely on real, measurable data:
    
    - Registration count (0-2.0 points)
    - View count (0-1.5 points)
    - Verified organizer bonus (0-0.5 points)
    - Source platform trust bonus (0-1.0 points)
    
    Returns 0.0 for events with no real engagement yet.
    """
    if registrations == 0 and views == 0:
        return 0.0
    
    score = 0.0
    
    # Registration score (0-2.0 points, logarithmic scale)
    if registrations > 0:
        import math
        # log2(1) = 0, log2(2) = 1, log2(8) = 3, log2(128) = 7
        reg_score = min(2.0, math.log2(registrations + 1) * 0.3)
        score += reg_score
    
    # View score (0-1.5 points, logarithmic scale)
    if views > 0:
        import math
        view_score = min(1.5, math.log2(views + 1) * 0.15)
        score += view_score
    
    # Verified organizer bonus
    if is_verified_organizer:
        score += 0.5
    
    # Source platform trust (platforms with editorial control score higher)
    source_bonus = {
        "organizer": 0.5,  # Direct organizer submission
        "eventbrite": 0.4,
        "meetup": 0.4,
        "luma": 0.3,
        "townscript": 0.3,
        "scraper": 0.2,    # Aggregator (AllEvents)
    }
    score += source_bonus.get(source, 0.2)
    
    # Cap at 5.0
    return round(min(5.0, score), 1)
