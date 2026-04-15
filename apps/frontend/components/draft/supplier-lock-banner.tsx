import { LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SupplierLockBanner({ supplier }: { supplier: string | null }) {
  if (!supplier) {
    return (
      <Alert className="border-dashed bg-muted/25">
        <AlertTitle>No supplier lock</AlertTitle>
        <AlertDescription>
          Add the first item to lock this draft to a supplier.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="accent" className="flex items-start gap-3">
      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <AlertTitle>Locked to {supplier}</AlertTitle>
        <AlertDescription>
          Purchase orders can include items from one supplier only.
        </AlertDescription>
      </div>
    </Alert>
  );
}
