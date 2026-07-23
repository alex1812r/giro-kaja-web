export type CurrencyCode = "USD" | "EUR" | "VES" | "USDT";

export type CurrencyOption = {
  code: CurrencyCode;
  /** Texto corto del chip del header (ej. BS). */
  shortLabel: string;
  /** i18n key under `currency.*` */
  labelKey: string;
};

export const currencyOptions: CurrencyOption[] = [
  { code: "USD", shortLabel: "USD", labelKey: "currency.usd" },
  { code: "EUR", shortLabel: "EUR", labelKey: "currency.eur" },
  { code: "VES", shortLabel: "BS", labelKey: "currency.ves" },
  { code: "USDT", shortLabel: "USDT", labelKey: "currency.usdt" },
];

export const currencyStorageKey = "giro-kaja:currency";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyOptions.some((option) => option.code === value);
}

export function getCurrencyOption(code: CurrencyCode): CurrencyOption {
  return (
    currencyOptions.find((option) => option.code === code) ?? currencyOptions[0]
  );
}
