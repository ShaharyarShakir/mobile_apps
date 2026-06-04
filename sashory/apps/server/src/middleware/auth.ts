import { auth } from "@sashory/auth";
import { createMiddleware } from "hono/factory";

type AppEnv = {
    Variables: {
        userId: string;
        userEmail: string;
    }
}

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.header(),
    })
    if (!session?.user) return c.json({ error: "Unauthorized" }, 401)


    c.set("userId", session.user.id)
    c.set("userEmail", session.user.email)
    await next()

})