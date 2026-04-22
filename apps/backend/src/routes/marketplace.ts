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
import { zValidator } from "@hono/zod-validator";
import {
  tenderSchema,
  pledgeSchema,
  gratitudeSchema,
  driveSchema,
  categoryRequestSchema,
  pollVoteSchema,
  commentSchema,
} from "../lib/schemas";
import { successResponse, errorResponse } from "../lib/response";
import { TRUST_POINTS, updateTrustScore } from "../lib/impact";

const marketplaceRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

// --- Tenders (Beneficiary Needs) ---

marketplaceRoutes.get("/tenders", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");
  const radius = c.req.query("radius") || "50000"; // Default 50km in meters for PostGIS geography

  let whereClause = eq(tenders.status, "open");

  if (lat && lng) {
    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    const uRad = parseFloat(radius);

    // PostGIS optimized spatial query: 
    // ST_DWithin(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326), radius)
    // We also include SOS (urgent) bypass in the SQL where clause
    const spatialFilter = sql`(${tenders.urgency} = 'urgent' OR ST_DWithin(${tenders.location}, ST_SetSRID(ST_MakePoint(${uLng}, ${uLat}), 4326)::geography, ${uRad}))`;
    
    const filteredTenders = await db.query.tenders.findMany({
      where: and(whereClause, spatialFilter),
      with: {
        user: true,
        category: true,
      },
      orderBy: (tenders, { desc }) => [desc(tenders.urgency), desc(tenders.createdAt)],
    });

    return successResponse(c, "Tenders fetched with PostGIS geofencing", filteredTenders);
  }

  const allTenders = await db.query.tenders.findMany({
    where: whereClause,
    with: {
      user: true,
      category: true,
    },
    orderBy: (tenders, { desc }) => [desc(tenders.urgency), desc(tenders.createdAt)],
  });

  return successResponse(c, "All open tenders fetched", allTenders);
});

marketplaceRoutes.post("/tenders", requireAuth, zValidator("json", tenderSchema), async (c) => {
  const currentUser = c.get("user");
  const body = c.req.valid("json");
  const newTenderId = crypto.randomUUID();

  await db.insert(tenders).values({
    id: newTenderId,
    userId: currentUser.id,
    title: body.title,
    description: body.description,
    categoryId: body.categoryId,
    urgency: body.urgency as any,
    latitude: body.latitude,
    longitude: body.longitude,
    location: (body.latitude && body.longitude) 
      ? sql`ST_SetSRID(ST_MakePoint(${parseFloat(body.longitude)}, ${parseFloat(body.latitude)}), 4326)::geography` as any
      : null,
    targetAmount: body.targetAmount,
    targetVolunteers: body.targetVolunteers,
  });

  return successResponse(c, "Tender created successfully", { id: newTenderId }, 201);
});

// --- Handshake Protocol & Resource Pooling ---

marketplaceRoutes.post("/tenders/:id/pledge", requireAuth, zValidator("json", pledgeSchema), async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");
  const { amount, volunteers } = c.req.valid("json");

  const tenderRecord = await db.query.tenders.findFirst({
    where: eq(tenders.id, tenderId),
  });

  if (!tenderRecord) return errorResponse(c, "Tender not found", undefined, 404);
  if (tenderRecord.status !== "open") return errorResponse(c, "Tender is not open for pledges", undefined, 400);

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

  await updateTrustScore(currentUser.id, TRUST_POINTS.PARTIAL_PLEDGE);

  return successResponse(c, `Pledge accepted! +${TRUST_POINTS.PARTIAL_PLEDGE} Trust Score.`);
});

marketplaceRoutes.post("/tenders/:id/claim", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");

  const tenderRecord = await db.query.tenders.findFirst({
    where: eq(tenders.id, tenderId),
  });

  if (!tenderRecord) return errorResponse(c, "Tender not found", undefined, 404);
  if (tenderRecord.status !== "open") return errorResponse(c, "Tender already claimed or closed", undefined, 400);

  await db
    .update(tenders)
    .set({
      status: "claimed",
      claimedById: currentUser.id,
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  return successResponse(c, "Handshake accepted. Tender is now claimed.");
});

marketplaceRoutes.post("/tenders/:id/fulfill", requireAuth, async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");

  const tenderRecord = await db.query.tenders.findFirst({
    where: eq(tenders.id, tenderId),
  });

  if (!tenderRecord) return errorResponse(c, "Tender not found", undefined, 404);
  if (tenderRecord.claimedById !== currentUser.id && tenderRecord.userId !== currentUser.id) {
    return errorResponse(c, "Unauthorized", undefined, 403);
  }

  await db
    .update(tenders)
    .set({
      status: "fulfilled",
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, tenderId));

  await updateTrustScore(currentUser.id, TRUST_POINTS.TENDER_FULFILLED);

  return successResponse(c, `Tender marked as fulfilled. Closing the loop. +${TRUST_POINTS.TENDER_FULFILLED} Trust Score!`);
});

