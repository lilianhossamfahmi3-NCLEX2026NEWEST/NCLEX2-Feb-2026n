const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeMalfunctions() {
    console.log("--- Purging Local Malfunctions (Matching Cloud Set) ---");

    // 1. Fetch Cloud IDs
    const { data: cloudRows, error } = await supabase.from('clinical_vault').select('id');
    if (error) {
        console.error("Cloud Error:", error.message);
        return;
    }
    const cloudIds = new Set(cloudRows.map(r => r.id));
    console.log(`Master Cloud Set: ${cloudIds.size} items.`);

    // 2. Walk Local Vault
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
    let deletedCount = 0;

    for (const f of files) {
        // PROTECT new 2026 items and any file specifically mentioning v2026 in filename
        if (f.includes('v2026')) continue;

        try {
            const content = JSON.parse(fs.readFileSync(f, 'utf8'));
            const items = Array.isArray(content) ? content : [content];

            // If ANY item in this file is NOT in cloud, we suspect it might be a malfunction 
            // OR if the entire file is unknown to the master cloud set.
            const shouldKeep = items.some(item => cloudIds.has(item.id));

            if (!shouldKeep) {
                fs.unlinkSync(f);
                deletedCount++;
                if (deletedCount % 50 === 0) console.log(`  Deleted ${deletedCount} local-only files...`);
            }
        } catch (e) { }
    }

    console.log(`\nPurge Complete!`);
    console.log(`  Local files removed: ${deletedCount}`);
    console.log(`  Local files remaining: ${walk(vaultDir).length}`);
}

purgeMalfunctions();
