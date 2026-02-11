
import { db } from '../lib/db';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
    console.log('⏳ Running migrations...');
    try {
        await migrate(db, { migrationsFolder: 'drizzle' });
        console.log('✅ Migrations completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

main();
