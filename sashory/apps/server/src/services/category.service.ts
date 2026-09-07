import { db } from "@sashory/db";
import { category, type CategoryType } from "@sashory/db/schema/category";
import { and, desc, eq } from "drizzle-orm";
import { createId } from "@sashory/db/lib/id";

export async function createCategory(input: {
  userId: string;
  name: string;
  type: CategoryType;
}) {
  const [created] = await db
    .insert(category)
    .values({
      id: createId(),
      userId: input.userId,
      name: input.name,
      type: input.type,
      isActive: true,
    })
    .returning();

  return created;
}

export async function listCategories(
  userId: string,
  type?: CategoryType,
  isActive: boolean = true,
) {
  const conditions = [
    eq(category.userId, userId),
    eq(category.isActive, isActive),
  ];

  if (type) {
    conditions.push(eq(category.type, type));
  }

  return db
    .select()
    .from(category)
    .where(and(...conditions))
    .orderBy(desc(category.createdAt));
}

export async function getCategory(
  userId: string,
  categoryId: string,
) {
  const [result] = await db
    .select()
    .from(category)
    .where(
      and(
        eq(category.id, categoryId),
        eq(category.userId, userId),
      ),
    )
    .limit(1);

  return result ?? null;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: {
    name?: string;
    isActive?: boolean;
  },
) {
  const [updated] = await db
    .update(category)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(category.id, categoryId),
        eq(category.userId, userId),
      ),
    )
    .returning();

  return updated ?? null;
}

export async function archiveCategory(
  userId: string,
  categoryId: string,
) {
  return updateCategory(userId, categoryId, { isActive: false });
}

