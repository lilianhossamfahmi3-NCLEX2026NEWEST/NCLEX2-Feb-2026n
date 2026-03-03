const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const TARGET_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie_v3_mapped');
const API_KEYS = [
    process.env.VITE_GEMINI_API_KEY_1, process.env.VITE_GEMINI_API_KEY_2, process.env.VITE_GEMINI_API_KEY_3,
    process.env.VITE_GEMINI_API_KEY_4, process.env.VITE_GEMINI_API_KEY_5, process.env.VITE_GEMINI_API_KEY_6,
    process.env.VITE_GEMINI_API_KEY_7, process.env.VITE_GEMINI_API_KEY_8, process.env.VITE_GEMINI_API_KEY_9,
    process.env.VITE_GEMINI_API_KEY_10, process.env.VITE_GEMINI_API_KEY_11, process.env.VITE_GEMINI_API_KEY_12,
    process.env.VITE_GEMINI_API_KEY_13, process.env.VITE_GEMINI_API_KEY_14
].filter(Boolean);

let keyIndex = 0;
function getNextKey() {
    const key = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    return key;
}

const REPAIR_PROMPT_TEMPLATE = `
You are a Senior NGN Clinical Nurse Educator. 
Repair this Bowtie V3 item to ensure 100% logic consistency and UI quality.

### MANDATORY REPAIR STEPS:
1. **Clinical Context Injection**: 
   - 'itemContext.patient': Generate a realistic patient (Name, Age, Sex, Code Status, ISO, Allergies) matching the stem.
   - **CRITICAL**: 'allergies' MUST be a string array, e.g., ["Latex", "Penicillin"] or ["NKDA"].
   - 'itemContext.clinicalData': Generate specific Vitals, Lab Results, Physical Exam findings, Radiology, Medications (MAR), and Nursing Orders matching the scenario. 
   - **CRITICAL**: The data must support the correct answers in the bowtie grid.
2. **Study Companion**: Ensure 'studyCompanion' contains Pearls, Traps (description + strategy), and Mnemonics.
3. **Logic Normalization**:
   - Ensure 'conditionId' matches the correct condition in 'potentialConditions'.
   - Ensure 'correctActionIds' and 'correctParameterIds' are present.
   - Build 'rationale.answerBreakdown' by mapping per-option rationales.

### ITEM TO REPAIR:
{{ITEM_JSON}}

### OUTPUT:
Return ONLY the raw JSON object conforming to the BowtieV3Mapped interface.
No markdown code blocks. No explanations. Just the JSON.
`;

function cleanJSON(text) {
    if (!text) return null;
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    // Explicitly handle literal newlines and tabs which break JSON.parse
    cleaned = cleaned.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F]/g, "");
    return cleaned;
}

async function aiRepair(item, key) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

    // Pre-processing: Strip the tag before sending to AI
    if (item.stem) {
        item.stem = item.stem.replace('[V3-MAPPED-2026] ', '').replace('[V3-MAPPED-2026]', '').trim();
    }

    const payload = {
        contents: [{ parts: [{ text: REPAIR_PROMPT_TEMPLATE.replace('{{ITEM_JSON}}', JSON.stringify(item)) }] }],
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error(`API ${resp.status}: ${await resp.text()}`);
    const resData = await resp.json();
    const rawOutput = resData.candidates[0].content.parts[0].text;
    const cleanedJson = cleanJSON(rawOutput);
    return JSON.parse(cleanedJson);
}

async function run() {
    console.log(`🚀 Starting Deep Bowtie V3 Repair Engine (V2 - Allergy Fix)...`);
    const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));
    console.log(`📂 Found ${files.length} items to repair.`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(TARGET_DIR, file);

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let item = JSON.parse(content);

            // Trigger re-repair for everything that doesn't have the V2 mark
            if (item.qualityMark === 'GOLD-SERIES-V3-DEEP-REPAIRED-V2') {
                console.log(`[${i + 1}/${files.length}] Skipping: ${file} (Already V2 repaired)`);
                continue;
            }

            console.log(`[${i + 1}/${files.length}] Repairing: ${item.id} (${file})`);

            const repaired = await aiRepair(item, getNextKey());

            // Post-processing and normalization
            repaired.qualityMark = 'GOLD-SERIES-V3-DEEP-REPAIRED-V2';
            repaired.updatedAt = new Date().toISOString();
            repaired.lastFixed = new Date().toISOString();

            // Safety: Ensure stem has NO tag
            if (repaired.stem) {
                repaired.stem = repaired.stem.replace('[V3-MAPPED-2026] ', '').replace('[V3-MAPPED-2026]', '').trim();
            }

            // Normalization: Ensure patient data is typed correctly
            if (repaired.itemContext && repaired.itemContext.patient) {
                const p = repaired.itemContext.patient;

                // Normalization: Allergies (must be array)
                if (typeof p.allergies === 'string') {
                    p.allergies = [p.allergies];
                } else if (!p.allergies) {
                    p.allergies = ["NKDA"];
                }

                // Normalization: Sex (M/F)
                if (typeof p.sex === 'string') {
                    const s = p.sex.toLowerCase();
                    if (s.startsWith('f')) p.sex = 'F';
                    else if (s.startsWith('m')) p.sex = 'M';
                    else p.sex = 'Other';
                }

                // Normalization: Age (Number)
                if (typeof p.age === 'string') {
                    p.age = parseInt(p.age.replace(/\D/g, ''), 10) || 45;
                }
            }

            // Correct IDs injection (double check AI didn't miss it)
            if ((!repaired.correctActionIds || repaired.correctActionIds.length === 0) && Array.isArray(repaired.actions)) {
                repaired.correctActionIds = repaired.actions.filter(a => a && a.correct).map(a => a.id);
            }
            if ((!repaired.correctParameterIds || repaired.correctParameterIds.length === 0) && Array.isArray(repaired.parameters)) {
                repaired.correctParameterIds = repaired.parameters.filter(p => p && p.correct).map(p => p.id);
            }

            fs.writeFileSync(filePath, JSON.stringify(repaired, null, 2));
            success++;
            console.log(`   ✅ Success!`);

        } catch (err) {
            failed++;
            console.error(`   ❌ Failed ${file}: ${err.message}`);
        }

        // Throttle to respect rate limits
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log(`\n🏁 Repair Cycle Complete!`);
    console.log(`   Success: ${success}`);
    console.log(`   Failed: ${failed}`);
}

run().catch(console.error);
