require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
//  Prompt Engineering (NGN 2026 "God Mode")
// ═══════════════════════════════════════════════════════════
function buildGenerationPrompt(topic, type) {
    return `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
TASK: Generate ONE ultra-high-fidelity NGN standalone item.

STRICT STANDARDS (NGN_2026_SPEC):
1. ID: "New-v26-<TIMESTAMP>-<RAND>"
2. TYPE: ${type}
3. TOPIC: ${topic}
4. SBAR: Exactly 120-160 words. Structure: Situation, Background, Assessment, Recommendation. Use military time (HH:mm).
5. TABS: MUST include 7 specific tabs: [sbar, vitals, labs, physicalExam, radiology, carePlan, mar].
   - "content" in each tab MUST be an HTML string (tables for labs/vitals).
   - "vitals" must have 3+ time-points.
   - "labs" must have Result | Unit | Reference Range.
6. RATIONALE: Deep clinical analysis. sub-fields: correct, incorrect, clinicalPearls (array), questionTrap ({trap, howToOvercome}), mnemonic ({title, expansion}).
7. OPTIONS: JSON format matching ${type} schema.

EXAMPLE SCHEMA (Partial):
{
  "id": "...", "type": "${type}", "stem": "...",
  "itemContext": {
    "patient": { "name": "...", "age": 0, "gender": "...", "allergies": [] },
    "sbar": "...",
    "tabs": [
      { "id": "labs", "title": "Lab Diagnostics", "content": "<table>...</table>" },
      { "id": "vitals", "title": "Vital Signs", "content": "<table>...</table>" }
    ]
  },
  "pedagogy": { "bloomLevel": "analyze", "cjmmStep": "takeAction", "nclexCategory": "...", "difficulty": 5, "topicTags": ["${topic}"] },
  "rationale": { ... }
}

Failsafe Logic for ${type}:
${getFailsafe(type)}

Return ONLY PURE JSON. NO markdown. NO explanations.`;
}

function getFailsafe(type) {
    switch (type) {
        case 'clozeDropdown': return 'Include "template" (string with {{blank1}}) and "blanks" (array of {id, options, correctOption}).';
        case 'bowtie': return 'Include "causes" (4-6), "correctCauseIds" (2), "conditions" (3-5), "correctConditionId" (1), "interventions" (4-6), "correctInterventionIds" (2).';
        case 'trend': return 'Include "timePoints" (array), "rows" (array), "options" (array), "correctMatrix" (object mapping row-time to option).';
        case 'matrixMatch': return 'Include "rows", "columns", "correctMatches" (object mapping row id to column id).';
        case 'highlight': return 'Include "passage" and "correctSpanIndices".';
        default: return '';
    }
}

// ═══════════════════════════════════════════════════════════
//  Normalization & Validation
// ═══════════════════════════════════════════════════════════
function normalizeItem(item) {
    if (!item || typeof item !== 'object') return null;

    // Fix tabs if they are an object instead of an array
    if (item.itemContext && item.itemContext.tabs && !Array.isArray(item.itemContext.tabs)) {
        const tabsObj = item.itemContext.tabs;
        const tabsArr = [];
        for (const [id, data] of Object.entries(tabsObj)) {
            tabsArr.push({
                id,
                title: id.charAt(0).toUpperCase() + id.slice(1),
                content: typeof data === 'string' ? data : (data.content || JSON.stringify(data))
            });
        }
        item.itemContext.tabs = tabsArr;
    }

    // Ensure SBAR is a string
    if (item.itemContext && item.itemContext.sbar && typeof item.itemContext.sbar === 'object') {
        const s = item.itemContext.sbar;
        item.itemContext.sbar = `S: ${s.situation}\nB: ${s.background}\nA: ${s.assessment}\nR: ${s.recommendation}`;
    }

    // Force numeric difficulty
    if (item.pedagogy) {
        item.pedagogy.difficulty = parseInt(item.pedagogy.difficulty) || 4;
    }

    return item;
}

const { validateItem } = require('./validation/sentinel_validator.cjs');

// ═══════════════════════════════════════════════════════════
//  AI Call
// ═══════════════════════════════════════════════════════════
async function callAI(prompt) {
    const key = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85 }
    };

    try {
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!resp.ok) return null;
        const data = await resp.json();
        let text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
//  Main Batch Loop
// ═══════════════════════════════════════════════════════════
async function main() {
    console.log("🚀 STARTING GOD-MODE GEN (500 ITEMS)");
    const TARGET = 500;
    let saved = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_v2026_perfect');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    while (saved < TARGET) {
        console.log(`\n📦 Batch Progress: ${saved} / ${TARGET}`);
        const tasks = [];
        for (let i = 0; i < 4; i++) {
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            const type = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)];

            tasks.push((async () => {
                let raw = await callAI(buildGenerationPrompt(topic, type));
                let item = normalizeItem(raw);
                if (!item) return null;

                let report = validateItem(item);

                // Active Repair Pass
                if (report.score < 95) {
                    const repairPrompt = `NGN REPAIR: SCORE ${report.score}%. ERRORS: ${report.diags.join(', ')}. 
                    Fix and return PERFECT ${type} JSON: ${JSON.stringify(item)}`;
                    let healedRaw = await callAI(repairPrompt);
                    if (healedRaw) {
                        item = normalizeItem(healedRaw);
                        report = validateItem(item);
                    }
                }

                if (report.score >= 90) {
                    item.sentinelStatus = 'healed_v2026_v13_qi100';
                    const typeDir = path.join(rootDir, item.type);
                    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
                    fs.writeFileSync(path.join(typeDir, `${item.id}.json`), JSON.stringify(item, null, 2));

                    // Cloud Upsert
                    try {
                        await supabase.from('clinical_vault').upsert({
                            id: item.id, type: item.type, item_data: item,
                            topic_tags: item.pedagogy?.topicTags || [],
                            nclex_category: item.pedagogy?.nclexCategory || null,
                            difficulty: item.pedagogy?.difficulty || 5
                        }, { onConflict: 'id' });
                    } catch (e) { }
                    return item.id;
                }
                return null;
            })());
        }

        const results = await Promise.all(tasks);
        saved += results.filter(Boolean).length;
        await new Promise(r => setTimeout(r, 2000));
    }
}

main();
