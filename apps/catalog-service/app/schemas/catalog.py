from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

CatalogSort = Literal["price-asc", "price-desc", "lead-asc", "lead-desc", "supplier-asc"]


class CatalogItemRead(BaseModel):
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


class CatalogSearchResponse(BaseModel):
    items: list[CatalogItemRead]
    total: int
    page: int
    pageSize: int
    totalPages: int

