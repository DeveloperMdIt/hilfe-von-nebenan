ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_account_id" varchar(255);