import { createMiddleware } from "hono/factory";
import { auth as authFallback } from "../lib/auth";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@impact/db";
import type { getAuth } from "../lib/auth";

type AuthType = ReturnType<typeof getAuth>;

type Env = {
  Variables: {
    db: NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;
    auth: AuthType;
    user: AuthType["$Infer"]["Session"]["user"] | undefined;
    session: AuthType["$Infer"]["Session"]["session"] | undefined;
  };
};

export const sessionMiddleware = createMiddleware<Env>(async (c, next) => {
  // Optimization: Skip session fetching for known public GET routes
  const publicPaths = [
    "/api/marketplace/tenders",
    "/api/marketplace/drives",
    "/api/marketplace/categories",
    "/api/marketplace/polls",
    "/api/health",
  ];

  const isPublicGet = c.req.method === "GET" && publicPaths.some((p) => c.req.path.startsWith(p));

  if (isPublicGet) {
    return await next();
  }

  const auth = c.get("auth") || authFallback;
  if (!auth) {
    console.error("[AUTH MIDDLEWARE]: Auth object not found in context or fallback");
    return await next();
  }

  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session) {
      c.set("user", session.user);
      c.set("session", session.session);
    }
  } catch (err) {
    console.error("[AUTH MIDDLEWARE]: Failed to fetch session", err);
  }
  await next();
});

export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const auth = c.get("auth") || authFallback;
  if (!auth) {
    return c.json({ message: "Authentication system unavailable" }, 500);
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

export const requireRole = (role: "admin" | "user" | "ngo") => {
  return createMiddleware<Env>(async (c, next) => {
    const user = c.get("user");
    if (!user || user.role !== role) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await next();
  });
};
