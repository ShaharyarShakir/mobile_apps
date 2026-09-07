import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireJson } from "../middleware/content-type";
import { ApiError } from "../lib/api-error";
import { readJson } from "../lib/request";
import { parseOrThrow } from "../lib/parse";
import {
  createFinancialAccountSchema,
  financialAccountIdSchema,
  financialAccountListQuerySchema,
  updateFinancialAccountSchema,
} from "../lib/validation";
import {
  archiveFinancialAccount,
  createFinancialAccount,
  getFinancialAccount,
  listFinancialAccounts,
  updateFinancialAccount,
} from "../services/financial-account.service";

const financialAccounts = new Hono()
  .use("*", authMiddleware)
  .use("*", requireJson)

  .get("/", async (c) => {
    const user = c.get("user");

    const query = parseOrThrow(financialAccountListQuerySchema, {
      type: c.req.query("type"),
      isActive: c.req.query("isActive"),
    });

    const accounts = await listFinancialAccounts(user.id, query);

    return c.json({
      accounts,
    });
  })

  .post("/", async (c) => {
    const user = c.get("user");

    const body = parseOrThrow(
      createFinancialAccountSchema,
      await readJson(c.req.raw),
    );

    const created = await createFinancialAccount({
      userId: user.id,
      name: body.name,
      type: body.type,
      currency: body.currency,
    });

    return c.json(
      {
        account: created,
      },
      201,
    );
  })

  .get("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(financialAccountIdSchema, {
      id: c.req.param("id"),
    });

    const result = await getFinancialAccount(
      user.id,
      params.id,
    );

    if (!result) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Account not found",
      );
    }

    return c.json({
      account: result,
    });
  })

  .patch("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(financialAccountIdSchema, {
      id: c.req.param("id"),
    });

    const body = parseOrThrow(
      updateFinancialAccountSchema,
      await readJson(c.req.raw),
    );

    const updated = await updateFinancialAccount(
      user.id,
      params.id,
      body,
    );

    if (!updated) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Account not found",
      );
    }

    return c.json({
      account: updated,
    });
  })

  .delete("/:id", async (c) => {
    const user = c.get("user");

    const params = parseOrThrow(financialAccountIdSchema, {
      id: c.req.param("id"),
    });

    const archived = await archiveFinancialAccount(
      user.id,
      params.id,
    );

    if (!archived) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Account not found",
      );
    }

    return c.body(null, 204);
  });

export default financialAccounts;

