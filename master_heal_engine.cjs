require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ═══════════════════════════════════════════════════════════
//  Configuration & API Keys
// ═══════════════════════════════════════════════════════════
console.log("Initializing Supabase...");
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const API_KEYS = [
    process.env.VITE_GEMINI_API_KEY_1, process.env.VITE_GEMINI_API_KEY_2,
    process.env.VITE_GEMINI_API_KEY_3, process.env.VITE_GEMINI_API_KEY_4,
    process.env.VITE_GEMINI_API_KEY_5, process.env.VITE_GEMINI_API_KEY_6,
    process.env.VITE_GEMINI_API_KEY_7, process.env.VITE_GEMINI_API_KEY_8,
    process.env.VITE_GEMINI_API_KEY_9, process.env.VITE_GEMINI_API_KEY_10,
    process.env.VITE_GEMINI_API_KEY_11, process.env.VITE_GEMINI_API_KEY_12,
    process.env.VITE_GEMINI_API_KEY_13, process.env.VITE_GEMINI_API_KEY_14
].filter(Boolean);

console.log(`Loaded ${API_KEYS.length} API keys.`);

let keyIndex = 0;
function getNextKey() {
    const key = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    return key;
}

const NGN_2026_PROMPT_TEMPLATE = `
You are a Lead NGN Psychometrician (2026 Edition).
TASK: REPAIR the following item to meet 100% SentinelQA compliance.
Return ONLY PURE JSON matching the MasterItem interface.
{{ITEM_JSON}}
`;

function repairItemLocally(item) {
    const repaired = JSON.parse(JSON.stringify(item));
    let changes = 0;
    if (repaired.itemType && !repaired.type) { repaired.type = repaired.itemType; changes++; }
    if (!repaired.pedagogy) {
        repaired.pedagogy = {
            bloomLevel: (repaired.cognitiveLevel || 'apply').toLowerCase(),
            cjmmStep: repaired.clinicalProcess || 'analyzeCues',
            nclexCategory: repaired.clientNeed || 'Physiological Adaptation',
            topicTags: repaired.topicTags || ['Uncategorized'],
            difficulty: parseInt(repaired.difficulty) || 3
        };
        changes++;
    }
    return { repaired, changesCount: changes };
}

async function runDeepAIHeal(item) {
    const apiKey = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = NGN_2026_PROMPT_TEMPLATE.replace('{{ITEM_JSON}}', JSON.stringify(item, null, 2));

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!resp.ok) return null;

        const data = await resp.json();
        const rawJson = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
        const repaired = JSON.parse(rawJson);
        repaired.sentinelStatus = 'healed_v2026_v11';
        return repaired;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log("🚀 STARTING HEAL...");
    const vaultDir = path.join(__dirname, 'data', 'ai-generated', 'vault');

    // Manual small walk
    const files = [];
    const dirs = [vaultDir];
    while (dirs.length > 0) {
        const d = dirs.pop();
        if (!fs.existsSync(d)) continue;
        const list = fs.readdirSync(d);
        for (const f of list) {
            const p = path.join(d, f);
            if (fs.statSync(p).isDirectory()) dirs.push(p);
            else if (f.endsWith('.json')) files.push(p);
        }
    }

    console.log(`Found ${files.length} files.`);
    let aiCount = 0;

    for (const file of files) {
        // Full process run requested by USER

        const raw = fs.readFileSync(file, 'utf8');
        let content = JSON.parse(raw);
        let items = Array.isArray(content) ? content : [content];
        let fileChanged = false;

        for (let j = 0; j < items.length; j++) {
            const item = items[j];
            if (!item || !item.id) continue;

            // Deterministic
            const { repaired: detItem, changesCount } = repairItemLocally(item);
            if (changesCount > 0) { items[j] = detItem; fileChanged = true; }

            // AI
            if (!item.sentinelStatus?.includes('healed_v2026_v11')) {
                console.log(`Healing ${item.id}...`);
                const healed = await runDeepAIHeal(items[j]);
                if (healed) { items[j] = healed; fileChanged = true; aiCount++; }
            }
        }

        if (fileChanged) {
            fs.writeFileSync(file, JSON.stringify(Array.isArray(content) ? items : items[0], null, 2));
            // Sync
            for (const it of items) {
                await supabase.from('clinical_vault').upsert({
                    id: it.id, type: it.type || 'unknown', item_data: it,
                    topic_tags: it.pedagogy?.topicTags || [],
                    nclex_category: it.pedagogy?.nclexCategory || null,
                    difficulty: it.pedagogy?.difficulty || 3
                }, { onConflict: 'id' });
            }
        }
    }
    console.log(`Done. AI items healed: ${aiCount}`);
}

main();
