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
    "Pulmonary Embolism / Acute Respiratory Distress",
    "Anaphylaxis / Airway Compromise",
    "Post-Op Hemorrhage / Hypovolemic Shock",
    "Increased ICP / Impending Herniation",
    "Tension Pneumothorax / Tracheal Deviation",
    "DKA / HHS Emergency Management",
    "Preeclampsia / Eclampsia Convulsions",
    "Malignant Hyperthermia (OR Emergency)",
    "Opioid Overdose / Respiratory Failure",
    "Thyroid Storm / Hyperpyrexia",
    "Adrenal Crisis / Acute Hypotension",
    "Chest Tube Disconnection / Air Leak",
    "Blood Transfusion Reaction (Acute Hemolytic)",
    "Active Seizure Safety Measures",
    "Surgical Dehiscence / Evisceration",
    "SVT / V-Tach (Stable vs Unstable)",
    "Cardiac Tamponade / Becks Triad",
    "Autonomic Dysreflexia Crisis",
    "Compartment Syndrome / Ischemic Pain",
    "Septic Shock / Fluid Resuscitation",
    "Status Epilepticus Interventions",
    "Placenta Previa vs Abruption Delivery",
    "Cord Prolapse Immediate Action",
    "Neonatal Respiratory Distress / Meconium",
    "Intussusception / Perforation Signs",
    "Epiglottitis / Airway Protection",
    "Aortic Dissection Rupture Risk",
    "Serotonin Syndrome vs NMS Priority",
    "Suicide Attempt / Immediate Safety",
    "Violent Client / De-escalation Delay",
    "Acute Pancreatitis / Necrosis signs",
    "Mechanical Ventilation / High Pressure Alarm",
    "Arterial Line Disconnection / Bleeding",
    "Ventriculostomy (EVD) Malfunction",
    "Hypoglycemia / Neuroglycopenia",
    "Hyperkalemia / Cardiac Rhythm Change",
    "Fat Embolism / Petechial Rash",
    "HIT / Platelet Drop Recognition",
    "DIC / Bleeding Control",
    "Basilar Skull Fracture / CSF Leak",
    "Myasthenic Crisis / Respiratory Failure",
    "Pheochromocytoma / Hypertensive Surge",
    "Heat Stroke / Cooling Priority",
    "Carbon Monoxide Poisoning / 100% O2",
    "Bacterial Meningitis / Isolation Priority",
    "Tuberculosis / Negative Pressure Room",
    "Late Decelerations / Fetal Distress",
    "Post-Op Bladder Irrigation / Occlusion",
    "Total Joint Replacement / Dislocation Signs",
    "Ischemic Stroke / tPA Inclusion Window"
];

async function generatePriorityAction(topic, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN PRIORITY ACTION Item.

TOPIC: ${topic}
CATEGORY: priority_action (Store in 'priorityAction' folder)

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Populated EHR subsections (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR).
2. SBAR: Exactly 120-160 words, military time (HH:mm). Must describe a deteriorating or acute clinical situation.
3. ITEM TYPE: This is a Multiple Choice Item where the focus is 'Priority Action'.
4. OPTIONS: Exactly 4. Distractors must be plausible nursing actions that are either lower priority, incorrect timing, or clinically inappropriate for the acute crisis.
5. RATIONALE: Deep pathophysiology/legal explanations. Use the 'upgradedRationale' or standard 'rationale' structure with 'answerBreakdown'.
6. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "priority_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "multipleChoice",
  "stem": "Based on the findings, which action should the nurse take FIRST?",
  "options": [
    { "id": "a", "text": "Priority Action Description" },
    { "id": "b", "text": "Distractor 1" },
    { "id": "c", "text": "Distractor 2" },
    { "id": "d", "text": "Distractor 3" }
  ],
  "correctOptionId": "a",
  "itemContext": {
    "tabs": [ ... SBAR, Vitals, Labs, Exam, Orders, MAR ... ]
  },
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "takeAction",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 5,
    "topicTags": ["${topic}"]
  },
  "rationale": {
    "correct": "Pathophysiological why it's the TOP priority...",
    "incorrect": "Why others are secondary...",
    "answerBreakdown": [ ... ],
    "clinicalPearls": [ ... ],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  },
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
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'priorityAction');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Priority Action Generation: 50 Items...");

    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        console.log("[" + (i + 1) + "/50] Generating: " + topic);

        try {
            const item = await generatePriorityAction(topic, i);
            const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_priority_v2026.json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generatePriorityAction(topic, i);
                const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_priority_v2026.json";
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
