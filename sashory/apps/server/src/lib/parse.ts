import { z } from "zod";
import { ApiError } from "./api-error";

export function parseOrThrow<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.output<T> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid request data");
  }

  return result.data;
}

