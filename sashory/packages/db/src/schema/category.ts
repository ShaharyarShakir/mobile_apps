import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const categoryTypeEnum = ["INCOME", "EXPENSE"] as const;
export type CategoryType = (typeof categoryTypeEnum)[number];

export const categoryType = pgEnum("category_type", ["INCOME", "EXPENSE"]);

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    type: categoryType("type").notNull(),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("category_user_id_idx").on(table.userId),
    check(
      "category_name_length_check",
      sql`char_length(trim(${table.name})) > 0`,
    ),
  ],
);

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

