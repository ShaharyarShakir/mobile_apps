import { auth } from "@sashory/auth";
import { createMiddleware } from "hono/factory";

export type AuthVariables = {
  user: NonNullable<
    Awaited<ReturnType<typeof auth.api.getSession>>
  >["user"];
  session: NonNullable<
    Awaited<ReturnType<typeof auth.api.getSession>>
  >["session"];
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      401,
    );
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
});