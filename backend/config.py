import os
import sys
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    MONGO_URL: Optional[str] = None
    ADMIN_SECRET: str = "superadmin123"
    JWT_SECRET: str = "devsecret"
    CORS_ORIGINS: str = "*"
    RENDER: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    EMERGENT_LLM_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    logger.error(f"CRITICAL: Failed to load configuration. Missing or invalid environment variables.")
    logger.error(str(e))
    # We will not sys.exit(1) so that the debug endpoint can be accessed
    settings = Settings(MONGO_URL=None)
