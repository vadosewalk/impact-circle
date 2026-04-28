import { Hono } from "hono";
import { messages } from "@impact/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { sendMessageSchema } from "../lib/schemas";
import { successResponse } from "../lib/response";
import type { Variables } from "../lib/types";

const messageRoutes = new Hono<{
  Variables: Variables;
}>();

messageRoutes.get("/", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db");

  // Fetch unique contacts the user has messaged or received messages from
  const sentTo = await db
    .select({ contactId: messages.receiverId })
    .from(messages)
    .where(eq(messages.senderId, currentUser.id))
    .groupBy(messages.receiverId);

  const receivedFrom = await db
    .select({ contactId: messages.senderId })
    .from(messages)
    .where(eq(messages.receiverId, currentUser.id))
    .groupBy(messages.senderId);

  const contactIds = Array.from(new Set([...sentTo, ...receivedFrom].map((r) => r.contactId)));

  if (contactIds.length === 0) {
    return successResponse(c, "No conversations found", []);
  }

  // Fetch contact details and last message for each conversation
  const conversations = await Promise.all(
    contactIds.map(async (id) => {
      const contactUser = await db.query.user.findFirst({
        where: eq(user.id, id),
        columns: {
          id: true,
          name: true,
          image: true,
          trustScore: true,
        },
      });

      const lastMessage = await db.query.messages.findFirst({
        where: or(
          and(eq(messages.senderId, currentUser.id), eq(messages.receiverId, id)),
          and(eq(messages.senderId, id), eq(messages.receiverId, currentUser.id)),
        ),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      });

      return {
        contact: contactUser,
        lastMessage,
      };
    }),
  );

  // Sort by last message date
  conversations.sort((a, b) => {
    const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return successResponse(c, "Conversations fetched", conversations);
});

messageRoutes.get("/:contactId", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db");
  const contactId = c.req.param("contactId");

  const conversationMessages = await db.query.messages.findMany({
    where: or(
      and(eq(messages.senderId, currentUser.id), eq(messages.receiverId, contactId)),
      and(eq(messages.senderId, contactId), eq(messages.receiverId, currentUser.id)),
    ),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
    limit: 50,
  });

  return successResponse(c, "Conversation messages fetched", conversationMessages);
});

messageRoutes.post("/send", requireAuth, zValidator("json", sendMessageSchema), async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db");
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
