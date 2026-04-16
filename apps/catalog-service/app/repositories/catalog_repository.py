from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.catalog_item import CatalogItem
from app.schemas.catalog import CatalogSort


class CatalogRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, item_id: str) -> CatalogItem | None:
        return self.db.get(CatalogItem, item_id)

    def categories(self) -> list[str]:
        stmt = select(CatalogItem.category).distinct().order_by(CatalogItem.category)
        return list(self.db.scalars(stmt).all())

    def search(
        self,
        *,
        query: str,
        category: str,
        in_stock: bool,
        sort: CatalogSort,
        page: int,
        page_size: int,
    ) -> tuple[list[CatalogItem], int, int, int]:
        stmt = select(CatalogItem)
        stmt = self._apply_filters(stmt, query=query, category=category, in_stock=in_stock)

        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        total_pages = max(1, (total + page_size - 1) // page_size)
        safe_page = min(max(page, 1), total_pages)
        stmt = self._apply_sort(stmt, sort).offset((safe_page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total, safe_page, total_pages

    def upsert_many(self, items: list[CatalogItem]) -> None:
        for item in items:
            self.db.merge(item)

    def _apply_filters(
        self, stmt: Select[tuple[CatalogItem]], *, query: str, category: str, in_stock: bool
    ) -> Select[tuple[CatalogItem]]:
        search = query.strip()
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    CatalogItem.id.ilike(pattern),
                    CatalogItem.name.ilike(pattern),
                    CatalogItem.supplier.ilike(pattern),
                    CatalogItem.manufacturer.ilike(pattern),
                    CatalogItem.model.ilike(pattern),
                )
            )
        if category and category != "all":
            stmt = stmt.where(CatalogItem.category == category)
        if in_stock:
            stmt = stmt.where(CatalogItem.in_stock.is_(True))
        return stmt

    def _apply_sort(
        self, stmt: Select[tuple[CatalogItem]], sort: CatalogSort
    ) -> Select[tuple[CatalogItem]]:
        match sort:
            case "price-desc":
                return stmt.order_by(CatalogItem.price_usd.desc(), CatalogItem.name.asc())
            case "lead-asc":
                return stmt.order_by(CatalogItem.lead_time_days.asc(), CatalogItem.name.asc())
            case "lead-desc":
                return stmt.order_by(CatalogItem.lead_time_days.desc(), CatalogItem.name.asc())
            case "supplier-asc":
                return stmt.order_by(CatalogItem.supplier.asc(), CatalogItem.name.asc())
            case _:
                return stmt.order_by(CatalogItem.price_usd.asc(), CatalogItem.name.asc())

