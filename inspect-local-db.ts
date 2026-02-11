
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, tasks } from './lib/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function inspect() {
    const allUsers = await db.select().from(users);
    const allTasks = await db.select().from(tasks);

    console.log('--- USERS ---');
    console.table(allUsers.map(u => ({ id: u.id, name: u.fullName, email: u.email, role: u.role })));

    console.log('--- TASKS ---');
    console.table(allTasks.map(t => ({ id: t.id, title: t.title, status: t.status })));

    await client.end();
}

inspect();
