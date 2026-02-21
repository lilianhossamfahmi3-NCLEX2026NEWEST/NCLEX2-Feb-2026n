const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
const LOG_FILE = path.join(__dirname, 'deep_heal_log.json');

console.log("🚀 Sentinel Deep Heal Script Starting (v8-Robust)...");

const API_KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) API_KEYS.push(key);
}

if (API_KEYS.length === 0) {
    console.error("❌ No API Keys found.");
    process.exit(1);
}

let keyIdx = 0;
function getNextKey() {
    return API_KEYS[keyIdx++ % API_KEYS.length];
}

const NGN_2026_SPEC_SUMMARY = "SBAR (120-160 words, military time), +/- scoring for SATA/Highlight, deep pathophysiology rationales, clinicalPearls.";

async function deepRepairItem(item, apiKey) {
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `
REPAIR this NCLEX JSON to 2026 Spec: ${NGN_2026_SPEC_SUMMARY}
ITEM: ${JSON.stringify(item)}

IMPORTANT: Return ONLY the repaired JSON. No markdown blocks. No thinking. No preamble.
`;

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 }
            })
        });

        if (!resp.ok) throw new Error(`API Error ${resp.status}`);
        const data = await resp.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : text;
        return JSON.parse(cleaned);
    } catch (err) {
        throw err;
    }
}

function walkDir(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walkDir(p, files);
        else if (e.name.endsWith('.json')) files.push(p);
    });
    return files;
}

async function runHeal() {
    const allFiles = walkDir(VAULT_DIR);
    let results = { repaired: 0, failed: 0, skipped: 0 };

    for (let i = 0; i < allFiles.length; i++) {
        const filePath = allFiles[i];
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (!content.trim()) continue;
            let data = JSON.parse(content);
            const isArray = Array.isArray(data);
            let items = isArray ? data : [data];
            let mod = false;

            for (let item of items) {
                if (item.sentinelStatus === 'healed_v2026_v8') continue;
                console.log(`[${i + 1}/${allFiles.length}] Healing ${item.id || path.basename(filePath)}`);
                const repaired = await deepRepairItem(item, getNextKey());
                repaired.sentinelStatus = 'healed_v2026_v8';
                Object.assign(item, repaired);
                mod = true;
                await new Promise(r => setTimeout(r, 2000));
            }

            if (mod) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                results.repaired++;
                console.log(`   ✅ Success`);
            } else {
                results.skipped++;
            }
        } catch (err) {
            results.failed++;
            console.error(`   ❌ Failed: ${err.message}`);
        }
    }
    fs.writeFileSync(LOG_FILE, JSON.stringify(results, null, 2));
    console.log("🏁 Done.");
}

runHeal().catch(console.error);
