import { db } from "@sashory/db";
import {
  financialAccount,
  type FinancialAccountType,
} from "@sashory/db/schema/financial-account";
import { and, desc, eq } from "drizzle-orm";
import { createId } from "@sashory/db/lib/id";

export async function createFinancialAccount(input: {
  userId: string;
  name: string;
  type: FinancialAccountType;
  currency?: string;
}) {
  const [created] = await db
    .insert(financialAccount)
    .values({
      id: createId(),
      userId: input.userId,
      name: input.name,
      type: input.type,
      currency: input.currency ?? "PKR",
      isActive: true,
    })
    .returning();

  return created;
}

export async function listFinancialAccounts(
  userId: string,
  filters?: {
    type?: FinancialAccountType;
    isActive?: boolean;
  },
) {
  const conditions = [eq(financialAccount.userId, userId)];

  if (filters?.type !== undefined) {
    conditions.push(eq(financialAccount.type, filters.type));
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(financialAccount.isActive, filters.isActive));
  }

  return db
    .select()
    .from(financialAccount)
    .where(and(...conditions))
    .orderBy(desc(financialAccount.createdAt));
}

export async function getFinancialAccount(
  userId: string,
  accountId: string,
) {
  const [result] = await db
    .select()
    .from(financialAccount)
    .where(
      and(
        eq(financialAccount.id, accountId),
        eq(financialAccount.userId, userId),
      ),
    )
    .limit(1);

  return result ?? null;
}

export async function updateFinancialAccount(
  userId: string,
  accountId: string,
  input: {
    name?: string;
    isActive?: boolean;
  },
) {
  const [updated] = await db
    .update(financialAccount)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(financialAccount.id, accountId),
        eq(financialAccount.userId, userId),
      ),
    )
    .returning();

  return updated ?? null;
}

export async function archiveFinancialAccount(
  userId: string,
  accountId: string,
) {
  return updateFinancialAccount(userId, accountId, { isActive: false });
}

export async function deleteFinancialAccount(
  userId: string,
  accountId: string,
) {
  const [deleted] = await db
    .delete(financialAccount)
    .where(
      and(
        eq(financialAccount.id, accountId),
        eq(financialAccount.userId, userId),
      ),
    )
    .returning();

  return deleted ?? null;
}

