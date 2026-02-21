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

async function pushNewItems() {
    console.log("--- Pushing New 2026 Items to Cloud Vault ---");

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

    const files = walk(vaultDir).filter(f => f.includes('v2026'));
    console.log(`Found ${files.length} candidate files to push.`);

    let successCount = 0;
    let failCount = 0;

    for (const f of files) {
        try {
            const content = JSON.parse(fs.readFileSync(f, 'utf8'));
            const items = Array.isArray(content) ? content : [content];

            for (const item of items) {
                const { error } = await supabase
                    .from('clinical_vault')
                    .upsert({
                        id: item.id,
                        item_data: item,
                        type: item.type || 'standalone'
                    });

                if (error) {
                    console.error(`  Failed ${item.id}:`, error.message);
                    failCount++;
                } else {
                    successCount++;
                    if (successCount % 10 === 0) console.log(`  Pushed ${successCount} items...`);
                }
            }
        } catch (e) {
            console.error(`  Error parsing ${f}:`, e.message);
        }
    }

    console.log(`\nPush Complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failures: ${failCount}`);
}

pushNewItems();
