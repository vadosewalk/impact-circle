import { Hono } from "hono";
import { db, tenders, drives, categories, ngo, comments, driveUpdates } from "@impact/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const marketplaceRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

// --- Tenders (Beneficiary Needs) ---

marketplaceRoutes.get("/tenders", async (c) => {
  const allTenders = await db.query.tenders.findMany({
    where: eq(tenders.status, "open"),
    with: {
      user: true,
      category: true,
    },
    orderBy: (tenders, { desc }) => [desc(tenders.createdAt)],
  });
  return c.json(allTenders);
});

marketplaceRoutes.post("/tenders", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json();
  const newTenderId = crypto.randomUUID();
  await db.insert(tenders).values({
    id: newTenderId,
    userId: currentUser.id,
    title: body.title,
    description: body.description,
    categoryId: body.categoryId,
    urgency: body.urgency || "normal",
    latitude: body.latitude,
    longitude: body.longitude,
  });
  return c.json({ message: "Tender created successfully", id: newTenderId }, 201);
});

// --- Handshake Protocol ---

marketplaceRoutes.post("/tenders/:id/claim", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");

  const tenderRecord = await db.query.tenders.findFirst({
    where: eq(tenders.id, tenderId),
  });

  if (!tenderRecord) return c.json({ message: "Tender not found" }, 404);
  if (tenderRecord.status !== "open") return c.json({ message: "Tender already claimed or closed" }, 400);

  await db
    .update(tenders)
    .set({
      status: "claimed",
      claimedById: currentUser.id,
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  return c.json({ message: "Handshake accepted. Tender is now claimed." });
});

marketplaceRoutes.post("/tenders/:id/fulfill", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");

  const tenderRecord = await db.query.tenders.findFirst({
    where: eq(tenders.id, tenderId),
  });

  if (!tenderRecord) return c.json({ message: "Tender not found" }, 404);
  if (tenderRecord.claimedById !== currentUser.id)
    return c.json({ message: "Only the claimant can fulfill this tender" }, 403);

  await db
    .update(tenders)
    .set({
      status: "fulfilled",
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  return c.json({ message: "Tender marked as fulfilled. Closing the loop." });
});

// --- Drives (NGO Initiatives) ---

marketplaceRoutes.get("/drives", async (c) => {
  const allDrives = await db.query.drives.findMany({
    where: eq(drives.status, "open"),
    with: {
      ngo: true,
    },
    orderBy: (drives, { desc }) => [desc(drives.createdAt)],
  });
  return c.json(allDrives);
});

marketplaceRoutes.post("/drives", requireAuth, requireRole("ngo"), async (c) => {
  const currentUser = c.get("user");
  const body = await c.req.json();
  const ngoRecord = await db.query.ngo.findFirst({
    where: and(eq(ngo.userId, currentUser.id), eq(ngo.status, "verified")),
  });
  if (!ngoRecord) {
    return c.json({ message: "Only verified NGOs can create drives" }, 403);
  }
  const newDriveId = crypto.randomUUID();
  await db.insert(drives).values({
    id: newDriveId,
    ngoId: ngoRecord.id,
    title: body.title,
    description: body.description,
    targetFunds: body.targetFunds,
    targetVolunteers: body.targetVolunteers,
    latitude: body.latitude,
    longitude: body.longitude,
  });
  return c.json({ message: "Drive created successfully", id: newDriveId }, 201);
});

// --- Impact Wall ---

marketplaceRoutes.post("/drives/:id/update", requireAuth, requireRole("ngo"), async (c) => {
  const driveId = c.req.param("id");
  const currentUser = c.get("user");
  const { content, images } = await c.req.json();

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (!ngoRecord) return c.json({ message: "NGO record not found" }, 404);

  const driveRecord = await db.query.drives.findFirst({
    where: and(eq(drives.id, driveId), eq(drives.ngoId, ngoRecord.id)),
  });

  if (!driveRecord) return c.json({ message: "Drive not found or access denied" }, 403);

  await db.insert(driveUpdates).values({
    id: crypto.randomUUID(),
    driveId,
    content,
    images,
  });

  return c.json({ message: "Drive update posted successfully" });
});

marketplaceRoutes.post("/drives/:id/complete", requireAuth, requireRole("ngo"), async (c) => {
  const driveId = c.req.param("id");
  const currentUser = c.get("user");

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (!ngoRecord) return c.json({ message: "NGO record not found" }, 404);

  await db
    .update(drives)
    .set({ status: "completed", updatedAt: new Date() })
    .where(and(eq(drives.id, driveId), eq(drives.ngoId, ngoRecord.id)));

  return c.json({ message: "Drive marked as completed" });
});

// --- Categories ---

marketplaceRoutes.get("/categories", async (c) => {
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.status, "approved"),
  });
  return c.json(allCategories);
});

// --- Comments ---

marketplaceRoutes.post("/tenders/:id/comment", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");
  const { content } = await c.req.json();
  await db.insert(comments).values({
    id: crypto.randomUUID(),
    userId: currentUser.id,
    tenderId: tenderId,
    content: content,
  });
  return c.json({ message: "Comment added" }, 201);
});

marketplaceRoutes.post("/drives/:id/comment", requireAuth, async (c) => {
  const driveId = c.req.param("id");
  const currentUser = c.get("user");
  const { content } = await c.req.json();
  await db.insert(comments).values({
    id: crypto.randomUUID(),
    userId: currentUser.id,
    driveId: driveId,
    content: content,
  });
  return c.json({ message: "Comment added" }, 201);
});

export { marketplaceRoutes };
