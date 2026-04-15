import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Header", "Review", "Submit"];

export function WorkflowStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Purchase order progress" className="mb-5">
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const position = index + 1;
          const complete = position < currentStep;
          const active = position === currentStep;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-md border bg-card p-3 text-sm",
                active && "border-primary bg-accent",
                complete && "border-emerald-200 bg-emerald-50"
              )}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                  active && "border-primary bg-primary text-primary-foreground",
                  complete && "border-emerald-700 bg-emerald-700 text-white"
                )}
              >
                {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : position}
              </span>
              <span className="font-medium">{step}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
