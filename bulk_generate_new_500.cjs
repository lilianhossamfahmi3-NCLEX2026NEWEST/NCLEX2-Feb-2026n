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
    'Cardiovascular: Shock & Hemodynamics',
    'Respiratory: Respiratory Failure & ARDS',
    'Respiratory: Mechanical Ventilation Safety',
    'Neurological: Stroke & Increased ICP',
    'Neurological: Spinal Cord Injury & Autonomic Dysreflexia',
    'Renal: AKI vs CKD & Electrolyte Emergencies',
    'Endocrine: DKA/HHS & Thyroid Storm',
    'GI/Hepatic: Liver Failure & Pancreatitis',
    'Infection Control: Sepsis & Multi-Drug Resistance',
    'Maternal: Preeclampsia & Postpartum Hemorrhage',
    'Mental Health: Suicide Risk & Crisis Management',
    'Pediatric: Congenital Heart Defects & Safety',
    'Safety: Medication Calculation & High-Alert Drugs'
];

const ALLOWED_TYPES = [
    'multipleChoice', 'selectAll', 'clozeDropdown', 'dragAndDropCloze',
    'bowtie', 'trend', 'priorityAction', 'matrixMatch', 'highlight', 'selectN'
];

// ═══════════════════════════════════════════════════════════
//  Prompt Engineering
// ═══════════════════════════════════════════════════════════
function buildGenerationPrompt(topic, type) {
    return `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
TASK: Generate ONE high-fidelity, standalone NGN assessment item.

SPECIFICATIONS:
1. ID: Prefix with "New-v26-".
2. TYPE: ${type}
3. TOPIC: ${topic}
4. DIFFICULTY: Must be 4 or 5 (High Cognitive Depth).
5. SBAR: Exactly 120-160 words, mandatory military time (HH:mm), specific patient data.
6. TAB SYNC: Evidence in EHR tabs (Labs, MAR, Vitals) MUST correlate with the clinical situation.
7. RATIONALE: Deep clinical explanation (>60 words each), clinicalPearls, questionTrap, and mnemonic.
8. SCORING: 
   - SATA/Highlight: Polytomous.
   - Cloze/Matrix: 0/1 (Dichotomous per point).
   - Bowtie: Linked/Linkage scoring.

REQUIRED JSON STRUCTURE (MasterItem):
{
  "id": "New-v26-<UUID>",
  "type": "${type}",
  "stem": "...",
  "scoring": { "method": "...", "maxPoints": 0 },
  "itemContext": {
    "patient": { "name": "...", "age": 0, "gender": "...", "iso": "...", "allergies": [] },
    "sbar": "...",
    "tabs": [ { "id": "...", "title": "...", "content": "..." } ]
  },
  "pedagogy": { "bloomLevel": "...", "cjmmStep": "...", "nclexCategory": "...", "difficulty": 5, "topicTags": ["${topic}"] },
  "rationale": { "correct": "...", "incorrect": "...", "clinicalPearls": [], "questionTrap": { "trap": "...", "howToOvercome": "..." }, "mnemonic": { "title": "...", "expansion": "..." } }
}

Return ONLY PURE JSON. NO markdown blocks.`;
}

// ═══════════════════════════════════════════════════════════
//  Helper Functions
// ═══════════════════════════════════════════════════════════
async function callAI(prompt) {
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
        const text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
        console.error("  AI Error:", e.message);
        return null;
    }
}

const { validateItem } = require('./validation/sentinel_validator.cjs');

// ═══════════════════════════════════════════════════════════
//  Main Execution
// ═══════════════════════════════════════════════════════════
async function main() {
    console.log("🚀 STARTING BULK GENERATION (MISSION 500)");
    const TOTAL_TARGET = 500;
    const BATCH_SIZE = 5;

    let successCount = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_new_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    while (successCount < TOTAL_TARGET) {
        console.log(`\n📦 Current Progress: ${successCount} / ${TOTAL_TARGET}`);
        const promises = [];

        for (let i = 0; i < BATCH_SIZE; i++) {
            const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            const type = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)];

            promises.push((async () => {
                let item = await callAI(buildGenerationPrompt(topic, type));
                if (!item) return null;

                // Ensure ID prefix
                if (!item.id?.startsWith('New-')) {
                    item.id = `New-v26-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }

                // Initial QA
                let report = validateItem(item);

                // One-time Auto-Heal if needed
                if (report.score < 90) {
                    process.stdout.write(`  Healing ${item.id} (${report.score}%)... `);
                    const healPrompt = `REPAIR this NGN item. IT SCORED ${report.score}%. DEFECTS: ${report.diags.join('; ')}. 
                    Return perfected MasterItem JSON for: ${JSON.stringify(item)}`;
                    const healed = await callAI(healPrompt);
                    if (healed) {
                        item = healed;
                        report = validateItem(item);
                        console.log(`New Score: ${report.score}%`);
                    } else {
                        console.log("Heal Failed.");
                    }
                }

                if (report.score >= 80) {
                    // Save Local
                    const typeDir = path.join(rootDir, item.type || 'misc');
                    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
                    const filename = `${item.id}.json`;
                    fs.writeFileSync(path.join(typeDir, filename), JSON.stringify(item, null, 2));

                    // Sync Cloud
                    try {
                        const { error } = await supabase.from('clinical_vault').upsert({
                            id: item.id,
                            type: item.type || 'unknown',
                            item_data: item,
                            topic_tags: item.pedagogy?.topicTags || [],
                            nclex_category: item.pedagogy?.nclexCategory || null,
                            difficulty: item.pedagogy?.difficulty || 3
                        }, { onConflict: 'id' });
                        if (error) console.error(`  [!] Cloud Error ${item.id}:`, error.message);
                    } catch (e) { }

                    return item.id;
                } else {
                    console.log(`  ❌ Discarded ${item.id} (Score too low: ${report.score}%)`);
                    return null;
                }
            })());
        }

        const results = await Promise.all(promises);
        successCount += results.filter(Boolean).length;

        // Progress check & push indicator
        if (successCount % 20 === 0) {
            console.log("  >>> Checkpoint reached. Keep generating...");
        }

        // Small cooldown
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n✅ MISSION 500 COMPLETE. TOTAL SAVED: ${successCount}`);
}

main();
