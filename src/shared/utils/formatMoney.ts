const ISO_CURRENCIES = new Set([
  "USD",
  "EUR",
  "VES",
  "GBP",
  "MXN",
  "COP",
  "PEN",
  "ARS",
  "CLP",
  "BRL",
  "CAD",
  "JPY",
  "CHF",
]);

export function formatMoney(amount: number, currency = "USD"): string {
  if (ISO_CURRENCIES.has(currency)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${currency}`;
}
