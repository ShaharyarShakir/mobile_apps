import { describe, expect, test, beforeAll } from "bun:test";
import app from "../app";
import { db } from "@sashory/db";
import { category as categoryTable } from "@sashory/db/schema/category";

describe("Categories API - Integration Tests", () => {
  const timestamp = Date.now();
  const userAEmail = `cat_user_a_${timestamp}@example.com`;
  const userBEmail = `cat_user_b_${timestamp}@example.com`;
  const password = "password123";

  let cookieA = "";
  let cookieB = "";
  let userAId = "";
  let categoryAId = "";
  let categoryBId = "";

  beforeAll(async () => {
    // Register User A
    const resA = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userAEmail,
        password,
        name: "Category User A",
      }),
    });
    expect(resA.status).toBe(200);
    cookieA = resA.headers.get("set-cookie") || "";
    expect(cookieA).not.toBe("");
    const dataA = (await resA.json()) as any;
    userAId = dataA.user.id;

    // Register User B
    const resB = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userBEmail,
        password,
        name: "Category User B",
      }),
    });
    expect(resB.status).toBe(200);
    cookieB = resB.headers.get("set-cookie") || "";
    expect(cookieB).not.toBe("");
  });

  describe("1. Authentication & Security", () => {
    test("Rejects unauthenticated request with 401 UNAUTHORIZED", async () => {
      const res = await app.request("/api/categories");
      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    test("Rejects request with invalid cookie with 401", async () => {
      const res = await app.request("/api/categories", {
        headers: { Cookie: "sashory.session_token=invalid-token" },
      });
      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("2. Request Validation & Hardening", () => {
    test("Rejects POST without Content-Type: application/json with 415", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          Cookie: cookieA,
        },
        body: JSON.stringify({ name: "Food", type: "EXPENSE" }),
      });
      expect(res.status).toBe(415);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    test("Rejects PATCH without Content-Type: application/json with 415", async () => {
      const res = await app.request("/api/categories/a0000000-0000-0000-0000-000000000000", {
        method: "PATCH",
        headers: {
          Cookie: cookieA,
        },
        body: JSON.stringify({ name: "Updated Category" }),
      });
      expect(res.status).toBe(415);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    test("Rejects malformed JSON body with 400 BAD_REQUEST", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: "{not-valid-json",
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
      expect(data.error.message).toBe("Request body must contain valid JSON");
    });

    test("Rejects empty category name with 400", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "   ",
          type: "EXPENSE",
        }),
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    test("Rejects invalid category type with 400", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "Valid Name",
          type: "INVALID_TYPE",
        }),
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    test("Rejects invalid query type with 400", async () => {
      const res = await app.request("/api/categories?type=INVALID", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
      expect(data.error.message).toBe("Invalid category type");
    });

    test("Rejects invalid UUID parameter with 400", async () => {
      const res = await app.request("/api/categories/not-a-uuid", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("3. Category CRUD & Archiving Operations", () => {
    test("Creates an EXPENSE category successfully (201)", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "Food",
          type: "EXPENSE",
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.category).toBeDefined();
      expect(data.category.name).toBe("Food");
      expect(data.category.type).toBe("EXPENSE");
      expect(data.category.isActive).toBe(true);
      categoryAId = data.category.id;
    });

    test("Creates an INCOME category successfully (201)", async () => {
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "Salary",
          type: "INCOME",
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.category.type).toBe("INCOME");
      expect(data.category.name).toBe("Salary");
    });

    test("Lists all active categories for User A", async () => {
      const res = await app.request("/api/categories", {
        headers: { Cookie: cookieA },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.categories.length).toBe(2);
    });

    test("Filters categories by type (EXPENSE)", async () => {
      const res = await app.request("/api/categories?type=EXPENSE", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.categories.length).toBe(1);
      expect(data.categories[0].name).toBe("Food");
      expect(data.categories[0].type).toBe("EXPENSE");
    });

    test("Filters categories by type (INCOME)", async () => {
      const res = await app.request("/api/categories?type=INCOME", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.categories.length).toBe(1);
      expect(data.categories[0].name).toBe("Salary");
      expect(data.categories[0].type).toBe("INCOME");
    });

    test("Retrieves single category by ID (200)", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        headers: { Cookie: cookieA },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.category.id).toBe(categoryAId);
      expect(data.category.name).toBe("Food");
    });

    test("Updates category name (200)", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "Groceries & Dining",
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.category.name).toBe("Groceries & Dining");
    });

    test("Archives category via PATCH { isActive: false }", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          isActive: false,
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.category.isActive).toBe(false);

      // Verify archived category is excluded from default list
      const listRes = await app.request("/api/categories", {
        headers: { Cookie: cookieA },
      });
      expect(listRes.status).toBe(200);
      const listData = (await listRes.json()) as any;
      expect(listData.categories.length).toBe(1);
      expect(listData.categories[0].name).toBe("Salary");

      // Reactivate for DELETE test
      await app.request(`/api/categories/${categoryAId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          isActive: true,
        }),
      });
    });

    test("Archives category via DELETE endpoint (returns 204)", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        method: "DELETE",
        headers: { Cookie: cookieA },
      });

      expect(res.status).toBe(204);

      // Verify category is now archived (isActive = false)
      const getRes = await app.request(`/api/categories/${categoryAId}`, {
        headers: { Cookie: cookieA },
      });
      expect(getRes.status).toBe(200);
      const getData = (await getRes.json()) as any;
      expect(getData.category.isActive).toBe(false);
    });
  });

  describe("4. Cross-User Ownership Enforcement", () => {
    beforeAll(async () => {
      // Create a category for User B
      const res = await app.request("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieB,
        },
        body: JSON.stringify({
          name: "Gaming",
          type: "EXPENSE",
        }),
      });
      const data = (await res.json()) as any;
      categoryBId = data.category.id;
    });

    test("User B receives 404 when reading User A's category", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B cannot update User A's category (404)", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieB,
        },
        body: JSON.stringify({ name: "Hacked Category" }),
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B cannot archive User A's category (404)", async () => {
      const res = await app.request(`/api/categories/${categoryAId}`, {
        method: "DELETE",
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B category list does not leak User A's categories", async () => {
      const res = await app.request("/api/categories", {
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.categories.length).toBe(1);
      expect(data.categories[0].id).toBe(categoryBId);
      expect(data.categories[0].name).toBe("Gaming");
    });
  });

  describe("5. Database Constraints & Request Tracing", () => {
    test("Database check constraint blocks inserting whitespace-only name", async () => {
      let threw = false;
      try {
        await db.insert(categoryTable).values({
          id: crypto.randomUUID(),
          userId: userAId,
          name: "   ",
          type: "EXPENSE",
        });
      } catch (err: any) {
        threw = true;
        const fullMessage = `${err?.message ?? ""} ${err?.cause?.message ?? ""} ${err?.cause?.constraint ?? ""}`;
        expect(fullMessage).toContain("category_name_length_check");
      }
      expect(threw).toBe(true);
    });

    test("Server error response includes requestId", async () => {
      const res = await app.request("/api/categories/not-a-uuid", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.requestId).toBeDefined();
      expect(typeof data.error.requestId).toBe("string");
    });
  });
});

