import { LockKeyhole } from "lucide-react";

export function SupplierLockBanner({ supplier }: { supplier: string | null }) {
  if (!supplier) {
    return (
      <div className="rounded-md border border-dashed bg-card p-3 text-sm text-muted-foreground">
        Add the first item to lock this draft to a supplier.
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border bg-accent p-3 text-sm text-accent-foreground">
      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">Supplier locked to {supplier}</p>
        <p className="mt-1 text-accent-foreground/80">
          Purchase orders can include items from one supplier only.
        </p>
      </div>
    </div>
  );
}
