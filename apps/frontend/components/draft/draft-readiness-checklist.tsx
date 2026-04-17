import { CheckCircle2, Circle } from "lucide-react";
import type { DraftHeaderFormValues } from "@/lib/validations";

const checks = [
  { key: "requestor", label: "Requestor provided" },
  { key: "costCenter", label: "Cost center confirmed" },
  { key: "neededBy", label: "Needed-by date selected" },
  { key: "paymentTerms", label: "Payment terms selected" }
] as const;

export function DraftReadinessChecklist({
  header,
  supplier,
  lineCount
}: {
  header: DraftHeaderFormValues;
  supplier?: string | null;
  lineCount: number;
}) {
  const items = [
    ...checks.map((check) => ({
      label: check.label,
      complete: Boolean(header[check.key])
    })),
    {
      label: supplier ? `Supplier locked to ${supplier}` : "Supplier locked",
      complete: Boolean(supplier)
    },
    {
      label: lineCount === 1 ? "1 line item ready" : `${lineCount} line items ready`,
      complete: lineCount > 0
    }
  ];

  return (
    <section
      aria-labelledby="draft-readiness-title"
      className="rounded-md border bg-muted/20 p-4"
    >
      <div>
        <h2 id="draft-readiness-title" className="text-sm font-semibold">
          Before review
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Confirm the request is ready for final submission.
        </p>
      </div>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.complete ? (
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : (
              <Circle
                className="h-4 w-4 shrink-0 text-muted-foreground/60"
                aria-hidden="true"
              />
            )}
            <span className={item.complete ? "text-foreground" : "text-muted-foreground"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
