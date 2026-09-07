import { db } from "@sashory/db";
import { project } from "@sashory/db/schema/project";
import { and, desc, eq } from "drizzle-orm";
import { createId } from "@sashory/db/lib/id";

export async function createProject(input: {
  userId: string;
  name: string;
  description?: string;
}) {
  const [created] = await db
    .insert(project)
    .values({
      id: createId(),
      userId: input.userId,
      name: input.name,
      description: input.description ?? null,
    })
    .returning();

  return created;
}

export async function listProjects(
  userId: string,
  input: {
    limit: number;
    offset: number;
  } = { limit: 20, offset: 0 },
) {
  return db
    .select()
    .from(project)
    .where(eq(project.userId, userId))
    .orderBy(desc(project.createdAt))
    .limit(input.limit)
    .offset(input.offset);
}

export async function getProject(
  userId: string,
  projectId: string,
) {
  const [result] = await db
    .select()
    .from(project)
    .where(
      and(
        eq(project.id, projectId),
        eq(project.userId, userId),
      ),
    )
    .limit(1);

  return result ?? null;
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: {
    name?: string;
    description?: string | null;
  },
) {
  const [updated] = await db
    .update(project)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(project.id, projectId),
        eq(project.userId, userId),
      ),
    )
    .returning();

  return updated ?? null;
}

export async function deleteProject(
  userId: string,
  projectId: string,
) {
  const [deleted] = await db
    .delete(project)
    .where(
      and(
        eq(project.id, projectId),
        eq(project.userId, userId),
      ),
    )
    .returning();

  return deleted ?? null;
}

