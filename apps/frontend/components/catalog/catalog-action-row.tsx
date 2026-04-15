"use client";

import { Search } from "lucide-react";
import { CatalogActiveFilters } from "@/components/catalog/catalog-active-filters";
import { CatalogFilterPopover } from "@/components/catalog/catalog-filter-popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CatalogQuery } from "@/lib/types";

export function CatalogActionRow({
  query,
  categories,
  total,
  loading,
  activeFilterCount,
  onChange,
  onReset,
  onClearFilters
}: {
  query: CatalogQuery;
  categories: string[];
  total: number;
  loading: boolean;
  activeFilterCount: number;
  onChange: (query: CatalogQuery) => void;
  onReset: () => void;
  onClearFilters: () => void;
}) {
  return (
    <section className="space-y-3" aria-label="Catalog actions">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="catalog-search" className="sr-only">
            Search catalog
          </Label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="catalog-search"
            value={query.search}
            onChange={(event) =>
              onChange({ ...query, search: event.target.value, page: 1 })
            }
            placeholder="Search by name, ID, supplier, manufacturer, or model"
            className="h-10 bg-background pl-9"
          />
        </div>
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <CatalogFilterPopover
            query={query}
            categories={categories}
            activeFilterCount={activeFilterCount}
            onChange={onChange}
            onClear={onClearFilters}
          />
          <div className="min-w-[108px] text-right text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total}</span> results
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CatalogActiveFilters query={query} onChange={onChange} onReset={onReset} />
        <span className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
          {loading ? "Refreshing catalog..." : "Catalog ready"}
        </span>
      </div>
    </section>
  );
}
