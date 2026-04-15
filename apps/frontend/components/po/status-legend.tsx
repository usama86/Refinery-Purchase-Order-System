import { StatusBadge } from "@/components/common/status-badge";
import type { PoStatus } from "@/lib/types";

const statuses: PoStatus[] = ["Submitted", "Approved", "Rejected", "Fulfilled"];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Lifecycle:</span>
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
}
