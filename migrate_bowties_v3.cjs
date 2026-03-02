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

// 🛑 STOP LIMIT
const MAX_TOTAL_ITEMS = 210;

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
 * Robust JSON Cleaner
 */
function cleanJSON(text) {
    if (!text) return null;
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    // Remove control characters (\n, \r, \t are usually fine in JSON but literal control chars aren't)
    // This regex targets actual control characters (U+0000-U+001F) except the common ones
    // and also cleans up common AI hallucinatory prefixes
    cleaned = cleaned.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");

    // Most "Bad control character" errors come from literal newlines inside strings.
    // However, Gemini usually outputs proper JSON. If it fails, we try a more aggressive approach.
    return cleaned;
}

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
    const rawOutput = resData.candidates[0].content.parts[0].text;
    const cleanedJson = cleanJSON(rawOutput);
    try {
        return JSON.parse(cleanedJson);
    } catch (e) {
        // Try one more aggressive cleanup if simple JSON.parse fails
        console.warn(`      ⚠️  Heuristic parsing needed for item...`);
        // Remove literal double quotes or weird formatting that might break JSON
        const hyperCleaned = cleanedJson.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        return JSON.parse(hyperCleaned);
    }
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
    console.log(`🛑 Stopping at total ${MAX_TOTAL_ITEMS} items.`);

    // Check current count in target dir
    if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });
    const existingTargetFiles = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));
    const processedIdsInTarget = new Set(existingTargetFiles.map(f => f.replace(/_v3\.json$/, '')));

    let totalTargetCount = existingTargetFiles.length;
    let totalFixedInThisRun = 0;
    let totalFailed = 0;

    console.log(`📊 Current Target Count: ${totalTargetCount}`);

    if (totalTargetCount >= MAX_TOTAL_ITEMS) {
        console.log(`✅ Limit already reached (${totalTargetCount}/${MAX_TOTAL_ITEMS}). Exiting.`);
        return;
    }

    const processedIdsInSession = new Set();

    for (const dir of SOURCE_DIRS) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

        for (const file of files) {
            if (totalTargetCount >= MAX_TOTAL_ITEMS) break;

            const filePath = path.join(dir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                let data = JSON.parse(content);
                const items = Array.isArray(data) ? data : [data];

                for (let rawItem of items) {
                    if (totalTargetCount >= MAX_TOTAL_ITEMS) break;

                    const item = normalizeStructure(rawItem);
                    if (!item) continue;

                    const itemId = item.id || file;
                    const targetFileNameBase = itemId.replace(/[^a-zA-Z0-9]/g, '_');

                    if (processedIdsInTarget.has(targetFileNameBase) || processedIdsInSession.has(itemId)) continue;
                    processedIdsInSession.add(itemId);

                    // Final check for file existence
                    const targetFilePath = path.join(TARGET_DIR, `${targetFileNameBase}_v3.json`);
                    if (fs.existsSync(targetFilePath)) continue;

                    console.log(`[${totalTargetCount + 1}/${MAX_TOTAL_ITEMS}] Fixating: ${itemId} (${file})`);

                    try {
                        const fixed = await aiFixate(item, getNextKey());

                        // Add metadata and identification
                        fixed.qualityMark = 'GOLD-SERIES-V3-MAPPED';
                        fixed.lastFixed = new Date().toISOString();

                        if (fixed.stem && !fixed.stem.startsWith('[V3-MAPPED-2026]')) {
                            fixed.stem = '[V3-MAPPED-2026] ' + fixed.stem;
                        }

                        // Save to target
                        const targetFileName = `${targetFileNameBase}_v3.json`;
                        fs.writeFileSync(path.join(TARGET_DIR, targetFileName), JSON.stringify(fixed, null, 2));

                        totalTargetCount++;
                        totalFixedInThisRun++;
                        console.log(`   ✅ Success saved to ${targetFileName} (Total: ${totalTargetCount})`);
                    } catch (err) {
                        totalFailed++;
                        console.error(`   ❌ Failed: ${err.message}`);
                    }

                    // Throttle
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (err) {
                console.error(`Error reading ${file}: ${err.message}`);
            }
        }
        if (totalTargetCount >= MAX_TOTAL_ITEMS) break;
    }

    console.log(`\n🏁 Fixation Run Complete!`);
    console.log(`   Total in Target: ${totalTargetCount}`);
    console.log(`   Fixed in this run: ${totalFixedInThisRun}`);
    console.log(`   Total Failed: ${totalFailed}`);
}

run().catch(console.error);
