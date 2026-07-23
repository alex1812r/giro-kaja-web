import { z } from "zod";

import { currencyOptions, type CurrencyCode } from "@/shared/currency";

const currencyCodes = currencyOptions.map((o) => o.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

export function createTransferFormSchema() {
  return z
    .object({
      fromCurrency: z.enum(currencyCodes),
      toCurrency: z.enum(currencyCodes),
      amount: z
        .string()
        .min(1, "validation.required")
        .refine((v) => {
          const n = parseFloat(v.replace(/,/g, "."));
          return !Number.isNaN(n) && n > 0;
        }, "validation.minAmount"),
    })
    .superRefine((data, ctx) => {
      if (data.fromCurrency === data.toCurrency) {
        ctx.addIssue({
          code: "custom",
          message: "cashRegister.transferSameCurrency",
          path: ["toCurrency"],
        });
      }
    });
}

export type TransferFormValues = {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  amount: string;
};
