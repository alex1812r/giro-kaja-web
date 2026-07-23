export function OrganizationDetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <div className="h-4 w-40 animate-pulse rounded-md bg-surface-muted" />
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-surface-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-surface-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-surface-muted" />
      </div>
      <div className="h-56 animate-pulse rounded-xl border border-border bg-surface-muted/40" />
    </div>
  );
}
