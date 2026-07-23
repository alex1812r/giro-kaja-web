import { z } from "zod";

export const createClientFormSchema = z.object({
  firstName: z.string().min(1, "validation.required"),
  lastName: z.string().optional(),
  phone: z.string().min(1, "validation.required"),
});

export type CreateClientFormValues = z.infer<typeof createClientFormSchema>;
