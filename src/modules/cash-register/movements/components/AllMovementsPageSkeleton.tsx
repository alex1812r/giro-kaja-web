export function AllMovementsPageSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-6 p-6 md:p-8">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-surface-muted" />
        <div className="h-7 w-56 rounded bg-surface-muted" />
        <div className="h-4 w-72 rounded bg-surface-muted" />
      </div>
      <div className="h-48 rounded-xl border border-border bg-surface" />
      <div className="h-64 rounded-xl border border-border bg-surface" />
    </div>
  );
}
