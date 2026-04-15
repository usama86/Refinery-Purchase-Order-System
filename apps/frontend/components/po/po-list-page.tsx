"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { StatusLegend } from "@/components/po/status-legend";
import { Button } from "@/components/ui/button";
import { listPurchaseOrders } from "@/lib/procurement";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PoListPage() {
  const ordersQuery = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: listPurchaseOrders
  });

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Purchase orders"
        description="Track submitted refinery purchase orders, supplier commitments, totals, and lifecycle status."
        action={<StatusLegend />}
      />
      {ordersQuery.isLoading ? <TableSkeleton rows={5} /> : null}
      {ordersQuery.isError ? (
        <ErrorState
          title="Purchase orders unavailable"
          message="The mock procurement API could not return submitted orders."
        />
      ) : null}
      {ordersQuery.isSuccess && ordersQuery.data.length === 0 ? (
        <EmptyState
          title="No purchase orders submitted"
          description="Submitted purchase orders will appear here with supplier, status, and value context."
          action={
            <Button asChild>
              <Link href="/catalog">Build a draft</Link>
            </Button>
          }
        />
      ) : null}
      {ordersQuery.isSuccess && ordersQuery.data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">PO number</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Requestor</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.data.map((order) => (
                <tr key={order.poNumber} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-4 font-semibold">{order.poNumber}</td>
                  <td className="px-4 py-4">{order.supplier}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4">{formatDate(order.submittedAt)}</td>
                  <td className="px-4 py-4">{order.header.requestor}</td>
                  <td className="px-4 py-4 text-right font-semibold">
                    {formatCurrency(order.totalUsd)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/purchase-orders/${order.poNumber}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View details
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
