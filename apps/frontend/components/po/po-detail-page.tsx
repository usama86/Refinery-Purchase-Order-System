"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Timeline } from "@/components/common/timeline";
import { LineItemsEditor } from "@/components/draft/line-items-editor";
import { PoLifecycleActions } from "@/components/po/po-lifecycle-actions";
import { StatusLegend } from "@/components/po/status-legend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPurchaseOrder } from "@/lib/procurement";
import type { PurchaseOrder } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PoDetailPage({ poNumber }: { poNumber: string }) {
  const orderQuery = useQuery({
    queryKey: ["purchase-order", poNumber],
    queryFn: () => getPurchaseOrder(poNumber)
  });

  if (orderQuery.isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (orderQuery.isError) {
    return (
      <ErrorState
        title="Purchase order unavailable"
        message="The procurement service could not load this purchase order."
      />
    );
  }

  if (!orderQuery.data) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="The requested purchase order is not available."
        action={
          <Button asChild>
            <Link href="/purchase-orders">Back to purchase orders</Link>
          </Button>
        }
      />
    );
  }

  const order = orderQuery.data;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-3 -ml-3">
              <Link href="/purchase-orders">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Purchase orders
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {order.poNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.supplier} · Submitted {formatDate(order.submittedAt)}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => exportPurchaseOrder(order)}
              aria-label={`Export ${order.poNumber} as CSV`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Supplier" value={order.supplier} />
          <Metric label="Cost center" value={order.header.costCenter} />
          <Metric label="Needed by" value={formatDate(order.header.neededBy)} />
          <Metric label="Total value" value={formatCurrency(order.totalUsd)} />
        </div>
      </div>

      <StatusLegend />
      <PoLifecycleActions order={order} />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Commercial metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm md:grid-cols-4">
                <Metadata label="Requestor" value={order.header.requestor} />
                <Metadata label="Payment terms" value={order.header.paymentTerms} />
                <Metadata label="Line items" value={String(order.lines.length)} />
                <Metadata label="Current status" value={order.status} />
              </dl>
            </CardContent>
          </Card>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Snapshotted line items</h2>
            <LineItemsEditor
              draft={{
                supplier: order.supplier,
                lines: order.lines,
                header: order.header,
                updatedAt: order.submittedAt
              }}
              readonly
            />
          </div>
        </section>
        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Status history</CardTitle>
              <p className="text-sm text-muted-foreground">
                Every status change is represented as an audit event.
              </p>
            </CardHeader>
            <CardContent>
              <Timeline events={order.timeline} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

function exportPurchaseOrder(order: PurchaseOrder) {
  const rows = [
    ["Purchase order", order.poNumber],
    ["Status", order.status],
    ["Supplier", order.supplier],
    ["Requestor", order.header.requestor],
    ["Cost center", order.header.costCenter],
    ["Needed by", order.header.neededBy],
    ["Payment terms", order.header.paymentTerms],
    ["Total USD", String(order.totalUsd)],
    [],
    ["Line items"],
    ["Item ID", "Name", "Supplier", "Quantity", "Unit price USD", "Lead time days", "Line total USD"],
    ...order.lines.map((line) => [
      line.itemSnapshot.id,
      line.itemSnapshot.name,
      line.itemSnapshot.supplier,
      String(line.quantity),
      String(line.priceUsdSnapshot ?? line.itemSnapshot.priceUsd),
      String(line.leadTimeDaysSnapshot ?? line.itemSnapshot.leadTimeDays),
      String(line.quantity * Number(line.priceUsdSnapshot ?? line.itemSnapshot.priceUsd))
    ]),
    [],
    ["Status history"],
    ["Status", "At", "Actor", "Note"],
    ...order.timeline.map((event) => [
      event.status,
      event.at,
      event.actor,
      event.note
    ])
  ];

  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.poNumber}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
