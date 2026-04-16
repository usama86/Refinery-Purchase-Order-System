import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Enum, ForeignKey, ForeignKeyConstraint, Integer, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def new_id() -> str:
    return str(uuid.uuid4())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class PurchaseOrderStatus(str, enum.Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    rejected = "Rejected"
    fulfilled = "Fulfilled"


status_type = Enum(PurchaseOrderStatus, values_callable=lambda x: [e.value for e in x])


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    __table_args__ = (
        UniqueConstraint("id", "supplier", name="uq_purchase_orders_id_supplier"),
        {"schema": "procurement"},
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    po_number: Mapped[str | None] = mapped_column(String(32), unique=True, index=True)
    supplier: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[PurchaseOrderStatus] = mapped_column(
        status_type, default=PurchaseOrderStatus.draft, nullable=False, index=True
    )
    requestor: Mapped[str] = mapped_column(String(120), default="Alex Morgan", nullable=False)
    cost_center: Mapped[str] = mapped_column(String(40), default="CC-1234", nullable=False)
    needed_by: Mapped[date | None] = mapped_column(Date)
    payment_terms: Mapped[str] = mapped_column(String(60), default="Net 30", nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    lines: Mapped[list["PurchaseOrderLine"]] = relationship(back_populates="purchase_order", cascade="all, delete-orphan")
    timeline: Mapped[list["StatusHistory"]] = relationship(back_populates="purchase_order", cascade="all, delete-orphan", order_by="StatusHistory.created_at")


class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"
    __table_args__ = (
        UniqueConstraint("purchase_order_id", "item_id", name="uq_purchase_order_lines_po_item"),
        ForeignKeyConstraint(
            ["purchase_order_id", "supplier"],
            ["procurement.purchase_orders.id", "procurement.purchase_orders.supplier"],
            name="fk_lines_match_po_supplier",
        ),
        {"schema": "procurement"},
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    purchase_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("procurement.purchase_orders.id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[str] = mapped_column(String(64), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    supplier: Mapped[str] = mapped_column(String(120), nullable=False)
    item_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    price_usd_snapshot: Mapped[float | None] = mapped_column(Numeric(12, 2))
    lead_time_days_snapshot: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    purchase_order: Mapped[PurchaseOrder] = relationship(back_populates="lines")


class StatusHistory(Base):
    __tablename__ = "status_history"
    __table_args__ = {"schema": "procurement"}

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    purchase_order_id: Mapped[str] = mapped_column(String(36), ForeignKey("procurement.purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[PurchaseOrderStatus] = mapped_column(status_type, nullable=False)
    actor: Mapped[str] = mapped_column(String(120), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

    purchase_order: Mapped[PurchaseOrder] = relationship(back_populates="timeline")


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = (
        UniqueConstraint("key", "scope", name="uq_idempotency_key_scope"),
        {"schema": "procurement"},
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    key: Mapped[str] = mapped_column(String(160), nullable=False)
    scope: Mapped[str] = mapped_column(String(160), nullable=False)
    response: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, nullable=False)

