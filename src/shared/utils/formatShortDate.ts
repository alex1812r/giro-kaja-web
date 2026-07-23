export function formatShortDate(value: string, locale: string): string {
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
