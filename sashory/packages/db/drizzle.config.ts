import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  const envFile =
    process.env.NODE_ENV === "test"
      ? "../../apps/server/.env.test"
      : "../../apps/server/.env";

  dotenv.config({
    path: envFile,
  });
}

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
