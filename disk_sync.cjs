require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function syncToDisk() {
    console.log("💾 SYNCING CLOUD DATA TO LOCAL DISK...");
    const { data: items, error } = await supabase
        .from('clinical_vault')
        .select('*')
        .ilike('id', 'New-v26-%');

    if (error) return console.error(error);

    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    let count = 0;
    for (const row of items) {
        const itemData = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;
        const type = itemData.type || 'unknown';
        const typeDir = path.join(rootDir, type);
        if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });

        fs.writeFileSync(path.join(typeDir, `${row.id}.json`), JSON.stringify(itemData, null, 2));
        count++;
    }
    console.log(`Successfully synced ${count} items to disk.`);
}

syncToDisk();
