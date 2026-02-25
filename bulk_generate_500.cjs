/**
 * NCLEX-RN NGN 2026 — SENTINEL-GUARDED Bulk Generator (Mission 50)
 * Generates 50 items with inline SentinelQA v2.0 validation + AI auto-heal.
 * Uses gemini-2.0-flash with strict MasterItem schema enforcement.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// ─── API Key Rotator ───
const KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`];
    if (key) KEYS.push(key);
}
if (KEYS.length === 0) { console.error('No API keys found'); process.exit(1); }
let keyIdx = 0;
function nextKey() { const k = KEYS[keyIdx]; keyIdx = (keyIdx + 1) % KEYS.length; return k; }

// ─── Topics & Types ───
const TOPICS = [
    'Acute Coronary Syndrome / MI', 'Sepsis & MODS', 'DKA/HHS Management',
    'Increased ICP / Cushing Triad', 'ARDS', 'Mechanical Ventilation Safety',
    'Heparin/Warfarin Anticoagulation', 'Renal Failure & Hyperkalemia',
    'Preeclampsia/Eclampsia (HELLP)', 'Psychiatric Crisis / Suicide Risk',
    'Burn Resuscitation (Parkland)', 'Post-Op Compartment Syndrome',
    'Tension Pneumothorax / Chest Tubes', 'Hemodynamics (A-Line/CVP)',
    'Tuberculosis Isolation & Treatment', 'C. Diff Infection Control'
];

const TYPES = [
    'multipleChoice', 'selectAll', 'orderedResponse',
    'matrixMatch', 'clozeDropdown', 'dragAndDropCloze', 'bowtie',
    'trend', 'highlight', 'priorityAction'
];

// ─── Strict MasterItem Schema Prompt ───
function buildPrompt(topic, itemType, seed) {
    return `You are a Lead NGN Psychometrician (NCLEX-RN 2026).
Generate ONE standalone NGN item as PURE JSON (no markdown, no wrapping array).

TOPIC: ${topic}
TYPE: ${itemType}
DIFFICULTY: 4-5
SEED: ${seed}

THE JSON MUST USE THIS EXACT SCHEMA (MasterItem interface):
{
  "id": "unique-string-id",
  "type": "${itemType}",
  "stem": "The clinical question stem as a string (NOT an object)",
  "scoring": { "method": "polytomous"|"dichotomous"|"linkage", "maxPoints": <number> },
  "rationale": {
    "correct": "Deep pathophysiology explanation for correct answer (50+ words)",
    "incorrect": "Why each wrong option is wrong (50+ words)",
    "clinicalPearls": ["Pearl 1 (30+ chars)", "Pearl 2", "Pearl 3"],
    "questionTrap": { "trap": "Common student mistake", "howToOvercome": "Strategy to avoid it" },
    "mnemonic": { "title": "SHORT_MNEMONIC", "expansion": "What each letter stands for" },
    "reviewUnits": [{ "title": "Topic", "content": "Educational content" }]
  },
  "pedagogy": {
    "bloomLevel": "analyze"|"apply"|"evaluate",
    "cjmmStep": "recognizeCues"|"analyzeCues"|"prioritizeHypotheses"|"generateSolutions"|"takeAction"|"evaluateOutcomes",
    "nclexCategory": "one of the 8 NCLEX categories",
    "difficulty": 4,
    "topicTags": ["tag1", "tag2"]
  },
  "itemContext": {
    "patient": { "name": "FirstName LastName", "age": 55, "gender": "Female", "allergies": ["Penicillin"], "iso": "standard" },
    "sbar": "120-160 word SBAR note with military time HH:mm format",
    "tabs": [
      { "id": "sbar", "title": "Nurses Notes", "content": "..." },
      { "id": "labs", "title": "Lab Diagnostics", "content": "Na 138 mEq/L | K 4.2 mEq/L | ..." },
      { "id": "vitals", "title": "Vital Signs", "content": "HR 88 | BP 128/78 | ..." },
      { "id": "mar", "title": "MAR", "content": "Metoprolol 25mg PO BID | ..." }
    ]
  }${itemType === 'multipleChoice' || itemType === 'trend' || itemType === 'priorityAction' ? `,
  "options": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],
  "correctOptionId": "a"` : ''}${itemType === 'selectAll' ? `,
  "options": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."},{"id":"e","text":"..."},{"id":"f","text":"..."}],
  "correctOptionIds": ["a","c","e"]` : ''}${itemType === 'orderedResponse' ? `,
  "options": [{"id":"a","text":"Step"},{"id":"b","text":"Step"},{"id":"c","text":"Step"},{"id":"d","text":"Step"}],
  "correctOrder": ["b","a","d","c"]` : ''}${itemType === 'highlight' ? `,
  "passage": "Long clinical passage with multiple sentences to highlight...",
  "correctSpanIndices": [1, 3, 5]` : ''}${itemType === 'clozeDropdown' || itemType === 'dragAndDropCloze' ? `,
  "template": "The nurse should {{blank1}} and then {{blank2}}.",
  "blanks": [
    {"id":"blank1","options":["opt1","opt2","opt3","opt4"],"correctOption":"opt1"},
    {"id":"blank2","options":["opt1","opt2","opt3","opt4"],"correctOption":"opt2"}
  ]` : ''}${itemType === 'matrixMatch' ? `,
  "rows": [{"id":"r1","text":"Finding 1"},{"id":"r2","text":"Finding 2"},{"id":"r3","text":"Finding 3"}],
  "columns": [{"id":"c1","text":"Category A"},{"id":"c2","text":"Category B"}],
  "correctMatches": {"r1":"c1","r2":"c2","r3":"c1"}` : ''}${itemType === 'bowtie' ? `,
  "causes": [{"id":"c1","text":"Cause 1"},{"id":"c2","text":"Cause 2"},{"id":"c3","text":"Cause 3"},{"id":"c4","text":"Cause 4"}],
  "correctCauseIds": ["c1","c3"],
  "conditions": [{"id":"cond1","text":"Condition 1"},{"id":"cond2","text":"Condition 2"},{"id":"cond3","text":"Condition 3"}],
  "correctConditionId": "cond2",
  "interventions": [{"id":"i1","text":"Intervention 1"},{"id":"i2","text":"Intervention 2"},{"id":"i3","text":"Intervention 3"},{"id":"i4","text":"Intervention 4"}],
  "correctInterventionIds": ["i1","i4"]` : ''}
}

CRITICAL RULES:
1. "stem" MUST be a STRING, never an object.
2. "type" MUST be exactly "${itemType}".
3. "rationale" MUST contain "correct", "incorrect", "clinicalPearls", "questionTrap", "mnemonic".
4. ALL EHR tab content must contain SPECIFIC clinical values (numbers, doses, times).
5. SBAR must be 120-160 words with military time.
6. If patient has allergies, the MAR must NOT contain contraindicated drugs.
7. Return ONLY the JSON object. No markdown fences, no arrays.`;
}

// ─── Normalizer: Fix common AI schema drift ───
function normalize(raw) {
    let item = raw;

    // Unwrap arrays
    if (Array.isArray(item)) item = item[0];
    if (!item || typeof item !== 'object') return null;

    // Map alternate field names
    if (!item.id && item.masterId) item.id = item.masterId;
    if (!item.id && item.itemId) item.id = item.itemId;
    if (!item.type && item.format) item.type = item.format;
    if (!item.type && item.itemType && TYPES.includes(item.itemType)) item.type = item.itemType;

    // Stem could be an object
    if (item.stem && typeof item.stem === 'object') {
        item.stem = item.stem.text || item.stem.question || item.stem.content || JSON.stringify(item.stem);
    }

    // Rationale could be a flat string
    if (typeof item.rationale === 'string') {
        const txt = item.rationale;
        item.rationale = { correct: txt, incorrect: 'See rationale above.' };
    }

    // Lift top-level clinicalPearls/questionTrap/mnemonic into rationale
    if (item.rationale && typeof item.rationale === 'object') {
        if (item.clinicalPearls && !item.rationale.clinicalPearls) {
            item.rationale.clinicalPearls = item.clinicalPearls;
            delete item.clinicalPearls;
        }
        if (item.questionTrap && !item.rationale.questionTrap) {
            item.rationale.questionTrap = typeof item.questionTrap === 'string'
                ? { trap: item.questionTrap, howToOvercome: 'Review the clinical scenario carefully.' }
                : item.questionTrap;
            delete item.questionTrap;
        }
        if (item.mnemonic && !item.rationale.mnemonic) {
            item.rationale.mnemonic = typeof item.mnemonic === 'string'
                ? { title: item.mnemonic, expansion: item.mnemonic }
                : item.mnemonic;
            delete item.mnemonic;
        }
    }

    // Scoring normalization
    if (!item.scoring && item.scoringRules) {
        item.scoring = { method: 'polytomous', maxPoints: 1 };
        delete item.scoringRules;
    }
    if (!item.scoring) {
        item.scoring = { method: 'polytomous', maxPoints: 1 };
    }

    // Fallback ID
    if (!item.id) item.id = `ngn_${item.type || 'item'}_${Date.now()}`;

    return item;
}

// ─── Validator ───
const { validateItem } = require('./validation/sentinel_validator.cjs');

// ─── AI Call ───
async function callAI(prompt, key) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.85, responseMimeType: "application/json" }
        })
    });
    if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

// ─── Main Loop ───
async function run() {
    console.log(`\n⚡ MISSION 50: SENTINEL-GUARDED GENERATION`);
    console.log(`   Keys: ${KEYS.length} | Types: ${TYPES.length} | Topics: ${TOPICS.length}\n`);

    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault');
    let saved = 0, healed = 0, discarded = 0, retries = 0;
    const MAX_RETRIES_PER_ITEM = 3;

    for (let i = 1; i <= 50; i++) {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const itemType = TYPES[Math.floor(Math.random() * TYPES.length)];
        let attempts = 0;

        while (attempts < MAX_RETRIES_PER_ITEM) {
            attempts++;
            try {
                const key = nextKey();
                console.log(`[${i}/50] [Key ${keyIdx}] ${itemType} on "${topic}" (attempt ${attempts})...`);

                // GENERATE
                const prompt = buildPrompt(topic, itemType, `MISSION50-${i}-${Date.now()}`);
                let raw = await callAI(prompt, key);
                let item = normalize(raw);

                if (!item) { console.log(`  ⚠ Normalize returned null`); continue; }

                // VALIDATE
                let report = validateItem(item);
                console.log(`  📊 Score: ${report.score}% (${report.diags.length} issues)`);

                // HEAL if needed
                if (report.score < 85 && report.diags.length > 0) {
                    console.log(`  🩺 Healing: ${report.diags.slice(0, 3).join(', ')}...`);
                    healed++;

                    const healPrompt = `FIX this NGN item to pass SentinelQA. Defects: ${report.diags.join('; ')}.
RULES: "type" must be "${itemType}". "stem" must be a STRING. "rationale" must have "correct","incorrect","clinicalPearls","questionTrap","mnemonic".
Return ONLY fixed JSON object (not array).
ITEM: ${JSON.stringify(item)}`;

                    try {
                        const fixed = await callAI(healPrompt, nextKey());
                        item = normalize(fixed);
                        if (item) {
                            report = validateItem(item);
                            console.log(`  💊 Post-heal: ${report.score}%`);
                        }
                    } catch (healErr) {
                        console.log(`  ⚠ Heal failed: ${healErr.message}`);
                    }

                    await new Promise(r => setTimeout(r, 2000));
                }

                // GATE
                if (report.score >= 70) {
                    const dir = path.join(rootDir, itemType);
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    const fname = `${topic.replace(/[\s\/&]/g, '_').toLowerCase()}_${itemType}_v26_${i}.json`;
                    fs.writeFileSync(path.join(dir, fname), JSON.stringify(item, null, 2));
                    console.log(`  ✅ SAVED (${report.score}%): ${fname}`);
                    saved++;
                    break; // Move to next item
                } else {
                    console.log(`  ❌ Score ${report.score}% < 70% threshold`);
                    discarded++;
                }

            } catch (err) {
                const msg = err.message || '';
                if (msg.includes('429')) {
                    console.log(`  ⏳ Rate limited, waiting 15s...`);
                    await new Promise(r => setTimeout(r, 15000));
                } else {
                    console.log(`  ❌ Error: ${msg.substring(0, 100)}`);
                }
                retries++;
            }

            await new Promise(r => setTimeout(r, 4000));
        }

        // Pace between items
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`\n════════════════════════════════════════`);
    console.log(`  MISSION 50 COMPLETE`);
    console.log(`  ✅ Saved: ${saved}`);
    console.log(`  🩺 Healed: ${healed}`);
    console.log(`  ❌ Discarded: ${discarded}`);
    console.log(`  🔄 Retries: ${retries}`);
    console.log(`════════════════════════════════════════\n`);
}

run();
