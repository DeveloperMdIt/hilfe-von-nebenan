-- Erweiterungen für Sicherheit und Geodaten
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Nutzer-Tabelle (Kunden & Helfer)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'helper', 'admin'
    trust_level INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    stripe_account_id TEXT, -- Für Helfer (Auszahlung)
    stripe_customer_id TEXT, -- Für Kunden (Zahlung)
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Aufträge (Tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    helper_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'authorized', 'completed', 'paid'
    price_cents INT NOT NULL,
    application_fee_cents INT NOT NULL,
    task_location GEOGRAPHY(POINT, 4326),
    stripe_intent_id TEXT, -- Verknüpfung zur Stripe-Zahlung
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index für die Umkreissuche
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks USING GIST(task_location);

-- Add column if it doesn't exist (idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='forbidden_keywords_triggered') THEN
        ALTER TABLE tasks ADD COLUMN forbidden_keywords_triggered BOOLEAN DEFAULT false;
    END IF;
END
$$;
