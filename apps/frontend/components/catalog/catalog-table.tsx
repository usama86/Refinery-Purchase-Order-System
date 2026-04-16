"use client";

import { Fragment, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  LockKeyhole
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { CatalogItem, CatalogSort } from "@/lib/types";
import { cn, formatCurrency, sentenceCase } from "@/lib/utils";

export function CatalogTable({
  items,
  supplierLock,
  sort,
  onSortChange,
  onAdd
}: {
  items: CatalogItem[];
  supplierLock: string | null;
  sort: CatalogSort;
  onSortChange: (sort: CatalogSort) => void;
  onAdd: (item: CatalogItem) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleSpecs = (itemId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <Table className="min-w-[980px]">
      <TableHeader className="bg-muted/50">
        <TableRow className="hover:bg-muted/50">
          <TableHead className="w-[38%] pl-5">Item</TableHead>
          <SortableHead
            label="Supplier"
            active={sort === "supplier-asc" ? "asc" : false}
            onSort={() => onSortChange("supplier-asc")}
          />
          <TableHead className="w-[132px]">Category</TableHead>
          <SortableHead
            label="Lead"
            active={
              sort === "lead-asc" ? "asc" : sort === "lead-desc" ? "desc" : false
            }
            onSort={() => onSortChange(sort === "lead-asc" ? "lead-desc" : "lead-asc")}
          />
          <TableHead className="w-[132px]">Stock</TableHead>
          <SortableHead
            label="Price"
            align="right"
            active={
              sort === "price-asc" ? "asc" : sort === "price-desc" ? "desc" : false
            }
            onSort={() => onSortChange(sort === "price-asc" ? "price-desc" : "price-asc")}
          />
          <TableHead className="pr-5 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const blocked = Boolean(supplierLock && supplierLock !== item.supplier);
          const expanded = expandedIds.has(item.id);

          return (
            <Fragment key={item.id}>
              <TableRow
                data-state={expanded ? "open" : "closed"}
                className="group hover:bg-muted/20 data-[state=open]:border-b-0 data-[state=open]:bg-muted/10"
              >
                <TableCell className="max-w-[440px] py-3.5 pl-5">
                  <div className="space-y-1.5">
                    <div>
                      <p className="font-semibold leading-5 tracking-tight">{item.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground/85">
                        {item.id} <span aria-hidden="true">/</span> {item.manufacturer}{" "}
                        <span aria-hidden="true">/</span> {item.model}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`specs-${item.id}`}
                      onClick={() => toggleSpecs(item.id)}
                      className="focus-ring group/specs -ml-0.5 inline-flex items-center gap-1 rounded px-0.5 text-xs font-semibold text-primary/85 transition-colors hover:text-primary"
                    >
                      <ChevronDown
                        className="h-3.5 w-3.5 transition-transform group-aria-expanded/specs:rotate-180"
                        aria-hidden="true"
                      />
                      Engineering specs
                    </button>
                  </div>
                </TableCell>
                <TableCell className="py-3.5 font-medium">{item.supplier}</TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    variant="secondary"
                    className="whitespace-nowrap bg-muted/60 font-medium text-foreground/90"
                  >
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 font-medium tabular-nums">
                  {item.leadTimeDays} days
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    variant={item.inStock ? "accent" : "secondary"}
                    className={
                      item.inStock
                        ? "whitespace-nowrap bg-success/10 text-success ring-1 ring-success/15"
                        : "whitespace-nowrap bg-muted/80 text-muted-foreground"
                    }
                  >
                    {item.inStock ? "In stock" : "Backorder"}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5 text-right text-base font-semibold tabular-nums">
                  {formatCurrency(item.priceUsd)}
                </TableCell>
                <TableCell className="py-3.5 pr-5 text-right">
                  <Button
                    size="sm"
                    variant={blocked ? "outline" : "default"}
                    disabled={blocked}
                    aria-label={
                      blocked
                        ? `Cannot add ${item.name}; draft is locked to ${supplierLock}`
                        : `Add ${item.name} to draft`
                    }
                    title={
                      blocked
                        ? `Draft is locked to ${supplierLock}; ${item.supplier} cannot be added.`
                        : `Add ${item.name}`
                    }
                    onClick={() => onAdd(item)}
                    className="min-w-[92px]"
                  >
                    {blocked ? (
                      <>
                        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                        Blocked
                      </>
                    ) : (
                      "Add"
                    )}
                  </Button>
                  {blocked ? (
                    <p className="mt-2 text-right text-xs text-destructive" aria-live="polite">
                      Locked to {supplierLock}
                    </p>
                  ) : null}
                </TableCell>
              </TableRow>
              <TableRow
                aria-hidden={!expanded}
                className={cn(
                  "hover:bg-transparent",
                  expanded ? "border-b bg-muted/10" : "border-0"
                )}
              >
                <TableCell colSpan={7} className="p-0">
                  <div
                    id={`specs-${item.id}`}
                    data-state={expanded ? "open" : "closed"}
                    className="catalog-specs"
                  >
                    <div className="px-5 pb-3">
                      <div className="border-l-2 border-primary/25 bg-background/35 py-2.5 pl-4 pr-3">
                        <div className="mb-2.5 grid gap-1.5 sm:grid-cols-[150px_1fr] sm:items-baseline">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Engineering details
                          </p>
                          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <dl className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
                          {Object.entries(item.specs).map(([key, value]) => (
                            <div
                              key={key}
                              className="grid min-w-0 grid-cols-[minmax(90px,128px)_1fr] items-baseline gap-3 border-t border-border/45 pt-2 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0"
                            >
                              <dt className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {sentenceCase(key)}
                              </dt>
                              <dd className="min-w-0 text-sm font-medium leading-5 text-foreground">
                                {value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

function SortableHead({
  label,
  active,
  align = "left",
  onSort
}: {
  label: string;
  active: "asc" | "desc" | false;
  align?: "left" | "right";
  onSort: () => void;
}) {
  const Icon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <TableHead
      aria-sort={
        active === "asc" ? "ascending" : active === "desc" ? "descending" : "none"
      }
      className={align === "right" ? "text-right" : undefined}
    >
      <button
        type="button"
        onClick={onSort}
        className={[
          "focus-ring inline-flex items-center gap-1.5 rounded px-1 py-1 transition-colors hover:text-foreground",
          align === "right" ? "ml-auto" : "",
          active ? "text-foreground" : ""
        ].join(" ")}
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </TableHead>
  );
}
