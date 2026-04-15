import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronDown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { CatalogItem, CatalogSort } from "@/lib/types";
import { formatCurrency, sentenceCase } from "@/lib/utils";

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
  return (
    <Table className="min-w-[980px]">
      <TableHeader className="bg-muted/65">
        <TableRow className="hover:bg-muted/65">
          <TableHead className="w-[38%]">Item</TableHead>
          <SortableHead
            label="Supplier"
            active={sort === "supplier-asc" ? "asc" : false}
            onSort={() => onSortChange("supplier-asc")}
          />
          <TableHead>Category</TableHead>
          <SortableHead
            label="Lead"
            active={
              sort === "lead-asc" ? "asc" : sort === "lead-desc" ? "desc" : false
            }
            onSort={() => onSortChange(sort === "lead-asc" ? "lead-desc" : "lead-asc")}
          />
          <TableHead>Stock</TableHead>
          <SortableHead
            label="Price"
            align="right"
            active={
              sort === "price-asc" ? "asc" : sort === "price-desc" ? "desc" : false
            }
            onSort={() => onSortChange(sort === "price-asc" ? "price-desc" : "price-asc")}
          />
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const blocked = Boolean(supplierLock && supplierLock !== item.supplier);
          return (
            <TableRow key={item.id} className="align-top">
              <TableCell className="max-w-[420px] py-4">
                <p className="font-semibold leading-5">{item.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.id} / {item.manufacturer} / {item.model}
                </p>
                <Collapsible>
                  <CollapsibleTrigger className="focus-ring group mt-3 inline-flex items-center gap-1 rounded text-xs font-semibold text-primary">
                    <ChevronDown
                      className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                    Engineering specs
                  </CollapsibleTrigger>
                  <CollapsibleContent className="catalog-specs">
                    <dl className="mt-3 grid grid-cols-2 gap-3 rounded-md border bg-background/80 p-3 shadow-sm">
                      {Object.entries(item.specs).map(([key, value]) => (
                        <div key={key} className="min-w-0">
                          <dt className="truncate text-[11px] font-medium uppercase text-muted-foreground">
                            {sentenceCase(key)}
                          </dt>
                          <dd className="mt-0.5 text-xs font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </CollapsibleContent>
                </Collapsible>
              </TableCell>
              <TableCell className="font-medium">{item.supplier}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.leadTimeDays} days</TableCell>
              <TableCell>
                <Badge
                  variant={item.inStock ? "accent" : "secondary"}
                  className={
                    item.inStock
                      ? "bg-success/12 text-success"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {item.inStock ? "In stock" : "Backorder"}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(item.priceUsd)}
              </TableCell>
              <TableCell className="text-right">
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
