import { db } from '../lib/db';
import { tasks, users, zipCoordinates } from '../lib/schema';
import { eq, isNotNull } from 'drizzle-orm';

async function diagnose() {
    try {
        console.log('--- DIAGNOSIS ---');

        // 1. Total tasks
        const allTasks = await db.select().from(tasks);
        console.log(`Total tasks: ${allTasks.length}`);

        // 2. Tasks with users who have a ZIP code
        const tasksWithUserZip = await db.select({
            taskId: tasks.id,
            zipCode: users.zipCode
        })
            .from(tasks)
            .leftJoin(users, eq(tasks.customerId, users.id))
            .where(isNotNull(users.zipCode));

        console.log(`Tasks with user ZIP: ${tasksWithUserZip.length}`);
        if (tasksWithUserZip.length > 0) {
            console.log('ZIP Codes found in tasks:', tasksWithUserZip.map(t => t.zipCode));
        }

        // 3. Check zip_coordinates for these ZIPs
        if (tasksWithUserZip.length > 0) {
            const zips = [...new Set(tasksWithUserZip.map(t => t.zipCode!))];
            for (const zip of zips) {
                const coord = await db.select().from(zipCoordinates).where(eq(zipCoordinates.zipCode, zip)).limit(1);
                console.log(`ZIP ${zip}: ${coord.length > 0 ? 'COORDINATES FOUND' : 'COORDINATES MISSING'}`);
            }
        }

        // 4. Overall zip_coordinates count
        const totalCoords = await db.select().from(zipCoordinates);
        console.log(`Total ZIP coordinates in DB: ${totalCoords.length}`);

        console.log('-----------------');
    } catch (e) {
        console.error('Diagnosis failed:', e);
    }
    process.exit(0);
}

diagnose();
