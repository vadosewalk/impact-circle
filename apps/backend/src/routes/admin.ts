import { Hono } from "hono";
import { ngo, user, categories, polls, member } from "@impact/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import {
  adminScheduleAuditSchema,
  adminUpdateNgoStatusSchema,
  adminMoveCategoryToPollSchema,
  adminFinalizeCategorySchema,
} from "../lib/schemas";
import { successResponse, errorResponse } from "../lib/response";
import { TRUST_POINTS } from "../lib/impact";

const adminRoutes = new Hono<{
  Variables: {
    user: any;
    session: any;
    db: any;
    auth: any;
  };
}>();

// --- NGO Onboarding & Meet Scheduling ---

adminRoutes.get("/ngos/pending", requireAuth, requireRole("admin"), async (c) => {
  const db = c.get("db");
  const pendingNgos = await db.query.ngo.findMany({
    where: eq(ngo.status, "pending"),
    with: {
      user: true,
    },
  });

  return successResponse(c, "Pending NGOs fetched", pendingNgos);
});

adminRoutes.post(
  "/ngos/:id/schedule",
  requireAuth,
  requireRole("admin"),
  zValidator("json", adminScheduleAuditSchema),
  async (c) => {
    const id = c.req.param("id");
    const { scheduledAt, meetLink } = c.req.valid("json");
    const db = c.get("db");

    await db
      .update(ngo)
      .set({
        auditScheduledAt: new Date(scheduledAt),
        auditMeetLink: meetLink,
        updatedAt: new Date(),
      })
      .where(eq(ngo.id, id));

    return successResponse(c, "Audit meet scheduled and NGO notified.");
  },
);

adminRoutes.post(
  "/ngos/:id/status",
  requireAuth,
  requireRole("admin"),
  zValidator("json", adminUpdateNgoStatusSchema),
  async (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");
    const db = c.get("db");

    const ngoRecord = await db.query.ngo.findFirst({
      where: eq(ngo.id, id),
    });

    if (!ngoRecord) return errorResponse(c, "NGO not found", undefined, 404);

    await db.transaction(async (tx) => {
      await tx.update(ngo).set({ status, updatedAt: new Date() }).where(eq(ngo.id, id));

      if (status === "verified") {
        // Update user global role to 'ngo'
        await tx.update(user).set({ role: "ngo" }).where(eq(user.id, ngoRecord.userId));

        // Increment trust score
        await tx
          .update(user)
          .set({ trustScore: sql`${user.trustScore} + ${TRUST_POINTS.NGO_VERIFIED}` })
          .where(eq(user.id, ngoRecord.userId));

        // Sync organization role if exists
        if (ngoRecord.organizationId) {
          await tx
            .update(member)
            .set({ role: "admin" }) // Set as admin of their own NGO organization
            .where(and(eq(member.organizationId, ngoRecord.organizationId), eq(member.userId, ngoRecord.userId)));
        }
      }
    });

    return successResponse(c, `NGO status updated to ${status}. Roles and Trust Score synchronized.`);
  },
);

// --- Category Triage & Democratic Taxonomy ---

adminRoutes.get("/categories/pending", requireAuth, requireRole("admin"), async (c) => {
  const db = c.get("db");
  const pendingCats = await db.query.categories.findMany({
    where: eq(categories.status, "pending"),
    with: {
      requestedBy: true,
    },
  });
  return successResponse(c, "Pending categories fetched", pendingCats);
});

adminRoutes.post(
  "/categories/:id/poll",
  requireAuth,
  requireRole("admin"),
  zValidator("json", adminMoveCategoryToPollSchema),
  async (c) => {
    const id = c.req.param("id");
    const { title, description, durationDays } = c.req.valid("json");
    const db = c.get("db");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (durationDays || 7));

    await db.insert(polls).values({
      id: crypto.randomUUID(),
      categoryId: id,
      title,
      description,
      expiresAt,
      status: "active",
    });

    return successResponse(c, "Category moved to community poll.");
  },
);

adminRoutes.post(
  "/categories/:id/finalize",
  requireAuth,
  requireRole("admin"),
  zValidator("json", adminFinalizeCategorySchema),
  async (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");
    const db = c.get("db");

    await db.update(categories).set({ status }).where(eq(categories.id, id));

    return successResponse(c, `Category ${status}.`);
  },
);

// --- Global Monitoring ---

// List all organizations and their associated NGOs
adminRoutes.get("/organizations", requireAuth, requireRole("admin"), async (c) => {
  const db = c.get("db");
  const allOrgs = await db.query.organization.findMany({
    with: {
      ngo: true,
      members: {
        with: {
          user: true,
        },
      },
    },
  });

  return successResponse(c, "All organizations fetched", allOrgs);
});

// List all users
adminRoutes.get("/users", requireAuth, requireRole("admin"), async (c) => {
  const db = c.get("db");
  const allUsers = await db.query.user.findMany({
    orderBy: (user, { desc }) => [desc(user.trustScore)],
  });

  return successResponse(c, "All users fetched", allUsers);
});

export { adminRoutes };
