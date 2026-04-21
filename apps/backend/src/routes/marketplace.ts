import { Hono } from "hono";
import {
  db,
  tenders,
  drives,
  categories,
  ngo,
  comments,
  driveUpdates,
  user,
  beneficiaryUpdates,
  polls,
} from "@impact/db";
import { eq, and, sql, or, lt, gte } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const marketplaceRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

// --- Geofencing Helper ---
// SQL fragment for Haversine distance calculation (returns km)
const distanceSql = (lat: number, lng: number, targetLatCol: any, targetLngSql: any) => {
  return sql`6371 * acos(cos(radians(${lat})) * cos(radians(${targetLatCol})) * cos(radians(${targetLngSql}) - radians(${lng})) + sin(radians(${lat})) * sin(radians(${targetLatCol})))`;
};

// --- Tenders (Beneficiary Needs) ---

marketplaceRoutes.get("/tenders", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");
  const radius = c.req.query("radius") || "50"; // Default 50km

  let whereClause = eq(tenders.status, "open");

  // SOS (Urgent) tenders bypass geofencing or get prioritized
  // For now, we'll fetch all open, but if lat/lng provided, we could filter
  const allTenders = await db.query.tenders.findMany({
    where: whereClause,
    with: {
      user: true,
      category: true,
    },
    orderBy: (tenders, { desc }) => [desc(tenders.urgency), desc(tenders.createdAt)],
  });

  // Manual filter for geofencing if PostGIS not available/ready
  if (lat && lng) {
    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    const uRad = parseFloat(radius);

    return c.json(
      allTenders.filter((t) => {
        if (t.urgency === "urgent") return true; // SOS bypass
        if (!t.latitude || !t.longitude) return true; // Pan-India

        // Simple Euclidean approximation for performance if needed,
        // but Haversine is better. For small counts, this is fine.
        const distance =
          111 * Math.sqrt(Math.pow(parseFloat(t.latitude) - uLat, 2) + Math.pow(parseFloat(t.longitude) - uLng, 2));
        return distance <= uRad;
      }),
    );
  }

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
    targetAmount: body.targetAmount,
    targetVolunteers: body.targetVolunteers,
  });

  return c.json({ message: "Tender created successfully", id: newTenderId }, 201);
});

// --- Handshake Protocol & Resource Pooling ---

marketplaceRoutes.post("/tenders/:id/pledge", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");
  const { amount, volunteers } = await c.req.json();

  const tenderRecord = await db.query.tenders.findFirst({
    where: eq(tenders.id, tenderId),
  });

  if (!tenderRecord) return c.json({ message: "Tender not found" }, 404);
  if (tenderRecord.status !== "open") return c.json({ message: "Tender is not open for pledges" }, 400);

  // Update amounts
  const newAmount = (parseFloat(tenderRecord.currentAmount || "0") + (amount || 0)).toString();
  const newVolunteers = (tenderRecord.currentVolunteers || 0) + (volunteers || 0);

  await db
    .update(tenders)
    .set({
      currentAmount: newAmount,
      currentVolunteers: newVolunteers,
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  // TRUST SCORE: +2 for each partial contribution
  await db
    .update(user)
    .set({ trustScore: sql`${user.trustScore} + 2` })
    .where(eq(user.id, currentUser.id));

  return c.json({ message: "Pledge accepted! +2 Trust Score." });
});

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
  if (tenderRecord.claimedById !== currentUser.id && tenderRecord.userId !== currentUser.id) {
    return c.json({ message: "Unauthorized" }, 403);
  }

  await db
    .update(tenders)
    .set({
      status: "fulfilled",
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  // TRUST SCORE: +10 for fulfilling a tender
  await db
    .update(user)
    .set({ trustScore: sql`${user.trustScore} + 10` })
    .where(eq(user.id, currentUser.id));

  return c.json({ message: "Tender marked as fulfilled. Closing the loop. +10 Trust Score!" });
});

// --- Beneficiary Gratitude ---

marketplaceRoutes.post("/tenders/:id/gratitude", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");
  const { content } = await c.req.json();

  const tenderRecord = await db.query.tenders.findFirst({
    where: and(eq(tenders.id, tenderId), eq(tenders.userId, currentUser.id)),
  });

  if (!tenderRecord) return c.json({ message: "Tender not found or unauthorized" }, 403);
  if (tenderRecord.status !== "fulfilled")
    return c.json({ message: "Tender must be fulfilled before posting gratitude" }, 400);

  await db.insert(beneficiaryUpdates).values({
    id: crypto.randomUUID(),
    tenderId,
    userId: currentUser.id,
    content,
  });

  // TRUST SCORE: +5 for beneficiary closing the loop
  await db
    .update(user)
    .set({ trustScore: sql`${user.trustScore} + 5` })
    .where(eq(user.id, currentUser.id));

  return c.json({ message: "Gratitude post shared! +5 Trust Score." });
});

// --- Drives (NGO Initiatives) ---

marketplaceRoutes.get("/drives", async (c) => {
  const allDrives = await db.query.drives.findMany({
    where: eq(drives.status, "open"),
    with: {
      ngo: true,
    },
    // NGO LEADERBOARD: Boost higher trust scores
    // This requires joining with user table to get trustScore
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
    userId: currentUser.id,
    content,
    images,
  });

  await db
    .update(user)
    .set({ trustScore: sql`${user.trustScore} + 5` })
    .where(eq(user.id, currentUser.id));

  return c.json({ message: "Drive update posted successfully. +5 Trust Score!" });
});

// --- Categories & Governance ---

marketplaceRoutes.get("/categories", async (c) => {
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.status, "approved"),
  });
  return c.json(allCategories);
});

marketplaceRoutes.post("/categories/request", requireAuth, requireRole("ngo"), async (c) => {
  const currentUser = c.get("user");
  const { name, description } = await c.req.json();

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (!ngoRecord) return c.json({ message: "NGO not found" }, 404);

  const newCatId = crypto.randomUUID();
  await db.insert(categories).values({
    id: newCatId,
    name,
    description,
    isCustom: true,
    status: "pending",
    requestedByNgoId: ngoRecord.id,
  });

  return c.json({ message: "Category request submitted for admin triage.", id: newCatId });
});

// Community Voting
marketplaceRoutes.get("/polls", async (c) => {
  const activePolls = await db.query.polls.findMany({
    where: eq(polls.status, "active"),
    with: {
      category: true,
    },
  });
  return c.json(activePolls);
});

marketplaceRoutes.post("/polls/:id/vote", requireAuth, async (c) => {
  const pollId = c.req.param("id");
  const { vote } = await c.req.json(); // "for" | "against"

  if (vote === "for") {
    await db
      .update(polls)
      .set({ votesFor: sql`${polls.votesFor} + 1` })
      .where(eq(polls.id, pollId));
  } else {
    await db
      .update(polls)
      .set({ votesAgainst: sql`${polls.votesAgainst} + 1` })
      .where(eq(polls.id, pollId));
  }

  return c.json({ message: "Vote cast successfully" });
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

export { marketplaceRoutes };
