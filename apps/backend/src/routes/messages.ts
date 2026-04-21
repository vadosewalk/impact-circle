import { Hono } from "hono";
import { db, messages } from "@impact/db";
import { eq, or, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";

const messageRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

// List messages (conversations)
messageRoutes.get("/", requireAuth, async (c) => {
  const currentUser = c.get("user");

  const allMessages = await db.query.messages.findMany({
    where: or(eq(messages.senderId, currentUser.id), eq(messages.receiverId, currentUser.id)),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  return c.json(allMessages);
});

// Send Short DM
messageRoutes.post("/send", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const { receiverId, content } = await c.req.json();

  // Content length check (max 500 characters)
  if (content.length > 500) {
    return c.json({ message: "Message too long. Max 500 characters." }, 400);
  }

  await db.insert(messages).values({
    id: crypto.randomUUID(),
    senderId: currentUser.id,
    receiverId: receiverId,
    content: content,
  });

  return c.json({ message: "Message sent" }, 201);
});

export { messageRoutes };
