import { Skeleton } from "@/shared/components/Skeleton";

export function AdminOrganizationDetailSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 p-6 md:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton variant="text" className="h-4 w-40" />

      <header className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton variant="text" className="h-4 w-64" />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-12" />
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-3 gap-3 px-4 py-3.5"
            >
              <Skeleton variant="text" className="h-4 w-28" />
              <Skeleton variant="text" className="h-4 w-36" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
