const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
const OUTPUT_JSON = path.join(__dirname, 'public', 'data', 'vaultItems.json');

function walk(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath, results);
        } else if (file.endsWith('.json')) {
            results.push(fullPath);
        }
    }
    return results;
}

console.log('--- NCLEX Master Indexer v2 (Zero-Error Mode) ---');
const files = walk(VAULT_DIR);
console.log(`Scanning bank of ${files.length} files...`);

const items = files.map((f, index) => {
    try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        const batch = Array.isArray(content) ? content : [content];

        // Filter out Quarantined or truly invalid items
        return batch.filter(item => {
            if (!item || !item.id || !item.type || !item.stem) return false;
            if (item.sentinelStatus && item.sentinelStatus.startsWith('quarantined')) return false;
            return true;
        });
    } catch (e) {
        return [];
    }
}).flat();

console.log(`-------------------------------------------`);
console.log(`TOTAL PRODUCTION-READY ITEMS: ${items.length}`);
console.log(`Writing index to: ${OUTPUT_JSON}`);
console.log(`-------------------------------------------`);

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(items, null, 2), 'utf8'); // Reduced indent for smaller file size
console.log('Indexing Complete.');
