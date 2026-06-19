"""
organizer_utils.py — Robust organizer name extraction for all scrapers.

Extracts the REAL organizer name using a multi-layer extraction strategy:
1. JSON-LD structured data (most reliable)
2. HTML CSS selectors (platform-specific)
3. Meta tags (og:site_name, author, twitter:creator)
4. URL patterns (e.g., Meetup group name from URL)
5. Title patterns (e.g., "Event by OrganizerName")
6. Page text patterns (e.g., "Hosted by X", "Organized by X")

Ensures no generic platform names are stored.
"""

import logging
import re
from typing import Optional
from urllib.parse import urlparse

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
    "host",
    "event host",
    "the organizer",
    "the organiser",
    "unknown",
    "n/a",
    "na",
    "none",
    "tba",
    "tbd",
    # Platform brand names (should not be used as organizer name)
    "allevents",
    "allevents.in",
    "allevents in",
    "townscript",
    "meetup",
    "meetup.com",
    "eventbrite",
    "eventbrite.com",
    "luma",
    "lu.ma",
    "bookmyshow",
    "insider.in",
    "paytm insider",
    "online event",
    "virtual event",
}


def is_generic_name(name: Optional[str]) -> bool:
    """Check if an organizer name is a generic/platform placeholder."""
    if not name or not name.strip():
        return True
    normalized = name.strip().lower()
    if normalized in GENERIC_ORGANIZER_NAMES:
        return True
    # Also reject very short names (1-2 chars) or pure numbers
    if len(normalized) <= 2:
        return True
    if normalized.isdigit():
        return True
    return False


def _clean_name(name: str) -> str:
    """Clean up an extracted organizer name."""
    if not name:
        return ""
    # Strip whitespace and common surrounding chars
    name = name.strip().strip("–—-|·•").strip()
    # Remove leading "by " if present
    if name.lower().startswith("by "):
        name = name[3:].strip()
    # Remove trailing " | City" patterns
    name = re.split(r'\s*[|]\s*', name)[0].strip()
    # Collapse multiple spaces
    name = re.sub(r'\s+', ' ', name)
    return name


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
    
    return _clean_name(name)


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
        ".organizer-card .name",
        ".organizer-card h3",
        ".organizer-card h4",
        # Eventbrite
        ".organizer-listing-info-variant-b .descriptive-organizer-info-mobile__name",
        ".descriptive-organizer-info__name",
        "[data-testid='organizer-name']",
        ".organizer-name-link",
        # Luma
        "[class*='host-name']",
        "[class*='creator-name']",
        "[class*='host'] [class*='name']",
        ".event-host-name",
        # Meetup
        "[class*='groupName']",
        ".group-name",
        ".groupHomeHeader-groupName",
        "[data-testid='group-name']",
        # Townscript
        ".organiser-name",
        ".organiser-info .name",
        "[class*='organiser'] h3",
        "[class*='organiser'] h4",
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
                    return _clean_name(text)
        except Exception:
            continue
    
    return ""


def extract_from_meta_tags(soup) -> str:
    """
    Extract organizer name from <meta> tags.
    
    Many event pages embed the organizer in meta tags like:
    - <meta name="author" content="OrganizerName">
    - <meta property="og:site_name" content="OrganizerName">
    - <meta name="twitter:creator" content="@OrganizerName">
    - <meta property="article:author" content="OrganizerName">
    """
    if not soup:
        return ""
    
    meta_attrs = [
        {"name": "author"},
        {"property": "article:author"},
        {"name": "twitter:creator"},
    ]
    
    for attrs in meta_attrs:
        try:
            tag = soup.find("meta", attrs=attrs)
            if tag and tag.get("content"):
                content = tag["content"].strip()
                # Remove @ from Twitter handles
                if content.startswith("@"):
                    content = content[1:]
                if content and not is_generic_name(content):
                    return _clean_name(content)
        except Exception:
            continue
    
    # og:site_name is lower priority — often it's the platform name
    try:
        og_site = soup.find("meta", attrs={"property": "og:site_name"})
        if og_site and og_site.get("content"):
            content = og_site["content"].strip()
            if content and not is_generic_name(content):
                return _clean_name(content)
    except Exception:
        pass
    
    return ""


def extract_from_meetup_url(url: str) -> str:
    """
    Extract the Meetup group name from the URL pattern.
    
    Meetup URLs follow the pattern: https://www.meetup.com/group-name/events/12345/
    The group name portion is a human-readable slug.
    """
    if not url:
        return ""
    
    try:
        parsed = urlparse(url)
        if "meetup.com" not in parsed.hostname:
            return ""
        
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        if len(parts) >= 1:
            group_slug = parts[0]
            # Convert slug to human-readable: "python-bengaluru" -> "Python Bengaluru"
            name = group_slug.replace("-", " ").title()
            if name and not is_generic_name(name):
                return _clean_name(name)
    except Exception:
        pass
    
    return ""


