import { db } from '../lib/db';
import { users, tasks } from '../lib/schema';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Seeding database...');

    try {
        // 1. Create a sample user (Customer)
        const [customer] = await db.insert(users).values({
            email: 'anna.mueller@example.com',
            fullName: 'Anna Müller',
            role: 'customer',
            trustLevel: 1,
            isVerified: true,
        }).returning();

        console.log('Created customer:', customer.fullName);

        // 2. Create tasks for this customer
        await db.insert(tasks).values([
            {
                customerId: customer.id,
                title: 'Hilfe beim Einkaufen',
                description: 'Ich brauche jemanden, der mir 2 Kisten Wasser und Lebensmittel vom Supermarkt holt.',
                category: 'shopping',
                priceCents: 1500, // 15.00 EUR
                status: 'open',
            },
            {
                customerId: customer.id,
                title: 'Hund ausführen',
                description: 'Suche jemanden, der mit meinem Dackel Waldi eine Stunde im Park spazieren geht.',
                category: 'pets',
                priceCents: 1000, // 10.00 EUR
                status: 'open',
            },
            {
                customerId: customer.id,
                title: 'Regal aufbauen',
                description: 'Habe ein neues IKEA-Regal und brauche Hilfe beim Aufbauen. Werkzeug ist vorhanden.',
                category: 'diy',
                priceCents: 2000, // 20.00 EUR
                status: 'open',
            }
        ]);

        console.log('Seeding finished successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        process.exit(0);
    }
}

main();
