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
              variant="ghost"
              size="sm"
              onClick={() => exportPurchaseOrder(order)}
              aria-label={`Export ${order.poNumber} for Excel`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Excel
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
  const summaryRows = [
    ["Purchase Order", order.poNumber],
    ["Status", order.status],
    ["Supplier", order.supplier],
    ["Requestor", order.header.requestor],
    ["Cost center", order.header.costCenter],
    ["Needed by", formatDate(order.header.neededBy)],
    ["Payment terms", order.header.paymentTerms],
    ["Total value", formatCurrency(order.totalUsd)]
  ];

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Calibri, Arial, sans-serif; color: #111827; }
      table { border-collapse: collapse; margin-bottom: 18px; table-layout: fixed; }
      th, td { border: 1px solid #d1d5db; padding: 8px 10px; vertical-align: top; }
      th { background: #e8f0ef; font-weight: 700; text-align: left; }
      .title { font-size: 18px; font-weight: 700; background: #0f5f56; color: #ffffff; }
      .section { font-size: 14px; font-weight: 700; background: #f3f4f6; }
      .label { width: 160px; font-weight: 700; background: #f9fafb; }
      .number { text-align: right; }
      .muted { color: #4b5563; }
    </style>
  </head>
  <body>
    <table>
      <colgroup>
        <col style="width: 180px" />
        <col style="width: 260px" />
      </colgroup>
      <tr><td class="title" colspan="2">${escapeHtml(order.poNumber)}</td></tr>
      <tr><td class="section" colspan="2">Purchase Order Summary</td></tr>
      ${summaryRows
        .map(
          ([label, value]) =>
            `<tr><td class="label">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
        )
        .join("")}
    </table>

    <table>
      <colgroup>
        <col style="width: 120px" />
        <col style="width: 320px" />
        <col style="width: 140px" />
        <col style="width: 90px" />
        <col style="width: 130px" />
        <col style="width: 130px" />
        <col style="width: 130px" />
      </colgroup>
      <tr><td class="section" colspan="7">Line items</td></tr>
      <tr>
        <th>Item ID</th>
        <th>Name</th>
        <th>Supplier</th>
        <th>Quantity</th>
        <th>Unit price</th>
        <th>Lead time</th>
        <th>Line total</th>
      </tr>
      ${order.lines
        .map((line) => {
          const unitPrice = Number(line.priceUsdSnapshot ?? line.itemSnapshot.priceUsd);
          const leadTime = line.leadTimeDaysSnapshot ?? line.itemSnapshot.leadTimeDays;

          return `<tr>
            <td>${escapeHtml(line.itemSnapshot.id)}</td>
            <td>${escapeHtml(line.itemSnapshot.name)}</td>
            <td>${escapeHtml(line.itemSnapshot.supplier)}</td>
            <td class="number">${line.quantity}</td>
            <td class="number">${escapeHtml(formatCurrency(unitPrice))}</td>
            <td class="number">${leadTime} days</td>
            <td class="number">${escapeHtml(formatCurrency(line.quantity * unitPrice))}</td>
          </tr>`;
        })
        .join("")}
    </table>

    <table>
      <colgroup>
        <col style="width: 130px" />
        <col style="width: 170px" />
        <col style="width: 150px" />
        <col style="width: 360px" />
      </colgroup>
      <tr><td class="section" colspan="4">Status history</td></tr>
      <tr>
        <th>Status</th>
        <th>At</th>
        <th>Actor</th>
        <th>Note</th>
      </tr>
      ${order.timeline
        .map(
          (event) => `<tr>
            <td>${escapeHtml(event.status)}</td>
            <td>${escapeHtml(formatDate(event.at))}</td>
            <td>${escapeHtml(event.actor)}</td>
            <td class="muted">${escapeHtml(event.note)}</td>
          </tr>`
        )
        .join("")}
    </table>
  </body>
</html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.poNumber}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
