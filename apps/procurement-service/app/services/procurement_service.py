from contextlib import contextmanager
from datetime import date
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.clients.catalog_client import CatalogClient, CatalogClientError
from app.core.config import settings
from app.models.purchase_order import (
    IdempotencyKey,
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseOrderStatus,
    StatusHistory,
    now_utc,
)
from app.repositories.procurement_repository import ProcurementRepository
from app.schemas.procurement import (
    AddLineRequest,
    DraftHeader,
    PurchaseOrderLineRead,
    PurchaseOrderRead,
    StatusActionRequest,
    TimelineEventRead,
    UpdateLineRequest,
)

DEFAULT_HEADER = DraftHeader(
    requestor="Alex Morgan",
    costCenter="CC-1234",
    neededBy=date.today(),
    paymentTerms="Net 30",
)

STATUS_NOTES = {
    PurchaseOrderStatus.draft: "Draft purchase order created.",
    PurchaseOrderStatus.submitted: "Purchase order submitted by Buyer.",
    PurchaseOrderStatus.approved: "Commercial approval captured.",
    PurchaseOrderStatus.rejected: "Purchase order rejected.",
    PurchaseOrderStatus.fulfilled: "Supplier fulfillment completed.",
}

ALLOWED_TRANSITIONS = {
    PurchaseOrderStatus.draft: {PurchaseOrderStatus.submitted},
    PurchaseOrderStatus.submitted: {PurchaseOrderStatus.approved, PurchaseOrderStatus.rejected},
    PurchaseOrderStatus.approved: {PurchaseOrderStatus.fulfilled},
    PurchaseOrderStatus.rejected: set(),
    PurchaseOrderStatus.fulfilled: set(),
}


