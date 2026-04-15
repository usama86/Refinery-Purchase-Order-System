# Frontend Local Run

The frontend lives in `apps/frontend` and uses Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style local primitives, TanStack Query, React Hook Form, Zod, Vitest, and React Testing Library.

## Commands

From the repository root:

```bash
npm install
npm run dev:frontend
```

Then open:

```text
http://localhost:3000
```

Useful checks:

```bash
npm run test:frontend
npm run build:frontend
```

## Frontend Data

Catalog data is loaded from `apps/frontend/data/refinery-items.json`, copied from the provided `refinery_items_50_5suppliers_strict.json` file. Purchase orders are handled through a local mock procurement API and persisted in browser storage so the UI can later swap to real services without route-level rewrites.

The catalog mock API returns a paginated result shape now: items, total, page, page size, and total pages. For larger datasets, search, filtering, sorting, and pagination should move server-side behind the same catalog query contract.
