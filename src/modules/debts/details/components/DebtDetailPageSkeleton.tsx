import { Skeleton } from "@/shared/components/Skeleton";

export function DebtDetailPageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-4 w-32" />
      <section className="rounded-xl border border-border bg-surface p-5">
        <Skeleton className="mb-3 h-8 w-48" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-12 rounded" />
        </div>
      </section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-4">
            <Skeleton variant="text" className="mb-2 h-3 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-border bg-surface p-4">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mb-2 h-10 w-full" />
        <Skeleton className="mb-2 h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </section>
    </div>
  );
}
