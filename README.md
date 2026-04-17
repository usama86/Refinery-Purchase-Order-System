# Refinery Purchase Order System

Interview assignment implementation for a Buyer-facing refinery purchase order workflow.

## Architecture

- `apps/frontend`: Next.js App Router frontend. It calls catalog-service and procurement-service directly.
- `apps/catalog-service`: FastAPI service that owns refinery catalog items, search/filter/sort/pagination, item details, and dataset seeding.
- `apps/procurement-service`: FastAPI service that owns drafts, purchase orders, line items, PO lifecycle, status timeline, idempotency, and PO number generation.

The implementation uses one PostgreSQL database for practicality, with logical ownership kept separate. Migrations create `catalog` and `procurement` schemas so each service owns its own tables.

## How to run locally (quick start)

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env.local
npm install
docker compose up --build catalog-service procurement-service
```

In another terminal:

```bash
cd apps/catalog-service && alembic upgrade head
cd ../procurement-service && alembic upgrade head
npm run dev:frontend
```

Open `http://localhost:3000`.

## Backend Rules

- Procurement enforces single-supplier purchase orders in service logic and with a composite DB constraint on line supplier.
- The first line item sets the draft supplier. Later mismatches return `409 Conflict`.
- Submit is atomic: validates draft/header, refreshes catalog item data, snapshots price and lead time, generates `PO-YYYY-000001`, changes status to `Submitted`, and appends timeline history.
- Status transitions are explicit: `Draft -> Submitted -> Approved -> Fulfilled`, with `Submitted -> Rejected` also allowed.
- Submit and status actions support `Idempotency-Key`.

## Local Environment

Create a root `.env` for Docker Compose:

```bash
cp .env.example .env
```

Root variables:

```bash
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
ALLOWED_ORIGINS=http://localhost:3000
PO_NUMBER_PREFIX=PO
```

Set `DATABASE_URL` from your Neon values, for example:

```bash
DATABASE_URL='postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require'
```

Create frontend env:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Frontend variables:

```bash
NEXT_PUBLIC_CATALOG_API_BASE_URL=http://localhost:8001
NEXT_PUBLIC_PROCUREMENT_API_BASE_URL=http://localhost:8002
```

Catalog service variables:

```bash
APP_NAME=Refinery Catalog Service
APP_ENV=local
APP_PORT=8001
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
ALLOWED_ORIGINS=http://localhost:3000
SEED_CATALOG_ON_STARTUP=true
```

Procurement service variables:

```bash
APP_NAME=Refinery Procurement Service
APP_ENV=local
APP_PORT=8002
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/neondb?sslmode=require
CATALOG_SERVICE_BASE_URL=http://catalog-service:8001
ALLOWED_ORIGINS=http://localhost:3000
PO_NUMBER_PREFIX=PO
```

## Run Locally

Install frontend dependencies:

```bash
npm install
```

Run backend services:

```bash
docker compose up --build catalog-service procurement-service
```

Run migrations against the configured database:

```bash
cd apps/catalog-service && alembic upgrade head
cd ../procurement-service && alembic upgrade head
```

Run the frontend:

```bash
npm run dev:frontend
```

Open:

- Frontend: `http://localhost:3000`
- Catalog OpenAPI: `http://localhost:8001/docs`
- Procurement OpenAPI: `http://localhost:8002/docs`

## Checks

Frontend:

```bash
npm run test:frontend
npm run test:coverage:frontend
npm run build:frontend
```

Backend:

```bash
cd apps/catalog-service && pip install ".[dev]" && pytest
cd apps/procurement-service && pip install ".[dev]" && pytest
```

Coverage:

```bash
npm run test:coverage:frontend
cd apps/catalog-service && pytest --cov=app --cov-report=term-missing --cov-fail-under=80
cd apps/procurement-service && pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

## Notes

- Catalog data is seeded from `apps/catalog-service/app/data/refinery-items.json`.
- Frontend keeps only a browser draft id pointer; purchase order state lives in procurement-service.
- No authentication is implemented; the assignment assumes a logged-in Buyer role.
- Large production datasets should use server-side search/filter/sort/pagination, which the catalog API already models.
- Deployment direction: run the frontend separately from the two FastAPI services, apply Alembic migrations during release, and point all services at the same managed PostgreSQL database with separate schemas.
- Tradeoff: the frontend talks directly to backend services for assignment clarity.
- Intentional scope limits: no authentication, no message broker, and no additional routing layer.
