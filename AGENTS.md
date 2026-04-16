# Refinery Purchase Order System

This monorepo contains the frontend and backend implementation for the Refinery Purchase Order System interview assignment.

## Current Scope

- `apps/frontend`: Buyer-facing Next.js application.
- `apps/catalog-service`: FastAPI service that owns catalog item data and search/read APIs.
- `apps/procurement-service`: FastAPI service that owns drafts, purchase orders, lines, status lifecycle, and timeline history.
- `apps/api-gateway`: intentionally absent from runtime scope. Do not recreate or wire a gateway until explicitly requested.
- `docs`: Assignment and local run notes.

## Engineering Notes

- Keep route files thin and move feature logic into focused modules.
- Keep FastAPI route handlers thin; put business rules in service modules and persistence in repository modules.
- Enforce single-supplier draft behavior in procurement-service, with DB constraints where practical, and reflect conflicts clearly in the UI.
- Keep catalog data ownership in catalog-service. Procurement may snapshot catalog item data, but should not own catalog search.
- Use transactions for draft creation, line mutations, submit, status transitions, and audit/timeline writes.
- Use `Idempotency-Key` for submit and status transition actions when callers can retry.
- Keep gateway work out of the runtime path until explicitly requested.
- No authentication; the UI assumes a logged-in Buyer.
