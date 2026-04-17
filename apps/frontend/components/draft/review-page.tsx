"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { DraftSummaryCard } from "@/components/draft/draft-summary-card";
import { LineItemsEditor } from "@/components/draft/line-items-editor";
import { SupplierLockBanner } from "@/components/draft/supplier-lock-banner";
import { WorkflowStepper } from "@/components/draft/workflow-stepper";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitDraft } from "@/lib/procurement";
import { useDraft } from "@/lib/use-draft";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDraftTotal } from "@/lib/draft";

export function ReviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, hydrated, setQuantity } = useDraft();
  const submitMutation = useMutation({
    mutationFn: () => submitDraft(draft),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      router.push(`/purchase-orders/${order.poNumber}`);
    }
  });

  if (hydrated && draft.lines.length === 0) {
    return (
      <EmptyState
        title="Review needs line items"
        description="The draft is empty. Add catalog items before submitting a purchase order."
        action={
          <Button asChild>
            <Link href="/catalog">Browse catalog</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Review"
        title="Review purchase order"
        description="Validate supplier, commercial metadata, quantities, and snapshotted pricing before submission."
      />
      <WorkflowStepper currentStep={2} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <SupplierLockBanner supplier={draft.supplier} />
          <Card>
            <CardHeader>
              <CardTitle>Purchase order metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Requestor</dt>
                  <dd className="mt-1 font-semibold">{draft.header.requestor}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cost center</dt>
                  <dd className="mt-1 font-semibold">{draft.header.costCenter}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Needed by</dt>
                  <dd className="mt-1 font-semibold">
                    {draft.header.neededBy ? formatDate(draft.header.neededBy) : "Unset"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payment terms</dt>
                  <dd className="mt-1 font-semibold">{draft.header.paymentTerms}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Line items</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/draft/header">Edit header</Link>
              </Button>
            </div>
            <LineItemsEditor
              draft={draft}
              onQuantityChange={setQuantity}
              onRemoveLine={(itemId) => setQuantity(itemId, 0)}
            />
          </div>
          <Card>
            <CardContent className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submission total</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(getDraftTotal(draft))}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" asChild disabled={submitMutation.isPending}>
                  <Link href="/catalog">Edit items</Link>
                </Button>
                <Button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || draft.lines.length === 0}
                >
                  {submitMutation.isPending
                    ? "Generating Purchase Order number..."
                    : "Submit Purchase Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
          {submitMutation.isError ? (
            <ErrorState
              title="Submission blocked"
              message={
                submitMutation.error instanceof Error
                  ? submitMutation.error.message
                  : "The purchase order could not be submitted."
              }
            />
          ) : null}
          <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Pricing and lead time are snapshotted when the purchase order is submitted.
          </div>
        </section>
        <aside>
          <DraftSummaryCard
            draft={draft}
            ctaHref="/draft/review"
            ctaLabel="Ready for submission"
            disabled
          />
        </aside>
      </div>
    </div>
  );
}
