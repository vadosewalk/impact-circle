import { Hono } from "hono";
import { db, messages } from "@impact/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import type { auth } from "../lib/auth";
import { zValidator } from "@hono/zod-validator";
import { sendMessageSchema } from "../lib/schemas";
import { successResponse } from "../lib/response";

const messageRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

messageRoutes.get("/", requireAuth, async (c) => {
  const currentUser = c.get("user");

  const allMessages = await db.query.messages.findMany({
    where: or(eq(messages.senderId, currentUser.id), eq(messages.receiverId, currentUser.id)),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  return successResponse(c, "Messages fetched", allMessages);
});

messageRoutes.post("/send", requireAuth, zValidator("json", sendMessageSchema), async (c) => {
  const currentUser = c.get("user");
  const { receiverId, content } = c.req.valid("json");

  await db.insert(messages).values({
    id: crypto.randomUUID(),
    senderId: currentUser.id,
    receiverId: receiverId,
    content: content,
  });

  return successResponse(c, "Message sent", undefined, 201);
});

export { messageRoutes };
