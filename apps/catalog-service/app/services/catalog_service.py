import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.catalog_item import CatalogItem
from app.repositories.catalog_repository import CatalogRepository
from app.schemas.catalog import CatalogItemRead, CatalogSearchResponse, CatalogSort


def to_read_model(item: CatalogItem) -> CatalogItemRead:
    return CatalogItemRead(
        id=item.id,
        name=item.name,
        category=item.category,
        supplier=item.supplier,
        manufacturer=item.manufacturer,
        model=item.model,
        description=item.description,
        leadTimeDays=item.lead_time_days,
        priceUsd=item.price_usd,
        inStock=item.in_stock,
        specs=item.specs,
        compatibleWith=item.compatible_with or [],
    )


class CatalogService:
    def __init__(self, db: Session):
        self.repo = CatalogRepository(db)

    def search(
        self,
        *,
        query: str = "",
        category: str = "all",
        in_stock: bool = False,
        sort: CatalogSort = "price-asc",
        page: int = 1,
        page_size: int = 10,
    ) -> CatalogSearchResponse:
        items, total, safe_page, total_pages = self.repo.search(
            query=query,
            category=category,
            in_stock=in_stock,
            sort=sort,
            page=page,
            page_size=page_size,
        )
        return CatalogSearchResponse(
            items=[to_read_model(item) for item in items],
            total=total,
            page=safe_page,
            pageSize=page_size,
            totalPages=total_pages,
        )

    def get_item(self, item_id: str) -> CatalogItemRead | None:
        item = self.repo.get(item_id)
        return to_read_model(item) if item else None

    def categories(self) -> list[str]:
        return self.repo.categories()


def seed_catalog_from_file(db: Session, path: Path | None = None) -> None:
    dataset_path = path or Path(__file__).resolve().parents[1] / "data" / "refinery-items.json"
    raw_items = json.loads(dataset_path.read_text())
    repo = CatalogRepository(db)
    repo.upsert_many(
        [
            CatalogItem(
                id=item["id"],
                name=item["name"],
                category=item["category"],
                supplier=item["supplier"],
                manufacturer=item["manufacturer"],
                model=item["model"],
                description=item["description"],
                lead_time_days=item["leadTimeDays"],
                price_usd=item["priceUsd"],
                in_stock=item["inStock"],
                specs=item["specs"],
                compatible_with=item.get("compatibleWith", []),
            )
            for item in raw_items
        ]
    )
    db.commit()

