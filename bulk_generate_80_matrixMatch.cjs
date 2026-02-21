const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
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

const TOPICS = [
    { subtopic: "Psychiatric Medications", detail: "Matching specific adverse effects (e.g., EPS, Serotonin Syndrome, Tardive Dyskinesia) to the correct drug class (SSRIs, Typical Antipsychotics, MAOIs)." },
    { subtopic: "Fetal Heart Rate Strips", detail: "Categorizing EHR descriptions of decelerations (Early, Late, Variable) to their cause (Head compression, Placental insufficiency, Cord compression)." },
    { subtopic: "Fluid Volume Imbalances", detail: "Matching clinical findings (bounding pulses, flat neck veins, crackles, tenting) to Fluid Volume Excess vs. Fluid Volume Deficit." },
    { subtopic: "Maternity Triage", detail: "Categorizing client statements into Normal Pregnancy Discomforts vs. Immediate Danger Signs (e.g., visual disturbances, vaginal bleeding)." },
    { subtopic: "Hepatitis Transmission", detail: "Matching Hepatitis types (A, B, C) to their transmission route (fecal-oral, blood, sexual) and vaccine availability." },
    { subtopic: "Triage / Disaster Management", detail: "Matching 4-5 different client presentations to START triage tags (Red, Yellow, Green, Black)." },
    { subtopic: "Interdisciplinary Referrals", detail: "Matching client deficits (swallowing, speech, fine motor) to the correct therapist (PT, OT, ST, Social Work)." },
    { subtopic: "Restraint Safety", detail: "Categorizing nursing actions as appropriate or inappropriate for physical vs. chemical restraints." },
    { subtopic: "Pediatric Milestones", detail: "Matching physical and cognitive behaviors to expected age ranges (6, 12, 18 months)." },
    { subtopic: "Routine Screenings", detail: "Matching patient demographics (age, sex, risk factors) to required cancer or health screenings." },
    { subtopic: "Insulin Management", detail: "Categorizing insulin types (Rapid, Short, Intermediate, Long) to their correct onset, peak, and duration times." },
    { subtopic: "ABG Interpretation", detail: "Matching pH, CO2, and HCO3 lab values to Metabolic/Respiratory Acidosis/Alkalosis." },
    { subtopic: "Acute Respiratory Distress (ARDS)", detail: "Categorizing ventilator settings and positioning strategies to their physiological purpose in ARDS." }
];

