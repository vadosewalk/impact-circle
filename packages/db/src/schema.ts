import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  varchar,
  pgEnum,
  numeric,
  jsonb,
  customType,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Custom PostGIS Geography Type
export const geography = customType<{ data: string }>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

// Enums
export const roleEnum = pgEnum("role", ["admin", "user", "ngo"]);
export const ngoStatusEnum = pgEnum("ngo_status", ["pending", "verified", "rejected"]);
export const tenderStatusEnum = pgEnum("tender_status", ["open", "claimed", "fulfilled", "cancelled"]);
export const driveStatusEnum = pgEnum("drive_status", ["open", "completed", "cancelled"]);
export const urgencyEnum = pgEnum("urgency", ["normal", "urgent"]);
export const categoryStatusEnum = pgEnum("category_status", ["pending", "approved", "rejected"]);
export const pollStatusEnum = pgEnum("poll_status", ["active", "passed", "rejected"]);

// Better Auth Tables
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),

    // Impact Circle Extensions
    role: roleEnum("role").default("user").notNull(),
    trustScore: integer("trust_score").default(0).notNull(),
    flags: integer("flags").default(0).notNull(),
    bio: text("bio"),
  },
  (table) => ({
    roleIdx: index("user_role_idx").on(table.role),
    trustScoreIdx: index("user_trust_score_idx").on(table.trustScore),
  }),
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
  }),
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({
    userIdIdx: index("account_user_id_idx").on(table.userId),
  }),
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    role: text("role").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => ({
    orgIdIdx: index("member_org_id_idx").on(table.organizationId),
    userIdIdx: index("member_user_id_idx").on(table.userId),
  }),
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    orgIdIdx: index("invitation_org_id_idx").on(table.organizationId),
    inviterIdIdx: index("invitation_inviter_id_idx").on(table.inviterId),
  }),
);

// Impact Circle Business Logic Tables

export const ngo = pgTable(
  "ngo",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    organizationId: text("organization_id").references(() => organization.id), // Link to Better Auth Org
    name: text("name").notNull(),
    description: text("description"),
    status: ngoStatusEnum("status").default("pending").notNull(),
    geoRadius: integer("geo_radius"), // in kilometers
    address: text("address"),
    registrationNumber: text("registration_number"),
    flags: integer("flags").default(0).notNull(),
    auditMeetLink: text("audit_meet_link"),
    auditScheduledAt: timestamp("audit_scheduled_at"),
    documents: jsonb("documents"), // JSON of document metadata/URLs
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("ngo_user_id_idx").on(table.userId),
    orgIdIdx: index("ngo_org_id_idx").on(table.organizationId),
    statusIdx: index("ngo_status_idx").on(table.status),
  }),
);

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isCustom: boolean("is_custom").default(false).notNull(),
    status: categoryStatusEnum("status").default("approved").notNull(), // Default to approved for core
    requestedByNgoId: text("requested_by_ngo_id").references(() => ngo.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("category_status_idx").on(table.status),
    ngoIdIdx: index("category_ngo_id_idx").on(table.requestedByNgoId),
  }),
);

export const polls = pgTable(
  "polls",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    title: text("title").notNull(),
    description: text("description"),
    votesFor: integer("votes_for").default(0).notNull(),
    votesAgainst: integer("votes_against").default(0).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    status: pollStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    catIdIdx: index("poll_cat_id_idx").on(table.categoryId),
    statusIdx: index("poll_status_idx").on(table.status),
  }),
);

export const tenders = pgTable(
  "tenders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    status: tenderStatusEnum("status").default("open").notNull(),
    urgency: urgencyEnum("urgency").default("normal").notNull(),
    latitude: numeric("latitude"),
    longitude: numeric("longitude"),
    location: geography("location"), // PostGIS Geography

    // Resource Pooling
    targetAmount: numeric("target_funds"),
    currentAmount: numeric("current_funds").default("0"),
    targetVolunteers: integer("target_volunteers"),
    currentVolunteers: integer("current_volunteers").default(0),

    claimedById: text("claimed_by_id").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("tender_user_id_idx").on(table.userId),
    catIdIdx: index("tender_cat_id_idx").on(table.categoryId),
    statusIdx: index("tender_status_idx").on(table.status),
    urgencyIdx: index("tender_urgency_idx").on(table.urgency),
    claimedByIdIdx: index("tender_claimed_by_id_idx").on(table.claimedById),
    locationIdx: index("tender_location_gist_idx").using("gist", table.location),
  }),
);

export const beneficiaryUpdates = pgTable(
  "beneficiary_updates",
  {
    id: text("id").primaryKey(),
    tenderId: text("tender_id")
      .notNull()
      .references(() => tenders.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenderIdIdx: index("beneficiary_update_tender_id_idx").on(table.tenderId),
    userIdIdx: index("beneficiary_update_user_id_idx").on(table.userId),
  }),
);

