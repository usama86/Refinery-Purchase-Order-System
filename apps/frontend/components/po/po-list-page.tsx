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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
          message="The procurement service could not return submitted orders."
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
          <Table className="min-w-[920px]">
            <TableHeader className="bg-muted/65">
              <TableRow className="hover:bg-muted/65">
                <TableHead>PO number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersQuery.data.map((order) => (
                <TableRow key={order.poNumber}>
                  <TableCell className="font-semibold">{order.poNumber}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatDate(order.submittedAt)}</TableCell>
                  <TableCell>{order.header.requestor}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(order.totalUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/purchase-orders/${order.poNumber}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
