import rawItems from "@/data/refinery-items.json";
import type {
  CatalogItem,
  CatalogQuery,
  CatalogSearchResult,
  CatalogSort
} from "@/lib/types";

export const catalogItems = rawItems as unknown as CatalogItem[];

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  search: "",
  category: "all",
  inStockOnly: false,
  sort: "price-asc",
  page: 1,
  pageSize: 10
};

export const SORT_LABELS: Record<CatalogSort, string> = {
  "price-asc": "Price Low to High",
  "price-desc": "Price High to Low",
  "lead-asc": "Lead Time Low to High",
  "lead-desc": "Lead Time High to Low",
  "supplier-asc": "Supplier A to Z"
};

export function getCatalogCategories(items: CatalogItem[] = catalogItems) {
  return Array.from(new Set(items.map((item) => item.category))).sort();
}

export function parseCatalogQuery(params: URLSearchParams): CatalogQuery {
  const sort = params.get("sort") as CatalogSort | null;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));

  return {
    search: params.get("q") ?? DEFAULT_CATALOG_QUERY.search,
    category: params.get("category") ?? DEFAULT_CATALOG_QUERY.category,
    inStockOnly: params.get("stock") === "in",
    sort: sort && sort in SORT_LABELS ? sort : DEFAULT_CATALOG_QUERY.sort,
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_CATALOG_QUERY.page,
    pageSize:
      Number.isInteger(pageSize) && pageSize > 0
        ? pageSize
        : DEFAULT_CATALOG_QUERY.pageSize
  };
}

export function catalogQueryToParams(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.search.trim()) params.set("q", query.search.trim());
  if (query.category !== "all") params.set("category", query.category);
  if (query.inStockOnly) params.set("stock", "in");
  if (query.sort !== DEFAULT_CATALOG_QUERY.sort) params.set("sort", query.sort);
  if (query.page !== DEFAULT_CATALOG_QUERY.page) params.set("page", String(query.page));
  if (query.pageSize !== DEFAULT_CATALOG_QUERY.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }
  return params;
}

export function filterAndSortCatalog(
  items: CatalogItem[],
  query: CatalogQuery
) {
  const search = query.search.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const searchable = [
      item.id,
      item.name,
      item.supplier,
      item.manufacturer,
      item.model
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = search ? searchable.includes(search) : true;
    const matchesCategory =
      query.category === "all" || item.category === query.category;
    const matchesStock = query.inStockOnly ? item.inStock : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return [...filtered].sort((a, b) => {
    switch (query.sort) {
      case "price-desc":
        return b.priceUsd - a.priceUsd;
      case "lead-asc":
        return a.leadTimeDays - b.leadTimeDays;
      case "lead-desc":
        return b.leadTimeDays - a.leadTimeDays;
      case "supplier-asc":
        return a.supplier.localeCompare(b.supplier) || a.name.localeCompare(b.name);
      case "price-asc":
      default:
        return a.priceUsd - b.priceUsd;
    }
  });
}

export function paginateCatalog(
  items: CatalogItem[],
  query: Pick<CatalogQuery, "page" | "pageSize">
): CatalogSearchResult {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(query.page, 1), totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    items: items.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    totalPages
  };
}

export async function searchCatalog(query: CatalogQuery) {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return paginateCatalog(filterAndSortCatalog(catalogItems, query), query);
}
