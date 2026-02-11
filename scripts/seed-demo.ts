
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, tasks } from '../lib/schema';
import * as dotenv from 'dotenv';
import { eq, and } from 'drizzle-orm';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seedDemoData() {
    console.log('Seeding demo data...');

    try {
        // 1. Ensure Demo Customer exists
        const demoEmail = 'anna.mueller@example.com';
        let customerId: string;

        const existingUser = await db.select().from(users).where(eq(users.email, demoEmail));

        if (existingUser.length === 0) {
            console.log('Creating demo user...');
            const [newUser] = await db.insert(users).values({
                email: demoEmail,
                fullName: 'Anna Müller',
                role: 'customer',
                trustLevel: 1,
                isVerified: true,
                password: 'password', // Optional: set a password so you can login as her
            }).returning();
            customerId = newUser.id;
        } else {
            console.log('Demo user already exists.');
            customerId = existingUser[0].id;
        }

        // 2. Insert Tasks (Idempotent-ish check)
        const demoTasks = [
            {
                title: 'Hilfe beim Einkaufen',
                description: 'Ich brauche jemanden, der mir 2 Kisten Wasser und Lebensmittel vom Supermarkt holt.',
                category: 'shopping',
                priceCents: 1500,
            },
            {
                title: 'Hund ausführen',
                description: 'Suche jemanden, der mit meinem Dackel Waldi eine Stunde im Park spazieren geht.',
                category: 'pets',
                priceCents: 1000,
            },
            {
                title: 'Regal aufbauen',
                description: 'Habe ein neues IKEA-Regal und brauche Hilfe beim Aufbauen. Werkzeug ist vorhanden.',
                category: 'diy',
                priceCents: 2000,
            }
        ];

        for (const task of demoTasks) {
            // Check if this specific task already exists for this user
            const existingTask = await db.select().from(tasks).where(
                and(
                    eq(tasks.customerId, customerId),
                    eq(tasks.title, task.title)
                )
            );

            if (existingTask.length === 0) {
                console.log(`Creating task: ${task.title}`);
                await db.insert(tasks).values({
                    customerId,
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    priceCents: task.priceCents,
                    status: 'open',
                });
            } else {
                console.log(`Task already exists: ${task.title}`);
            }
        }

        console.log('Demo data seeding finished.');

    } catch (error) {
        console.error('Error seeding demo data:', error);
    } finally {
        await client.end();
    }
}

seedDemoData();
