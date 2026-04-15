import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PurchaseOrderDraft } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function LineItemsEditor({
  draft,
  onQuantityChange,
  readonly = false
}: {
  draft: PurchaseOrderDraft;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Item</th>
            <th className="px-4 py-3 font-semibold">Lead</th>
            <th className="px-4 py-3 font-semibold">Unit</th>
            <th className="px-4 py-3 font-semibold">Qty</th>
            <th className="px-4 py-3 text-right font-semibold">Line total</th>
          </tr>
        </thead>
        <tbody>
          {draft.lines.map((line) => (
            <tr key={line.itemId} className="border-t">
              <td className="px-4 py-4">
                <p className="font-medium">{line.itemSnapshot.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {line.itemSnapshot.id} · {line.itemSnapshot.model}
                </p>
              </td>
              <td className="px-4 py-4">{line.itemSnapshot.leadTimeDays} days</td>
              <td className="px-4 py-4">{formatCurrency(line.itemSnapshot.priceUsd)}</td>
              <td className="px-4 py-4">
                {readonly ? (
                  line.quantity
                ) : (
                  <Input
                    aria-label={`Quantity for ${line.itemSnapshot.name}`}
                    type="number"
                    min={0}
                    className="w-20"
                    value={line.quantity}
                    onChange={(event) =>
                      onQuantityChange?.(line.itemId, Number(event.target.value))
                    }
                  />
                )}
              </td>
              <td className="px-4 py-4 text-right font-semibold">
                {formatCurrency(line.quantity * line.itemSnapshot.priceUsd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!readonly ? (
        <div className="border-t bg-muted/30 px-4 py-3">
          <Button variant="outline" size="sm" asChild>
            <a href="/catalog">Edit catalog selections</a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
