import httpx

from app.core.config import settings
from app.schemas.procurement import CatalogItemSnapshot


class CatalogClientError(Exception):
    pass


class CatalogClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or settings.catalog_service_base_url).rstrip("/")

    def get_item(self, item_id: str) -> CatalogItemSnapshot:
        response = httpx.get(f"{self.base_url}/catalog/items/{item_id}", timeout=5)
        if response.status_code == 404:
            raise CatalogClientError("Catalog item not found")
        response.raise_for_status()
        return CatalogItemSnapshot.model_validate(response.json())
