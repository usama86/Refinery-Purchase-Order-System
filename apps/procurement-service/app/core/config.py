from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Refinery Procurement Service"
    app_env: str = "local"
    app_port: int = 8002
    database_url: str = "sqlite+pysqlite:///./procurement.db"
    catalog_service_base_url: str = "http://localhost:8001"
    allowed_origins: str = "http://localhost:3000"
    po_number_prefix: str = "PO"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

