# Refinery Purchase Order System

This monorepo contains the frontend-first implementation for the Refinery Purchase Order System interview assignment.

## Current Scope

- `apps/frontend`: Buyer-facing Next.js application.
- `apps/catalog-service`: Backend service boundary placeholder only.
- `apps/procurement-service`: Backend service boundary placeholder only.
- `apps/api-gateway`: Scaffold placeholder only. Do not wire until backend work begins.
- `docs`: Assignment and local run notes.

## Engineering Notes

- Keep route files thin and move feature logic into focused modules.
- Enforce single-supplier draft behavior in the data/domain layer and reflect it clearly in the UI.
- Use local mock APIs for frontend flows until backend services are implemented.
- No authentication; the UI assumes a logged-in Buyer.
