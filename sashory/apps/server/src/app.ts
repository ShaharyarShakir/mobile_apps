import { auth } from "@sashory/auth";
import { env } from "@sashory/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import me from "./routes/me";
import projects from "./routes/projects";
import financialAccounts from "./routes/financial-accounts";
import categories from "./routes/categories";
import { ApiError } from "./lib/api-error";
import { requestIdMiddleware, type RequestIdVariables } from "./middleware/request-id";

const app = new Hono<{ Variables: RequestIdVariables }>()
  .use("*", requestIdMiddleware)
  .use(
    env.NODE_ENV === "production"
      ? async (c, next) => {
          const start = Date.now();
          await next();
          const duration = Date.now() - start;
          console.log(
            `req=${c.get("requestId")} method=${c.req.method} path=${c.req.path} status=${c.res.status} duration=${duration}ms`,
          );
        }
      : logger(),
  )
  .use(
    "/*",
    cors({
      origin: env.CORS_ORIGIN,
      allowMethods: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
      ],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Cookie",
        "x-request-id",
      ],
      credentials: true,
    }),
  )
  .get("/health", (c) => {
    return c.json({
      status: "ok",
    });
  })
  .get("/api/version", (c) => {
    return c.json({
      name: "sashory-api",
      version: 1,
    });
  })
  .on(
    ["POST", "GET"],
    "/api/auth/*",
    (c) => auth.handler(c.req.raw),
  )
  .route("/api/me", me)
  .route("/api/projects", projects)
  .route("/api/accounts", financialAccounts)
  .route("/api/categories", categories)
  .onError((error, c) => {
    const requestId = c.get("requestId");

    if (error instanceof ApiError) {
      if (error.status >= 500) {
        console.error(`[Server Error req=${requestId}]`, error);
      }
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
            requestId,
          },
        },
        error.status,
      );
    }

    console.error(`[Internal Error req=${requestId}]`, error);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            env.NODE_ENV === "development"
              ? error.message
              : "Internal server error",
          requestId,
        },
      },
      500,
    );
  })
  .notFound((c) => {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Not Found",
          requestId: c.get("requestId"),
        },
      },
      404,
    );
  });

export type AppType = typeof app;
export default app;