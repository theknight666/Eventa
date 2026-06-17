"""
organizer_utils.py — Shared organizer name extraction for all scrapers.

Extracts the REAL organizer name from JSON-LD data, HTML page content,
and other structured data sources. Ensures no generic platform names
(like "Townscript Organizer", "Meetup Organizer") are stored.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Generic/platform names that should NEVER be used as the organizer name.
# If the extracted name matches any of these, we try harder to find the real name.
GENERIC_ORGANIZER_NAMES = {
    # Platform defaults
    "event organizer",
    "external organizer",
    "external organiser",
    "townscript organizer",
    "townscript organiser",
    "meetup organizer",
    "meetup organiser",
    "eventbrite organizer",
    "eventbrite organiser",
    "luma host",
    "luma organizer",
    "luma organiser",
    "organizer",
    "organiser",
    # Platform brand names (should not be used as organizer name)
    "allevents",
    "allevents.in",
    "townscript",
    "meetup",
    "eventbrite",
    "luma",
    "lu.ma",
    "bookmyshow",
    "insider.in",
    "paytm insider",
}


def is_generic_name(name: Optional[str]) -> bool:
    """Check if an organizer name is a generic/platform placeholder."""
    if not name or not name.strip():
        return True
    normalized = name.strip().lower()
    return normalized in GENERIC_ORGANIZER_NAMES


def extract_organizer_from_jsonld(data: dict) -> str:
    """
    Extract the real organizer name from JSON-LD structured data.
    
    Handles all common JSON-LD organizer formats:
    - {"organizer": {"name": "Real Name"}}
    - {"organizer": [{"name": "Real Name"}]}
    - {"organizer": "Real Name"}
    - {"organizer": [{"@type": "Organization", "name": "Real Name"}]}
    
    Returns the organizer name or empty string if not found/generic.
    """
    org = data.get("organizer")
    
    if not org:
        return ""
    
    name = ""
    
    if isinstance(org, dict):
        name = org.get("name", "")
    elif isinstance(org, list) and len(org) > 0:
        first = org[0]
        if isinstance(first, dict):
            name = first.get("name", "")
        elif isinstance(first, str):
            name = first
    elif isinstance(org, str):
        name = org
    
    return name.strip() if name else ""


def extract_organizer_from_html(soup) -> str:
    """
    Extract the real organizer name from HTML page content.
    
    Tries multiple CSS selectors and patterns commonly used by event platforms
    to display the organizer name on the page.
    """
    if not soup:
        return ""
    
    # Common selectors for organizer name across platforms
    selectors = [
        # AllEvents.in specific
        ".organizer-name",
        ".organizer-info .name",
        "[class*='organizer'] [class*='name']",
        "[class*='organiser'] [class*='name']",
        ".event-organiser-name",
        ".event-organizer-name",
        # Eventbrite
        ".organizer-listing-info-variant-b .descriptive-organizer-info-mobile__name",
        ".descriptive-organizer-info__name",
        "[data-testid='organizer-name']",
        # Luma
        "[class*='host-name']",
        "[class*='creator-name']",
        # Generic patterns
        "[itemprop='organizer'] [itemprop='name']",
        "[itemtype*='Organization'] [itemprop='name']",
    ]
    
    for selector in selectors:
        try:
            el = soup.select_one(selector)
            if el:
                text = el.get_text(strip=True)
                if text and not is_generic_name(text):
                    return text
        except Exception:
            continue
    
    return ""


def extract_organizer_name(
    jsonld_data: dict = None,
    soup=None,
    fallback: str = "",
) -> str:
    """
    Master function to extract the real organizer name.
    
    Priority:
    1. JSON-LD structured data (most reliable)
    2. HTML page scraping (fallback for pages without proper JSON-LD organizer)
    3. Provided fallback (should be a real name, not a platform name)
    
    Args:
        jsonld_data: The parsed JSON-LD event data dict
        soup: BeautifulSoup object of the event page (optional)
        fallback: A fallback name to use if extraction fails
    
    Returns:
        The real organizer name, or "Event Organizer" as absolute last resort.
    """
    # 1. Try JSON-LD first
    if jsonld_data:
        name = extract_organizer_from_jsonld(jsonld_data)
        if name and not is_generic_name(name):
            return name
    
    # 2. Try HTML scraping
    if soup:
        name = extract_organizer_from_html(soup)
        if name and not is_generic_name(name):
            return name
    
    # 3. Use fallback if it's a real name
    if fallback and not is_generic_name(fallback):
        return fallback
    
    # 4. Absolute last resort — but this should be rare
    return ""
