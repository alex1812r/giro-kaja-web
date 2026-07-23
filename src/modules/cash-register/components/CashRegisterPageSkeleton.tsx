import { Skeleton } from "@/shared/components/Skeleton";

function MovementRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton variant="circle" className="size-9" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-3.5 w-36" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      </div>
      <Skeleton variant="text" className="h-3.5 w-16" />
    </div>
  );
}

export function CashRegisterPageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton variant="text" className="h-4 w-56" />
      </header>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col md:flex-row md:items-stretch">
            <div className="space-y-2">
              <Skeleton variant="text" className="h-3 w-28" />
              <Skeleton className="h-8 w-44" />
            </div>
            <div className="mt-3 flex flex-col justify-center gap-2 border-t border-border pt-3 md:mt-0 md:ml-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
              <Skeleton variant="text" className="h-3.5 w-36" />
              <Skeleton variant="text" className="h-3.5 w-32" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-44" />
          <Skeleton variant="text" className="h-3 w-28" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <MovementRowSkeleton />
          <MovementRowSkeleton />
          <MovementRowSkeleton />
          <MovementRowSkeleton />
        </div>
      </section>
    </div>
  );
}
