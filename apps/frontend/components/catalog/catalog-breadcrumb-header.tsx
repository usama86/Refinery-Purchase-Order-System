import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export function CatalogBreadcrumbHeader({
  info,
  total,
  loading
}: {
  info: string;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="mb-3 flex min-h-7 items-center justify-between gap-3 border-b pb-2">
      <nav
        aria-label="Catalog breadcrumb"
        className="flex min-w-0 items-center gap-1.5 text-sm"
      >
        <span className="shrink-0 text-muted-foreground">Catalog</span>
        <span className="shrink-0 text-muted-foreground/55" aria-hidden="true">
          /
        </span>
        <span className="truncate font-semibold text-foreground">
          Refinery equipment catalog
        </span>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="focus-ring inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                aria-label="About refinery equipment catalog"
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {info}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <div className="hidden shrink-0 items-center gap-2 text-xs text-muted-foreground sm:flex">
        <span>
          <span className="font-semibold text-foreground">{total}</span> results
        </span>
        <span className="text-muted-foreground/45" aria-hidden="true">
          /
        </span>
        <span aria-live="polite" aria-atomic="true">
          {loading ? "Refreshing catalog..." : "Catalog ready"}
        </span>
      </div>
    </div>
  );
}
