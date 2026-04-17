import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Header" },
  { id: 2, label: "Review" },
  { id: 3, label: "Submit" }
] as const;

export function WorkflowStepper({
  currentStep,
  completedSteps = [],
  editableSteps = []
}: {
  currentStep: number;
  completedSteps?: number[];
  editableSteps?: Array<{ step: number; href: string }>;
}) {
  const editableStepMap = new Map(editableSteps.map((step) => [step.step, step.href]));

  return (
    <nav aria-label="Purchase order progress" className="mb-5">
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step) => {
          const complete = completedSteps.includes(step.id);
          const active = step.id === currentStep;
          const href = editableStepMap.get(step.id);
          const interactive = Boolean(href);
          const content = (
            <>
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                  active && "border-primary bg-primary text-primary-foreground",
                  complete && "border-emerald-700 bg-emerald-700 text-white",
                  !active && !complete && "border-border bg-background text-muted-foreground"
                )}
              >
                {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : step.id}
              </span>
              <span className="font-medium">{step.label}</span>
            </>
          );

          return (
            <li
              key={step.id}
              className={cn(
                "rounded-md border bg-card text-sm transition-colors",
                active && "border-primary bg-accent",
                complete && !active && "border-emerald-200 bg-emerald-50",
                interactive && "hover:border-primary/60 hover:bg-accent/70"
              )}
              aria-current={active ? "step" : undefined}
              aria-disabled={!interactive && !active ? true : undefined}
            >
              {href ? (
                <Link
                  href={href}
                  className="focus-ring flex items-center gap-3 rounded-md p-3"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-3">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
