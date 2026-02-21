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

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Populated EHR subsections in 'itemContext.tabs' (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR) MUST sync with the item stem.
2. SBAR: Exactly 120-160 words, military time (HH:mm). Must be realistic clinical note.
3. EXHIBITS: 
   - Vitals: Min 3 timepoints showing clinical trend relevant to the matrix questions.
   - Labs/Physical Exam: Populated with relevant cues that the matrix asks to categorize.
4. MATRIX LOGIC:
   - Rows: 3-5 rows.
   - Columns: 2-5 columns.
   - matrixType: 'multipleChoice' (1 select per row) or 'multipleResponse' (1+ select per row). Use what's most appropriate for the topic.
5. RATIONALE: Deep pathophysiology/legal explanations for ALL rows and columns.
6. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "matrixMatch_${topicObj.subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "matrixMatch",
  "matrixType": "multipleChoice",
  "stem": "Concise nursing prompt...",
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
    "r2": ["c2", "c3"],
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
    "correct": "...",
    "incorrect": "...",
    "answerBreakdown": [ 
       { "id": "r1", "text": "Row 1 Explanation...", "rationale": "..." },
       ...
    ],
    "clinicalPearls": [ ... ],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  },
  "scoring": { "method": "polytomous", "maxPoints": 5 },
  "sentinelStatus": "healed_v2026_v8"
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

    console.log("🚀 Starting Matrix Match Generation: 50 Items...");

    for (let i = 0; i < 50; i++) {
        const topicObj = TOPICS[i % TOPICS.length];
        console.log("[" + (i + 1) + "/50] Generating: " + topicObj.subtopic);

        try {
            const item = await generateMatrixMatch(topicObj, i);
            // Append index to ID to avoid collision if same subtopic
            item.id = item.id + "_" + i;
            const filename = topicObj.subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_matrixMatch_v2026_" + i + ".json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topicObj.subtopic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generateMatrixMatch(topicObj, i);
                item.id = item.id + "_" + i;
                const filename = topicObj.subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_matrixMatch_v2026_" + i + ".json";
                fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Retry Success: " + filename);
            } catch (err2) {
                console.error("   ❌ Dual Failure: " + topicObj.subtopic);
            }
        }

        // Pacing
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("🏁 Batch Complete.");

    // Sync
    try {
        const { execSync } = require('child_process');
        console.log("🔄 Regenerating Index...");
        execSync('node regen_vault_index.cjs');
        console.log("📤 Pushing to Git...");
        execSync('git add data/ai-generated/vault/matrixMatch/*_v2026_*.json');
        execSync('git commit -m "feat(vault): add 50 fresh matrixMatch items (2026 Spec)"');
        execSync('git push origin main');
        console.log("✅ All Systems Synced.");
    } catch (e) {
        console.error("❌ Post-generation sync failed: " + e.message);
    }
}

runBatch();
