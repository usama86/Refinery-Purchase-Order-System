"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { CatalogQuery } from "@/lib/types";

export function CatalogFilterPopover({
  query,
  categories,
  activeFilterCount,
  onChange,
  onClear
}: {
  query: CatalogQuery;
  categories: string[];
  activeFilterCount: number;
  onChange: (query: CatalogQuery) => void;
  onClear: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 shrink-0 bg-background">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[11px] text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Refine catalog</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            Filters update the result set and persist in the URL.
          </p>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-filter">Category</Label>
            <Select
              value={query.category}
              onValueChange={(value) =>
                onChange({ ...query, category: value, page: 1 })
              }
            >
              <SelectTrigger id="category-filter" className="bg-background">
                <SelectValue placeholder="All categories" />
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
          <label className="flex items-start gap-3 rounded-md border bg-background p-3">
            <Checkbox
              id="stock-filter"
              checked={query.inStockOnly}
              onCheckedChange={(checked) =>
                onChange({ ...query, inStockOnly: checked === true, page: 1 })
              }
            />
            <span>
              <span className="block text-sm font-medium">In stock only</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Hide backordered items when availability matters.
              </span>
            </span>
          </label>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={activeFilterCount === 0}
          >
            Clear filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
