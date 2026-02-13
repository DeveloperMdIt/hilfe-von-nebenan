CREATE TABLE "archived_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"task_id" uuid,
	"archived_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"is_approved" boolean DEFAULT false,
	"suggested_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_tags" (
	"user_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "zip_code_activations" (
	"zip_code" varchar(10) PRIMARY KEY NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "commission_cents" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "payout_cents" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "zip_code" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "psttg_last_warning_year" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "street_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tax_id" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_details" text;--> statement-breakpoint
ALTER TABLE "archived_conversations" ADD CONSTRAINT "archived_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_conversations" ADD CONSTRAINT "archived_conversations_partner_id_users_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_conversations" ADD CONSTRAINT "archived_conversations_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_suggested_by_id_users_id_fk" FOREIGN KEY ("suggested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;