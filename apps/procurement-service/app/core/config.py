from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SQLITE_FALLBACK_DATABASE_URL = "sqlite+pysqlite:///./procurement.db"


class Settings(BaseSettings):
    app_name: str = "Refinery Procurement Service"
    app_env: str = "local"
    app_port: int = 8002
    database_url: str = SQLITE_FALLBACK_DATABASE_URL
    catalog_service_base_url: str = "http://localhost:8001"
    allowed_origins: str = "http://localhost:3000"
    po_number_prefix: str = "PO"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: object) -> str:
        if not isinstance(value, str) or not value.strip():
            return SQLITE_FALLBACK_DATABASE_URL
        if any(token in value for token in ("USER", "PASSWORD", "@HOST", "HOST/")):
            return SQLITE_FALLBACK_DATABASE_URL
        return value

    @property
    def allowed_origin_list(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
