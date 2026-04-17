import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PurchaseOrderDraft } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const PREVIEW_LIMIT = 3;

export function DraftItemsPreview({ draft }: { draft: PurchaseOrderDraft }) {
  const visibleLines = draft.lines.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(draft.lines.length - visibleLines.length, 0);

  return (
    <section
      aria-labelledby="draft-items-preview-title"
      className="rounded-md border bg-background p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="draft-items-preview-title" className="text-sm font-semibold">
            Draft items
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A quick check before opening the review step.
          </p>
        </div>
        <Link
          href="/catalog"
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium text-primary hover:underline"
        >
          Edit items
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {visibleLines.map((line) => (
          <div
            key={line.itemId}
            className="flex items-start justify-between gap-3 border-t pt-2 first:border-t-0 first:pt-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{line.itemSnapshot.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Qty {line.quantity} x {formatCurrency(line.itemSnapshot.priceUsd)}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold">
              {formatCurrency(line.quantity * line.itemSnapshot.priceUsd)}
            </span>
          </div>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          +{hiddenCount} more {hiddenCount === 1 ? "item" : "items"} in the draft summary.
        </p>
      ) : null}
    </section>
  );
}
