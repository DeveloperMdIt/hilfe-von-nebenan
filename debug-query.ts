import { db } from './lib/db';
import { users } from './lib/schema';
import { eq } from 'drizzle-orm';

async function debugQuery() {
    const testId = 'e3d6ce54-29b5-4290-b504-50ce133ef2f1';
    console.log(`Testing query for ID: ${testId}`);

    try {
        const result = await db.select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
        }).from(users).where(eq(users.id, testId));

        console.log('Query success:', result);
    } catch (e: any) {
        console.error('Query failed!');
        console.error('Error name:', e.name);
        console.error('Error message:', e.message);
        console.error('Full error:', JSON.stringify(e, null, 2));
        if (e.cause) console.error('Cause:', e.cause);
    }
    process.exit(0);
}

debugQuery();
