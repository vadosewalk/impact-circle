import { Hono } from "hono";
import { db, ngo, user } from "@impact/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const ngoRoutes = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user;
		session: typeof auth.$Infer.Session.session;
	};
}>();

// Submit NGO Onboarding Request
ngoRoutes.post("/onboard", requireAuth, async (c) => {
	const currentUser = c.get("user");
	const body = await c.req.json();

	// Check if already has an NGO record
	const existingNgo = await db.query.ngo.findFirst({
		where: eq(ngo.userId, currentUser.id),
	});

	if (existingNgo) {
		return c.json({ message: "NGO onboarding already in progress or completed" }, 400);
	}

	const newNgoId = crypto.randomUUID();

	await db.insert(ngo).values({
		id: newNgoId,
		userId: currentUser.id,
		name: body.name,
		description: body.description,
		geoRadius: body.geoRadius,
		address: body.address,
		registrationNumber: body.registrationNumber,
		documents: body.documents, // Expecting array of { type: string, url: string }
	});

	// Update user role to NGO (pending status)
	await db.update(user)
		.set({ role: "ngo" })
		.where(eq(user.id, currentUser.id));

	return c.json({ 
		message: "NGO onboarding request submitted successfully",
		id: newNgoId,
		status: "pending"
	}, 201);
});

// Get current user's NGO status
ngoRoutes.get("/me", requireAuth, async (c) => {
	const currentUser = c.get("user");
	
	const ngoRecord = await db.query.ngo.findFirst({
		where: eq(ngo.userId, currentUser.id),
	});

	if (!ngoRecord) {
		return c.json({ message: "No NGO record found" }, 404);
	}

	return c.json(ngoRecord);
});

export { ngoRoutes };
