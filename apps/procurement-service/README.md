# Procurement Service

FastAPI service that owns purchase order drafts, line items, submission, lifecycle status, and audit timeline.

## Endpoints

- `POST /procurement/purchase-orders`
- `GET /procurement/purchase-orders`
- `GET /procurement/purchase-orders/{purchaseOrderId}`
- `POST /procurement/purchase-orders/{purchaseOrderId}/lines`
- `PATCH /procurement/purchase-orders/{purchaseOrderId}/lines/{lineId}`
- `DELETE /procurement/purchase-orders/{purchaseOrderId}/lines/{lineId}`
- `PATCH /procurement/purchase-orders/{purchaseOrderId}/header`
- `POST /procurement/purchase-orders/{purchaseOrderId}/submit`
- `POST /procurement/purchase-orders/{purchaseOrderId}/approve`
- `POST /procurement/purchase-orders/{purchaseOrderId}/reject`
- `POST /procurement/purchase-orders/{purchaseOrderId}/fulfill`
- `GET /procurement/purchase-orders/{purchaseOrderId}/timeline`

## Local

```bash
pip install ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --port 8002
pytest
```

Submit and status transition endpoints accept an `Idempotency-Key` header.

