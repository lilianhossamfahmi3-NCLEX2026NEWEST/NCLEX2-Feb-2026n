const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');

function walk(dir, results = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) walk(fp, results);
        else if (file.endsWith('.json') && file.includes('v2026')) results.push(fp);
    }
    return results;
}

const files = walk(VAULT_DIR);
console.log(`Auditing ${files.length} v2026 files for logic quality...`);

for (const f of files) {
    try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        let modified = false;

        if (content.itemContext && content.itemContext.tabs) {
            content.itemContext.tabs.forEach(tab => {
                // Check for "Lazy" content
                if (tab.content.includes("Initial assessment confirms findings") ||
                    tab.content.length < 100 ||
                    tab.content.includes("Received report from night shift. Four patients require review")) {

                    console.log(`[LAZY DETECTED] ${path.basename(f)} - Tab: ${tab.title}`);
                    // We will mark these for manual or AI repair in the next step.
                    modified = true;
                }
            });
        }
    } catch (e) { }
}
