import { Skeleton } from "@/shared/components/Skeleton";

export function LoanDetailPageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton variant="text" className="h-4 w-36" />

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <div className="flex gap-2">
            <Skeleton variant="text" className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-12 rounded" />
          </div>
        </div>
        <Skeleton className="h-9 w-36" />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-border bg-surface p-4"
          >
            <Skeleton variant="text" className="h-3 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-5 w-40" />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
          >
            <Skeleton variant="text" className="h-3.5 w-24" />
            <Skeleton variant="text" className="h-3.5 w-16" />
            <Skeleton variant="text" className="h-3.5 w-16" />
            <Skeleton variant="text" className="h-3.5 w-16" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
        ))}
      </section>
    </div>
  );
}
