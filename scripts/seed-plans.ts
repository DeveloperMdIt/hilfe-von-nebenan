
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { subscriptionPlans } from '../lib/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seedPlans() {
    console.log('Seeding subscription plans...');

    try {
        const existingPlans = await db.select().from(subscriptionPlans);

        if (existingPlans.length === 0) {
            console.log('No plans found. Inserting default plans...');
            await db.insert(subscriptionPlans).values([
                {
                    name: 'Basis',
                    priceMonthlyCents: 0,
                    priceYearlyCents: 0,
                    commissionRate: 15,
                    features: 'Kostenlos starten,15% Servicegebühr,Basis-Support',
                    isActive: true
                },
                {
                    name: 'Pro',
                    priceMonthlyCents: 299, // 2.99 EUR
                    priceYearlyCents: 2999, // 29.99 EUR
                    commissionRate: 10,
                    features: 'Nur 10% Servicegebühr,Bevorzugter Support,Pro-Abzeichen im Profil',
                    isActive: true
                }
            ]);
            console.log('Default plans created successfully.');
        } else {
            console.log('Plans already exist. Skipping seed.');
        }
    } catch (error) {
        console.error('Error seeding plans:', error);
    } finally {
        await client.end();
    }
}

seedPlans();
