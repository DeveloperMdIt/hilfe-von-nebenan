const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
}

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

async function main() {
    console.log('⏳ Running migrations...');
    try {
        // Look for migrations in the 'drizzle' folder relative to CWD
        await migrate(db, { migrationsFolder: 'drizzle' });
        console.log('✅ Migrations completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

main();
