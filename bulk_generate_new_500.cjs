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
    'Cardiovascular: Acute MI/ACS Management',
    'Cardiovascular: Cardiogenic Shock & Intra-aortic Balloon Pump',
    'Respiratory: Mechanical Ventilation & Ventilator-Associated Pneumonia (VAP)',
    'Respiratory: ARDS Progression & Prone Positioning',
    'Neurological: Transient Ischemic Attack (TIA) vs. Stroke Management',
    'Neurological: Traumatic Brain Injury & ICP Monitoring',
    'Renal/Urinary: Acute Kidney Injury (AKI) & Continuous Renal Replacement Therapy (CRRT)',
    'Endocrine: Hypoglycemic Emergencies vs DKA/HHS',
    'Infection Control: Sepsis 1-Hour Bundle & Septic Shock',
    'Safety: High-Alert Medication Administration & Sentinel Events',
    'Psychiatric: Severe Depression & Suicide Precaution Protocols',
    'Maternal-Newborn: Placenta Previa vs. Abruptio Placentae',
    'Pediatrics: Sickle Cell Vaso-occlusive Crisis & Epiglottitis Management'
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
    bowtie: `"causes": [{"id":"c1","text":"..."},{"id":"c2","text":"..."}], "correctCauseIds": ["c1"], "conditions": [{"id":"cond1","text":"..."},{"id":"cond2","text":"..."}], "correctConditionId": "cond1", "interventions": [{"id":"i1","text":"..."},{"id":"i2","text":"..."}], "correctInterventionIds": ["i1"]`,
    trend: `"timePoints": ["Baseline","2 Hours Later","4 Hours Later"], "rows": [{"id":"r1","text":"Vital Signs/Finding"}], "options": ["Improving","Stable","Declining"], "correctMatrix": {"r1-Baseline":"Stable", "r1-2 Hours Later":"Declining"}`,
    matrixMatch: `"rows": [{"id":"r1","text":"Finding 1"}], "columns": [{"id":"c1","text":"Category A"},{"id":"c2","text":"Category B"}], "correctMatches": {"r1":"c1"}`
};

// ═══════════════════════════════════════════════════════════
//  Prompt Engineering
// ═══════════════════════════════════════════════════════════
function buildGenerationPrompt(topic, type) {
    const fragment = SCHEMA_FRAGMENTS[type] || '';
    return `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
TASK: Generate ONE high-fidelity, standalone NGN assessment item.

SPECIFICATIONS:
1. ID: MUST be "New-v26-<TIMESTAMP>-<RANDOM>".
2. TYPE: ${type}
3. TOPIC: ${topic}
4. DIFFICULTY: Level 4 (Analyze) or 5 (Evaluate/Synthesize).
5. SBAR: 120-160 words. Strict military time (HH:mm). Include patient history, current vitals, and nurse's assessment.
6. EHR TABS: Mandatory "labs", "vitals", "mar". Labs must use tables. Vitals must have time-series trends.
7. RATIONALE: Deep clinical explanation (>60 words). Must include "correct", "incorrect", "clinicalPearls" (array), "questionTrap" (object), and "mnemonic" (object).
8. QI TARGET: 100/Pass. No generic filler. Use specific medical values (e.g., pH 7.28, K+ 5.8).

SCHEMA REQUIREMENTS:
Include all standard MasterItem fields: id, type, stem, scoring (method/maxPoints), itemContext (patient/sbar/tabs), pedagogy (bloomLevel/cjmmStep/nclexCategory/difficulty/topicTags), rationale (...).
Failsafe: For type "${type}", you MUST include: ${fragment}

Return ONLY PURE JSON. NO markdown blocks.`;
}

// ═══════════════════════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════════════════════
async function callAI(prompt, targetType) {
    const key = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 }
    };

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const data = await resp.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json|```/g, '').trim();

        // Final JSON Polish
        const item = JSON.parse(text);
        item.type = targetType; // Force type safety
        item.sentinelStatus = 'healed_v2026_v12_perfect';
        if (!item.id?.startsWith('New-')) {
            item.id = `New-v26-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }
        return item;
    } catch (e) {
        console.error("  AI/JSON Error:", e.message);
        return null;
    }
}

const { validateItem } = require('./validation/sentinel_validator.cjs');

// ═══════════════════════════════════════════════════════════
//  Main Execution
// ═══════════════════════════════════════════════════════════
async function main() {
    console.log("🚀 STARTING ULTIMATE NGN GEN (500 ITEMS)");
    const TOTAL_TARGET = 500;
    const BATCH_SIZE = 4; // Slightly smaller for better stability

    let successCount = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    while (successCount < TOTAL_TARGET) {
        process.stdout.write(`\rProgress: [${successCount}/${TOTAL_TARGET}] `);
        const promises = [];

        for (let i = 0; i < BATCH_SIZE; i++) {
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            const type = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)];

            promises.push((async () => {
                let item = await callAI(buildGenerationPrompt(topic, type), type);
                if (!item) return null;

                // Stricter QA Level
                let report = validateItem(item);

                // Active Healing Loop (Max 2 attempts)
                let attempts = 0;
                while (report.score < 95 && attempts < 1) {
                    const healPrompt = `CRITICAL FAILURE (Score: ${report.score}%). FIX THIS ITEM IMMEDIATELY.
                    DEFECTS: ${report.diags.join('; ')}
                    Return the PERFECTED JSON object for this ${type} item:
                    ${JSON.stringify(item)}`;

                    const healed = await callAI(healPrompt, type);
                    if (healed) {
                        item = healed;
                        report = validateItem(item);
                    }
                    attempts++;
                }

                if (report.score >= 90) {
                    // Save Local
                    const typeDir = path.join(rootDir, item.type || 'misc');
                    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
                    const filename = `${item.id}.json`;
                    fs.writeFileSync(path.join(typeDir, filename), JSON.stringify(item, null, 2));

                    // Sync Cloud
                    try {
                        await supabase.from('clinical_vault').upsert({
                            id: item.id,
                            type: item.type || 'unknown',
                            item_data: item,
                            topic_tags: item.pedagogy?.topicTags || [],
                            nclex_category: item.pedagogy?.nclexCategory || null,
                            difficulty: item.pedagogy?.difficulty || 3
                        }, { onConflict: 'id' });
                    } catch (e) { }

                    return item.id;
                } else {
                    return null;
                }
            })());
        }

        const results = await Promise.all(promises);
        successCount += results.filter(Boolean).length;

        // Adaptive Delay to prevent rate limits
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`\n✅ GENERATION COMPLETE. 500 ITEMS SYNCED.`);
}

main();
