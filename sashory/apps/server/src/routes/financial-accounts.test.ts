import { describe, expect, test, beforeAll } from "bun:test";
import app from "../app";
import { db } from "@sashory/db";
import { financialAccount as financialAccountTable } from "@sashory/db/schema/financial-account";

describe("Financial Accounts API - Integration Tests", () => {
  const timestamp = Date.now();
  const userAEmail = `acc_user_a_${timestamp}@example.com`;
  const userBEmail = `acc_user_b_${timestamp}@example.com`;
  const password = "password123";

  let cookieA = "";
  let cookieB = "";
  let userAId = "";
  let accountAId = "";
  let accountBId = "";

  beforeAll(async () => {
    // Register User A
    const resA = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userAEmail,
        password,
        name: "Account User A",
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
        name: "Account User B",
      }),
    });
    expect(resB.status).toBe(200);
    cookieB = resB.headers.get("set-cookie") || "";
    expect(cookieB).not.toBe("");
  });

  describe("1. Authentication & Security", () => {
    test("Rejects unauthenticated request with 401 UNAUTHORIZED", async () => {
      const res = await app.request("/api/accounts");
      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    test("Rejects request with invalid cookie with 401", async () => {
      const res = await app.request("/api/accounts", {
        headers: { Cookie: "sashory.session_token=invalid-token" },
      });
      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("2. Request Validation & Hardening", () => {
    test("Rejects POST without Content-Type: application/json with 415", async () => {
      const res = await app.request("/api/accounts", {
        method: "POST",
        headers: {
          Cookie: cookieA,
        },
        body: JSON.stringify({ name: "Meezan Bank", type: "ASSET" }),
      });
      expect(res.status).toBe(415);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    test("Rejects PATCH without Content-Type: application/json with 415", async () => {
      const res = await app.request("/api/accounts/a0000000-0000-0000-0000-000000000000", {
        method: "PATCH",
        headers: {
          Cookie: cookieA,
        },
        body: JSON.stringify({ name: "Updated Account" }),
      });
      expect(res.status).toBe(415);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    test("Rejects malformed JSON body with 400 BAD_REQUEST", async () => {
      const res = await app.request("/api/accounts", {
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

    test("Rejects empty account name with 400", async () => {
      const res = await app.request("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "   ",
          type: "ASSET",
        }),
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    test("Rejects invalid account type with 400", async () => {
      const res = await app.request("/api/accounts", {
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

    test("Rejects invalid UUID parameter with 400", async () => {
      const res = await app.request("/api/accounts/not-a-uuid", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("3. Financial Account CRUD & Archiving Operations", () => {
    test("Creates an ASSET account successfully (201)", async () => {
      const res = await app.request("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "Meezan Checking",
          type: "ASSET",
          currency: "pkr",
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.account).toBeDefined();
      expect(data.account.name).toBe("Meezan Checking");
      expect(data.account.type).toBe("ASSET");
      expect(data.account.currency).toBe("PKR");
      expect(data.account.isActive).toBe(true);
      accountAId = data.account.id;
    });

    test("Creates a LIABILITY account successfully (201)", async () => {
      const res = await app.request("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "HBL Credit Card",
          type: "LIABILITY",
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.account.type).toBe("LIABILITY");
      expect(data.account.currency).toBe("PKR");
    });

    test("Lists all accounts for User A", async () => {
      const res = await app.request("/api/accounts", {
        headers: { Cookie: cookieA },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(Array.isArray(data.accounts)).toBe(true);
      expect(data.accounts.length).toBe(2);
    });

    test("Filters accounts by type", async () => {
      const resAssets = await app.request("/api/accounts?type=ASSET", {
        headers: { Cookie: cookieA },
      });
      expect(resAssets.status).toBe(200);
      const dataAssets = (await resAssets.json()) as any;
      expect(dataAssets.accounts.length).toBe(1);
      expect(dataAssets.accounts[0].type).toBe("ASSET");

      const resLiabilities = await app.request("/api/accounts?type=LIABILITY", {
        headers: { Cookie: cookieA },
      });
      expect(resLiabilities.status).toBe(200);
      const dataLiabilities = (await resLiabilities.json()) as any;
      expect(dataLiabilities.accounts.length).toBe(1);
      expect(dataLiabilities.accounts[0].type).toBe("LIABILITY");
    });

    test("Retrieves single account by ID (200)", async () => {
      const res = await app.request(`/api/accounts/${accountAId}`, {
        headers: { Cookie: cookieA },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.account.id).toBe(accountAId);
      expect(data.account.name).toBe("Meezan Checking");
    });

    test("Updates account name (200)", async () => {
      const res = await app.request(`/api/accounts/${accountAId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          name: "Meezan Primary Checking",
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.account.name).toBe("Meezan Primary Checking");
    });

    test("Archives account (DELETE returns 204)", async () => {
      const res = await app.request(`/api/accounts/${accountAId}`, {
        method: "DELETE",
        headers: { Cookie: cookieA },
      });

      expect(res.status).toBe(204);

      // Verify account is now archived (isActive = false)
      const getRes = await app.request(`/api/accounts/${accountAId}`, {
        headers: { Cookie: cookieA },
      });
      expect(getRes.status).toBe(200);
      const getData = (await getRes.json()) as any;
      expect(getData.account.isActive).toBe(false);
    });

    test("Filters accounts by isActive", async () => {
      const resActive = await app.request("/api/accounts?isActive=true", {
        headers: { Cookie: cookieA },
      });
      const dataActive = (await resActive.json()) as any;
      expect(dataActive.accounts.length).toBe(1);
      expect(dataActive.accounts[0].name).toBe("HBL Credit Card");

      const resInactive = await app.request("/api/accounts?isActive=false", {
        headers: { Cookie: cookieA },
      });
      const dataInactive = (await resInactive.json()) as any;
      expect(dataInactive.accounts.length).toBe(1);
      expect(dataInactive.accounts[0].id).toBe(accountAId);
    });
  });

  describe("4. Cross-User Ownership Enforcement", () => {
    beforeAll(async () => {
      // Create an account for User B
      const res = await app.request("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieB,
        },
        body: JSON.stringify({
          name: "User B Cash",
          type: "ASSET",
        }),
      });
      const data = (await res.json()) as any;
      accountBId = data.account.id;
    });

    test("User B receives 404 when reading User A's account", async () => {
      const res = await app.request(`/api/accounts/${accountAId}`, {
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B cannot update User A's account (404)", async () => {
      const res = await app.request(`/api/accounts/${accountAId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieB,
        },
        body: JSON.stringify({ name: "Hacked Name" }),
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B cannot archive User A's account (404)", async () => {
      const res = await app.request(`/api/accounts/${accountAId}`, {
        method: "DELETE",
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B account list does not leak User A's accounts", async () => {
      const res = await app.request("/api/accounts", {
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.accounts.length).toBe(1);
      expect(data.accounts[0].id).toBe(accountBId);
      expect(data.accounts[0].name).toBe("User B Cash");
    });
  });

  describe("5. Database Constraints & Request Tracing", () => {
    test("Database check constraint blocks inserting whitespace-only name", async () => {
      let threw = false;
      try {
        await db.insert(financialAccountTable).values({
          id: crypto.randomUUID(),
          userId: userAId,
          name: "   ",
          type: "ASSET",
          currency: "PKR",
        });
      } catch (err: any) {
        threw = true;
        const fullMessage = `${err?.message ?? ""} ${err?.cause?.message ?? ""} ${err?.cause?.constraint ?? ""}`;
        expect(fullMessage).toContain("financial_account_name_length_check");
      }
      expect(threw).toBe(true);
    });

    test("Server error response includes requestId", async () => {
      const res = await app.request("/api/accounts/not-a-uuid", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.requestId).toBeDefined();
      expect(typeof data.error.requestId).toBe("string");
    });
  });
});

