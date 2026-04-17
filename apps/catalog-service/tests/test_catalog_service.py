from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.services.catalog_service import CatalogService, seed_catalog_from_file


def make_db():
    engine = create_engine("sqlite+pysqlite:///:memory:").execution_options(
        schema_translate_map={"catalog": None}
    )
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    seed_catalog_from_file(session, Path(__file__).parents[1] / "app" / "data" / "refinery-items.json")
    return session


def test_catalog_search_filter_sort_and_pagination():
    service = CatalogService(make_db())

    result = service.search(
        query="gasket",
        category="Gasket",
        in_stock=False,
        sort="price-asc",
        page=1,
        page_size=5,
    )

    assert result.total > 0
    assert result.page == 1
    assert result.pageSize == 5
    assert all(item.category == "Gasket" for item in result.items)
    assert result.items[0].priceUsd <= result.items[-1].priceUsd


def test_catalog_searches_supported_fields():
    service = CatalogService(make_db())

    assert service.search(query="GST-0001").items[0].id == "GST-0001"
    assert service.search(query="Flowserve").total > 0
    assert service.search(query="Rosemount").total > 0
    assert service.search(query="DCD996").items[0].model == "DCD996"


def test_catalog_item_detail_and_categories():
    service = CatalogService(make_db())

    item = service.get_item("GST-0001")
    categories = service.categories()

    assert item is not None
    assert item.id == "GST-0001"
    assert "Gasket" in categories
