import { z } from "zod";

export const depositFormSchema = z.object({
  amount: z
    .string()
    .min(1, "validation.required")
    .refine(
      (v) => parseFloat(v.replace(/,/g, ".")) > 0,
      "validation.minAmount",
    ),
  note: z.string().max(500).optional(),
});

export type DepositFormValues = z.infer<typeof depositFormSchema>;
