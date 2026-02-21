const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');

const PATTERNS = [
    'NGN_Trend',
    'SA_BOWTIE_',
    'SCN-BATCH-',
    'a0f3d6b',
    'NGN_',
    'NGN-',
    'NCLEX_NGN',
    'NCLEX_',
    'MISSION-',
    'BATCH-'
];

function walkDir(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, files);
        } else if (entry.name.endsWith('.json')) {
            files.push(fullPath);
        }
    }
    return files;
}

function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).length;
}

function checkTimeFormat(str) {
    if (!str) return true; // Not present
    // Look for times in the string like 08:30 or 14:00
    // If it uses AM/PM it's a fail
    if (/\d{1,2}:\d{2}\s*(AM|PM)/i.test(str)) return false;
    // Check if it has military-ish times
    return true;
}

function diagnoseItem(item, filePath) {
    const issues = [];
    const id = item.id || 'NO_ID';

    // 1. SBAR Check
    const sbarMatch = JSON.stringify(item).match(/SBAR[:\s]+([\s\S]+?)(?=\n\n|Tabs:|$)/i) || [];
    const sbarContent = item.itemContext?.sbar || (sbarMatch[1] || "");

    const wordCount = countWords(sbarContent);
    if (wordCount > 0) {
        if (wordCount < 120 || wordCount > 160) {
            issues.push(`SBAR Word Count: ${wordCount} (Spec: 120-160)`);
        }
        if (!checkTimeFormat(sbarContent)) {
            issues.push(`SBAR Time Format: Uses AM/PM instead of Military`);
        }
    } else if (item.itemContext) {
        issues.push("SBAR Missing or empty in itemContext");
    }

    // 2. Rationale Check
    const rationales = [];
    if (item.options) {
        item.options.forEach((opt, idx) => {
            if (!opt.explanation || opt.explanation.length < 20 || opt.explanation.toLowerCase().includes("incorrect")) {
                rationales.push(`Option ${idx + 1} Rationale weak/generic`);
            }
        });
    }
    if (rationales.length > 0) issues.push(...rationales);

    // 3. Scoring Check
    if (item.type === 'selectAll' || item.type === 'highlight') {
        if (item.scoring?.method !== 'polytomous') {
            issues.push(`Scoring Method: ${item.scoring?.method} (Spec: polytomous for ${item.type})`);
        }
    }

    // 4. Clinical Pearls / Traps
    if (!item.pedagogy?.clinicalPearls || item.pedagogy.clinicalPearls.length === 0) {
        issues.push("Missing Clinical Pearls");
    }
    if (!item.pedagogy?.questionTraps || item.pedagogy.questionTraps.length === 0) {
        issues.push("Missing Question Traps");
    }

    return issues;
}

async function runAudit() {
    const files = walkDir(VAULT_DIR);
    const report = {};

    files.forEach(file => {
        const fileName = path.basename(file);
        const matchesAny = PATTERNS.some(p => fileName.startsWith(p)) || file.includes('trend');

        if (matchesAny) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const data = JSON.parse(content);
                const items = Array.isArray(data) ? data : [data];

                items.forEach(item => {
                    const id = item.id || fileName;
                    const issues = diagnoseItem(item, file);
                    if (issues.length > 0) {
                        report[id] = {
                            file: path.relative(VAULT_DIR, file),
                            issues: issues
                        };
                    }
                });
            } catch (e) {
                report[fileName] = { error: "JSON Parse Error: " + e.message };
            }
        }
    });

    console.log(JSON.stringify(report, null, 2));
}

runAudit();
