const fs = require('fs');
const path = require('path');

const QUARANTINE_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault', 'quarantine');
const OUTPUT_JSON = path.join(__dirname, 'public', 'data', 'quarantineItems.json');

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

console.log('--- NCLEX Quarantine Indexer ---');
const files = walk(QUARANTINE_DIR);
console.log(`Scanning quarantine of ${files.length} files...`);

const items = files.map((f, index) => {
    try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        const batch = Array.isArray(content) ? content : [content];
        return batch.filter(item => item && item.id && (item.type || item.itemType));
    } catch (e) {
        return [];
    }
}).flat();

console.log(`-------------------------------------------`);
console.log(`TOTAL QUARANTINE ITEMS: ${items.length}`);
console.log(`Writing index to: ${OUTPUT_JSON}`);
console.log(`-------------------------------------------`);

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(items, null, 2), 'utf8');
console.log('Quarantine Indexing Complete.');
