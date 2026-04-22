import { z } from "zod";

export const tenderSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  categoryId: z.string().uuid(),
  urgency: z.enum(["normal", "urgent"]).default("normal"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  targetAmount: z.string().optional(),
  targetVolunteers: z.number().int().min(0).optional(),
});

export const driveSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  targetFunds: z.string().optional(),
  targetVolunteers: z.number().int().min(0).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const pledgeSchema = z.object({
  amount: z.number().min(0).optional(),
  volunteers: z.number().int().min(0).optional(),
});

export const gratitudeSchema = z.object({
  content: z.string().min(1).max(500),
});

export const categoryRequestSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(200),
});

export const pollVoteSchema = z.object({
  vote: z.enum(["for", "against"]),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(500),
});

export const ngoOnboardSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000).optional(),
  geoRadius: z.number().int().min(1).max(10000).optional(),
  address: z.string().min(5).max(200).optional(),
  registrationNumber: z.string().min(5).max(50).optional(),
  documents: z
    .array(
      z.object({
        type: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
});

export const adminScheduleAuditSchema = z.object({
  scheduledAt: z.string().datetime(),
  meetLink: z.string().url(),
});

export const adminUpdateNgoStatusSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

export const adminMoveCategoryToPollSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(500).optional(),
  durationDays: z.number().int().min(1).max(30).optional(),
});

export const adminFinalizeCategorySchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid().or(z.string()), // Better Auth IDs might not be UUIDs
  content: z.string().min(1).max(500),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string(),
  role: z.enum(["admin", "member"]),
});
