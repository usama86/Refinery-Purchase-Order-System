# Refinery Purchase Order System

Frontend-first monorepo implementation for the refinery Buyer purchase order workflow.

## Frontend Local Run

```bash
npm install
npm run dev:frontend
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run test:frontend
npm run build:frontend
```

## Current Scope

- `apps/frontend`: Next.js App Router frontend with local mock catalog/procurement data.
- `apps/catalog-service`: Scaffold placeholder only.
- `apps/procurement-service`: Scaffold placeholder only.
- `apps/api-gateway`: Scaffold placeholder only and intentionally not wired.
- `docs/frontend.md`: Frontend run and data notes.
