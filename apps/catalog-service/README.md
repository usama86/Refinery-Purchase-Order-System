# Catalog Service

FastAPI service that owns refinery catalog items.

## Endpoints

- `GET /health`
- `GET /catalog/items`
- `GET /catalog/items/{item_id}`
- `GET /catalog/categories`

## Local

```bash
pip install ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --port 8001
pytest
```

The service seeds `app/data/refinery-items.json` at startup when `SEED_CATALOG_ON_STARTUP=true`.