def extract_from_title_pattern(title: str) -> str:
    """
    Extract organizer name from common title patterns.
    
    Many events embed the organizer in the title:
    - "TechSparks by YourStory"
    - "AI Summit — Presented by Google"
    - "Startup Grind | Hosted by TechHub"
    - "Workshop with Dr. Priya Sharma"
    """
    if not title:
        return ""
    
    # Patterns: "Event by OrgName", "Event presented by OrgName", etc.
    patterns = [
        r'\bby\s+(.+?)(?:\s*[-–—|]|$)',
        r'\bpresented\s+by\s+(.+?)(?:\s*[-–—|]|$)',
        r'\bhosted\s+by\s+(.+?)(?:\s*[-–—|]|$)',
        r'\borganized\s+by\s+(.+?)(?:\s*[-–—|]|$)',
        r'\borganised\s+by\s+(.+?)(?:\s*[-–—|]|$)',
        r'\bpowered\s+by\s+(.+?)(?:\s*[-–—|]|$)',
        r'\bwith\s+(.+?)(?:\s*[-–—|]|$)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Reject if the match is too long (probably grabbed the whole title)
            if len(name) > 60:
                continue
            # Reject if it looks like a topic, not an organizer
            topic_words = {"ai", "technology", "business", "startup", "marketing",
                          "finance", "networking", "music", "sports", "workshop",
                          "experts", "leaders", "professionals", "everyone",
                          "beginners", "students", "developers"}
            if name.lower() in topic_words:
                continue
            if not is_generic_name(name):
                return _clean_name(name)
    
    return ""


def extract_from_page_text(soup) -> str:
    """
    Extract organizer name from visible page text patterns.
    
    Looks for text like "Hosted by X", "Organized by X", "Presented by X"
    and extracts the adjacent text as the organizer name.
    """
    if not soup:
        return ""
    
    # Look for text nodes containing hosting/organizing phrases
    patterns = [
        r'(?:Hosted|Organized|Organised|Presented|Curated|Created)\s+by\s+(.+?)(?:\s*[.!,\n]|$)',
    ]
    
    # Search in likely containers
    containers = soup.find_all(['p', 'span', 'div', 'h3', 'h4', 'h5', 'a', 'strong'], limit=200)
    
    for el in containers:
        text = el.get_text(strip=True)
        if not text or len(text) > 200:
            continue
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Trim at reasonable length
                if len(name) > 60:
                    name = name[:60].rsplit(' ', 1)[0]
                if name and not is_generic_name(name):
                    return _clean_name(name)
    
    return ""


def extract_organizer_name(
    jsonld_data: dict = None,
    soup=None,
    source_url: str = "",
    fallback: str = "",
) -> str:
    """
    Master function to extract the real organizer name.
    
    Uses a 6-layer priority waterfall:
    1. JSON-LD structured data (most reliable)
    2. HTML CSS selector scraping
    3. Meta tags (author, og:site_name, etc.)
    4. URL patterns (Meetup group name, etc.)
    5. Title patterns in JSON-LD ("Event by X")
    6. Page text patterns ("Hosted by X")
    7. Provided fallback
    
    Args:
        jsonld_data: The parsed JSON-LD event data dict
        soup: BeautifulSoup object of the event page (optional)
        source_url: The URL of the event page (used for URL pattern extraction)
        fallback: A fallback name to use if extraction fails
    
    Returns:
        The real organizer name, or empty string as absolute last resort.
    """
    # 1. Try JSON-LD first (most reliable structured data)
    if jsonld_data:
        name = extract_organizer_from_jsonld(jsonld_data)
        if name and not is_generic_name(name):
            return name
    
    # 2. Try HTML CSS selectors
    if soup:
        name = extract_organizer_from_html(soup)
        if name and not is_generic_name(name):
            return name
    
    # 3. Try meta tags
    if soup:
        name = extract_from_meta_tags(soup)
        if name and not is_generic_name(name):
            return name
    
    # 4. Try URL pattern extraction (e.g., Meetup group names)
    if source_url:
        name = extract_from_meetup_url(source_url)
        if name and not is_generic_name(name):
            return name
    
    # 5. Try title pattern extraction
    if jsonld_data:
        title = jsonld_data.get("name", "")
        if title:
            name = extract_from_title_pattern(title)
            if name and not is_generic_name(name):
                return name
    
    # 6. Try page text patterns
    if soup:
        name = extract_from_page_text(soup)
        if name and not is_generic_name(name):
            return name
    
    # 7. Use fallback if it's a real name
    if fallback and not is_generic_name(fallback):
        return fallback
    
    # 8. Absolute last resort — empty string
    return ""
