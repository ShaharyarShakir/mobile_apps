import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/api-error";

export const requireJson = createMiddleware(async (c, next) => {
  if (c.req.method === "GET" || c.req.method === "DELETE") {
    await next();
    return;
  }

  const contentType = c.req.header("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json",
    );
  }

  await next();
});

