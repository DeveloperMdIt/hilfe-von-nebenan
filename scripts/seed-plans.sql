-- Seed Subscription Plans
-- Idempotent insert: checks if plan with name exists before inserting

INSERT INTO "subscription_plans" ("name", "price_monthly_cents", "price_yearly_cents", "commission_rate", "features", "is_active")
SELECT 'Basis', 0, 0, 15, 'Kostenlos starten,15% Servicegebühr,Basis-Support', true
WHERE NOT EXISTS (SELECT 1 FROM "subscription_plans" WHERE "name" = 'Basis');

INSERT INTO "subscription_plans" ("name", "price_monthly_cents", "price_yearly_cents", "commission_rate", "features", "is_active")
SELECT 'Pro', 299, 2999, 10, 'Nur 10% Servicegebühr,Bevorzugter Support,Pro-Abzeichen im Profil', true
WHERE NOT EXISTS (SELECT 1 FROM "subscription_plans" WHERE "name" = 'Pro');
