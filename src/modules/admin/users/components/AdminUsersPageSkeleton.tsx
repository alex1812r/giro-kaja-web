import { Skeleton } from "@/shared/components/Skeleton";

export function AdminUsersPageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton variant="text" className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="grid grid-cols-6 gap-3 border-b border-border px-4 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-3 w-16" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-6 gap-3 px-4 py-3.5"
            >
              {Array.from({ length: 6 }).map((_, col) => (
                <Skeleton
                  key={col}
                  variant="text"
                  className={col === 0 ? "h-4 w-28" : "h-4 w-20"}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
