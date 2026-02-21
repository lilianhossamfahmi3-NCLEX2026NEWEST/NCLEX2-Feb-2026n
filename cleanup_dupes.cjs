const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');

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

const files = walk(VAULT_DIR);
console.log('Total vault files:', files.length);

// Pass 1: Collect all IDs and find duplicates
const idToFile = new Map();
const toDelete = [];

for (const f of files) {
    try {
        const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
        const items = Array.isArray(raw) ? raw : [raw];
        for (const item of items) {
            if (item.id) {
                if (idToFile.has(item.id)) {
                    // Keep the file with a more specific/longer id or the one with _v2026
                    const existing = idToFile.get(item.id);
                    const existingBase = path.basename(existing);
                    const newBase = path.basename(f);

                    // Prefer v2026 over v1/v3, prefer files with more specific names
                    if (newBase.includes('_v2026') && !existingBase.includes('_v2026')) {
                        toDelete.push(existing);
                        idToFile.set(item.id, f);
                    } else {
                        toDelete.push(f);
                    }
                } else {
                    idToFile.set(item.id, f);
                }
            }
        }
    } catch (e) {
        console.log('JSON parse error, removing:', path.basename(f));
        toDelete.push(f);
    }
}

// Also check for stem-level duplicates within the same type
const stemMap = new Map();
const stemDupes = [];

for (const f of files) {
    if (toDelete.includes(f)) continue; // skip already marked for deletion
    try {
        const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
        const item = Array.isArray(raw) ? raw[0] : raw;
        if (!item) continue;
        const stem = (item.stem || '').substring(0, 100).toLowerCase().trim();
        const type = item.type || 'unknown';
        const key = type + '|' + stem;

        if (stem.length > 20 && stemMap.has(key)) {
            const existingF = stemMap.get(key);
            const existingBase = path.basename(existingF);
            const newBase = path.basename(f);

            if (newBase.includes('_v2026') && !existingBase.includes('_v2026')) {
                stemDupes.push(existingF);
                stemMap.set(key, f);
            } else {
                stemDupes.push(f);
            }
        } else if (stem.length > 20) {
            stemMap.set(key, f);
        }
    } catch (e) { /* skip */ }
}

const allToDelete = [...new Set([...toDelete, ...stemDupes])];
console.log('\nID duplicates to remove:', toDelete.length);
console.log('Stem duplicates to remove:', stemDupes.length);
console.log('Total unique files to remove:', allToDelete.length);

for (const f of allToDelete) {
    console.log('  DELETING:', path.basename(f));
    fs.unlinkSync(f);
}

// Recount
const remaining = walk(VAULT_DIR);
console.log('\nRemaining vault files:', remaining.length);
