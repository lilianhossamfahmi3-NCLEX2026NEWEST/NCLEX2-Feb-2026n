const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function audit() {
    // 1. Get total count
    const { count, error: countErr } = await supabase
        .from('clinical_vault')
        .select('*', { count: 'exact', head: true });

    console.log('Total items in DB:', count);
    if (countErr) console.error('Count error:', countErr);

    // 2. Default query (what the app currently does)
    const { data: defaultData, error: defErr } = await supabase
        .from('clinical_vault')
        .select('id');

    console.log('Default query returns:', defaultData?.length, 'items');

    // 3. Get type breakdown
    const { data: allItems } = await supabase
        .from('clinical_vault')
        .select('id, type')
        .range(0, 1999); // Get up to 2000

    console.log('With range(0,1999):', allItems?.length, 'items');

    // Type distribution
    const typeCounts = {};
    allItems?.forEach(item => {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });
    console.log('\nType Distribution:');
    Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

    // 4. Count local files
    const fs = require('fs');
    const path = require('path');
    const VAULT_ROOT = path.join(__dirname, '..', '..', 'data', 'ai-generated', 'vault');

    let localFileCount = 0;
    let localItemCount = 0;
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name.endsWith('.json')) {
                localFileCount++;
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const items = Array.isArray(content) ? content : [content];
                    localItemCount += items.filter(i => i.id).length;
                } catch { }
            }
        }
    }
    walk(VAULT_ROOT);
    console.log(`\nLocal: ${localFileCount} files, ${localItemCount} items with IDs`);

    // 5. Find local items NOT in cloud
    const cloudIds = new Set(allItems?.map(i => i.id));
    let missingCount = 0;
    const missingByType = {};
    function walkMissing(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkMissing(fullPath);
            } else if (entry.name.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    const items = Array.isArray(content) ? content : [content];
                    items.filter(i => i.id).forEach(item => {
                        if (!cloudIds.has(item.id)) {
                            missingCount++;
                            const t = item.type || 'unknown';
                            missingByType[t] = (missingByType[t] || 0) + 1;
                        }
                    });
                } catch { }
            }
        }
    }
    walkMissing(VAULT_ROOT);
    console.log(`\nMissing from cloud: ${missingCount} items`);
    if (Object.keys(missingByType).length > 0) {
        console.log('Missing by type:');
        Object.entries(missingByType)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
    }
}

audit();
