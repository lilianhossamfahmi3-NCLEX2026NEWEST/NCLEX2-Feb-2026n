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
    { topic: "Acute Pulmonary Embolism", n: 3, goal: "Identified prioritized cues" },
    { topic: "Septic Shock Resuscitation", n: 3, goal: "Initial bundle actions" },
    { topic: "DKA Emergency Protocol", n: 4, goal: "Priority electrolyte/fluid orders" },
    { topic: "Preeclampsia Magnesium Toxicity", n: 3, goal: "Key assessment findings" },
    { topic: "Increasing ICP (Cushing Triad)", n: 3, goal: "Vital sign changes" },
    { topic: "START Disaster Triage (Red Tag)", n: 4, goal: "Physiological parameters" },
    { topic: "Acute MI (STEMI) Recognition", n: 3, goal: "Diagnostic indicators" },
    { topic: "Serotonin Syndrome Assessment", n: 3, goal: "Neuromuscular/Autonomic cues" },
    { topic: "Lithium Toxicity Recognition", n: 3, goal: "Early-stage findings" },
    { topic: "Thyroid Storm Crisis", n: 4, goal: "Hypermetabolic manifestations" },
    { topic: "Liver Cirrhosis (Portal Hypertension)", n: 3, goal: "Clinical complications" },
    { topic: "AKI Recovery Phase", n: 3, goal: "Improvement indicators" },
    { topic: "Mechanical Ventilation Safety", n: 3, goal: "Priority alarm responses" },
    { topic: "Blood Transfusion Reaction (Hemolytic)", n: 3, goal: "Immediate nursing actions" },
    { topic: "Post-Op Hemorrhage (Internal)", n: 3, goal: "Occult bleeding cues" },
    { topic: "Compartment Syndrome (Early)", n: 3, goal: "Priority assessment Ps" },
    { topic: "GBS Respiratory Failure Risk", n: 3, goal: "Deteriorating airway cues" },
    { topic: "Myasthenic Crisis Emergency", n: 3, goal: "Bulbar/Respiratory signs" },
    { topic: "Autonomic Dysreflexia (Symptomatic)", n: 4, goal: "Classic clinical triad + 1" },
    { topic: "Status Epilepticus Interventions", n: 3, goal: "Immediate safety/ABC actions" },
    { topic: "Neonatal Abstinence Syndrome", n: 3, goal: "Scoring components" },
    { topic: "Newborn Respiratory Distress", n: 3, goal: "Classic distress signs" },
    { topic: "Pediatric Epiglottitis Recognition", n: 3, goal: "Airway obstruction cues (3 Ds)" },
    { topic: "Child Maltreatment Evaluation", n: 3, goal: "Objective injury patterns" },
    { topic: "Elder Abuse Screening", n: 3, goal: "Physical/Behavioral indicators" },
    { topic: "Hypoglycemia (Neuroglycopenia)", n: 3, goal: "Symptom recognition" },
    { topic: "Digoxin Toxicity Early Signs", n: 3, goal: "Visual/GI/Cardiac cues" },
    { topic: "Hyperkalemia EKG Evolution", n: 3, goal: "Progressive rhythm changes" },
    { topic: "Pheochromocytoma Crisis", n: 3, goal: "Hyperadrenergic symptoms" },
    { topic: "Addisonian Crisis Manifestations", n: 4, goal: "Fluid/Electrolyte/BP cues" },
    { topic: "SIADH (Dilutional Hyponatremia)", n: 3, goal: "Assessment findings" },
    { topic: "Diabetes Insipidus (Polyuric)", n: 3, goal: "Fluid balance indicators" },
    { topic: "Retinal Detachment Emergency", n: 3, goal: "Visual sensation cues" },
    { topic: "Aortic Dissection (Acute)", n: 3, goal: "Priority hemodynamic findings" },
    { topic: "Fat Embolism Syndrome (Classic)", n: 3, goal: "Manifestation triad" },
    { topic: "HIT (Thrombocytopenia Phase)", n: 3, goal: "Clotting/Platelet cues" },
    { topic: "DIC Flowsheet Monitoring", n: 3, goal: "Critical lab trends" },
    { topic: "Basilar Skull Fracture Risks", n: 3, goal: "Assessment findings" },
    { topic: "Anaphylactic Shock Logic", n: 3, goal: "Systemic collapse signs" },
    { topic: "Sepsis Early Recognition", n: 3, goal: "SIRS/qSOFA parameters" },
    { topic: "Appendicitis (McBurney Point)", n: 3, goal: "Localized assessment cues" },
    { topic: "Pancreatitis (Necrotizing)", n: 3, goal: "Hemorrhagic skin signs + 1" },
    { topic: "ARDS Ventilation Response", n: 3, goal: "Improvement parameters" },
    { topic: "Maternal Preeclampsia (Severe)", n: 3, goal: "Neurological/Renal cues" },
    { topic: "Late Decelerations Response", n: 4, goal: "Intrauterine resuscitation steps" },
    { topic: "Cord Prolapse Immediate Care", n: 3, goal: "Priority positioning/ABC" },
    { topic: "Placenta Previa Assessment", n: 3, goal: "Characteristic bleeding/pain" },
    { topic: "Placental Abruption Signs", n: 3, goal: "Priority findings" },
    { topic: "Postpartum Hemorrhage (Atony)", n: 3, goal: "Assessment/Palpation cues" },
    { topic: "NMS (Acute Stage)", n: 3, goal: "Diagnostic metabolic/Neuro cues" }
];

async function generateSelectNItem(topicObj, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN SELECT N Item.

TOPIC: ${topicObj.topic}
GOAL: ${topicObj.goal}
TYPE: Select ${topicObj.n} (N is explicitly fixed at ${topicObj.n})

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Populated EHR subsections (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR).
2. SBAR: Exactly 120-160 words, military time (HH:mm). 
3. ITEM LOGIC: Select N items MUST have a fixed 'n'. The stem must say "Select the ${topicObj.n} findings/actions...".
4. SCORING: 0/1 (no penalty).
5. OPTIONS: 5-8 options total.
6. RATIONALE: Deep clinical analysis.
7. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "selectN_${topicObj.topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "selectN",
  "n": ${topicObj.n},
  "stem": "The nurse reviews the clinical data. Select the ${topicObj.n} most likely findings that require...",
  "options": [ ... 5 to 8 options ... ],
  "correctOptionIds": [ ... exactly ${topicObj.n} correct IDs ... ],
  "itemContext": {
    "tabs": [ ... SBAR, Vitals, Labs, Exam, Orders, MAR ... ]
  },
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "recognizeCues",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["${topicObj.topic}"]
  },
  "rationale": { ... },
  "scoring": { "method": "dichotomous", "maxPoints": 1 },
  "sentinelStatus": "healed_v2026_v8"
}

Return ONLY pure JSON.`;

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

    if (!resp.ok) throw new Error("API Error " + resp.status);

    const data = await resp.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

async function runBatch() {
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'selectN');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Select N Generation: 50 Items...");

    for (let i = 0; i < TOPICS.length; i++) {
        const topicObj = TOPICS[i];
        console.log("[" + (i + 1) + "/50] Generating: " + topicObj.topic);

        try {
            const item = await generateSelectNItem(topicObj, i);
            const filename = topicObj.topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_select" + topicObj.n + "_v2026.json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topicObj.topic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generateSelectNItem(topicObj, i);
                const filename = topicObj.topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_select" + topicObj.n + "_v2026.json";
                fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Retry Success");
            } catch (err2) {
                console.error("   ❌ Dual Failure");
            }
        }
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
