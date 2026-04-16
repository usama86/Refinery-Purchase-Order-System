from datetime import date

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.purchase_order import PurchaseOrderStatus
from app.schemas.procurement import AddLineRequest, CatalogItemSnapshot, DraftHeader, StatusActionRequest
from app.services.procurement_service import ProcurementService


def item(item_id: str, supplier: str, price: int = 12, lead: int = 7) -> CatalogItemSnapshot:
    return CatalogItemSnapshot(
        id=item_id,
        name=f"Item {item_id}",
        category="Hand Tool",
        supplier=supplier,
        manufacturer=supplier,
        model=f"M-{item_id}",
        description="Approved refinery item.",
        leadTimeDays=lead,
        priceUsd=price,
        inStock=True,
        specs={"voltage": "120V"},
    )


class FakeCatalogClient:
    def __init__(self):
        self.items = {
            "A": item("A", "DeWalt", price=10, lead=3),
            "B": item("B", "DeWalt", price=18, lead=4),
            "C": item("C", "Flexitallic", price=95, lead=5),
        }

    def get_item(self, item_id: str) -> CatalogItemSnapshot:
        return self.items[item_id]


@pytest.fixture()
def service():
    engine = create_engine("sqlite+pysqlite:///:memory:").execution_options(
        schema_translate_map={"procurement": None}
    )
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine, expire_on_commit=False)()
    return ProcurementService(session, FakeCatalogClient())


def header() -> DraftHeader:
    return DraftHeader(
        requestor="Alex Morgan",
        costCenter="CC-1234",
        neededBy=date.today(),
        paymentTerms="Net 30",
    )


def test_first_line_locks_supplier_and_mismatch_returns_409(service: ProcurementService):
    draft = service.create_draft(header())
    draft = service.add_line(draft.id, AddLineRequest(itemId="A"))

    assert draft.supplier == "DeWalt"

    with pytest.raises(HTTPException) as exc:
        service.add_line(draft.id, AddLineRequest(itemId="C"))

    assert exc.value.status_code == 409
    assert "locked to DeWalt" in exc.value.detail


def test_submit_snapshots_price_lead_generates_po_and_timeline(service: ProcurementService):
    draft = service.create_draft(header())
    draft = service.add_line(draft.id, AddLineRequest(itemId="A"))

    submitted = service.submit(draft.id, idempotency_key="submit-key")
    repeated = service.submit(draft.id, idempotency_key="submit-key")

    assert submitted.poNumber.startswith("PO-")
    assert repeated.poNumber == submitted.poNumber
    assert submitted.status == "Submitted"
    assert submitted.lines[0].priceUsdSnapshot == 10
    assert submitted.lines[0].leadTimeDaysSnapshot == 3
    assert [event.status for event in submitted.timeline] == ["Draft", "Submitted"]


def test_invalid_lifecycle_transition_is_blocked(service: ProcurementService):
    draft = service.create_draft(header())

    with pytest.raises(HTTPException) as exc:
        service.transition(
            draft.id,
            PurchaseOrderStatus.fulfilled,
            StatusActionRequest(actor="Ops"),
        )

    assert exc.value.status_code == 409


def test_status_timeline_for_approve_and_fulfill(service: ProcurementService):
    draft = service.create_draft(header())
    draft = service.add_line(draft.id, AddLineRequest(itemId="A"))
    submitted = service.submit(draft.id)
    approved = service.transition(
        submitted.id,
        PurchaseOrderStatus.approved,
        StatusActionRequest(actor="Approvals Desk"),
    )
    fulfilled = service.transition(
        approved.id,
        PurchaseOrderStatus.fulfilled,
        StatusActionRequest(actor="DeWalt"),
    )

    assert fulfilled.status == "Fulfilled"
    assert [event.status for event in service.timeline(fulfilled.id)] == [
        "Draft",
        "Submitted",
        "Approved",
        "Fulfilled",
    ]

