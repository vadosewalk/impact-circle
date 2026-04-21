import { Hono } from "hono";
import { db, ngo, user } from "@impact/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const adminRoutes = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user;
		session: typeof auth.$Infer.Session.session;
	};
}>();

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

// Update NGO status (Verify or Reject)
adminRoutes.post("/ngos/:id/status", requireAuth, requireRole("admin"), async (c) => {
	const id = c.req.param("id");
	const { status } = await c.req.json(); // "verified" or "rejected"

	if (!["verified", "rejected"].includes(status)) {
		return c.json({ message: "Invalid status" }, 400);
	}

	await db.update(ngo)
		.set({ status: status as "verified" | "rejected", updatedAt: new Date() })
		.where(eq(ngo.id, id));

	return c.json({ message: `NGO status updated to ${status}` });
});

export { adminRoutes };
