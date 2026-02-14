
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
    console.log('Seeding realistic demo data...');

    try {
        const demoUsers = [
            {
                email: 'anna.mueller@example.com',
                fullName: 'Anna Müller',
                role: 'customer',
                zipCode: '36318',
                city: 'Schwalmtal',
                street: 'Bahnhofstraße',
                houseNumber: '1',
                tasks: [
                    {
                        title: 'Hilfe bei Gartenpflege',
                        description: 'Mein Rasen müsste gemäht werden und die Hecke braucht einen Schnitt. Werkzeug ist vorhanden.',
                        category: 'Garten',
                        priceCents: 3500,
                    }
                ]
            },
            {
                email: 'bernd.schmidt@example.com',
                fullName: 'Bernd Schmidt',
                role: 'customer',
                zipCode: '10115',
                city: 'Berlin',
                street: 'Chausseestraße',
                houseNumber: '12',
                tasks: [
                    {
                        title: 'PC-Einrichtung & WLAN',
                        description: 'Ich habe einen neuen Laptop und brauche Hilfe bei der Installation von Programmen und der WLAN-Konfiguration.',
                        category: 'Technik',
                        priceCents: 4500,
                    }
                ]
            },
            {
                email: 'claudia.weber@example.com',
                fullName: 'Claudia Weber',
                role: 'customer',
                zipCode: '20095',
                city: 'Hamburg',
                street: 'Mönckebergstraße',
                houseNumber: '5',
                tasks: [
                    {
                        title: 'Hundesitting am Wochenende',
                        description: 'Suche jemanden, der am Samstag auf meinen Golden Retriever aufpasst und zwei große Runden dreht.',
                        category: 'Haustiere',
                        priceCents: 3000,
                    }
                ]
            },
            {
                email: 'dieter.kunze@example.com',
                fullName: 'Dieter Kunze',
                role: 'customer',
                zipCode: '80331',
                city: 'München',
                street: 'Neuhauser Straße',
                houseNumber: '21',
                tasks: [
                    {
                        title: 'Einkaufshilfe für Senioren',
                        description: 'Ich schaffe es nicht mehr, schwere Getränkekisten zu tragen. Suche Hilfe für den wöchentlichen Einkauf.',
                        category: 'Einkauf',
                        priceCents: 2000,
                    }
                ]
            },
            {
                email: 'erika.petersen@example.com',
                fullName: 'Erika Petersen',
                role: 'customer',
                zipCode: '50667',
                city: 'Köln',
                street: 'Hohe Straße',
                houseNumber: '44',
                tasks: [
                    {
                        title: 'Lampen montieren',
                        description: 'Habe drei neue Deckenlampen gekauft und traue mich nicht an die Elektrik. Leiter ist vorhanden.',
                        category: 'Handwerk',
                        priceCents: 4000,
                    }
                ]
            }
        ];

        for (const uData of demoUsers) {
            let userId: string;
            const existingUser = await db.select().from(users).where(eq(users.email, uData.email));

            if (existingUser.length === 0) {
                console.log(`Creating user: ${uData.fullName}`);
                const [newUser] = await db.insert(users).values({
                    email: uData.email,
                    fullName: uData.fullName,
                    role: uData.role as any,
                    zipCode: uData.zipCode,
                    city: uData.city,
                    street: uData.street,
                    houseNumber: uData.houseNumber,
                    isVerified: true,
                    password: 'password',
                }).returning();
                userId = newUser.id;
            } else {
                userId = existingUser[0].id;
                // Update city/zip if needed
                await db.update(users).set({
                    city: uData.city,
                    zipCode: uData.zipCode,
                    fullName: uData.fullName
                }).where(eq(users.id, userId));
            }

            for (const task of uData.tasks) {
                const existingTask = await db.select().from(tasks).where(
                    and(
                        eq(tasks.customerId, userId),
                        eq(tasks.title, task.title)
                    )
                );

                if (existingTask.length === 0) {
                    console.log(`Creating task: ${task.title}`);
                    await db.insert(tasks).values({
                        customerId: userId,
                        title: task.title,
                        description: task.description,
                        category: task.category,
                        priceCents: task.priceCents,
                        status: 'open',
                    });
                }
            }
        }

        console.log('Realistic demo data seeding finished.');

    } catch (error) {
        console.error('Error seeding demo data:', error);
    } finally {
        await client.end();
    }
}

seedDemoData();
