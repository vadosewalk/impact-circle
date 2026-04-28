import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "@impact/db";
import { getAuth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/auth";
import { ngoRoutes } from "./routes/ngo";
import { adminRoutes } from "./routes/admin";
import { marketplaceRoutes } from "./routes/marketplace";
import { messageRoutes } from "./routes/messages";
import { accountabilityRoutes } from "./routes/accountability";
import { memberRoutes } from "./routes/members";
import { errorHandler, notFoundHandler } from "./middleware/error";

type Bindings = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  BETTER_AUTH_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global Error Handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

let cachedDb: any = null;
let cachedAuth: any = null;

// Initialize DB and Auth in middleware to use Bindings
app.use("*", async (c, next) => {
  if (!cachedDb) {
    cachedDb = createDb(c.env.DATABASE_URL);
  }

  if (!cachedAuth) {
    cachedAuth = getAuth(cachedDb, {
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
      FRONTEND_URL: c.env.FRONTEND_URL,
      RESEND_API_KEY: c.env.RESEND_API_KEY,
      EMAIL_FROM: c.env.EMAIL_FROM,
    });
  }

  c.set("db" as any, cachedDb);
  c.set("auth" as any, cachedAuth);

  await next();
});
// CORS Middleware
app.use("*", async (c, next) => {
  const middleware = cors({
    origin: [c.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });
  return middleware(c, next);
});

// Session Middleware
app.use("*", sessionMiddleware);

// Better Auth Route Handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = c.get("auth" as any);
  return auth.handler(c.req.raw);
});

// App Routes
app.route("/api/ngo", ngoRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/marketplace", marketplaceRoutes);
app.route("/api/messages", messageRoutes);
app.route("/api/accountability", accountabilityRoutes);
app.route("/api/members", memberRoutes);

// Root Route - Redirect to Frontend
app.get("/", (c) => {
  return c.redirect(c.env.FRONTEND_URL || "http://localhost:3000");
});

// Health Check
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    platform: "cloudflare-workers",
  });
});

export default app;
