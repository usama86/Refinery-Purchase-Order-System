import { Skeleton } from "@/components/ui/skeleton";

export function DraftWorkflowSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <span className="sr-only">Loading draft</span>
      <div className="space-y-3">
        <Skeleton className="h-5 w-64" />
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-md" />
          ))}
        </div>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-24 w-full rounded-md" />
        </div>
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}
