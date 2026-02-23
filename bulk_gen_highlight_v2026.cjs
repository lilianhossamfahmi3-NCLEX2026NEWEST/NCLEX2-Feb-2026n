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
    "Sepsis / Septic Shock Cues",
    "DKA / HHS Metabolic Crisis",
    "Preeclampsia / Eclampsia Signs",
    "Myocardial Infarction / ACS",
    "Acute Pulmonary Embolism",
    "Tension Pneumothorax Cues",
    "Increased ICP / Head Injury",
    "Acute Renal Failure / AKI",
    "Upper GI Bleeding Symptoms",
    "Alcohol Withdrawal Delirium",
    "Serotonin Syndrome vs NMS",
    "Anaphylactic Shock Symptoms",
    "Compartment Syndrome 6 Ps",
    "Fat Embolism Syndrome",
    "Meningitis Assessment (Kernig/Brudzinski)",
    "Placental Abruption vs Previa",
    "Intussusception in Pediatrics",
    "Epiglottitis Emergency Cues",
    "Thyroid Storm / Crisis",
    "Adrenal Crisis / Addisonian",
    "Pheochromocytoma Triad",
    "Autonomic Dysreflexia Signs",
    "Guillain-Barre Progression",
    "Myasthenic vs Cholinergic Crisis",
    "Heparin Induced Thrombocytopenia (HIT)",
    "Disseminated Intravascular Coagulation (DIC)",
    "Chronic Heart Failure Exacerbation",
    "Liver Failure / Hepatic Encephalopathy",
    "Pancreatitis (Cullen/Grey Turner)",
    "Appendicitis / Peritonitis Cues",
    "Syndrome of Inappropriate Antidiuretic Hormone (SIADH)",
    "Diabetes Insipidus (DI) Cues",
    "Retinal Detachment Signs",
    "Glaucoma (Angle Closure) Crisis",
    "Pulmonary Edema / Flash Edema",
    "COPD Exacerbation / Respiratory Failure",
    "Status Asthmaticus Cues",
    "Pyloric Stenosis Assessment",
    "Hirschsprung Disease Signs",
    "Developmental Dysplasia of the Hip (DDH)",
    "Kawasaki Disease (Strawberry Tongue/Fever)",
    "Reye Syndrome Progression",
    "Ectopic Pregnancy Rupture Signs",
    "Abruptio Placentae Signs",
    "Hyperemesis Gravidarum Symptoms",
    "Postpartum Hemorrhage Cues",
    "Neuroleptic Malignant Syndrome (NMS)",
    "Lithium Toxicity Symptoms",
    "Phenytoin / Digoxin Toxicity",
    "Aortic Dissection (Tearing Pain)"
];

async function generateHighlightItem(topic, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN HIGHLIGHT Item.

TOPIC: ${topic}
CATEGORY: highlight

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Populated EHR subsections in 'itemContext.tabs' (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR) MUST sync with the item stem.
2. SBAR: Exactly 120-160 words, military time (HH:mm). Must be realistic clinical note. 'content' should be a single string with newlines.
3. EXHIBITS: 
   - Vitals: Min 3 timepoints showing clinical trend.
   - Labs/Physical Exam: Populated with relevant cues for the highlight task.
4. HIGHLIGHT LOGIC:
   - Provide a 'passage' string containing bracketed options like "[finding 1]".
   - Spans MUST BE substantive clinical cues of interest. No filler words in brackets.
5. RATIONALE: Deep clinical/pathophysiological explanations.
6. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "highlight_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "highlight",
  "stem": "Click to highlight the findings that require immediate notification...",
  "passage": "A client with ${topic} is assessed. The nurse notes [finding 1], [finding 2], and [finding 3]. The vital signs show [BP 90/60].",
  "correctSpans": [ "finding 1", "BP 90/60" ],
  "itemContext": {
    "tabs": [
       { "id": "sbar", "title": "Nurses' Notes", "content": "120-160 word SBAR..." },
       { "id": "vitals", "title": "Vital Signs", "content": "..." },
       { "id": "labs", "title": "Lab Results", "content": "..." },
       { "id": "exam", "title": "Physical Exam", "content": "..." },
       { "id": "orders", "title": "Care Plan", "content": "..." },
       { "id": "mar", "title": "MAR", "content": "..." }
    ]
  },
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "recognizeCues",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["${topic}"]
  },
  "rationale": {
    "correct": "...",
    "incorrect": "...",
    "answerBreakdown": [ 
       { "label": "finding 1", "content": "Pathophysiological basis...", "isCorrect": true },
       ...
    ],
    "clinicalPearls": [ ... ],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  },
  "scoring": { "method": "polytomous", "maxPoints": 5 },
  "sentinelStatus": "healed_v2026_v8"
}

Return ONLY pure JSON. No markdown. No preamble.`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
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
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'highlight');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Highlight Generation: 50 Items...");

    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        console.log("[" + (i + 1) + "/50] Generating: " + topic);

        try {
            const item = await generateHighlightItem(topic, i);
            const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_highlight_v2026.json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generateHighlightItem(topic, i);
                const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_highlight_v2026.json";
                fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Retry Success: " + filename);
            } catch (err2) {
                console.error("   ❌ Dual Failure: " + topic);
            }
        }

        // Pacing
        await new Promise(r => setTimeout(r, 4000));
    }

    console.log("🏁 Batch Complete. Regenerating Index...");
    try {
        const { execSync } = require('child_process');
        execSync('node regen_vault_index.cjs');
        console.log("   ✅ Index regenerated.");
    } catch (e) {
        console.error("   ❌ Index regeneration failed.");
    }
}

runBatch();
