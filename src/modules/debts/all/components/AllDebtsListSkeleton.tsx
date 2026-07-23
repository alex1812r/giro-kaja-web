import { Skeleton } from "@/shared/components/Skeleton";

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

export function AllDebtsListSkeleton() {
  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
      aria-busy="true"
      aria-live="polite"
    >
      <DebtRowSkeleton />
      <DebtRowSkeleton />
      <DebtRowSkeleton />
      <DebtRowSkeleton />
    </section>
  );
}
