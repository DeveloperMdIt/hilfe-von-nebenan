import { db } from '../lib/db';
import { users } from '../lib/schema';

async function main() {
    console.log('Creating Admin User...');

    try {
        const [admin] = await db.insert(users).values({
            email: 'admin@hilfe-von-nebenan.de',
            fullName: 'Admin User',
            role: 'admin',
            trustLevel: 10,
            isVerified: true,
        }).returning();

        console.log('Created Admin:', admin.email);
    } catch (err: any) {
        if (err.code === '23505') {
            console.log('Admin user already exists.');
        } else {
            console.error('Failed to create admin:', err);
        }
    }
    process.exit(0);
}

main();