class ProcurementService:
    def __init__(self, db: Session, catalog_client: CatalogClient | None = None):
        self.db = db
        self.repo = ProcurementRepository(db)
        self.catalog_client = catalog_client or CatalogClient()

    def create_draft(self, header: DraftHeader | None = None) -> PurchaseOrderRead:
        data = header or DEFAULT_HEADER
        with self._transaction():
            order = PurchaseOrder(
                requestor=data.requestor,
                cost_center=data.costCenter,
                needed_by=data.neededBy,
                payment_terms=data.paymentTerms,
            )
            self.repo.add(order)
            self.repo.add(
                StatusHistory(
                    purchase_order=order,
                    status=PurchaseOrderStatus.draft,
                    actor=data.requestor,
                    note=STATUS_NOTES[PurchaseOrderStatus.draft],
                )
            )
        return self.to_read(order)

    def get_order(self, order_id_or_number: str) -> PurchaseOrderRead:
        return self.to_read(self._require_order(order_id_or_number))

    def list_orders(self) -> list[PurchaseOrderRead]:
        return [self.to_read(order) for order in self.repo.list_orders()]

    def add_line(self, order_id: str, payload: AddLineRequest) -> PurchaseOrderRead:
        order = self._require_order(order_id)
        self._require_draft(order)
        try:
            item = self.catalog_client.get_item(payload.itemId)
        except CatalogClientError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

        if order.supplier and order.supplier != item.supplier:
            raise HTTPException(
                status_code=409,
                detail=f"This draft is locked to {order.supplier}. Start a new draft to buy from {item.supplier}.",
            )

        with self._transaction():
            if not order.supplier:
                order.supplier = item.supplier
            existing = next((line for line in order.lines if line.item_id == item.id), None)
            if existing:
                existing.quantity += payload.quantity
                existing.item_snapshot = item.model_dump(mode="json")
            else:
                self.repo.add(
                    PurchaseOrderLine(
                        purchase_order=order,
                        item_id=item.id,
                        quantity=payload.quantity,
                        supplier=item.supplier,
                        item_snapshot=item.model_dump(mode="json"),
                    )
                )
        self.db.refresh(order)
        return self.to_read(order)

    def update_line(self, order_id: str, line_id: str, payload: UpdateLineRequest) -> PurchaseOrderRead:
        order = self._require_order(order_id)
        self._require_draft(order)
        line = self.repo.get_line(order, line_id)
        if not line:
            raise HTTPException(status_code=404, detail="Line item not found")
        with self._transaction():
            if payload.quantity == 0:
                self.db.delete(line)
                if len(order.lines) == 1:
                    order.supplier = None
            else:
                line.quantity = payload.quantity
        self.db.refresh(order)
        return self.to_read(order)

    def remove_line(self, order_id: str, line_id: str) -> PurchaseOrderRead:
        return self.update_line(order_id, line_id, UpdateLineRequest(quantity=0))

    def update_header(self, order_id: str, header: DraftHeader) -> PurchaseOrderRead:
        order = self._require_order(order_id)
        self._require_draft(order)
        with self._transaction():
            order.requestor = header.requestor
            order.cost_center = header.costCenter
            order.needed_by = header.neededBy
            order.payment_terms = header.paymentTerms
        return self.to_read(order)

    def submit(self, order_id: str, idempotency_key: str | None = None) -> PurchaseOrderRead:
        return self._idempotent(order_id, "submit", idempotency_key, lambda: self._submit(order_id))

    def transition(
        self,
        order_id: str,
        target: PurchaseOrderStatus,
        payload: StatusActionRequest,
        idempotency_key: str | None = None,
    ) -> PurchaseOrderRead:
        return self._idempotent(
            order_id,
            target.value.lower(),
            idempotency_key,
            lambda: self._transition(order_id, target, payload),
        )

    def timeline(self, order_id: str) -> list[TimelineEventRead]:
        return self.to_read(self._require_order(order_id)).timeline

    def _submit(self, order_id: str) -> PurchaseOrderRead:
        order = self._require_order(order_id)
        self._require_transition(order, PurchaseOrderStatus.submitted)
        if not order.lines:
            raise HTTPException(status_code=400, detail="A purchase order needs at least one line item.")
        if not order.needed_by or not order.requestor or not order.cost_center or not order.payment_terms:
            raise HTTPException(status_code=400, detail="Header information is incomplete.")

        with self._transaction():
            for line in order.lines:
                item = self.catalog_client.get_item(line.item_id)
                if item.supplier != order.supplier:
                    raise HTTPException(status_code=409, detail="Line supplier no longer matches purchase order supplier.")
                line.item_snapshot = item.model_dump(mode="json")
                line.price_usd_snapshot = item.priceUsd
                line.lead_time_days_snapshot = item.leadTimeDays
            now = now_utc()
            order.po_number = self._generate_po_number(now.year)
            order.status = PurchaseOrderStatus.submitted
            order.submitted_at = now
            self.repo.add(
                StatusHistory(
                    purchase_order=order,
                    status=PurchaseOrderStatus.submitted,
                    actor=order.requestor,
                    note=STATUS_NOTES[PurchaseOrderStatus.submitted],
                )
            )
        self.db.refresh(order)
        return self.to_read(order)

    def _transition(
        self, order_id: str, target: PurchaseOrderStatus, payload: StatusActionRequest
    ) -> PurchaseOrderRead:
        order = self._require_order(order_id)
        self._require_transition(order, target)
        with self._transaction():
            order.status = target
            self.repo.add(
                StatusHistory(
                    purchase_order=order,
                    status=target,
                    actor=payload.actor,
                    note=payload.note or STATUS_NOTES[target],
                )
            )
        self.db.refresh(order)
        return self.to_read(order)

    def _idempotent(self, order_id: str, action: str, key: str | None, fn) -> PurchaseOrderRead:
        if not key:
            return fn()
        scope = f"{order_id}:{action}"
        existing = self.repo.get_idempotency(key, scope)
        if existing:
            return PurchaseOrderRead.model_validate(existing.response)
        result = fn()
        with self._transaction():
            self.repo.add(IdempotencyKey(key=key, scope=scope, response=result.model_dump(mode="json")))
        return result

    @contextmanager
    def _transaction(self):
        try:
            yield
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

    def _require_order(self, order_id_or_number: str) -> PurchaseOrder:
        order = self.repo.get_order(order_id_or_number)
        if not order:
            raise HTTPException(status_code=404, detail="Purchase order not found")
        return order

    def _require_draft(self, order: PurchaseOrder) -> None:
        if order.status != PurchaseOrderStatus.draft:
            raise HTTPException(status_code=409, detail="Only draft purchase orders can be edited.")

    def _require_transition(self, order: PurchaseOrder, target: PurchaseOrderStatus) -> None:
        if target not in ALLOWED_TRANSITIONS[order.status]:
            raise HTTPException(status_code=409, detail=f"Cannot transition from {order.status.value} to {target.value}.")

    def _generate_po_number(self, year: int) -> str:
        sequence = self.repo.next_po_sequence(year)
        return f"{settings.po_number_prefix}-{year}-{sequence:06d}"

    def to_read(self, order: PurchaseOrder) -> PurchaseOrderRead:
        lines = [self._line_to_read(line) for line in order.lines]
        total = sum((line.priceUsdSnapshot or line.itemSnapshot.priceUsd) * line.quantity for line in lines)
        return PurchaseOrderRead(
            id=order.id,
            poNumber=order.po_number,
            supplier=order.supplier,
            status=order.status.value,
            header=DraftHeader(
                requestor=order.requestor,
                costCenter=order.cost_center,
                neededBy=order.needed_by or date.today(),
                paymentTerms=order.payment_terms,
            ),
            lines=lines,
            totalUsd=Decimal(total),
            submittedAt=order.submitted_at,
            createdAt=order.created_at,
            updatedAt=order.updated_at,
            timeline=[
                TimelineEventRead(
                    id=event.id,
                    status=event.status.value,
                    at=event.created_at,
                    actor=event.actor,
                    note=event.note,
                )
                for event in order.timeline
            ],
        )

    def _line_to_read(self, line: PurchaseOrderLine) -> PurchaseOrderLineRead:
        return PurchaseOrderLineRead(
            id=line.id,
            itemId=line.item_id,
            quantity=line.quantity,
            supplier=line.supplier,
            itemSnapshot=line.item_snapshot,
            priceUsdSnapshot=line.price_usd_snapshot,
            leadTimeDaysSnapshot=line.lead_time_days_snapshot,
        )
