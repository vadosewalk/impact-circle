import { db, user } from "@impact/db";
import { eq, sql } from "drizzle-orm";

export const TRUST_POINTS = {
  NGO_VERIFIED: 50,
  DRIVE_COMPLETED: 20,
  TENDER_FULFILLED: 10,
  IMPACT_UPDATE: 5,
  GRATITUDE_UPDATE: 5,
  PARTIAL_PLEDGE: 2,
  COMMUNITY_FLAG: -30,
};

export const updateTrustScore = async (userId: string, points: number) => {
  return await db
    .update(user)
    .set({
      trustScore: sql`${user.trustScore} + ${points}`,
    })
    .where(eq(user.id, userId));
};

export const checkStrikes = async (userId: string) => {
  const u = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (u && u.flags >= 3) {
    // Implement suspension logic here
    return true;
  }
  return false;
};
