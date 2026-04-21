CREATE TABLE "beneficiary_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"tender_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"votes_for" integer DEFAULT 0 NOT NULL,
	"votes_against" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "requested_by_ngo_id" text;--> statement-breakpoint
ALTER TABLE "drive_updates" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "ngo" ADD COLUMN "audit_meet_link" text;--> statement-breakpoint
ALTER TABLE "ngo" ADD COLUMN "audit_scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "target_funds" numeric;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "current_funds" numeric DEFAULT '0';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "target_volunteers" integer;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "current_volunteers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "beneficiary_updates" ADD CONSTRAINT "beneficiary_updates_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beneficiary_updates" ADD CONSTRAINT "beneficiary_updates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_requested_by_ngo_id_ngo_id_fk" FOREIGN KEY ("requested_by_ngo_id") REFERENCES "public"."ngo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_updates" ADD CONSTRAINT "drive_updates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;