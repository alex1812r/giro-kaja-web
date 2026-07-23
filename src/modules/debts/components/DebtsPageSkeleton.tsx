import { Skeleton } from "@/shared/components/Skeleton";

function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Skeleton variant="text" className="mb-2 h-3 w-28" />
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

function DebtRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="size-10" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-3.5 w-28" />
          <Skeleton variant="text" className="h-3 w-40" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 md:justify-end">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton variant="text" className="h-3.5 w-20" />
      </div>
    </div>
  );
}

export function DebtsPageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton variant="text" className="h-4 w-52" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-36" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-5 w-48" />
        </div>
        <DebtRowSkeleton />
        <DebtRowSkeleton />
        <DebtRowSkeleton />
      </section>
    </div>
  );
}
