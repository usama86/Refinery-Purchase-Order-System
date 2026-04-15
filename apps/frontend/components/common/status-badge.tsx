import { Badge } from "@/components/ui/badge";
import type { PoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<PoStatus, string> = {
  Submitted: "bg-accent text-accent-foreground",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-800",
  Fulfilled: "bg-zinc-900 text-white"
};

export function StatusBadge({ status }: { status: PoStatus }) {
  return <Badge className={cn(statusClasses[status])}>{status}</Badge>;
}
