import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

const me = new Hono()
  .use("*", authMiddleware)
  .get("/", (c) => {
    const user = c.get("user");
    const session = c.get("session");

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },

      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  });

export default me;

