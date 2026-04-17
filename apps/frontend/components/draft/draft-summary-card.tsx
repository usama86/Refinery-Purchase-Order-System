import Link from "next/link";
import { ClipboardList, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const canContinue = !disabled && draft.lines.length > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Draft summary</CardTitle>
            <CardDescription>{lineCount} units selected</CardDescription>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SupplierLockBanner supplier={draft.supplier} />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Line items</p>
            <p className="mt-1 text-xl font-semibold">{draft.lines.length}</p>
          </div>
          <div className="rounded-md border bg-muted/25 p-3">
            <p className="text-xs text-muted-foreground">Units</p>
            <p className="mt-1 text-xl font-semibold">{lineCount}</p>
          </div>
        </div>
        <div className="rounded-md border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Estimated total</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(total)}</p>
            </div>
            <PackageCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
        </div>
        {draft.lines.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Lines
              </p>
              <p className="text-xs text-muted-foreground">{draft.supplier}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              {draft.lines.map((line) => (
                <div
                  key={line.itemId}
                  className="flex items-start justify-between gap-3 rounded-md border bg-muted/20 p-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">
                      {line.itemSnapshot.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {line.quantity} x {formatCurrency(line.itemSnapshot.priceUsd)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatCurrency(line.quantity * line.itemSnapshot.priceUsd)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {canContinue ? (
          <Button asChild className="w-full">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            {ctaLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
