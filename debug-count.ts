import { db } from './lib/db';
import { users } from './lib/schema';
import { sql } from 'drizzle-orm';

async function debugCount() {
    console.log('Testing count query...');
    try {
        const result = await db.execute(sql`SELECT count(*) FROM ${users}`);
        console.log('Raw result:', result);
        console.log('First item:', result[0]);
    } catch (e) {
        console.error('Count query failed:', e);
    }
    process.exit(0);
}

debugCount();
