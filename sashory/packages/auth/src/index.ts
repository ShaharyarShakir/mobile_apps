import { expo } from "@better-auth/expo";
import { db } from "@sashory/db";
import * as schema from "@sashory/db/schema/auth";
import { env } from "@sashory/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const developmentOrigins =
  env.NODE_ENV === "development"
    ? [
        "exp://**",
        "http://localhost:*",
        "http://127.0.0.1:*",
        "http://10.0.2.2:*",
        "http://192.168.*.*:*",
      ]
    : [];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    env.CORS_ORIGIN,
    // Native app schemes
    "sashory://",
    "sashory.expo.direct://",
    ...developmentOrigins,
  ],
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  plugins: [expo()],
});

export type Auth = typeof auth;

