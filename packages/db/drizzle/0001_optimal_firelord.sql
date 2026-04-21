ALTER TYPE "public"."tender_status" ADD VALUE 'claimed' BEFORE 'fulfilled';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "claimed_by_id" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_claimed_by_id_user_id_fk" FOREIGN KEY ("claimed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;