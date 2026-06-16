import re

def infer_category(title: str, description: str = "") -> str:
    """
    Standardized categorization logic based on keywords in title and description.
    Uses regex word boundaries to prevent substring matching issues 
    (e.g., "architect" matching "tech") and prioritizes specific event types.
    """
    combined_text = f"{title} {description}".lower()
    
    def has_any(words):
        # Match any of the words/phrases with word boundaries
        pattern = r'\b(?:' + '|'.join(map(re.escape, words)) + r')\b'
        return re.search(pattern, combined_text) is not None

    # Priority 1: Very specific event types (less likely to be used as buzzwords)
    if has_any(["marathon", "run", "running", "5k", "10k", "half marathon", "trek", "trekking", "fitness", "yoga", "sports", "tournament", "championship", "cricket", "football", "badminton"]):
        return "sports"
        
    if has_any(["music", "concert", "dj", "festival", "gig", "band", "live music", "orchestra", "party", "club"]):
        return "music"
        
    if has_any(["comedy", "standup", "stand-up", "theater", "theatre", "movie", "film", "waterpark", "amusement park", "theme park", "carnival"]):
        return "entertainment"

    if has_any(["healthcare", "medical", "health", "doctor", "hospital", "clinic", "nursing", "pharmacy", "wellness", "biotech", "medtech"]):
        return "healthcare"

    if has_any(["legal", "law", "lawyer", "attorney", "compliance", "patent", "ip"]):
        return "legal"

    if has_any(["hr", "human resources", "talent", "recruitment", "hiring", "employee", "payroll", "workplace"]):
        return "hr"

    if has_any(["creator", "influencer", "youtube", "tiktok", "vlog", "content creation", "youtuber"]):
        return "creator"

    if has_any(["sustainability", "climate", "environment", "green", "renewable", "esg", "carbon", "eco"]):
        return "sustainability"

    if has_any(["government", "policy", "public sector", "municipal", "civic", "smart city", "diplomacy"]):
        return "government"

    if has_any(["real estate", "property", "housing", "realtor", "commercial real estate", "proptech", "architecture", "residential", "apartment", "villa", "realty"]):
        return "real-estate"

    if has_any(["manufacturing", "factory", "industrial", "production", "hardware", "machinery", "supply chain"]):
        return "manufacturing"

    if has_any(["import", "export", "shipping", "logistics", "freight", "customs", "trade"]):
        return "import-export"

    if has_any(["ecommerce", "e-commerce", "d2c", "dropshipping", "shopify", "amazon seller", "retail"]):
        return "ecommerce"

    if has_any(["marketing", "seo", "growth hacking", "branding", "social media", "advertising", "content marketing"]):
        return "marketing"

    if has_any(["finance", "trading", "stock", "wealth", "investment", "crypto", "defi", "banking", "forex", "fintech"]):
        return "finance"

    # Priority 2: Professional and educational events
    if has_any(["startup", "founder", "pitch", "venture", "angel investor", "seed round", "vc"]):
        return "startup"

    if has_any(["ai", "artificial intelligence", "machine learning", "llm", "agent", "deep learning", "generative ai"]):
        return "ai"
        
    if has_any(["tech", "technology", "developer", "code", "hackathon", "software", "cloud", "saas", "api", "programming", "web3"]):
        return "technology"
        
    if has_any(["workshop", "class", "learn", "course", "education", "training", "bootcamp"]):
        return "education"
        
    if has_any(["business", "expo", "summit", "sales", "b2b", "conference", "corporate", "networking"]):
        return "business"
        
    return "networking"  # default fallback
