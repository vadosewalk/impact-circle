import "dotenv/config";
import { serve } from "@hono/node-server";
import { db } from "@impact/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getAuth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { accountabilityRoutes } from "./routes/accountability";
import { adminRoutes } from "./routes/admin";
import { marketplaceRoutes } from "./routes/marketplace";
import { memberRoutes } from "./routes/members";
import { messageRoutes } from "./routes/messages";
import { ngoRoutes } from "./routes/ngo";
import { notificationRoutes } from "./routes/notifications";

const auth = getAuth(db);

type Variables = {
  user: typeof auth.$Infer.Session.user | undefined;
  session: typeof auth.$Infer.Session.session | undefined;
  db: typeof db;
  auth: typeof auth;
};

const app = new Hono<{ Variables: Variables }>();

// Global Error Handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

// Debug Logging Middleware
app.use("*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
  await next();
});

// Inject DB and Auth into context
app.use("*", async (c, next) => {
  c.set("db", db);
  c.set("auth", auth);
  await next();
});

// CORS Middleware
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow all localhost/127.0.0.1 origins in development
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return origin;
      }
      return process.env.FRONTEND_URL || "http://localhost:3000";
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Global Session Middleware
app.use("*", sessionMiddleware);

// Better Auth Route Handler
app.all("/api/auth/*", (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

// App Routes
app.route("/api/ngo", ngoRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/marketplace", marketplaceRoutes);
app.route("/api/messages", messageRoutes);
app.route("/api/accountability", accountabilityRoutes);
app.route("/api/members", memberRoutes);
app.route("/api/notifications", notificationRoutes);

// Root Route - Redirect to Frontend
app.get("/", (c) => {
  return c.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
});

// Health Check
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Session Helper / Debug Route
app.get("/api/me", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  if (!session) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  return c.json({ user, session });
});

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080,
    hostname: "0.0.0.0",
  },
  (info: { address: string; port: number }) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
