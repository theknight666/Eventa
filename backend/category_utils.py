def infer_category(title: str, description: str = "") -> str:
    """
    Standardized categorization logic based on keywords in title and description.
    """
    combined_text = f"{title} {description}".lower()
    
    # Priority order is important here.
    if "startup" in combined_text or "founder" in combined_text or "pitch" in combined_text or "venture" in combined_text or "angel investor" in combined_text:
        return "startup"
    elif "ai " in combined_text or "artificial intelligence" in combined_text or "machine learning" in combined_text or "llm" in combined_text or "agent " in combined_text:
        return "ai"
    elif "tech" in combined_text or "code" in combined_text or "developer" in combined_text or "hackathon" in combined_text or "software" in combined_text or "cloud " in combined_text:
        return "technology"
    elif "business" in combined_text or "expo" in combined_text or "summit" in combined_text or "marketing" in combined_text or "sales" in combined_text:
        return "business"
    elif "music" in combined_text or "concert" in combined_text or "live" in combined_text or "dj " in combined_text or "festival" in combined_text:
        return "music"
    elif "comedy" in combined_text or "standup" in combined_text or "show " in combined_text or "theater" in combined_text or "theatre" in combined_text:
        return "entertainment"
    elif "sports" in combined_text or "marathon" in combined_text or "run " in combined_text or "trek" in combined_text or "fitness" in combined_text or "yoga" in combined_text:
        return "sports"
    elif "workshop" in combined_text or "class" in combined_text or "learn" in combined_text or "course" in combined_text or "education" in combined_text:
        return "education"
    elif "art " in combined_text or "exhibition" in combined_text or "gallery" in combined_text or "culture" in combined_text or "painting" in combined_text:
        return "art"
        
    return "networking"  # default fallback
