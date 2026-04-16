from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.purchase_order import IdempotencyKey, PurchaseOrder, PurchaseOrderLine, StatusHistory


class ProcurementRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity):
        self.db.add(entity)
        return entity

    def get_order(self, order_id_or_number: str) -> PurchaseOrder | None:
        stmt = (
            select(PurchaseOrder)
            .options(selectinload(PurchaseOrder.lines), selectinload(PurchaseOrder.timeline))
            .where(
                (PurchaseOrder.id == order_id_or_number)
                | (PurchaseOrder.po_number == order_id_or_number)
            )
        )
        return self.db.scalar(stmt)

    def list_orders(self) -> list[PurchaseOrder]:
        stmt = (
            select(PurchaseOrder)
            .options(selectinload(PurchaseOrder.lines), selectinload(PurchaseOrder.timeline))
            .where(PurchaseOrder.status != "Draft")
            .order_by(PurchaseOrder.submitted_at.desc().nullslast(), PurchaseOrder.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def get_line(self, order: PurchaseOrder, line_id: str) -> PurchaseOrderLine | None:
        return next((line for line in order.lines if line.id == line_id), None)

    def next_po_sequence(self, year: int) -> int:
        prefix = f"PO-{year}-"
        count = self.db.scalar(
            select(func.count()).select_from(PurchaseOrder).where(PurchaseOrder.po_number.like(f"{prefix}%"))
        )
        return int(count or 0) + 1

    def get_idempotency(self, key: str, scope: str) -> IdempotencyKey | None:
        return self.db.scalar(select(IdempotencyKey).where(IdempotencyKey.key == key, IdempotencyKey.scope == scope))

