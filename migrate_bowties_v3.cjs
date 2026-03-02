const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 📂 Source & Target Directories
const SOURCE_DIRS = [
    path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie'),
    path.join(__dirname, 'data', 'ai-generated', 'vault', 'quarantine'),
    path.join(__dirname, 'data', 'ai-generated', 'vault', 'quarantine', 'bowtie'),
    path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500')
];
const TARGET_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie_v3_mapped');

if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

// 🔑 API Key Rotator (14 Keys)
const API_KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`];
    if (key) API_KEYS.push(key);
}
if (API_KEYS.length === 0) { console.error("❌ No API Keys found in .env"); process.exit(1); }
let keyIdx = 0;
function getNextKey() { return API_KEYS[keyIdx++ % API_KEYS.length]; }

// 📋 V3 Standard Template (Mandatory Requirements)
const V3_PROMPT_TEMPLATE = `
You are a Senior NGN Clinical Nurse Educator. 
Fix this Bowtie item to meet the NGN-2026 HI-FI V3 MAPPED standard.

MANDATORY FIXATION:
1. MapCodes: Generate a unique 'scenarioMapCode' (e.g. SCN-CONDITION-ID-001). Set ehr_map_code, bowtie_map_code, companion_map_code, hud_map_code to MATCH it.
2. Clinical Specificity: NO GENERAL INFO. Inject item-specific data for MISSING TABS:
   - Physical Exam: System-based objective findings.
   - Radiology: Realistic imaging reports (X-Ray, CT, etc.) matching the topic.
   - Care Plan: Nursing priorities and interventions.
   - MAR: Realistic medications with doses and routes.
3. Bowtie Grid: Every Action and Parameter must have a unique 'itemMapCode' (e.g. ACTION-LASIX, PARAM-BP).
4. Study Companion: Extract/Generate specific Pearls, Traps (description + strategy), and Mnemonics.
5. Patient Header: Ensure Name, Age, Gender, Code Status, ISO, and Allergies are present and scenario-correct.

ITEM TO FIX:
{{ITEM_JSON}}

OUTPUT: Return ONLY the raw JSON object conforming to the BowtieV3Mapped interface.
No markdown code blocks. No explanations. Just the JSON.
`;

/**
 * AI Fixation Call
 */
async function aiFixate(item, key) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const prompt = V3_PROMPT_TEMPLATE.replace('{{ITEM_JSON}}', JSON.stringify(item));

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        })
    });

    if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`);
    const resData = await resp.json();
    return JSON.parse(resData.candidates[0].content.parts[0].text);
}

/**
 * Normalizer & Deduplicator
 */
function normalizeStructure(item) {
    if (Array.isArray(item)) item = item[0];
    if (!item || typeof item !== 'object' || item.type !== 'bowtie') return null;
    return item;
}

/**
 * Main Execution
 */
async function run() {
    console.log(`🚀 Starting Bowtie V3 Fixation Engine...`);
    console.log(`🔑 Rotator active with ${API_KEYS.length} keys.`);

    const processedIds = new Set();
    let totalFound = 0;
    let totalFixed = 0;
    let totalFailed = 0;

    for (const dir of SOURCE_DIRS) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                let data = JSON.parse(content);
                const items = Array.isArray(data) ? data : [data];

                for (let rawItem of items) {
                    const item = normalizeStructure(rawItem);
                    if (!item) continue;

                    const itemId = item.id || file;
                    if (processedIds.has(itemId)) continue;
                    processedIds.add(itemId);
                    totalFound++;

                    console.log(`[${totalFound}] Fixating: ${itemId} (${file})`);

                    try {
                        const fixed = await aiFixate(item, getNextKey());

                        // Add metadata
                        fixed.qualityMark = 'NGN-2026-HI-FI-V3-MAPPED';
                        fixed.lastFixed = new Date().toISOString();

                        // Save to target
                        const targetFileName = `${itemId.replace(/[^a-zA-Z0-9]/g, '_')}_v3.json`;
                        fs.writeFileSync(path.join(TARGET_DIR, targetFileName), JSON.stringify(fixed, null, 2));

                        totalFixed++;
                        console.log(`   ✅ Success saved to ${targetFileName}`);
                    } catch (err) {
                        totalFailed++;
                        console.error(`   ❌ Failed: ${err.message}`);
                    }

                    // Throttle to avoid 429 even with 14 keys
                    await new Promise(r => setTimeout(r, 1500));
                }
            } catch (err) {
                console.error(`Error reading ${file}: ${err.message}`);
            }
        }
    }

    console.log(`\n🏁 Fixation Complete!`);
    console.log(`   Total Found: ${totalFound}`);
    console.log(`   Total Fixed: ${totalFixed}`);
    console.log(`   Total Failed: ${totalFailed}`);
}

run().catch(console.error);
