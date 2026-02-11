
const postgres = require('postgres');

async function check() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    const output = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    console.log('Tables in public schema:', output);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

check();
