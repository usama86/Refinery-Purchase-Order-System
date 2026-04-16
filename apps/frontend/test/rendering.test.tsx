import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/common/empty-state";
import { PoLifecycleActions } from "@/components/po/po-lifecycle-actions";
import { StatusLegend } from "@/components/po/status-legend";
import type { PurchaseOrder } from "@/lib/types";

describe("workflow rendering states", () => {
  it("renders no-results empty state copy", () => {
    render(
      <EmptyState
        title="No matching items"
        description="Adjust search criteria."
      />
    );

    expect(screen.getByRole("heading", { name: "No matching items" })).toBeInTheDocument();
    expect(screen.getByText("Adjust search criteria.")).toBeInTheDocument();
  });

  it("represents all purchase order statuses", () => {
    render(<StatusLegend />);

    expect(screen.getByText("Submitted")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Fulfilled")).toBeInTheDocument();
  });

  it("shows lifecycle actions only for actionable statuses", () => {
    const submitted = purchaseOrder("Submitted");
    const { rerender } = renderWithQuery(<PoLifecycleActions order={submitted} />);

    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();

    rerender(withQuery(<PoLifecycleActions order={purchaseOrder("Approved")} />));
    expect(screen.getByRole("button", { name: /fulfill/i })).toBeInTheDocument();

    rerender(withQuery(<PoLifecycleActions order={purchaseOrder("Fulfilled")} />));
    expect(screen.queryByRole("button", { name: /fulfill/i })).not.toBeInTheDocument();
  });
});

function renderWithQuery(ui: React.ReactElement) {
  return render(withQuery(ui));
}

function withQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>;
}

function purchaseOrder(status: PurchaseOrder["status"]): PurchaseOrder {
  return {
    id: "po-id",
    poNumber: "PO-2026-000001",
    supplier: "DeWalt",
    status,
    header: {
      requestor: "Alex Morgan",
      costCenter: "CC-1234",
      neededBy: "2026-05-01",
      paymentTerms: "Net 30"
    },
    lines: [],
    totalUsd: 0,
    submittedAt: "2026-04-16T00:00:00.000Z",
    timeline: []
  };
}
