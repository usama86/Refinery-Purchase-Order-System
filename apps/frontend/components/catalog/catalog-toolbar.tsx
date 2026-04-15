import { Filter, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
    <section
      className="rounded-lg border bg-card/92 p-3 shadow-sm"
      aria-label="Catalog controls"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <Label htmlFor="catalog-search" className="sr-only">
            Search catalog
          </Label>
          <div className="relative">
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
              className="h-9 bg-background pl-9"
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-[180px_220px_150px]">
          <div className="space-y-1.5">
            <Label htmlFor="category-filter" className="text-xs text-muted-foreground">
              Category
            </Label>
            <Select
              value={query.category}
              onValueChange={(value) => onChange({ ...query, category: value })}
            >
              <SelectTrigger id="category-filter" className="h-9 bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sort-filter" className="text-xs text-muted-foreground">
              Sort
            </Label>
            <Select
              value={query.sort}
              onValueChange={(value) =>
                onChange({ ...query, sort: value as CatalogSort })
              }
            >
              <SelectTrigger id="sort-filter" className="h-9 bg-background">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Availability</span>
            <label className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium">
            <Checkbox
              id="stock-filter"
              checked={query.inStockOnly}
              onCheckedChange={(checked) =>
                onChange({ ...query, inStockOnly: checked === true })
              }
            />
              <span>In stock only</span>
            </label>
          </div>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          {resultCount} matching items
        </span>
        <span aria-live="polite" aria-atomic="true">
          {loading ? "Refreshing catalog..." : "Catalog ready"}
        </span>
      </div>
    </section>
  );
}
