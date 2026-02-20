const postgres = require('postgres');
require('dotenv').config();
const sql = postgres(process.env.DATABASE_URL);

async function fix() {
    await sql`UPDATE clinical_vault SET type = 'multipleChoice' WHERE type IN ('multiple_choice', 'multiple-choice')`;
    console.log('Fixed variant type names');

    const final = await sql`SELECT type, count(*) as cnt FROM clinical_vault GROUP BY type ORDER BY cnt DESC`;
    console.log('\nFinal type distribution:');
    final.forEach(t => console.log(`  ${t.type}: ${t.cnt}`));

    console.log(`\nTotal: ${final.reduce((s, t) => s + Number(t.cnt), 0)}`);
    await sql.end();
}
fix();
