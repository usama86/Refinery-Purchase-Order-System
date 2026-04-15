import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogItem } from "@/lib/types";
import { formatCurrency, sentenceCase } from "@/lib/utils";

export function CatalogTable({
  items,
  supplierLock,
  onAdd
}: {
  items: CatalogItem[];
  supplierLock: string | null;
  onAdd: (item: CatalogItem) => void;
}) {
  return (
    <div className="table-grid overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="max-h-[calc(100vh-235px)] overflow-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const blocked = Boolean(supplierLock && supplierLock !== item.supplier);
              return (
                <tr key={item.id} className="border-b align-top last:border-b-0 hover:bg-muted/30">
                  <td className="max-w-[360px] px-4 py-4">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.id} · {item.manufacturer} · {item.model}
                    </p>
                    <details className="group mt-3">
                      <summary className="focus-ring inline-flex cursor-pointer list-none items-center gap-1 rounded text-xs font-semibold text-primary">
                        <ChevronDown
                          className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                        Engineering specs
                      </summary>
                      <dl className="mt-3 grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-3">
                        {Object.entries(item.specs).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-[11px] uppercase text-muted-foreground">
                              {sentenceCase(key)}
                            </dt>
                            <dd className="mt-0.5 text-xs font-medium">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  </td>
                  <td className="px-4 py-4 font-medium">{item.supplier}</td>
                  <td className="px-4 py-4">{item.category}</td>
                  <td className="px-4 py-4">{item.leadTimeDays} days</td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        item.inStock
                          ? "rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800"
                          : "rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700"
                      }
                    >
                      {item.inStock ? "In stock" : "Backorder"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold">
                    {formatCurrency(item.priceUsd)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      size="sm"
                      variant={blocked ? "outline" : "default"}
                      disabled={blocked}
                      title={
                        blocked
                          ? `Draft is locked to ${supplierLock}; ${item.supplier} cannot be added.`
                          : `Add ${item.name}`
                      }
                      onClick={() => onAdd(item)}
                    >
                      {blocked ? "Supplier blocked" : "Add"}
                    </Button>
                    {blocked ? (
                      <p className="mt-2 max-w-[170px] text-right text-xs text-destructive">
                        Locked to {supplierLock}
                      </p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
