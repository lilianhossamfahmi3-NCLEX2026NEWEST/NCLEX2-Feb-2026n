const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
const OUTPUT_JSON = path.join(__dirname, 'public', 'data', 'vaultItems.json');

function walk(dir, results = []) {
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

console.log('Indexing vault...');
const files = walk(VAULT_DIR);
console.log(`Found ${files.length} files. Reading contents...`);

const items = files.map((f, index) => {
    if (index % 100 === 0) console.log(`Processed ${index}/${files.length} items...`);
    try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (Array.isArray(content)) return content;
        return [content];
    } catch (e) {
        return [];
    }
}).flat().filter(i => i && i.id); // Filter out invalid items!

console.log(`Total VALID items collected: ${items.length}. Writing to ${OUTPUT_JSON}...`);

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(items, null, 4), 'utf8');
console.log('Successfully indexed ' + items.length + ' items to vaultItems.json');
