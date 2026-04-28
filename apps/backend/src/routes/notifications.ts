import { Hono } from "hono";
import { notifications } from "@impact/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { successResponse, errorResponse } from "../lib/response";

const notificationRoutes = new Hono<{
  Variables: {
    user: any;
    db: any;
  };
}>();

// GET /api/notifications - Fetch all notifications for the current user
notificationRoutes.get("/", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db");

  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, currentUser.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50); // Limit to last 50 notifications for performance

    return successResponse(c, "Notifications fetched successfully", userNotifications);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return errorResponse(c, "Failed to fetch notifications", undefined, 500);
  }
});

// POST /api/notifications/read - Mark all notifications as read
notificationRoutes.post("/read", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db");

  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, currentUser.id));

    return successResponse(c, "All notifications marked as read");
  } catch (err) {
    console.error("Failed to mark notifications as read:", err);
    return errorResponse(c, "Failed to update notifications", undefined, 500);
  }
});

export { notificationRoutes };
