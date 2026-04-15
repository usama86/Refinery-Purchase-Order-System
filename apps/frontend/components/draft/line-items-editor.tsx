import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
      <Table>
        <TableHeader className="bg-muted/65">
          <TableRow className="hover:bg-muted/65">
            <TableHead>Item</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="text-right">Line total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {draft.lines.map((line) => (
            <TableRow key={line.itemId}>
              <TableCell className="py-4">
                <p className="font-medium">{line.itemSnapshot.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {line.itemSnapshot.id} / {line.itemSnapshot.model}
                </p>
              </TableCell>
              <TableCell>{line.itemSnapshot.leadTimeDays} days</TableCell>
              <TableCell>{formatCurrency(line.itemSnapshot.priceUsd)}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(line.quantity * line.itemSnapshot.priceUsd)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
