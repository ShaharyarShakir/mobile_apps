import { relations } from "drizzle-orm/relations";
import { account, session, user } from "./auth";
import { financialAccount } from "./financial-account";

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    financialAccounts: many(financialAccount),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const financialAccountRelations = relations(financialAccount, ({ one }) => ({
    user: one(user, {
        fields: [financialAccount.userId],
        references: [user.id],
    }),
}));