export const drives = pgTable(
  "drives",
  {
    id: text("id").primaryKey(),
    ngoId: text("ngo_id")
      .notNull()
      .references(() => ngo.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    targetFunds: numeric("target_funds"),
    currentFunds: numeric("current_funds").default("0"),
    targetVolunteers: integer("target_volunteers"),
    currentVolunteers: integer("current_volunteers").default(0),
    status: driveStatusEnum("status").default("open").notNull(),
    latitude: numeric("latitude"),
    longitude: numeric("longitude"),
    location: geography("location"), // PostGIS Geography
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    ngoIdIdx: index("drive_ngo_id_idx").on(table.ngoId),
    statusIdx: index("drive_status_idx").on(table.status),
    locationIdx: index("drive_location_gist_idx").using("gist", table.location),
  }),
);

export const driveUpdates = pgTable(
  "drive_updates",
  {
    id: text("id").primaryKey(),
    driveId: text("drive_id")
      .notNull()
      .references(() => drives.id),
    userId: text("user_id").references(() => user.id), // The NGO user who posted it
    content: text("content").notNull(),
    images: jsonb("images"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    driveIdIdx: index("drive_update_drive_id_idx").on(table.driveId),
    userIdIdx: index("drive_update_user_id_idx").on(table.userId),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    tenderId: text("tender_id").references(() => tenders.id),
    driveId: text("drive_id").references(() => drives.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("comment_user_id_idx").on(table.userId),
    tenderIdIdx: index("comment_tender_id_idx").on(table.tenderId),
    driveIdIdx: index("comment_drive_id_idx").on(table.driveId),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id),
    content: varchar("content", { length: 500 }).notNull(), // Heavily limited character DM
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    senderIdIdx: index("message_sender_id_idx").on(table.senderId),
    receiverIdIdx: index("message_receiver_id_idx").on(table.receiverId),
  }),
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  ngo: many(ngo),
  memberships: many(member),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  tenders: many(tenders),
  beneficiaryUpdates: many(beneficiaryUpdates),
  claimedTenders: many(tenders, { relationName: "claimedBy" }),
  comments: many(comments),
}));

export const organizationRelations = relations(organization, ({ one, many }) => ({
  members: many(member),
  invitations: many(invitation),
  ngo: one(ngo, {
    fields: [organization.id],
    references: [ngo.organizationId],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const ngoRelations = relations(ngo, ({ one, many }) => ({
  user: one(user, {
    fields: [ngo.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [ngo.organizationId],
    references: [organization.id],
  }),
  drives: many(drives),
  requestedCategories: many(categories),
}));

export const tenderRelations = relations(tenders, ({ one, many }) => ({
  user: one(user, {
    fields: [tenders.userId],
    references: [user.id],
    relationName: "postedBy",
  }),
  claimedBy: one(user, {
    fields: [tenders.claimedById],
    references: [user.id],
    relationName: "claimedBy",
  }),
  category: one(categories, {
    fields: [tenders.categoryId],
    references: [categories.id],
  }),
  updates: many(beneficiaryUpdates),
  comments: many(comments),
}));

export const pollRelations = relations(polls, ({ one }) => ({
  category: one(categories, {
    fields: [polls.categoryId],
    references: [categories.id],
  }),
}));

export const driveRelations = relations(drives, ({ one, many }) => ({
  ngo: one(ngo, {
    fields: [drives.ngoId],
    references: [ngo.id],
  }),
  updates: many(driveUpdates),
  comments: many(comments),
}));

export const categoryRelations = relations(categories, ({ one, many }) => ({
  tenders: many(tenders),
  requestedBy: one(ngo, {
    fields: [categories.requestedByNgoId],
    references: [ngo.id],
  }),
  poll: one(polls, {
    fields: [categories.id],
    references: [polls.categoryId],
  }),
}));

export const commentRelations = relations(comments, ({ one }) => ({
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
  tender: one(tenders, {
    fields: [comments.tenderId],
    references: [tenders.id],
  }),
  drive: one(drives, {
    fields: [comments.driveId],
    references: [drives.id],
  }),
}));

export const beneficiaryUpdatesRelations = relations(beneficiaryUpdates, ({ one }) => ({
  tender: one(tenders, {
    fields: [beneficiaryUpdates.tenderId],
    references: [tenders.id],
  }),
  user: one(user, {
    fields: [beneficiaryUpdates.userId],
    references: [user.id],
  }),
}));

export const driveUpdatesRelations = relations(driveUpdates, ({ one }) => ({
  drive: one(drives, {
    fields: [driveUpdates.driveId],
    references: [drives.id],
  }),
  user: one(user, {
    fields: [driveUpdates.userId],
    references: [user.id],
  }),
}));
