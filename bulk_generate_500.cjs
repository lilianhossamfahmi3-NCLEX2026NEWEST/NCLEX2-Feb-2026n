/**
 * NCLEX-RN NGN 2026 Master Bulk Generator - MISSION 500
 * Strictly adheres to NGN_2026_STANDARDS_SPECIFICATION.md
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

// 1. Initialize API Key Rotator (Full 14-Key Spectrum)
const KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) KEYS.push(key);
}

if (KEYS.length === 0) {
    console.error('CRITICAL: No GEMINI_API_KEYs found in .env');
    process.exit(1);
}

let keyIndex = 0;
function getNextKey() {
    const key = KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % KEYS.length;
    return key;
}

// 2. Clinical Domains & Item Types per 2026 Spec
const TOPICS = [
    'Acute Coronary Syndrome / MI', 'Sepsic Shock & MODS', 'DKA/HHS Management',
    'Increased ICP / Cushing Triad', 'Acute Respiratory Distress Syndrome (ARDS)',
    'Mechanical Ventilation Safety', 'Heparin/Warfarin Anticoagulation Safety',
    'Renal Failure & Hyperkalemia', 'Preeclampsia/Eclampsia (HELLP)',
    'Psychiatric Crises / Suicide Risk', 'Burn Resuscitation (Parkland)',
    'Post-Op Compartment Syndrome', 'Tension Pneumothorax / Chest Tubes',
    'Advanced Hemodynamics (Arterial Line/CVP)', 'Digital Privacy & Ethics',
    'Health Equity / SDOH in Discharge Planning'
];

const VAULT_CATEGORIES = [
    'highlight', 'multipleChoice', 'selectAll', 'orderedResponse',
    'matrixMatch', 'clozeDropdown', 'dragAndDropCloze', 'bowtie',
    'trend', 'priorityAction', 'hotspot', 'graphic',
    'audioVideo', 'chartExhibit'
];

// 3. Post-Processing Utilities
function shuffle(array) {
    if (!array) return;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 4. AI Generation Logic
async function generateNGNItem(topic, category, index) {
    const key = getNextKey();
    const model = 'gemini-1.5-pro'; // Core engine
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const prompt = `
You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN Item.

SPECIFICATIONS (NCLEX-RN 2026):
1. TAB SYNC: Populated EHR subsections in 'itemContext' (SBAR, Labs, Vitals, Radiology, MAR) MUST sync with the item stem.
2. SBAR: Exactly 120-160 words, military time (HH:mm), SBAR format.
3. SCORING RULES:
   - SATA/Highlight: Polytomous (+/- 1.0 penalty).
   - Matrix/Cloze: 0/1 (no penalty).
   - Bowtie: Linked Dyad/Triad scoring.
4. RATIONALE: Deep clinical/pathophysiological explanations. No "Opt X is wrong" generic filler.
5. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap' (strategy), and 'mnemonic'.

TOPIC: ${topic}
CATEGORY: ${category}
DIFFICULTY: 4-5
SEED: NCLEX-2026-MISSION-500-${index}-${Date.now()}

Return ONLY PURE JSON matching the MasterItem interface.
`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.9,
            responseMimeType: "application/json"
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);

    const data = await resp.json();
    let item = JSON.parse(data.candidates[0].content.parts[0].text);

    // Dynamic Normalization
    if (item.options) shuffle(item.options);
    if (!item.id) item.id = `${category}_elite_${Date.now()}_${index}`;

    return item;
}

// 5. Main Execution Loop
async function runMission500() {
    console.log(`--- INITIATING MISSION 500: NGN 2026 ELITE GENERATION ---`);
    console.log(`Active Keys: ${KEYS.length} | Target: 500 Items`);

    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault');

    for (let i = 1; i <= 500; i++) {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const category = VAULT_CATEGORIES[Math.floor(Math.random() * VAULT_CATEGORIES.length)];

        try {
            console.log(`[${i}/500] [Key ${keyIndex + 1}] Generating ${category} on ${topic}...`);
            const item = await generateNGNItem(topic, category, i);

            const categoryDir = path.join(rootDir, category);
            if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });

            const filename = `${topic.replace(/[\s\/]/g, '_').toLowerCase()}_${category}_v26_${i}.json`;
            fs.writeFileSync(path.join(categoryDir, filename), JSON.stringify(item, null, 4));

        } catch (e) {
            console.error(`ERROR at [${i}/500]:`, e.message);
            await new Promise(r => setTimeout(r, 10000)); // Cool down
            i--; // Retry
        }

        // 6s Pace to respect rate limits & systemic integrity
        await new Promise(r => setTimeout(r, 6000));
    }

    console.log('--- MISSION 500 COMPLETE: REGENERATING INDEX ---');
    try {
        const { execSync } = require('child_process');
        execSync('node regen_vault_index.cjs');
        console.log('Manifest synchronized.');
    } catch (e) {
        console.error('Manifest sync failed.');
    }
}

runMission500();
