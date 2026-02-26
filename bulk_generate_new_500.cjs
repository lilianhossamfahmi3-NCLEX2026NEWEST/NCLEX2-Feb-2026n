require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

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

let keyIndex = 0;
function getNextKey() {
    const key = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    return key;
}

const TOPICS = [
    'Cardiovascular: Acute MI & Heart Failure', 'Respiratory: ARDS & Ventilation',
    'Neurological: Stroke & ICP', 'Renal: AKI & Electrolytes',
    'Endocrine: DKA/HHS', 'GI: Sepsis & Liver Failure',
    'Maternal: PHH & Preeclampsia', 'Pediatric: Congenital & Safety'
];

const ALLOWED_TYPES = [
    'multipleChoice', 'selectAll', 'clozeDropdown', 'dragAndDropCloze',
    'bowtie', 'trend', 'priorityAction', 'matrixMatch', 'highlight', 'selectN'
];

const { validateItem } = require('./validation/sentinel_validator.cjs');

function normalizeItem(item) {
    if (!item || typeof item !== 'object') return null;
    if (item.itemContext && item.itemContext.tabs && !Array.isArray(item.itemContext.tabs)) {
        item.itemContext.tabs = Object.entries(item.itemContext.tabs).map(([id, d]) => ({
            id, title: id.charAt(0).toUpperCase() + id.slice(1),
            content: typeof d === 'string' ? d : (d.content || JSON.stringify(d))
        }));
    }
    if (item.itemContext && typeof item.itemContext.sbar === 'object') {
        const s = item.itemContext.sbar;
        item.itemContext.sbar = `S: ${s.situation}\nB: ${s.background}\nA: ${s.assessment}\nR: ${s.recommendation}`;
    }
    if (!item.id?.startsWith('New-')) {
        item.id = `New-v26-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    return item;
}

function callAI(prompt) {
    return new Promise((resolve) => {
        const key = getNextKey();
        const data = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8 } });
        const options = {
            hostname: 'generativelanguage.googleapis.com', port: 443,
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const text = parsed.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
                    resolve(JSON.parse(text));
                } catch (e) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log("🚀 STARTING SYNC GEN (500 ITEMS)");
    const TARGET = 500;
    let saved = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    while (saved < TARGET) {
        process.stdout.write(`\rProgress: ${saved}/${TARGET} `);
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const type = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)];

        // 1. GENERATE
        let prompt = `Lead NGN Psychometrician: Generate PERFECT ${type} JSON for ${topic}. 
        Tabs: array of 7. SBAR: string 130 words. Rationale: deep. ID starts with "New-v26-". NO markdown.`;
        let item = normalizeItem(await callAI(prompt));
        if (!item) continue;

        // 2. REPAIR
        let report = validateItem(item);
        if (report.score < 90) {
            let repairPrompt = `FIX THIS NGN ITEM. Score ${report.score}%. Defects: ${report.diags.join('; ')}. 
            Return ONLY fixed JSON: ${JSON.stringify(item)}`;
            item = normalizeItem(await callAI(repairPrompt)) || item;
            report = validateItem(item);
        }

        // 3. PERSIST
        if (report.score >= 80) { // Slightly lower gate, but aiming for 90+
            fs.writeFileSync(path.join(rootDir, `${item.id}.json`), JSON.stringify(item, null, 2));
            await supabase.from('clinical_vault').upsert({
                id: item.id, type: item.type, item_data: item,
                topic_tags: item.pedagogy?.topicTags || [],
                nclex_category: item.pedagogy?.nclexCategory || null,
                difficulty: item.pedagogy?.difficulty || 5
            }, { onConflict: 'id' });
            saved++;
        }
    }
}
main();
