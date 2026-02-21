const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("Supabase credentials missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCheck() {
    console.log("--- Supabase Cloud Sync Check ---");

    // 1. Fetch Cloud IDs
    const { data: cloudRows, error } = await supabase.from('clinical_vault').select('id');
    if (error) {
        console.error("Cloud Error:", error.message);
        return;
    }
    const cloudIds = new Set(cloudRows.map(r => r.id));
    console.log(`Cloud Items: ${cloudIds.size}`);

    // 2. Fetch Local IDs
    const vaultDir = path.join(__dirname, 'data', 'ai-generated', 'vault');
    function walk(dir, results = []) {
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fp = path.join(dir, file);
            const stat = fs.statSync(fp);
            if (stat.isDirectory()) walk(fp, results);
            else if (file.endsWith('.json')) results.push(fp);
        }
        return results;
    }
    const files = walk(vaultDir);
    const localOnly = [];
    const both = [];

    for (const f of files) {
        try {
            const item = JSON.parse(fs.readFileSync(f, 'utf8'));
            const items = Array.isArray(item) ? item : [item];
            for (const i of items) {
                if (cloudIds.has(i.id)) {
                    both.push(f);
                } else {
                    localOnly.push({ id: i.id, file: path.basename(f) });
                }
            }
        } catch (e) { }
    }

    console.log(`Local Items: ${files.length}`);
    console.log(`Synced (In both): ${both.length}`);
    console.log(`Local Only: ${localOnly.length}`);

    console.log("\nNew 2026 Items (Local Only):");
    const newItems = localOnly.filter(i => i.id.includes('v2026'));
    console.log(`  Count: ${newItems.length}`);

    console.log("\nOther Local Only (Potential Malfunctions?):");
    const olderLocalOnly = localOnly.filter(i => !i.id.includes('v2026'));
    console.log(`  Count: ${olderLocalOnly.length}`);
    if (olderLocalOnly.length > 0) {
        console.log("  Examples:");
        olderLocalOnly.slice(0, 5).forEach(i => console.log(`    - ${i.id} (${i.file})`));
    }
}

syncCheck();
