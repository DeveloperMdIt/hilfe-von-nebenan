BEGIN
  -- Check if 'street_address' exists AND 'street' does NOT exist before renaming
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='users' AND column_name='street_address') 
     AND NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='users' AND column_name='street') THEN
    ALTER TABLE "users" RENAME COLUMN "street_address" TO "street";
  -- Otherwise, if 'street' does not exist, add it
  ELSIF NOT EXISTS(SELECT * FROM information_schema.columns WHERE table_name='users' AND column_name='street') THEN
    ALTER TABLE "users" ADD COLUMN "street" text;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "house_number" varchar(20);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" varchar(100);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" varchar(100) DEFAULT 'Deutschland';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "iban" varchar(50);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bic" varchar(20);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_holder_name" text;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "bank_details";