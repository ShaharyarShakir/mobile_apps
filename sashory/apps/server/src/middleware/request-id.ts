import { createMiddleware } from "hono/factory";
import { randomUUID } from "node:crypto";

export type RequestIdVariables = {
  requestId: string;
};

export const requestIdMiddleware = createMiddleware<{
  Variables: RequestIdVariables;
}>(async (c, next) => {
  const requestId =
    c.req.header("x-request-id") ?? randomUUID();

  c.header("x-request-id", requestId);
  c.set("requestId", requestId);

  await next();
});

