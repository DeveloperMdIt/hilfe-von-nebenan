ALTER TABLE "tasks" ADD COLUMN "stripe_payment_intent_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_account_id" varchar(255);