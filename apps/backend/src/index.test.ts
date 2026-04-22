import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { errorHandler, notFoundHandler } from "./middleware/error";

describe("Root API", () => {
  const app = new Hono();
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  app.get("/", (c) => {
    return c.json({
      message: "Impact Circle API is running!",
      status: "ok",
    });
  });

  it("should return ok status", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Impact Circle API is running!");
  });

  it("should return 404 for unknown routes", async () => {
    const res = await app.request("/unknown");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Route not found");
  });
});