async function generateMatrixMatch(topicObj, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `
You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN MATRIX MATCH Item.

TOPIC: ${topicObj.subtopic}
DETAIL: ${topicObj.detail}
CATEGORY: matrixMatch

9 PILLARS OF EXCELLENCE:
1. NO DUPLICATIONS: Create a unique, specific clinical scenario.
2. ACCURACY: All clinical facts, drug classes, and nursing interventions must be 100% medically accurate.
3. LOGIC: The information in the EHR tabs MUST directly support the answers. 
4. COMPLETENESS: Every required field must be populated with high-quality content.
5. FULL COMPLIANCE: Adhere strictly to NGN 2026 standards (military time, professional tone, SBAR).
6. STUDY COMPANION: Provide deep, educational rationales, mnemonics, and clinical pearls.
7. EHR AVAILABILITY: You MUST populate: Nurses' Notes (SBAR), Vital Signs, Lab Results, and Physical Exam Findings.
8. RELEVANCE: The EHR data cannot be placeholders like "Initial assessment confirms...". It MUST contain the specific cues (e.g., the actual HR value, the specific breath sound, the specific lab result).
9. SCORING: Use accurate NGN 2026 polytomous scoring rules.

MASTER SPECIFICATION (2026):
- SBAR: 120-160 words, military time (HH:mm). Must be a realistic, high-stakes clinical note.
- Exhibits: 
  - Vitals: Multiple timepoints showing a clear clinical trend.
  - Labs: Must include reference ranges and results that trigger clinical reasoning.
- Matrix Logic:
  - Rows: 3-5 rows (each a finding or client).
  - Columns: 2-5 columns (the categories).
  - matrixType: 'multipleChoice' (1 select per row) or 'multipleResponse' (sum of correct).
- sentinelStatus: Set to "healed_v2026_v9"

JSON STRUCTURE:
{
  "id": "matrixMatch_${topicObj.subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "matrixMatch",
  "matrixType": "multipleChoice",
  "stem": "Concise nursing prompt following EHR review...",
  "itemContext": {
    "tabs": [
       { "id": "sbar", "title": "Nurses' Notes", "content": "..." },
       { "id": "vitals", "title": "Vital Signs", "content": "..." },
       { "id": "labs", "title": "Lab Results", "content": "..." },
       { "id": "exam", "title": "Physical Exam", "content": "..." },
       { "id": "orders", "title": "Care Plan", "content": "..." },
       { "id": "mar", "title": "MAR", "content": "..." }
    ]
  },
  "rows": [ { "id": "r1", "text": "..." }, ... ],
  "columns": [ { "id": "c1", "text": "..." }, ... ],
  "correctAnswers": {
    "r1": ["c1"],
    "r2": ["c2"],
    ...
  },
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "analyzeCues",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["${topicObj.subtopic}"]
  },
  "rationale": {
    "correct": "PATHOPHYSIOLOGICAL explanation of why these match...",
    "incorrect": "Why other categories would be wrong...",
    "answerBreakdown": [ 
       { "id": "r1", "text": "Row 1 Finding", "rationale": "Direct link between EHR cue and category..." },
       ...
    ],
    "clinicalPearls": [ "Must be high-value clinical tips..." ],
    "questionTrap": { "trap": "A common mistake students make for this topic...", "howToOvercome": "Logic to avoid the trap..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  },
  "scoring": { "method": "polytomous", "maxPoints": 5 },
  "sentinelStatus": "healed_v2026_v9"
}

Return ONLY pure JSON. No markdown. No preamble.
`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.8,
            response_mime_type: "application/json"
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error("API Error " + resp.status + ": " + err);
    }

    const data = await resp.json();
    let text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
}

async function runBatch() {
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'matrixMatch');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Matrix Match Generation: 80 Items (2026 Elite Specification)...");

    for (let i = 0; i < 80; i++) {
        const topicObj = TOPICS[i % TOPICS.length];
        console.log("[" + (i + 1) + "/80] Generating: " + topicObj.subtopic);

        try {
            const item = await generateMatrixMatch(topicObj, i);
            item.id = item.id + "_" + Date.now() + "_" + i; // Very unique ID
            const filename = topicObj.subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_v2026_batch2_" + i + ".json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topicObj.subtopic + " - " + err.message);
            await new Promise(r => setTimeout(r, 6000));
            try {
                const item = await generateMatrixMatch(topicObj, i);
                item.id = item.id + "_" + Date.now() + "_" + i;
                const filename = topicObj.subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_v2026_batch2_" + i + ".json";
                fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Retry Success: " + filename);
            } catch (err2) {
                console.error("   ❌ Dual Failure: " + topicObj.subtopic);
            }
        }

        // Pacing to avoid rate limits
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log("🏁 Batch Complete. Syncing...");

    try {
        const { execSync } = require('child_process');
        console.log("🔄 Regenerating Index...");
        execSync('node regen_vault_index.cjs');
        console.log("📤 Pushing to Cloud & Git...");
        execSync('node pushToCloud.cjs'); // Direct push to Supabase
        execSync('git add data/ai-generated/vault/matrixMatch/*_v2026_*.json');
        execSync('git commit -m "feat(vault): add 80 elite matrixMatch items (2026 Specification)"');
        execSync('git push origin main');
        console.log("✅ All Systems Synced & Deployed.");
    } catch (e) {
        console.error("❌ Post-generation sync failed: " + e.message);
    }
}

runBatch();
