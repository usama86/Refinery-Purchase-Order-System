import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SORT_LABELS } from "@/lib/catalog";
import type { CatalogQuery, CatalogSort } from "@/lib/types";

export function CatalogToolbar({
  query,
  categories,
  resultCount,
  loading,
  onChange
}: {
  query: CatalogQuery;
  categories: string[];
  resultCount: number;
  loading: boolean;
  onChange: (query: CatalogQuery) => void;
}) {
  return (
    <section className="sticky top-[65px] z-30 mb-4 rounded-lg border bg-card p-4 shadow-soft">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="catalog-search">Search catalog</Label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="catalog-search"
              value={query.search}
              onChange={(event) =>
                onChange({ ...query, search: event.target.value })
              }
              placeholder="Name, ID, supplier, manufacturer, or model"
              className="pl-9"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:w-[620px]">
          <div>
            <Label htmlFor="category-filter">Category</Label>
            <Select
              id="category-filter"
              className="mt-2 w-full"
              value={query.category}
              onChange={(event) =>
                onChange({ ...query, category: event.target.value })
              }
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sort-filter">Sort</Label>
            <Select
              id="sort-filter"
              className="mt-2 w-full"
              value={query.sort}
              onChange={(event) =>
                onChange({ ...query, sort: event.target.value as CatalogSort })
              }
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <label className="flex h-[66px] items-end gap-2 rounded-md border bg-muted/40 px-3 pb-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={query.inStockOnly}
              onChange={(event) =>
                onChange({ ...query, inStockOnly: event.target.checked })
              }
              className="h-4 w-4 rounded border-input accent-teal-800"
            />
            In stock only
          </label>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
        <span>{resultCount} matching items</span>
        <span aria-live="polite">{loading ? "Refreshing catalog..." : "Catalog ready"}</span>
      </div>
    </section>
  );
}
