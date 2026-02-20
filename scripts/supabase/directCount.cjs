const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 10 });

async function check() {
    try {
        // Direct count via postgres driver (no PostgREST limit)
        const result = await sql`SELECT count(*) as cnt FROM clinical_vault`;
        console.log('Direct DB count:', result[0].cnt);

        // Type distribution
        const types = await sql`
            SELECT type, count(*) as cnt 
            FROM clinical_vault 
            GROUP BY type 
            ORDER BY cnt DESC
        `;
        console.log('\nType Distribution in DB:');
        types.forEach(t => console.log(`  ${t.type}: ${t.cnt}`));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sql.end();
    }
}

check();
