import { z } from "zod";

export const draftHeaderSchema = z.object({
  requestor: z.string().min(2, "Requestor is required."),
  costCenter: z
    .string()
    .regex(/^CC-\d{4}$/, "Use the cost center format CC-1234."),
  neededBy: z.string().min(1, "Needed-by date is required."),
  paymentTerms: z.string().min(3, "Payment terms are required.")
});

export type DraftHeaderFormValues = z.infer<typeof draftHeaderSchema>;
