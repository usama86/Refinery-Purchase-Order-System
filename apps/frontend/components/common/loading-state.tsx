import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="grid grid-cols-6 gap-4 border-b p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid grid-cols-6 gap-4 border-b p-4 last:border-b-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}
