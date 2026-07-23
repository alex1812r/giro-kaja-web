export function MyOrganizationsPageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 p-6 md:p-8">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-surface-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-border bg-surface-muted/60"
          />
        ))}
      </div>
    </div>
  );
}
