from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Refinery Catalog Service"
    app_env: str = "local"
    app_port: int = 8001
    database_url: str = "sqlite+pysqlite:///./catalog.db"
    allowed_origins: str = "http://localhost:3000"
    seed_catalog_on_startup: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
