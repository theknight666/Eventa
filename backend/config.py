import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    MONGO_URL: str | None = None
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
    logger.error(f"CRITICAL: Failed to load configuration. Missing or invalid environment variables.")
    logger.error(str(e))
    # We will not sys.exit(1) so that the debug endpoint can be accessed
    settings = Settings(MONGO_URL=None)
