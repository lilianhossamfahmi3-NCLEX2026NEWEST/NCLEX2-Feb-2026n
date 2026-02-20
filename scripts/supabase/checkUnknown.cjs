const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 10 });

async function checkUnknown() {
    // Get a few unknown items and check their item_data for actual type
    const rows = await sql`
        SELECT id, item_data 
        FROM clinical_vault 
        WHERE type = 'unknown' 
        LIMIT 5
    `;

    rows.forEach((row, i) => {
        let parsed;
        try {
            parsed = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;
        } catch { parsed = row.item_data; }

        console.log(`\n--- Item ${i + 1}: ${row.id} ---`);
        console.log('Has item_data:', !!parsed);
        console.log('item.type:', parsed?.type);
        console.log('item.itemType:', parsed?.itemType);
        console.log('item.format:', parsed?.format);
        console.log('Keys:', Object.keys(parsed || {}).slice(0, 15).join(', '));
    });

    // Count how many unknowns actually have a type in their item_data
    const allUnknown = await sql`
        SELECT id, item_data 
        FROM clinical_vault 
        WHERE type = 'unknown'
    `;

    let canFix = 0;
    const fixableTypes = {};
    allUnknown.forEach(row => {
        let parsed;
        try {
            parsed = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;
        } catch { return; }

        const actualType = parsed?.type || parsed?.itemType;
        if (actualType && actualType !== 'unknown') {
            canFix++;
            fixableTypes[actualType] = (fixableTypes[actualType] || 0) + 1;
        }
    });

    console.log(`\n\n${canFix} out of ${allUnknown.length} unknown items have a fixable type in item_data`);
    if (Object.keys(fixableTypes).length > 0) {
        console.log('Fixable types:', fixableTypes);
    }

    await sql.end();
}

checkUnknown();
