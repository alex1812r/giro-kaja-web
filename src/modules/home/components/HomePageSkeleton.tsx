import { Skeleton } from "@/shared/components/Skeleton";

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton variant="circle" className="size-4" />
        <Skeleton variant="text" className="h-3 w-24" />
      </div>
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton variant="circle" className="size-9" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-3.5 w-28" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      </div>
      <Skeleton variant="text" className="h-3.5 w-16" />
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton variant="text" className="h-4 w-40" />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <Skeleton className="h-5 w-40" />
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
        </section>

        <section className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Skeleton variant="circle" className="size-6" />
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-3.5 w-28" />
                    <Skeleton variant="text" className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton variant="text" className="h-3.5 w-14" />
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <Skeleton variant="text" className="mx-auto h-3 w-20" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
