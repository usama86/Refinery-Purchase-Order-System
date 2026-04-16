# Backend Implementation Notes

## Service Boundaries

`catalog-service` owns catalog item records and exposes read/search APIs. `procurement-service` owns purchase order state and stores catalog snapshots on PO lines when needed.

## Database

Both services can use the same Neon PostgreSQL database for this assignment. Ownership stays explicit through separate schemas:

- `catalog.catalog_items`
- `procurement.purchase_orders`
- `procurement.purchase_order_lines`
- `procurement.status_history`
- `procurement.idempotency_keys`

## Transactions

Procurement wraps critical workflows in transactions:

- draft creation plus initial timeline row
- line add/update/remove
- header update
- submit with snapshotting, PO number generation, status change, and timeline append
- status transitions plus timeline append

## Idempotency

Mutation retries are handled with `Idempotency-Key` on submit and lifecycle transition endpoints. The service stores the serialized response by action scope, then returns the same response for repeated keys.

## API Gateway

`apps/api-gateway` remains scaffold-only. The frontend calls services directly for now. A future gateway can centralize routing, auth, aggregation, and cross-service policies without changing service ownership.

