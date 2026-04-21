import { Hono } from "hono";
import { db, user, ngo, tenders, drives } from "@impact/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";

const accountabilityRoutes = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user;
		session: typeof auth.$Infer.Session.session;
	};
}>();

// Flag a User or NGO
accountabilityRoutes.post("/flag", requireAuth, async (c) => {
	const { targetType, targetId } = await c.req.json(); // targetType: "user" | "ngo"
	
	if (targetType === "user") {
		await db.update(user)
			.set({ flags: sql`${user.flags} + 1` })
			.where(eq(user.id, targetId));
		
		// Check for 3 strikes
		const updatedUser = await db.query.user.findFirst({
			where: eq(user.id, targetId),
		});
		
		if (updatedUser && updatedUser.flags >= 3) {
			// Suspend or mark for admin review
			console.log(`User ${targetId} has 3 strikes!`);
		}
	} else if (targetType === "ngo") {
		await db.update(ngo)
			.set({ flags: sql`${ngo.flags} + 1` })
			.where(eq(ngo.id, targetId));
		
		const updatedNgo = await db.query.ngo.findFirst({
			where: eq(ngo.id, targetId),
		});
		
		if (updatedNgo && updatedNgo.flags >= 3) {
			await db.update(ngo)
				.set({ status: "rejected" })
				.where(eq(ngo.id, targetId));
		}
	}

	return c.json({ message: "Flagged successfully" });
});

export { accountabilityRoutes };
