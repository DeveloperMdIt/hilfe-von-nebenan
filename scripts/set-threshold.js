const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        await client.connect();
        const res = await client.query(`
            INSERT INTO settings (key, value) 
            VALUES ('zip_activation_threshold', '1') 
            ON CONFLICT (key) DO UPDATE SET value = '1'
            RETURNING *;
        `);
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
