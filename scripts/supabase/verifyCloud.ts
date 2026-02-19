
import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!);

async function verify() {
    try {
        const count = await sql`SELECT count(*) FROM clinical_vault`;
        console.log(`--- CLOUD DATABASE VERIFIED ---`);
        console.log(`Total Clinical Items Online: ${count[0].count}`);

        const sample = await sql`SELECT id, type, nclex_category FROM clinical_vault LIMIT 3`;
        console.log(`Sample Items:`, sample);
    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

verify();
