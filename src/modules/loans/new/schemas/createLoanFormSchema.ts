import { z } from "zod";

export const createLoanFormSchema = z
  .object({
    clientId: z.string().min(1, "validation.required"),
    clientName: z.string().min(1, "validation.required"),
    amount: z
      .string()
      .min(1, "validation.required")
      .refine(
        (v) => parseFloat(v.replace(/,/g, ".")) > 0,
        "validation.minAmount",
      ),
    interestRate: z
      .string()
      .min(1, "validation.required")
      .refine((v) => {
        const n = parseFloat(v.replace(/,/g, "."));
        return !Number.isNaN(n) && n >= 0 && n <= 100;
      }, "validation.minInterest"),
    currency: z.enum(["USD", "EUR", "VES", "USDT"], {
      message: "validation.required",
    }),
    issueDate: z.string().min(1, "validation.required"),
    nextPaymentDate: z.string().min(1, "validation.required"),
    description: z.string().max(500, { message: "validation.stringMax500" }),
  })
  .refine(
    (data) =>
      !data.nextPaymentDate ||
      !data.issueDate ||
      data.nextPaymentDate >= data.issueDate,
    { message: "validation.dateRangeInvalid", path: ["nextPaymentDate"] },
  );

export type CreateLoanFormValues = z.infer<typeof createLoanFormSchema>;
