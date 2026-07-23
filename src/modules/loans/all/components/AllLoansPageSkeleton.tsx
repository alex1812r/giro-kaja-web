import { Skeleton } from "@/shared/components/Skeleton";

import { AllLoansListSkeleton } from "./AllLoansListSkeleton";

export function AllLoansPageSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <Skeleton variant="text" className="h-4 w-40" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </section>

      <AllLoansListSkeleton />
    </div>
  );
}
