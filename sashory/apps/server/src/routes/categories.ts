import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireJson } from "../middleware/content-type";
import { ApiError } from "../lib/api-error";
import { parseOrThrow } from "../lib/parse";
import { readJson } from "../lib/request";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../lib/validation";
import {
  archiveCategory,
  createCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "../services/category.service";

const categories = new Hono()
  .use("*", authMiddleware)
  .use("*", requireJson)

  .get("/", async (c) => {
    const user = c.get("user");

    const type = c.req.query("type");
    const isActiveQuery = c.req.query("isActive");

    if (
      type !== undefined &&
      type !== "INCOME" &&
      type !== "EXPENSE"
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Invalid category type",
      );
    }

    const isActive = isActiveQuery === undefined ? true : isActiveQuery === "true";

    const result = await listCategories(
      user.id,
      type,
      isActive,
    );

    return c.json({
      categories: result,
    });
  })

  .post("/", async (c) => {
    const user = c.get("user");

    const body = parseOrThrow(
      createCategorySchema,
      await readJson(c.req.raw),
    );

    const created = await createCategory({
      userId: user.id,
      name: body.name,
      type: body.type,
    });

    return c.json(
      {
        category: created,
      },
      201,
    );
  })

  .get("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(
      categoryIdSchema,
      {
        id: c.req.param("id"),
      },
    );

    const result = await getCategory(
      user.id,
      params.id,
    );

    if (!result) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Category not found",
      );
    }

    return c.json({
      category: result,
    });
  })

  .patch("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(
      categoryIdSchema,
      {
        id: c.req.param("id"),
      },
    );

    const body = parseOrThrow(
      updateCategorySchema,
      await readJson(c.req.raw),
    );

    const updated = await updateCategory(
      user.id,
      params.id,
      body,
    );

    if (!updated) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Category not found",
      );
    }

    return c.json({
      category: updated,
    });
  })

  .delete("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(
      categoryIdSchema,
      {
        id: c.req.param("id"),
      },
    );

    const archived = await archiveCategory(
      user.id,
      params.id,
    );

    if (!archived) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Category not found",
      );
    }

    return c.body(null, 204);
  });

export default categories;

