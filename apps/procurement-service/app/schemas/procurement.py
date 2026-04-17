from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

PoStatus = Literal["Draft", "Submitted", "Approved", "Rejected", "Fulfilled"]


class CatalogItemSnapshot(BaseModel):
    id: str
    name: str
    category: str
    supplier: str
    manufacturer: str
    model: str
    description: str
    leadTimeDays: int
    priceUsd: Decimal
    inStock: bool
    specs: dict[str, str]
    compatibleWith: list[str] = Field(default_factory=list)


class DraftHeader(BaseModel):
    requestor: str = Field(min_length=1)
    costCenter: str = Field(min_length=1)
    neededBy: date
    paymentTerms: str = Field(min_length=1)


class CreateDraftRequest(BaseModel):
    header: DraftHeader | None = None


class AddLineRequest(BaseModel):
    itemId: str
    quantity: int = Field(default=1, ge=1)


class UpdateLineRequest(BaseModel):
    quantity: int = Field(ge=0)


class StatusActionRequest(BaseModel):
    actor: str = "Approvals Desk"
    note: str | None = None


class PurchaseOrderLineRead(BaseModel):
    id: str
    itemId: str
    quantity: int
    supplier: str
    itemSnapshot: CatalogItemSnapshot
    priceUsdSnapshot: Decimal | None = None
    leadTimeDaysSnapshot: int | None = None


class TimelineEventRead(BaseModel):
    id: str
    status: PoStatus
    at: datetime
    actor: str
    note: str


class PurchaseOrderRead(BaseModel):
    id: str
    poNumber: str | None
    supplier: str | None
    status: PoStatus
    header: DraftHeader
    lines: list[PurchaseOrderLineRead]
    totalUsd: Decimal
    submittedAt: datetime | None
    createdAt: datetime
    updatedAt: datetime
    timeline: list[TimelineEventRead]

    # Compatibility with the existing frontend route shape.
    @property
    def po_number_or_id(self) -> str:
        return self.poNumber or self.id

