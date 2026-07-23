import { z } from "zod";

export function createWithdrawFormSchema(currentBalance: number) {
  return z
    .object({
      amount: z
        .string()
        .min(1, "validation.required")
        .refine(
          (v) => parseFloat(v.replace(/,/g, ".")) > 0,
          "validation.minAmount",
        ),
      reason: z.string().trim().min(1, "validation.reasonRequired"),
    })
    .refine(
      (data) => {
        const amount = parseFloat(data.amount.replace(/,/g, "."));
        return !Number.isNaN(amount) && amount <= currentBalance;
      },
      { message: "cashRegister.amountExceedsBalance", path: ["amount"] },
    );
}

export type WithdrawFormValues = {
  amount: string;
  reason: string;
};
