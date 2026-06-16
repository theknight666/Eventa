import os
import logging
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

ALLOWED_CATEGORIES = [
    "sports", "music", "entertainment", "healthcare", "legal", "hr", 
    "creator", "sustainability", "government", "real-estate", 
    "manufacturing", "import-export", "ecommerce", "marketing", 
    "finance", "startup", "ai", "technology", "education", 
    "business", "networking"
]

_client = None

def get_openai_client():
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if api_key:
            _client = AsyncOpenAI(api_key=api_key)
    return _client

async def infer_category_ai(title: str, description: str = "") -> str:
    """
    Use OpenAI to strictly categorize the event based on title and description.
    Returns exactly one of the ALLOWED_CATEGORIES.
    """
    client = get_openai_client()
    if not client:
        # Fallback if no API key is provided
        from category_utils import infer_category
        return infer_category(title, description)
        
    system_prompt = f"""You are an expert event categorizer.
Your job is to read an event's title and description and classify it into EXACTLY ONE of the following predefined categories:
{', '.join(ALLOWED_CATEGORIES)}

Rules:
1. You must output ONLY the category string. No explanation, no punctuation, no other text.
2. Be strict. Do not randomly assign things to "networking" unless it's genuinely a generic networking event or nothing else fits at all. 
3. Events about games, fun, theme parks, resorts, outings, or rides belong in "entertainment".
4. Events about yoga, mental health, wellness, meditation, medicine belong in "healthcare".
5. Events about housing, architecture, apartments, property belong in "real-estate".
"""

    user_prompt = f"Title: {title}\nDescription: {description}"
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            max_tokens=10
        )
        
        category = response.choices[0].message.content.strip().lower()
        
        # Verify it's exactly one of the allowed categories
        if category in ALLOWED_CATEGORIES:
            return category
            
        # Fallback if AI hallucinates
        from category_utils import infer_category
        return infer_category(title, description)
        
    except Exception as e:
        logger.warning(f"OpenAI categorization failed for '{title}': {e}")
        from category_utils import infer_category
        return infer_category(title, description)
