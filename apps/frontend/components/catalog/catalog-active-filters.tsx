import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SORT_LABELS } from "@/lib/catalog";
import type { CatalogQuery } from "@/lib/types";

export function CatalogActiveFilters({
  query,
  onChange,
  onReset
}: {
  query: CatalogQuery;
  onChange: (query: CatalogQuery) => void;
  onReset: () => void;
}) {
  const chips = [
    query.category !== "all"
      ? {
          key: "category",
          label: query.category,
          clear: () => onChange({ ...query, category: "all", page: 1 })
        }
      : null,
    query.inStockOnly
      ? {
          key: "stock",
          label: "In stock",
          clear: () => onChange({ ...query, inStockOnly: false, page: 1 })
        }
      : null,
    query.sort !== "price-asc"
      ? {
          key: "sort",
          label: SORT_LABELS[query.sort],
          clear: () => onChange({ ...query, sort: "price-asc", page: 1 })
        }
      : null
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

  if (chips.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Showing default catalog view.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="focus-ring inline-flex h-7 items-center gap-1 rounded-md border bg-background px-2 text-xs font-medium text-foreground shadow-sm hover:bg-muted"
          aria-label={`Clear ${chip.label}`}
        >
          {chip.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
