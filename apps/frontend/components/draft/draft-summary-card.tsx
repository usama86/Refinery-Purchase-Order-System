import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierLockBanner } from "@/components/draft/supplier-lock-banner";
import type { PurchaseOrderDraft } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getDraftLineCount, getDraftTotal } from "@/lib/draft";

export function DraftSummaryCard({
  draft,
  ctaHref = "/draft/header",
  ctaLabel = "Continue to header",
  disabled = false
}: {
  draft: PurchaseOrderDraft;
  ctaHref?: string;
  ctaLabel?: string;
  disabled?: boolean;
}) {
  const total = getDraftTotal(draft);
  const lineCount = getDraftLineCount(draft);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Draft summary</CardTitle>
            <p className="text-sm text-muted-foreground">{lineCount} units selected</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SupplierLockBanner supplier={draft.supplier} />
        <div className="space-y-3 rounded-md border bg-muted/40 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Supplier</span>
            <span className="font-medium">{draft.supplier ?? "Not selected"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Line items</span>
            <span className="font-medium">{draft.lines.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated total</span>
            <span className="font-semibold">{formatCurrency(total)}</span>
          </div>
        </div>
        {draft.lines.length > 0 ? (
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {draft.lines.map((line) => (
              <div key={line.itemId} className="rounded-md border bg-card p-3">
                <p className="line-clamp-2 text-sm font-medium">
                  {line.itemSnapshot.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Qty {line.quantity} x {formatCurrency(line.itemSnapshot.priceUsd)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        <Button asChild className="w-full" disabled={disabled || draft.lines.length === 0}>
          <Link
            href={disabled || draft.lines.length === 0 ? "#" : ctaHref}
            aria-disabled={disabled || draft.lines.length === 0}
          >
            {ctaLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
