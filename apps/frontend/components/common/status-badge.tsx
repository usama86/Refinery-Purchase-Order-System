import { Badge } from "@/components/ui/badge";
import type { PoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<PoStatus, string> = {
  Submitted: "border-primary/20 bg-accent text-accent-foreground",
  Approved: "bg-success/12 text-success",
  Rejected: "bg-destructive/12 text-destructive",
  Fulfilled: "bg-foreground text-background"
};

export function StatusBadge({ status }: { status: PoStatus }) {
  return (
    <Badge variant="outline" className={cn(statusClasses[status])}>
      {status}
    </Badge>
  );
}
