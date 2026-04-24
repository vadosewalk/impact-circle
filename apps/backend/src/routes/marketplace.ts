import { Hono } from "hono";
import { z } from "zod";
import {
  db,
  tenders,
  drives,
  categories,
  ngo,
  user,
  comments,
  driveUpdates,
  beneficiaryUpdates,
  polls,
} from "@impact/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import type { auth } from "../lib/auth";
import { zValidator } from "@hono/zod-validator";
import {
  tenderSchema,
  pledgeSchema,
  gratitudeSchema,
  driveSchema,
  categoryRequestSchema,
  pollVoteSchema,
  commentSchema,
  locationQuerySchema,
} from "../lib/schemas";
import { successResponse, errorResponse } from "../lib/response";
import { TRUST_POINTS, updateTrustScore } from "../lib/impact";

const marketplaceRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

// --- Categories ---

marketplaceRoutes.get("/categories", async (c) => {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .where(eq(categories.status, "approved"))
    .orderBy(categories.name);

  return successResponse(c, "Categories fetched successfully", allCategories);
});

// --- Tenders (Beneficiary Needs) ---

marketplaceRoutes.get("/tenders", zValidator("query", locationQuerySchema), async (c) => {
  const { lat, lng, radius: rawRadius } = c.req.valid("query");
  const radius = rawRadius || 50000; // Default 50km in meters for PostGIS geography

  const conditions = [eq(tenders.status, "open")];

  if (lat !== undefined && lng !== undefined) {
    conditions.push(
      sql`(${tenders.urgency} = 'urgent' OR ST_DWithin(${tenders.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius}))`,
    );
  }

  const rows = await db
    .select({
      tender: {
        id: tenders.id,
        userId: tenders.userId,
        title: tenders.title,
        description: tenders.description,
        categoryId: tenders.categoryId,
        status: tenders.status,
        urgency: tenders.urgency,
        latitude: tenders.latitude,
        longitude: tenders.longitude,
        targetAmount: tenders.targetAmount,
        currentAmount: tenders.currentAmount,
        targetVolunteers: tenders.targetVolunteers,
        currentVolunteers: tenders.currentVolunteers,
        claimedById: tenders.claimedById,
        createdAt: tenders.createdAt,
        updatedAt: tenders.updatedAt,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        trustScore: user.trustScore,
        role: user.role,
        bio: user.bio,
      },
      category: {
        id: categories.id,
        name: categories.name,
        description: categories.description,
      },
    })
    .from(tenders)
    .innerJoin(user, eq(tenders.userId, user.id))
    .innerJoin(categories, eq(tenders.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(tenders.urgency), desc(tenders.createdAt));

  const result = rows.map((row) => ({
    ...row.tender,
    user: row.user,
    category: row.category,
  }));

  return successResponse(c, "Tenders fetched successfully", result);
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
    urgency: body.urgency,
    latitude: body.latitude,
    longitude: body.longitude,
    location:
      body.latitude && body.longitude
        ? sql<string>`ST_SetSRID(ST_MakePoint(${parseFloat(body.longitude)}, ${parseFloat(body.latitude)}), 4326)::geography`
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

  await db.transaction(async (tx) => {
    await tx
      .update(tenders)
      .set({
        currentAmount: newAmount,
        currentVolunteers: newVolunteers,
        updatedAt: new Date(),
      })
      .where(eq(tenders.id, tenderId));

    await tx
      .update(user)
      .set({ trustScore: sql`${user.trustScore} + ${TRUST_POINTS.PARTIAL_PLEDGE}` })
      .where(eq(user.id, currentUser.id));
  });

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

  await db.transaction(async (tx) => {
    await tx
      .update(tenders)
      .set({
        status: "fulfilled",
        updatedAt: new Date(),
      })
      .where(eq(tenders.id, tenderId));

    await tx
      .update(user)
      .set({ trustScore: sql`${user.trustScore} + ${TRUST_POINTS.TENDER_FULFILLED}` })
      .where(eq(user.id, currentUser.id));
  });

  return successResponse(
    c,
    `Tender marked as fulfilled. Closing the loop. +${TRUST_POINTS.TENDER_FULFILLED} Trust Score!`,
  );
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

  await db.transaction(async (tx) => {
    await tx.insert(beneficiaryUpdates).values({
      id: crypto.randomUUID(),
      tenderId,
      userId: currentUser.id,
      content,
    });

    await tx
      .update(user)
      .set({ trustScore: sql`${user.trustScore} + ${TRUST_POINTS.GRATITUDE_UPDATE}` })
      .where(eq(user.id, currentUser.id));
  });

  return successResponse(c, `Gratitude post shared! +${TRUST_POINTS.GRATITUDE_UPDATE} Trust Score.`);
});

// --- Drives (NGO Initiatives) ---

marketplaceRoutes.get("/drives", zValidator("query", locationQuerySchema), async (c) => {
  const { lat, lng, radius: rawRadius } = c.req.valid("query");
  const radius = rawRadius || 50000;

  const conditions = [eq(drives.status, "open")];

  if (lat !== undefined && lng !== undefined) {
    conditions.push(
      sql`ST_DWithin(${drives.location}, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})`,
    );
  }

  const rows = await db
    .select({
      drive: {
        id: drives.id,
        ngoId: drives.ngoId,
        title: drives.title,
        description: drives.description,
        targetFunds: drives.targetFunds,
        currentFunds: drives.currentFunds,
        targetVolunteers: drives.targetVolunteers,
        currentVolunteers: drives.currentVolunteers,
        status: drives.status,
        latitude: drives.latitude,
        longitude: drives.longitude,
        createdAt: drives.createdAt,
        updatedAt: drives.updatedAt,
      },
      ngo: {
        id: ngo.id,
        userId: ngo.userId,
        organizationId: ngo.organizationId,
        name: ngo.name,
        description: ngo.description,
        status: ngo.status,
        geoRadius: ngo.geoRadius,
        address: ngo.address,
        registrationNumber: ngo.registrationNumber,
        flags: ngo.flags,
        auditMeetLink: ngo.auditMeetLink,
        auditScheduledAt: ngo.auditScheduledAt,
        documents: ngo.documents,
        createdAt: ngo.createdAt,
        updatedAt: ngo.updatedAt,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        trustScore: user.trustScore,
        role: user.role,
        bio: user.bio,
      },
    })
    .from(drives)
    .innerJoin(ngo, eq(drives.ngoId, ngo.id))
    .innerJoin(user, eq(ngo.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(user.trustScore));

  const sortedDrives = rows.map((row) => ({
    ...row.drive,
    ngo: {
      ...row.ngo,
      user: row.user,
    },
  }));

  return successResponse(c, "Drives fetched and ranked by NGO Trust Score", sortedDrives);
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
    location:
      body.latitude && body.longitude
        ? sql<string>`ST_SetSRID(ST_MakePoint(${parseFloat(body.longitude)}, ${parseFloat(body.latitude)}), 4326)::geography`
        : null,
  });
  return successResponse(c, "Drive created successfully", { id: newDriveId }, 201);
});

