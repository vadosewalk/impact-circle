import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const auth = c.get("auth" as any);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (session) {
    c.set("user", session.user);
    c.set("session", session.session);
  }
  await next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  const auth = c.get("auth" as any);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

export const requireRole = (role: "admin" | "user" | "ngo") => {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user || user.role !== role) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await next();
  });
};
