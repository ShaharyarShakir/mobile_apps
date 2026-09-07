import { z } from "zod";

export const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(100, "Account name must be 100 characters or less"),
  type: z.enum(["ASSET", "LIABILITY"]),
  currency: z
    .string()
    .trim()
    .length(3, "Currency code must be 3 characters"),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

