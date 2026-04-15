import { describe, expect, it } from "vitest";
import {
  catalogItems,
  filterAndSortCatalog,
  paginateCatalog,
  parseCatalogQuery
} from "@/lib/catalog";

describe("catalog search/filter/sort", () => {
  it("searches by name, id, supplier, manufacturer, and model", () => {
    expect(filterAndSortCatalog(catalogItems, query("gasket")).length).toBeGreaterThan(0);
    expect(filterAndSortCatalog(catalogItems, query("GST-0001"))[0]?.id).toBe("GST-0001");
    expect(filterAndSortCatalog(catalogItems, query("Flowserve")).length).toBeGreaterThan(0);
    expect(filterAndSortCatalog(catalogItems, query("Rosemount")).length).toBeGreaterThan(0);
    expect(filterAndSortCatalog(catalogItems, query("DCD996"))[0]?.model).toBe("DCD996");
  });

  it("filters by category and in-stock state", () => {
    const result = filterAndSortCatalog(catalogItems, {
      search: "",
      category: "Valve",
      inStockOnly: true,
      sort: "price-asc",
      page: 1,
      pageSize: 10
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === "Valve" && item.inStock)).toBe(true);
  });

  it("sorts by required commercial options", () => {
    const lowToHigh = filterAndSortCatalog(catalogItems, query("", "price-asc"));
    expect(lowToHigh[0].priceUsd).toBeLessThanOrEqual(lowToHigh[1].priceUsd);

    const highToLow = filterAndSortCatalog(catalogItems, query("", "price-desc"));
    expect(highToLow[0].priceUsd).toBeGreaterThanOrEqual(highToLow[1].priceUsd);

    const leadLow = filterAndSortCatalog(catalogItems, query("", "lead-asc"));
    expect(leadLow[0].leadTimeDays).toBeLessThanOrEqual(leadLow[1].leadTimeDays);

    const leadHigh = filterAndSortCatalog(catalogItems, query("", "lead-desc"));
    expect(leadHigh[0].leadTimeDays).toBeGreaterThanOrEqual(leadHigh[1].leadTimeDays);

    const supplier = filterAndSortCatalog(catalogItems, query("", "supplier-asc"));
    expect(supplier[0].supplier.localeCompare(supplier[1].supplier)).toBeLessThanOrEqual(0);
  });

  it("parses URL query parameters for catalog state", () => {
    const params = new URLSearchParams("q=pump&category=Pump&stock=in&sort=lead-desc&page=2&pageSize=20");
    expect(parseCatalogQuery(params)).toEqual({
      search: "pump",
      category: "Pump",
      inStockOnly: true,
      sort: "lead-desc",
      page: 2,
      pageSize: 20
    });
  });

  it("paginates catalog results with a server-ready result shape", () => {
    const result = paginateCatalog(catalogItems, { page: 2, pageSize: 10 });

    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(50);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(5);
  });
});

function query(search: string, sort: "price-asc" | "price-desc" | "lead-asc" | "lead-desc" | "supplier-asc" = "price-asc") {
  return {
    search,
    category: "all",
    inStockOnly: false,
    sort,
    page: 1,
    pageSize: 10
  };
}
