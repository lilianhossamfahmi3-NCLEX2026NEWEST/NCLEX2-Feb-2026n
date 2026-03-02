const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie_v3_mapped');

if (!fs.existsSync(TARGET_DIR)) {
    console.error("❌ Target directory not found.");
    process.exit(1);
}

const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));
console.log(`🔍 Found ${files.length} items to refactor...`);

const now = new Date().toISOString();
let count = 0;

files.forEach(file => {
    const filePath = path.join(TARGET_DIR, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const item = JSON.parse(content);

        // 1. Prefix ID if not already prefixed
        if (item.id && !item.id.startsWith('NGN-V3-')) {
            const oldId = item.id;
            item.id = `NGN-V3-${oldId}`;

            // 2. Update Dates to today (for UI sorting)
            item.createdAt = now;
            item.updatedAt = now;
            item.lastFixed = now;

            // 3. Ensure stem has the bracket prefix (just in case)
            if (item.stem && !item.stem.startsWith('[V3-MAPPED-2026]')) {
                item.stem = '[V3-MAPPED-2026] ' + item.stem;
            }

            // 4. Save with new filename based on new ID
            const newFileName = `${item.id.replace(/[^a-zA-Z0-9]/g, '_')}_v3.json`;
            const newPath = path.join(TARGET_DIR, newFileName);

            fs.writeFileSync(newPath, JSON.stringify(item, null, 2));

            // 5. Delete old file if the name changed
            if (newFileName !== file) {
                fs.unlinkSync(filePath);
            }

            count++;
            console.log(`   ✅ Refactored: ${oldId} -> ${item.id}`);
        } else {
            // Even if already prefixed, ensure the date is current for the user
            item.createdAt = now;
            item.updatedAt = now;
            fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
            console.log(`   ⏭️  Updated date for: ${item.id}`);
        }
    } catch (err) {
        console.error(`   ❌ Failed ${file}: ${err.message}`);
    }
});

console.log(`\n🏁 Done! Refactored ${count} items and updated dates for all.`);
