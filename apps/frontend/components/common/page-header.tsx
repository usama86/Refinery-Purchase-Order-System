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
  const tooltipText = info ?? description;

  return (
    <div className="mb-3 flex min-h-7 flex-col gap-2 border-b pb-2 md:flex-row md:items-center md:justify-between">
      <nav
        aria-label={`${eyebrow ?? title} breadcrumb`}
        className="flex min-w-0 items-center gap-2 text-sm"
      >
        {eyebrow ? (
          <>
            <span className="shrink-0 text-muted-foreground">{eyebrow}</span>
            <span className="shrink-0 text-muted-foreground/60" aria-hidden="true">
              /
            </span>
          </>
        ) : null}
        <span className="truncate font-semibold tracking-tight text-foreground">
          {title}
        </span>
        {tooltipText ? (
          <span className="shrink-0">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="focus-ring inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`About ${title}`}
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="max-w-xs">
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        ) : null}
      </nav>
      {action ? <div className="shrink-0 md:ml-auto">{action}</div> : null}
    </div>
  );
}
