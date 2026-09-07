import { describe, expect, test, beforeAll } from "bun:test";
import app from "../app";
import { db } from "@sashory/db";
import { project as projectTable } from "@sashory/db/schema/project";

describe("Projects API - Production Hardening & Ownership Tests", () => {
  const timestamp = Date.now();
  const userAEmail = `user_a_${timestamp}@example.com`;
  const userBEmail = `user_b_${timestamp}@example.com`;
  const password = "password123";

  let cookieA = "";
  let cookieB = "";
  let projectAId = "";

  beforeAll(async () => {
    // Register User A
    const resA = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userAEmail,
        password,
        name: "User A",
      }),
    });
    expect(resA.status).toBe(200);
    cookieA = resA.headers.get("set-cookie") || "";
    expect(cookieA).not.toBe("");

    // Register User B
    const resB = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userBEmail,
        password,
        name: "User B",
      }),
    });
    expect(resB.status).toBe(200);
    cookieB = resB.headers.get("set-cookie") || "";
    expect(cookieB).not.toBe("");
  });

  describe("1. Authentication", () => {
    test("Unauthenticated GET /api/projects returns 401", async () => {
      const res = await app.request("/api/projects");
      expect(res.status).toBe(401);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    test("Unauthenticated POST /api/projects returns 401", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Unauthenticated Project" }),
      });
      expect(res.status).toBe(401);
    });

    test("Unauthenticated GET /api/projects/:id returns 401", async () => {
      const res = await app.request("/api/projects/00000000-0000-0000-0000-000000000000");
      expect(res.status).toBe(401);
    });
  });

  describe("2. Request Hardening & Validation", () => {
    test("Rejects unsupported Content-Type on POST with 415", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "text/plain",
        },
        body: "name=TextProject",
      });
      expect(res.status).toBe(415);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
      expect(data.error.message).toBe("Content-Type must be application/json");
      expect(data.error.requestId).toBeDefined();
    });

    test("Rejects malformed JSON body with 400", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: "{ malformed json: true ",
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
      expect(data.error.message).toBe("Request body must contain valid JSON");
    });

    test("Rejects empty or whitespace-only project name with 400", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "   " }),
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    test("Rejects project name longer than 100 characters with 400", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "x".repeat(101) }),
      });
      expect(res.status).toBe(400);
    });

    test("Rejects description longer than 500 characters with 400", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Valid Project Name",
          description: "d".repeat(501),
        }),
      });
      expect(res.status).toBe(400);
    });

    test("Rejects invalid UUID route parameter with 400", async () => {
      const res = await app.request("/api/projects/not-a-valid-uuid", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(400);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    test("Rejects empty PATCH body with 400", async () => {
      // First ensure project exists
      const createRes = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Temp Project For Empty Patch" }),
      });
      const tempId = ((await createRes.json()) as any).project.id;

      const patchRes = await app.request(`/api/projects/${tempId}`, {
        method: "PATCH",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      expect(patchRes.status).toBe(400);
      const data = (await patchRes.json()) as any;
      expect(data.error.code).toBe("BAD_REQUEST");

      // Clean up temp project
      await app.request(`/api/projects/${tempId}`, {
        method: "DELETE",
        headers: { Cookie: cookieA },
      });
    });
  });

  describe("3. CRUD & Pagination", () => {
    test("User A creates a valid project (201 Created)", async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Alpha Project",
          description: "Initial alpha release",
        }),
      });
      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.project).toBeDefined();
      expect(data.project.name).toBe("Alpha Project");
      expect(data.project.description).toBe("Initial alpha release");
      expect(data.project.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      projectAId = data.project.id;
    });

    test("GET /api/projects returns user projects with pagination metadata", async () => {
      const res = await app.request("/api/projects?limit=10&offset=0", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(Array.isArray(data.projects)).toBe(true);
      expect(data.projects.some((p: any) => p.id === projectAId)).toBe(true);
      expect(data.pagination).toEqual({
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    });

    test("Pagination limit & offset filters list properly", async () => {
      // Create 2 additional projects for User A
      await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Project Page Test 1" }),
      });
      await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Project Page Test 2" }),
      });

      const res = await app.request("/api/projects?limit=2&offset=0", {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.projects.length).toBe(2);
      expect(data.pagination.hasMore).toBe(true);

      const resOffset = await app.request("/api/projects?limit=2&offset=2", {
        headers: { Cookie: cookieA },
      });
      const dataOffset = (await resOffset.json()) as any;
      expect(dataOffset.projects.length).toBeGreaterThanOrEqual(1);
      expect(dataOffset.pagination.offset).toBe(2);
    });

    test("User A updates their project (200 OK)", async () => {
      const res = await app.request(`/api/projects/${projectAId}`, {
        method: "PATCH",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Alpha Project Renamed",
          description: "Updated alpha release",
        }),
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.project.name).toBe("Alpha Project Renamed");
      expect(data.project.description).toBe("Updated alpha release");
    });

    test("User A deletes project (204 No Content)", async () => {
      const res = await app.request(`/api/projects/${projectAId}`, {
        method: "DELETE",
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(204);

      // Verify 404 after deletion
      const getRes = await app.request(`/api/projects/${projectAId}`, {
        headers: { Cookie: cookieA },
      });
      expect(getRes.status).toBe(404);
    });
  });

  describe("4. Cross-User Ownership Enforcement", () => {
    let ownedByA = "";

    beforeAll(async () => {
      const res = await app.request("/api/projects", {
        method: "POST",
        headers: {
          Cookie: cookieA,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "User A Secret Project",
          description: "Restricted data",
        }),
      });
      ownedByA = ((await res.json()) as any).project.id;
    });

    test("User A can read Project A", async () => {
      const res = await app.request(`/api/projects/${ownedByA}`, {
        headers: { Cookie: cookieA },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.project.id).toBe(ownedByA);
    });

    test("User B receives 404 when reading User A's project", async () => {
      const res = await app.request(`/api/projects/${ownedByA}`, {
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B cannot update User A's project (404)", async () => {
      const res = await app.request(`/api/projects/${ownedByA}`, {
        method: "PATCH",
        headers: {
          Cookie: cookieB,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "User B Overwrite Attempt" }),
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B cannot delete User A's project (404)", async () => {
      const res = await app.request(`/api/projects/${ownedByA}`, {
        method: "DELETE",
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(404);
      const data = (await res.json()) as any;
      expect(data.error.code).toBe("NOT_FOUND");
    });

    test("User B list does not leak User A's projects", async () => {
      const res = await app.request("/api/projects", {
        headers: { Cookie: cookieB },
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.projects.some((p: any) => p.id === ownedByA)).toBe(false);
    });
  });

  describe("5. Database Constraints & Request Tracing", () => {
    test("Database check constraint blocks inserting whitespace-only name", async () => {
      // Direct SQL insertion attempting to bypass application validation
      let threw = false;
      try {
        await db.insert(projectTable).values({
          id: "00000000-0000-0000-0000-000000000001",
          userId: "some-user-id",
          name: "   ",
        });
      } catch (err: any) {
        threw = true;
        const fullError = `${err.message} ${err.cause?.message ?? ""} ${err.cause?.constraint ?? ""}`;
        expect(fullError).toContain("project_name_length_check");
      }
      expect(threw).toBe(true);
    });

    test("Server error response includes requestId", async () => {
      const customRequestId = "test-request-id-12345";
      const res = await app.request("/api/projects/not-a-uuid", {
        headers: {
          Cookie: cookieA,
          "x-request-id": customRequestId,
        },
      });
      expect(res.headers.get("x-request-id")).toBe(customRequestId);
      const data = (await res.json()) as any;
      expect(data.error.requestId).toBe(customRequestId);
    });
  });
});