marketplaceRoutes.post("/tenders/:id/gratitude", requireAuth, zValidator("json", gratitudeSchema), async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");
  const { content } = c.req.valid("json");

  const tenderRecord = await db.query.tenders.findFirst({
    where: and(eq(tenders.id, tenderId), eq(tenders.userId, currentUser.id)),
  });

  if (!tenderRecord) return errorResponse(c, "Tender not found or unauthorized", undefined, 403);
  if (tenderRecord.status !== "fulfilled")
    return errorResponse(c, "Tender must be fulfilled before posting gratitude", undefined, 400);

  await db.insert(beneficiaryUpdates).values({
    id: crypto.randomUUID(),
    tenderId,
    userId: currentUser.id,
    content,
  });

  await updateTrustScore(currentUser.id, TRUST_POINTS.GRATITUDE_UPDATE);

  return successResponse(c, `Gratitude post shared! +${TRUST_POINTS.GRATITUDE_UPDATE} Trust Score.`);
});

// --- Drives (NGO Initiatives) ---

marketplaceRoutes.get("/drives", async (c) => {
  const allDrives = await db.query.drives.findMany({
    where: eq(drives.status, "open"),
    with: {
      ngo: {
        with: {
          user: true,
        },
      },
    },
    // Boost drives from NGOs with higher trust scores
    // Drizzle doesn't support easy sorting by joined field in findMany with 'with'
    // We might need to use the standard select query for complex sorting.
  });

  // Manual sort as a quick optimization
  const sorted = allDrives.sort((a, b) => (b.ngo.user.trustScore || 0) - (a.ngo.user.trustScore || 0));

  return successResponse(c, "Drives fetched and ranked by NGO Trust Score", sorted);
});

marketplaceRoutes.post("/drives", requireAuth, requireRole("ngo"), zValidator("json", driveSchema), async (c) => {
  const currentUser = c.get("user");
  const body = c.req.valid("json");
  const ngoRecord = await db.query.ngo.findFirst({
    where: and(eq(ngo.userId, currentUser.id), eq(ngo.status, "verified")),
  });
  if (!ngoRecord) {
    return errorResponse(c, "Only verified NGOs can create drives", undefined, 403);
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
    location: (body.latitude && body.longitude) 
      ? sql`ST_SetSRID(ST_MakePoint(${parseFloat(body.longitude)}, ${parseFloat(body.latitude)}), 4326)::geography` as any
      : null,
  });
  return successResponse(c, "Drive created successfully", { id: newDriveId }, 201);
});

marketplaceRoutes.post("/drives/:id/update", requireAuth, requireRole("ngo"), zValidator("json", z.object({
  content: z.string().min(10).max(2000),
  images: z.array(z.string().url()).optional(),
})), async (c) => {
  const driveId = c.req.param("id");
  const currentUser = c.get("user");
  const { content, images } = c.req.valid("json");

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (!ngoRecord) return errorResponse(c, "NGO record not found", undefined, 404);

  const driveRecord = await db.query.drives.findFirst({
    where: and(eq(drives.id, driveId), eq(drives.ngoId, ngoRecord.id)),
  });

  if (!driveRecord) return errorResponse(c, "Drive not found or access denied", undefined, 403);

  await db.insert(driveUpdates).values({
    id: crypto.randomUUID(),
    driveId,
    userId: currentUser.id,
    content,
    images,
  });

  await updateTrustScore(currentUser.id, TRUST_POINTS.IMPACT_UPDATE);

  return successResponse(c, `Drive update posted successfully. +${TRUST_POINTS.IMPACT_UPDATE} Trust Score!`);
});

marketplaceRoutes.post("/categories/request", requireAuth, requireRole("ngo"), zValidator("json", categoryRequestSchema), async (c) => {
  const currentUser = c.get("user");
  const { name, description } = c.req.valid("json");

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (!ngoRecord) return errorResponse(c, "NGO not found", undefined, 404);

  const newCatId = crypto.randomUUID();
  await db.insert(categories).values({
    id: newCatId,
    name,
    description,
    isCustom: true,
    status: "pending",
    requestedByNgoId: ngoRecord.id,
  });

  return successResponse(c, "Category request submitted for admin triage.", { id: newCatId });
});

marketplaceRoutes.post("/polls/:id/vote", requireAuth, zValidator("json", pollVoteSchema), async (c) => {
  const pollId = c.req.param("id");
  const { vote } = c.req.valid("json");

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

  return successResponse(c, "Vote cast successfully");
});

marketplaceRoutes.post("/tenders/:id/comment", requireAuth, zValidator("json", commentSchema), async (c) => {
  const tenderId = c.req.param("id");
  const currentUser = c.get("user");
  const { content } = c.req.valid("json");
  await db.insert(comments).values({
    id: crypto.randomUUID(),
    userId: currentUser.id,
    tenderId: tenderId,
    content: content,
  });
  return successResponse(c, "Comment added", undefined, 201);
});

export { marketplaceRoutes };
