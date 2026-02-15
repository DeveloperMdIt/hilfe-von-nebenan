const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    console.log('--- 🔍 INSPECTING USERS TABLE COLUMNS ---');
    try {
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY column_name;
        `;
        
        console.table(columns);
        
        const requiredColumns = ['street', 'house_number', 'city', 'zip_code', 'country', 'reset_password_token'];
        const missingColumns = requiredColumns.filter(req => !columns.find(c => c.column_name === req));
        
        if (missingColumns.length > 0) {
            console.error('\n❌ MISSING COLUMNS:', missingColumns.join(', '));
            console.log('The migration 0005 or 0006 probably did not run correctly.');
        } else {
            console.log('\n✅ All expected columns seem to be present.');
            console.log('Checking recent values for a user...');
            const lastUpdated = await sql`SELECT email, street, city FROM users ORDER BY updated_at DESC LIMIT 1`;
            console.log('Last updated user sample:', lastUpdated);
        }

    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await sql.end();
    }
}

main();
