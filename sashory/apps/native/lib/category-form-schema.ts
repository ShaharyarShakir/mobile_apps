import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type: z.enum(["EXPENSE", "INCOME"]),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

