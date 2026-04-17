from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as catalog_router
from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.services.catalog_service import seed_catalog_from_file

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    if settings.database_url.startswith("sqlite"):
        Base.metadata.create_all(bind=engine.execution_options(schema_translate_map={"catalog": None}))
    if settings.seed_catalog_on_startup:
        with SessionLocal() as db:
            seed_catalog_from_file(db)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


app.include_router(catalog_router)

