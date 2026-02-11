
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../lib/schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Hardcoded for debugging
const connectionString = 'postgresql://postgres:password@127.0.0.1:5177/hilfevonnebenan';

if (!connectionString) {
    console.error('Connection string is empty');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
    console.log('Checking for admin user...');
    const adminEmail = 'admin@admin.com';

    try {
        const existingUser = await db.select().from(users).where(eq(users.email, adminEmail));

        if (existingUser.length === 0) {
            console.log('Admin user not found. Creating...');
            await db.insert(users).values({
                email: adminEmail,
                password: 'password', // Password check is currently disabled in loginUser, but good to have
                role: 'admin',
                fullName: 'Admin User',
                isVerified: true,
            });
            console.log('Admin user created successfully.');
            console.log('Email: admin@admin.com');
        } else {
            console.log('Admin user exists.');
            const user = existingUser[0];
            if (user.role !== 'admin') {
                console.log('Updating role to admin...');
                await db.update(users).set({ role: 'admin' }).where(eq(users.email, adminEmail));
                console.log('User role updated to admin.');
            } else {
                console.log('User already has admin role.');
            }
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await client.end();
    }
}

seed();
