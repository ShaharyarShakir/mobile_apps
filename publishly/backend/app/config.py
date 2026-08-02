import os
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Look for .env in the parent directory of this file or the current working dir
        env_file=os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"
        ),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ENVIRONMENT: Literal["development", "production", "testing"] = "development"
    PROJECT_NAME: str = "PostPilot AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(default="supersecretdevkeychangeinproduction123")

    # Databases
    DATABASE_URL: str
    REDIS_URL: str

    # Integrations (for future Meta Graph and WhatsApp API support)
    META_GRAPH_API_VERSION: str = "v19.0"
    META_APP_ID: str | None = None
    META_APP_SECRET: str | None = None
    OPENAI_API_KEY: str | None = None
    WHATSAPP_PHONE_NUMBER_ID: str | None = None
    WHATSAPP_ACCESS_TOKEN: str | None = None

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith("postgresql+asyncpg://"):
            # If standard postgres url, replace it to use asyncpg
            if v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
            raise ValueError(
                "DATABASE_URL must start with postgresql:// or postgresql+asyncpg://"
            )
        return v


settings = Settings()
