const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
const LOG_FILE = path.join(__dirname, 'deep_heal_log.json');

const API_KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) API_KEYS.push(key);
}

let keyIdx = 0;
async function heal() {
    const files = walkDir(VAULT_DIR);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            const items = Array.isArray(data) ? data : [data];
            let mod = false;
            for (const item of items) {
                if (item.sentinelStatus === 'healed_v2026') continue;

                const model = 'gemini-2.0-flash'; // Confirmed in model list
                const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEYS[keyIdx++ % API_KEYS.length]}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "REPAIR NCLEX JSON to 2026 Spec: SBAR, military time, rationales, clinicalPearls.\n\n" + JSON.stringify(item) }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                });
                if (!res.ok) throw new Error(await res.text());
                const json = await res.json();
                const text = json.candidates[0].content.parts[0].text;
                const cleaned = text.replace(/```json|```/g, '').trim();
                const repaired = JSON.parse(cleaned);

                repaired.sentinelStatus = 'healed_v2026';
                Object.assign(item, repaired);
                mod = true;
                await new Promise(r => setTimeout(r, 2000));
            }
            if (mod) {
                fs.writeFileSync(file, JSON.stringify(data, null, 2));
                console.log("✅ Fixed " + path.relative(VAULT_DIR, file));
            }
        } catch (e) {
            console.error("❌ Error " + file + ": " + e.message);
        }
    }
}

function walkDir(d, f = []) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walkDir(p, f);
        else if (e.name.endsWith('.json')) f.push(p);
    });
    return f;
}
heal();
