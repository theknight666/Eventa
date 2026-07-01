import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    MONGO_URL: str
    ADMIN_SECRET: str = "superadmin123"
    JWT_SECRET: str = "devsecret"
    CORS_ORIGINS: str = "*"
    RENDER: str | None = None
    OPENAI_API_KEY: str | None = None
    EMERGENT_LLM_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    # If a critical environment variable is missing (like MONGO_URL), we log it clearly.
    # In production (like HuggingFace), we log and exit cleanly so it's obvious in the logs instead of phantom 500s.
    logger.error(f"CRITICAL: Failed to load configuration. Missing or invalid environment variables.")
    logger.error(str(e))
    # We still allow the app to start without MONGO_URL if we are just debugging, 
    # but strictly speaking, we want a robust server. For now, we will exit to force the user to fix it.
    sys.exit(1)
