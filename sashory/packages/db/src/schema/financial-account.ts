import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";

export const financialAccountTypeEnum = ["ASSET", "LIABILITY"] as const;
export type FinancialAccountType = (typeof financialAccountTypeEnum)[number];

export const financialAccount = pgTable(
  "financial_account",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    type: text("type", {
      enum: financialAccountTypeEnum,
    }).notNull(),

    currency: text("currency").default("PKR").notNull(),

    isActive: boolean("is_active").default(true).notNull(),

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
    index("financial_account_user_id_idx").on(table.userId),
    check(
      "financial_account_name_length_check",
      sql`char_length(trim(${table.name})) > 0`,
    ),
  ],
);

export type FinancialAccount = typeof financialAccount.$inferSelect;
export type NewFinancialAccount = typeof financialAccount.$inferInsert;

