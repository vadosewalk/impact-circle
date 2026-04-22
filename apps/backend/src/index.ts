import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/auth";
import { ngoRoutes } from "./routes/ngo";
import { adminRoutes } from "./routes/admin";
import { marketplaceRoutes } from "./routes/marketplace";
import { messageRoutes } from "./routes/messages";
import { accountabilityRoutes } from "./routes/accountability";
import { memberRoutes } from "./routes/members";
import { errorHandler, notFoundHandler } from "./middleware/error";

type Variables = {
  user: typeof auth.$Infer.Session.user | undefined;
  session: typeof auth.$Infer.Session.session | undefined;
};

const app = new Hono<{ Variables: Variables }>();

// Global Error Handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

// CORS Middleware
app.use(
  "*",
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Global Session Middleware
app.use("*", sessionMiddleware);

// Better Auth Route Handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// App Routes
app.route("/api/ngo", ngoRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/marketplace", marketplaceRoutes);
app.route("/api/messages", messageRoutes);
app.route("/api/accountability", accountabilityRoutes);
app.route("/api/members", memberRoutes);

// Root Route
app.get("/", (c) => {
  return c.json({
    message: "Impact Circle API is running!",
    status: "ok",
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
    port: 8787,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
