type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = "Cargando…",
  description,
}: LoadingStateProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-background px-4 text-center">
      <p className="font-headline text-base font-semibold text-text-main">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      ) : null}
    </div>
  );
}
