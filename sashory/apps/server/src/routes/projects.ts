import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireJson } from "../middleware/content-type";
import { ApiError } from "../lib/api-error";
import { readJson } from "../lib/request";
import { parseOrThrow } from "../lib/parse";
import {
  createProjectSchema,
  projectIdSchema,
  projectListQuerySchema,
  updateProjectSchema,
} from "../lib/validation";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../services/project.service";

const projects = new Hono()
  .use("*", authMiddleware)
  .use("*", requireJson)

  .get("/", async (c) => {
    const user = c.get("user");

    const query = parseOrThrow(projectListQuerySchema, {
      limit: c.req.query("limit"),
      offset: c.req.query("offset"),
    });

    const projects = await listProjects(user.id, query);

    return c.json({
      projects,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        hasMore: projects.length === query.limit,
      },
    });
  })

  .post("/", async (c) => {
    const user = c.get("user");

    const body = parseOrThrow(
      createProjectSchema,
      await readJson(c.req.raw),
    );

    const created = await createProject({
      userId: user.id,
      name: body.name,
      description: body.description,
    });

    return c.json(
      {
        project: created,
      },
      201,
    );
  })

  .get("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(projectIdSchema, {
      id: c.req.param("id"),
    });

    const result = await getProject(
      user.id,
      params.id,
    );

    if (!result) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Project not found",
      );
    }

    return c.json({
      project: result,
    });
  })

  .patch("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(projectIdSchema, {
      id: c.req.param("id"),
    });

    const body = parseOrThrow(
      updateProjectSchema,
      await readJson(c.req.raw),
    );

    const updated = await updateProject(
      user.id,
      params.id,
      body,
    );

    if (!updated) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Project not found",
      );
    }

    return c.json({
      project: updated,
    });
  })

  .delete("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(projectIdSchema, {
      id: c.req.param("id"),
    });

    const deleted = await deleteProject(
      user.id,
      params.id,
    );

    if (!deleted) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Project not found",
      );
    }

    return c.body(null, 204);
  });

export default projects;
