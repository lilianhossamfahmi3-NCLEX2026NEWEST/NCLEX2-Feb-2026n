
import postgres from 'postgres';
import 'dotenv/config';

console.log("Testing connection...");
const sql = postgres(process.env.DATABASE_URL!);

async function test() {
    try {
        const result = await sql`SELECT version()`;
        console.log("CONNETION SUCCESSFUL:", result[0].version);
    } catch (e) {
        console.error("CONNECTION FAILED:", e);
    } finally {
        await sql.end();
    }
}

test();
