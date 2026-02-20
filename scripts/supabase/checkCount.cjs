const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 10 });

async function check() {
    try {
        const result = await sql`SELECT count(*) as cnt FROM clinical_vault`;
        console.log('Items in Supabase cloud:', result[0].cnt);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sql.end();
    }
}

check();
