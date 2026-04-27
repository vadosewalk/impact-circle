import { Hono } from "hono";
import { ngo, user } from "@impact/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { ngoOnboardSchema } from "../lib/schemas";
import { successResponse, errorResponse } from "../lib/response";

const ngoRoutes = new Hono<{
  Variables: {
    user: any;
    session: any;
    db: any;
    auth: any;
  };
}>();

ngoRoutes.post("/onboard", requireAuth, zValidator("json", ngoOnboardSchema), async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db" as any);
  const auth = c.get("auth" as any);
  const body = c.req.valid("json");

  const existingNgo = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (existingNgo) {
    return errorResponse(c, "NGO onboarding already in progress or completed", undefined, 400);
  }

  // 1. Create Better Auth Organization
  const org = await auth.api.createOrganization({
    body: {
      name: body.name,
      slug: `${body.name.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).substring(7)}`,
      userId: currentUser.id,
    },
  });

  if (!org) {
    return errorResponse(c, "Failed to create organization", undefined, 500);
  }

  const newNgoId = crypto.randomUUID();

  // 2. Create NGO record linked to Organization
  await db.insert(ngo).values({
    id: newNgoId,
    userId: currentUser.id,
    organizationId: org.id,
    name: body.name,
    description: body.description,
    geoRadius: body.geoRadius,
    address: body.address,
    registrationNumber: body.registrationNumber,
    documents: body.documents,
  });

  await db.update(user).set({ role: "ngo" }).where(eq(user.id, currentUser.id));

  return successResponse(
    c,
    "NGO onboarding request submitted successfully",
    {
      id: newNgoId,
      organizationId: org.id,
      status: "pending",
    },
    201,
  );
});

ngoRoutes.get("/me", requireAuth, async (c) => {
  const currentUser = c.get("user");
  const db = c.get("db" as any);

  const ngoRecord = await db.query.ngo.findFirst({
    where: eq(ngo.userId, currentUser.id),
  });

  if (!ngoRecord) {
    return errorResponse(c, "No NGO record found", undefined, 404);
  }

  return successResponse(c, "NGO record fetched", ngoRecord);
});

export { ngoRoutes };
