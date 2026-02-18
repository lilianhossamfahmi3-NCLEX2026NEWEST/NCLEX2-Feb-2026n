const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
const OUTPUT_FILE = path.join(__dirname, 'data', 'vaultItems.ts');

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
        console.error(`Error reading ${f}:`, e.message);
        return [];
    }
}).flat();

console.log(`Total items collected: ${items.length}. Generating ${OUTPUT_FILE}...`);

const tsContent = `import { MasterItem } from '../types/master';

export const VAULT_ITEMS: MasterItem[] = ${JSON.stringify(items, null, 4)};
`;

fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
console.log('Successfully indexed ' + items.length + ' items.');
