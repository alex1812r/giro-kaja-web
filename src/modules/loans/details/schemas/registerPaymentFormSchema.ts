import { z } from "zod";

export function createRegisterPaymentFormSchema(expectedInterest: number) {
  return z.object({
    paymentDate: z.string().min(1, "validation.required"),
    amountPaid: z
      .string()
      .min(1, "validation.required")
      .refine((v) => {
        const n = parseFloat(v.replace(/,/g, "."));
        return !Number.isNaN(n) && n >= expectedInterest;
      }, "validation.amountMinInterest"),
    description: z.string().max(500, { message: "validation.stringMax500" }),
  });
}

export type RegisterPaymentFormValues = {
  paymentDate: string;
  amountPaid: string;
  description: string;
};
