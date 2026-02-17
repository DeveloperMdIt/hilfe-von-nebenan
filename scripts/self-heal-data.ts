
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db';
import { users, zipCoordinates } from '../lib/schema';
import { eq, isNotNull, notInArray } from 'drizzle-orm';

async function selfHeal() {
    console.log('--- Proactive Self-Healing ---');

    // 1. Find all unique ZIPs used by users
    const userZipsRes = await db.select({ zip: users.zipCode }).from(users).where(isNotNull(users.zipCode));
    const uniqueZips = [...new Set(userZipsRes.map(u => u.zip!))];

    console.log(`Checking ${uniqueZips.length} unique ZIP codes...`);

    const missing = [];
    for (const zip of uniqueZips) {
        const coord = await db.select().from(zipCoordinates).where(eq(zipCoordinates.zipCode, zip)).limit(1);
        if (coord.length === 0) {
            missing.push(zip);
        }
    }

    if (missing.length === 0) {
        console.log('✅ All active ZIP codes have coordinates.');
    } else {
        console.log(`❌ Missing coordinates for: ${missing.join(', ')}`);
        console.log('TIP: Add these manually or use a geocoding service.');
    }

    process.exit(0);
}

selfHeal();
