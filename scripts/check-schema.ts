import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function check() {
    try {
        const userId = '38765f3d-12ac-43d6-a70f-1c5a37f5c977';
        console.log('--- RUNNING DRIZZLE SELECT ---');
        const userResult = await db.select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            role: users.role,
            zipCode: users.zipCode,
            isVerified: users.isVerified,
            // New columns check
            resetPasswordToken: users.resetPasswordToken,
            street: users.street,
        }).from(users).where(eq(users.id, userId as string));

        console.log(JSON.stringify(userResult, null, 2));
        console.log('------------------------------');
    } catch (e) {
        console.error('Drizzle select failed:', e);
    }
    process.exit(0);
}

check();
