import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export function PageHeader({
  eyebrow,
  title,
  description,
  info,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  info?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-0.5 flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {info ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="focus-ring inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`About ${title}`}
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {info}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
