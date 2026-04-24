CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('active', 'passed', 'rejected');--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."poll_status";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "status" SET DATA TYPE "public"."poll_status" USING "status"::"public"."poll_status";--> statement-breakpoint
ALTER TABLE "drives" ADD COLUMN "location" "geography(Point, 4326)";--> statement-breakpoint
ALTER TABLE "ngo" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "location" "geography(Point, 4326)";--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_org_id_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_inviter_id_idx" ON "invitation" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "member_org_id_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_user_id_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "ngo" ADD CONSTRAINT "ngo_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "beneficiary_update_tender_id_idx" ON "beneficiary_updates" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "beneficiary_update_user_id_idx" ON "beneficiary_updates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "category_status_idx" ON "categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "category_ngo_id_idx" ON "categories" USING btree ("requested_by_ngo_id");--> statement-breakpoint
CREATE INDEX "comment_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comment_tender_id_idx" ON "comments" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "comment_drive_id_idx" ON "comments" USING btree ("drive_id");--> statement-breakpoint
CREATE INDEX "drive_update_drive_id_idx" ON "drive_updates" USING btree ("drive_id");--> statement-breakpoint
CREATE INDEX "drive_update_user_id_idx" ON "drive_updates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "drive_ngo_id_idx" ON "drives" USING btree ("ngo_id");--> statement-breakpoint
CREATE INDEX "drive_status_idx" ON "drives" USING btree ("status");--> statement-breakpoint
CREATE INDEX "drive_location_gist_idx" ON "drives" USING gist ("location");--> statement-breakpoint
CREATE INDEX "message_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_receiver_id_idx" ON "messages" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "ngo_user_id_idx" ON "ngo" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ngo_org_id_idx" ON "ngo" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ngo_status_idx" ON "ngo" USING btree ("status");--> statement-breakpoint
CREATE INDEX "poll_cat_id_idx" ON "polls" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "poll_status_idx" ON "polls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tender_user_id_idx" ON "tenders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tender_cat_id_idx" ON "tenders" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "tender_status_idx" ON "tenders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tender_urgency_idx" ON "tenders" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "tender_claimed_by_id_idx" ON "tenders" USING btree ("claimed_by_id");--> statement-breakpoint
CREATE INDEX "tender_location_gist_idx" ON "tenders" USING gist ("location");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_trust_score_idx" ON "user" USING btree ("trust_score");