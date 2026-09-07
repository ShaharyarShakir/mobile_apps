import { ApiError } from "./api-error";

export async function readJson<T>(
  request: Request,
): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Request body must contain valid JSON",
    );
  }
}

