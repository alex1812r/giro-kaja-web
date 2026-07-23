type ModulePlaceholderProps = {
  title: string;
  description?: string;
};

/** Pantalla vacía por módulo mientras se implementa el contenido. */
export function ModulePlaceholder({
  title,
  description = "Módulo en construcción.",
}: ModulePlaceholderProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="font-headline text-lg font-semibold text-text-main">{title}</p>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
    </div>
  );
}
