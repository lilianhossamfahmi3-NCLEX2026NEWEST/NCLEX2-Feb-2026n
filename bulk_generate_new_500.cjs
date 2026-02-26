require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// ═══════════════════════════════════════════════════════════
//  Configuration
// ═══════════════════════════════════════════════════════════
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
    'Cardiovascular: Acute MI & Heart Failure',
    'Respiratory: Respiratory Failure & ARDS',
    'Neurological: Stroke & Brain Injury',
    'Renal: AKI & Electrolyte Crisis',
    'Endocrine: DKA/HHS Management',
    'GI: Liver Failure & Pancreatitis',
    'Infection Control: Sepsis & MDR Infections',
    'Maternal: High-Risk Pregnancy Safety',
    'Pediatric: Critical Care & Safety',
    'Safety: Medication Errors & Ethics'
];

const ALLOWED_TYPES = [
    'multipleChoice', 'selectAll', 'clozeDropdown', 'dragAndDropCloze',
    'bowtie', 'trend', 'priorityAction', 'matrixMatch', 'highlight', 'selectN'
];

// ═══════════════════════════════════════════════════════════
//  Type-Specific Schema Fragments
// ═══════════════════════════════════════════════════════════
const SCHEMA_FRAGMENTS = {
    multipleChoice: `"options": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}], "correctOptionId": "a"`,
    selectAll: `"options": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."},{"id":"e","text":"..."},{"id":"f","text":"..."}], "correctOptionIds": ["a","c","e"]`,
    clozeDropdown: `"template": "The client is at risk for {{blank1}} as evidenced by {{blank2}}.", "blanks": [{"id":"blank1","options":["Option A","Option B"],"correctOption":"Option A"},{"id":"blank2","options":["Option X","Option Y"],"correctOption":"Option X"}]`,
    bowtie: `"causes": [{"id":"c1","text":"..."},{"id":"c2","text":"..."}], "correctCauseIds": ["c1"], "conditions": [{"id":"cond1","text":"..."},{"id":"cond2","text":"..."}], "correctConditionId": "cond1", "interventions": [{"id":"i1","text":"..."},{"id":"i2","text":"..."}], "correctInterventionIds": ["i1"]`
};

// ═══════════════════════════════════════════════════════════
//  Prompt Engineering
// ═══════════════════════════════════════════════════════════
function buildGenerationPrompt(topic, type) {
    const frag = SCHEMA_FRAGMENTS[type] || '';
    return `You are a Lead NGN Psychometrician (2026 Edition).
TASK: Generate ONE ultra-high-fidelity NGN standalone item.

ID: "New-v26-<TIMESTAMP>-<RAND>"
TYPE: ${type}
TOPIC: ${topic}
SBAR: Exactly 120-160 words (Situation, Background, Assessment, Recommendation), military time HH:mm.
TABS: Array of 7 objects [sbar, vitals, labs, physicalExam, radiology, carePlan, mar]. Content MUST be HTML strings.
RATIONALE: Includes correct, incorrect, clinicalPearls (array), questionTrap ({trap, howToOvercome}), mnemonic ({title, expansion}).
SPECIFIC SCHEMA FOR ${type}: ${frag}

Return ONLY PURE JSON. NO markdown.`;
}

// ═══════════════════════════════════════════════════════════
//  Normalization & Validation
// ═══════════════════════════════════════════════════════════
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
    return item;
}

// ═══════════════════════════════════════════════════════════
//  AI Call (Legacy Support)
// ═══════════════════════════════════════════════════════════
function callAI(prompt) {
    return new Promise((resolve) => {
        const key = getNextKey();
        const data = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.85 }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const text = parsed.candidates[0].content.parts[0].text;
                    resolve(JSON.parse(text.replace(/```json|```/g, '').trim()));
                } catch (e) {
                    resolve(null);
                }
            });
        });

        req.on('error', () => resolve(null));
        req.write(data);
        req.end();
    });
}

// ═══════════════════════════════════════════════════════════
//  Main Task
// ═══════════════════════════════════════════════════════════
async function main() {
    console.log("🚀 GOD-MODE GEN STARTING...");
    const TARGET = 500;
    let saved = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    while (saved < TARGET) {
        process.stdout.write(`\rProgress: ${saved}/${TARGET} `);
        const batch = [];
        for (let i = 0; i < 4; i++) {
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            const type = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)];
            batch.push((async () => {
                let item = await callAI(buildGenerationPrompt(topic, type));
                item = normalizeItem(item);
                if (!item) return null;

                let report = validateItem(item);
                if (report.score >= 85) {
                    item.sentinelStatus = 'healed_v2026_v14_perfect';
                    const typeDir = path.join(rootDir, item.type);
                    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
                    fs.writeFileSync(path.join(typeDir, `${item.id}.json`), JSON.stringify(item, null, 2));

                    await supabase.from('clinical_vault').upsert({
                        id: item.id, type: item.type, item_data: item,
                        topic_tags: item.pedagogy?.topicTags || [],
                        nclex_category: item.pedagogy?.nclexCategory || null,
                        difficulty: item.pedagogy?.difficulty || 5
                    }, { onConflict: 'id' });
                    return item.id;
                }
                return null;
            })());
        }
        const results = await Promise.all(batch);
        saved += results.filter(Boolean).length;
        await new Promise(r => setTimeout(r, 2000));
    }
}

main();
