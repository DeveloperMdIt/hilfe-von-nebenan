const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    console.log('--- 🧪 TESTING DB WRITE ---');
    const testEmail = 'michael.deja@md-it-solutions.de';
    const testStreet = 'Teststraße ' + Math.floor(Math.random() * 100);

    try {
        console.log(`Attempting to update street for ${testEmail} to "${testStreet}"...`);

        const result = await sql`
            UPDATE users 
            SET street = ${testStreet}
            WHERE email = ${testEmail}
            RETURNING id, email, street;
        `;

        if (result && result.length > 0) {
            console.log('✅ Update SUCCESSFUL!');
            console.log('Returned:', result[0]);
        } else {
            console.error('❌ Update FAILED. No rows returned (User not found?).');
        }

    } catch (e) {
        console.error('❌ Update FAILED with error:', e);
    } finally {
        await sql.end();
    }
}

main();
