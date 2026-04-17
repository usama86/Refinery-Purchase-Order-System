from typing import Annotated

from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.purchase_order import PurchaseOrderStatus
from app.schemas.procurement import (
    AddLineRequest,
    CreateDraftRequest,
    DraftHeader,
    PurchaseOrderRead,
    StatusActionRequest,
    TimelineEventRead,
    UpdateLineRequest,
)
from app.services.procurement_service import ProcurementService

router = APIRouter(prefix="/procurement/purchase-orders", tags=["purchase-orders"])


@router.post("", response_model=PurchaseOrderRead, status_code=201)
def create_draft(
    payload: CreateDraftRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PurchaseOrderRead:
    return ProcurementService(db).create_draft(payload.header)


@router.get("", response_model=list[PurchaseOrderRead])
def list_purchase_orders(db: Annotated[Session, Depends(get_db)]) -> list[PurchaseOrderRead]:
    return ProcurementService(db).list_orders()


@router.get("/{purchase_order_id}", response_model=PurchaseOrderRead)
def get_purchase_order(
    purchase_order_id: str, db: Annotated[Session, Depends(get_db)]
) -> PurchaseOrderRead:
    return ProcurementService(db).get_order(purchase_order_id)


@router.post("/{purchase_order_id}/lines", response_model=PurchaseOrderRead)
def add_line(
    purchase_order_id: str,
    payload: AddLineRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PurchaseOrderRead:
    return ProcurementService(db).add_line(purchase_order_id, payload)


@router.patch("/{purchase_order_id}/lines/{line_id}", response_model=PurchaseOrderRead)
def update_line(
    purchase_order_id: str,
    line_id: str,
    payload: UpdateLineRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PurchaseOrderRead:
    return ProcurementService(db).update_line(purchase_order_id, line_id, payload)


@router.delete("/{purchase_order_id}/lines/{line_id}", response_model=PurchaseOrderRead)
def remove_line(
    purchase_order_id: str,
    line_id: str,
    db: Annotated[Session, Depends(get_db)],
) -> PurchaseOrderRead:
    return ProcurementService(db).remove_line(purchase_order_id, line_id)


@router.patch("/{purchase_order_id}/header", response_model=PurchaseOrderRead)
def update_header(
    purchase_order_id: str,
    payload: DraftHeader,
    db: Annotated[Session, Depends(get_db)],
) -> PurchaseOrderRead:
    return ProcurementService(db).update_header(purchase_order_id, payload)


@router.post("/{purchase_order_id}/submit", response_model=PurchaseOrderRead)
def submit_purchase_order(
    purchase_order_id: str,
    db: Annotated[Session, Depends(get_db)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> PurchaseOrderRead:
    return ProcurementService(db).submit(purchase_order_id, idempotency_key)


@router.post("/{purchase_order_id}/approve", response_model=PurchaseOrderRead)
def approve_purchase_order(
    purchase_order_id: str,
    payload: StatusActionRequest,
    db: Annotated[Session, Depends(get_db)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> PurchaseOrderRead:
    return ProcurementService(db).transition(
        purchase_order_id, PurchaseOrderStatus.approved, payload, idempotency_key
    )


@router.post("/{purchase_order_id}/reject", response_model=PurchaseOrderRead)
def reject_purchase_order(
    purchase_order_id: str,
    payload: StatusActionRequest,
    db: Annotated[Session, Depends(get_db)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> PurchaseOrderRead:
    return ProcurementService(db).transition(
        purchase_order_id, PurchaseOrderStatus.rejected, payload, idempotency_key
    )


@router.post("/{purchase_order_id}/fulfill", response_model=PurchaseOrderRead)
def fulfill_purchase_order(
    purchase_order_id: str,
    payload: StatusActionRequest,
    db: Annotated[Session, Depends(get_db)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> PurchaseOrderRead:
    return ProcurementService(db).transition(
        purchase_order_id, PurchaseOrderStatus.fulfilled, payload, idempotency_key
    )


@router.get("/{purchase_order_id}/timeline", response_model=list[TimelineEventRead])
def get_timeline(
    purchase_order_id: str, db: Annotated[Session, Depends(get_db)]
) -> list[TimelineEventRead]:
    return ProcurementService(db).timeline(purchase_order_id)
