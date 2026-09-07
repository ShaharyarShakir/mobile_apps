import { env } from "@sashory/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(env.DATABASE_URL, {
  schema,
});

export function createDb() {
  return db;
}

export * from "./schema";
export * from "./lib/id";

