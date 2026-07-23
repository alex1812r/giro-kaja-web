import { Button } from "@/shared/components/Button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Algo salió mal",
  description,
  retryLabel = "Reintentar",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="space-y-1">
        <p className="font-headline text-base font-semibold text-text-main">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
