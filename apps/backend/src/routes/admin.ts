import { Hono } from "hono";
import { db, ngo, user, categories, polls } from "@impact/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const adminRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}>();

// --- NGO Onboarding & Meet Scheduling ---

// List NGOs waiting for review
adminRoutes.get("/ngos/pending", requireAuth, requireRole("admin"), async (c) => {
  const pendingNgos = await db.query.ngo.findMany({
    where: eq(ngo.status, "pending"),
    with: {
      user: true,
    },
  });

  return c.json(pendingNgos);
});

// Schedule Audit Meet
adminRoutes.post("/ngos/:id/schedule", requireAuth, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const { scheduledAt, meetLink } = await c.req.json();

  await db
    .update(ngo)
    .set({
      auditScheduledAt: new Date(scheduledAt),
      auditMeetLink: meetLink,
      updatedAt: new Date(),
    })
    .where(eq(ngo.id, id));

  // Trigger automated email logic here (placeholder)
  console.log(`Email sent to NGO ${id} with Meet link: ${meetLink}`);

  return c.json({ message: "Audit meet scheduled and NGO notified." });
});

// Update NGO status (Verify or Reject)
adminRoutes.post("/ngos/:id/status", requireAuth, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json(); // "verified" or "rejected"

  if (!["verified", "rejected"].includes(status)) {
    return c.json({ message: "Invalid status" }, 400);
  }

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.id, id),
  });

  if (!ngoRecord) return c.json({ message: "NGO not found" }, 404);

  await db
    .update(ngo)
    .set({ status: status as "verified" | "rejected", updatedAt: new Date() })
    .where(eq(ngo.id, id));

  if (status === "verified") {
    // TRUST SCORE: +50 for becoming a verified NGO
    await db
      .update(user)
      .set({ trustScore: sql`${user.trustScore} + 50`, role: "ngo" })
      .where(eq(user.id, ngoRecord.userId));
  }

  return c.json({ message: `NGO status updated to ${status}. Trust score updated.` });
});

// --- Category Triage & Democratic Taxonomy ---

// List pending custom category requests
adminRoutes.get("/categories/pending", requireAuth, requireRole("admin"), async (c) => {
  const pendingCats = await db.query.categories.findMany({
    where: eq(categories.status, "pending"),
    with: {
      requestedBy: true,
    },
  });
  return c.json(pendingCats);
});

// Move Category to Community Poll
adminRoutes.post("/categories/:id/poll", requireAuth, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const { title, description, durationDays } = await c.req.json();

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

  return c.json({ message: "Category moved to community poll." });
});

// Finalize Category Status (Manual override or batch)
adminRoutes.post("/categories/:id/finalize", requireAuth, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json(); // "approved" | "rejected"

  await db.update(categories).set({ status }).where(eq(categories.id, id));

  return c.json({ message: `Category ${status}.` });
});

export { adminRoutes };
