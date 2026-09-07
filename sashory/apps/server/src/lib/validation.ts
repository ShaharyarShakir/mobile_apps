import { z } from "zod";

export const projectIdSchema = z.object({
  id: z.string().uuid(),
});

export const projectListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const financialAccountTypeSchema = z.enum(["ASSET", "LIABILITY"]);
export type FinancialAccountTypeInput = z.infer<typeof financialAccountTypeSchema>;

export const financialAccountIdSchema = z.object({
  id: z.string().uuid(),
});

export const createFinancialAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Account name is required")
    .max(100, "Account name must be 100 characters or less"),
  type: financialAccountTypeSchema,
  currency: z
    .string()
    .trim()
    .length(3, "Currency code must be 3 characters")
    .default("PKR")
    .transform((v) => v.toUpperCase()),
});

export const updateFinancialAccountSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Account name is required")
      .max(100, "Account name must be 100 characters or less")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.isActive !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const financialAccountListQuerySchema = z.object({
  type: financialAccountTypeSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const categoryTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type CategoryTypeInput = z.infer<typeof categoryTypeSchema>;

export const categoryIdSchema = z.object({
  id: z.string().uuid(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  type: categoryTypeSchema,
});

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Category name is required")
      .max(100, "Category name must be 100 characters or less")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.isActive !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const categoryListQuerySchema = z.object({
  type: categoryTypeSchema.optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

