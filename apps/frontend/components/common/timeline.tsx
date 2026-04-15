import { CheckCircle2, CircleDot } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import type { StatusEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function Timeline({ events }: { events: StatusEvent[] }) {
  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li key={`${event.status}-${event.at}`} className="relative flex gap-4 pb-6">
            {!isLast ? (
              <span className="absolute left-[15px] top-8 h-full w-px bg-border" />
            ) : null}
            <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card">
              {isLast ? (
                <CircleDot className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 rounded-md border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={event.status} />
                <span className="text-sm text-muted-foreground">
                  {formatDate(event.at)}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">{event.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">Actor: {event.actor}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
