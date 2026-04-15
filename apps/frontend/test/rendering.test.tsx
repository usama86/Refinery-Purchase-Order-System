import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/common/empty-state";
import { StatusLegend } from "@/components/po/status-legend";

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
});
