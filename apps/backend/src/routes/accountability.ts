import { Hono } from "hono";
import { user, ngo } from "@impact/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { successResponse, errorResponse } from "../lib/response";
import { TRUST_POINTS, updateTrustScore } from "../lib/impact";

const accountabilityRoutes = new Hono<{
  Variables: {
    user: any;
    session: any;
    db: any;
    auth: any;
  };
}>();

const flagSchema = z.object({
  targetType: z.enum(["user", "ngo"]),
  targetId: z.string(),
});

accountabilityRoutes.post("/flag", requireAuth, zValidator("json", flagSchema), async (c) => {
  const { targetType, targetId } = c.req.valid("json");
  const db = c.get("db");

  if (targetType === "user") {
    await db
      .update(user)
      .set({
        flags: sql`${user.flags} + 1`,
      })
      .where(eq(user.id, targetId));

    await updateTrustScore(db, targetId, TRUST_POINTS.COMMUNITY_FLAG);

    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, targetId),
    });

    if (updatedUser && updatedUser.flags >= 3) {
      // Logic for 3 strikes
      console.log(`User ${targetId} has 3 strikes!`);
    }
  } else if (targetType === "ngo") {
    const ngoRecord = await db.query.ngo.findFirst({
      where: eq(ngo.id, targetId),
    });

    if (!ngoRecord) return errorResponse(c, "NGO not found", undefined, 404);

    await db
      .update(ngo)
      .set({ flags: sql`${ngo.flags} + 1` })
      .where(eq(ngo.id, targetId));

    await updateTrustScore(db, ngoRecord.userId, TRUST_POINTS.COMMUNITY_FLAG);

    const updatedNgo = await db.query.ngo.findFirst({
      where: eq(ngo.id, targetId),
    });

    if (updatedNgo && updatedNgo.flags >= 3) {
      await db.update(ngo).set({ status: "rejected" }).where(eq(ngo.id, targetId));
    }
  }

  return successResponse(c, `Flagged successfully. Trust score reduced by ${Math.abs(TRUST_POINTS.COMMUNITY_FLAG)}.`);
});

export { accountabilityRoutes };
