import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/auth";
import { ngoRoutes } from "./routes/ngo";
import { adminRoutes } from "./routes/admin";

import { marketplaceRoutes } from "./routes/marketplace";

import { messageRoutes } from "./routes/messages";

type Variables = {
	user: typeof auth.$Infer.Session.user | undefined;
	session: typeof auth.$Infer.Session.session | undefined;
};

const app = new Hono<{ Variables: Variables }>();

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