marketplaceRoutes.post(
  "/drives/:id/update",
  requireAuth,
  requireRole("ngo"),
  zValidator(
    "json",
    z.object({
      content: z.string().min(10).max(2000),
      images: z.array(z.string().url()).optional(),
    }),
  ),
  async (c) => {
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

    await db.transaction(async (tx) => {
      await tx.insert(driveUpdates).values({
        id: crypto.randomUUID(),
        driveId,
        userId: currentUser.id,
        content,
        images,
      });

      await tx
        .update(user)
        .set({ trustScore: sql`${user.trustScore} + ${TRUST_POINTS.IMPACT_UPDATE}` })
        .where(eq(user.id, currentUser.id));
    });

    return successResponse(c, `Drive update posted successfully. +${TRUST_POINTS.IMPACT_UPDATE} Trust Score!`);
  },
);

marketplaceRoutes.post(
  "/categories/request",
  requireAuth,
  requireRole("ngo"),
  zValidator("json", categoryRequestSchema),
  async (c) => {
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
  },
);

marketplaceRoutes.get("/polls", async (c) => {
  const activePolls = await db
    .select({
      id: polls.id,
      categoryId: polls.categoryId,
      title: polls.title,
      description: polls.description,
      votesFor: polls.votesFor,
      votesAgainst: polls.votesAgainst,
      expiresAt: polls.expiresAt,
      status: polls.status,
      createdAt: polls.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        description: categories.description,
      },
    })
    .from(polls)
    .innerJoin(categories, eq(polls.categoryId, categories.id))
    .where(eq(polls.status, "active"))
    .orderBy(desc(polls.createdAt));

  return successResponse(c, "Active polls fetched successfully", activePolls);
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
