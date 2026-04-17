from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.catalog import CatalogItemRead, CatalogSearchResponse, CatalogSort
from app.services.catalog_service import CatalogService

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/items", response_model=CatalogSearchResponse)
def list_items(
    db: Annotated[Session, Depends(get_db)],
    q: str = "",
    category: str = "all",
    stock: str | None = None,
    sort: CatalogSort = "price-asc",
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
) -> CatalogSearchResponse:
    return CatalogService(db).search(
        query=q,
        category=category,
        in_stock=stock == "in",
        sort=sort,
        page=page,
        page_size=pageSize,
    )


@router.get("/items/{item_id}", response_model=CatalogItemRead)
def get_item(item_id: str, db: Annotated[Session, Depends(get_db)]) -> CatalogItemRead:
    item = CatalogService(db).get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Catalog item not found")
    return item


@router.get("/categories", response_model=list[str])
def list_categories(db: Annotated[Session, Depends(get_db)]) -> list[str]:
    return CatalogService(db).categories()

