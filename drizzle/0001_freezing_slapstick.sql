ALTER TABLE "users" ADD COLUMN "accepted_terms_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "accepted_privacy_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "terms_version" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ip_address" varchar(45);