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
    "RN vs LPN vs UAP Delegation",
    "ABC Prioritization Framework",
    "Informed Consent Legal Issues",
    "START Disaster Triage",
    "Client Assignment Scoring",
    "Airborne and Droplet Precautions",
    "PPE Sequencing",
    "Fall Prevention Protocols",
    "Hand Hygiene Compliance",
    "Pediatric Developmental Milestones",
    "Prenatal Danger Signs",
    "Pediatric Immunization Schedules",
    "Abnormal Newborn Assessment",
    "Therapeutic Communication Techniques",
    "Suicide Crisis Interventions",
    "Elder Abuse Recognition",
    "Schizophrenia Nursing Interventions",
    "Alcohol Withdrawal Management",
    "Pain Scale Interpretation",
    "Therapeutic Diets (Low Sodium/Renal)",
    "Crutch Walking Gate Training",
    "Pressure Ulcer Staging and Wound Care",
    "Penicillin Allergy Cross-Sensitivity",
    "Opioid Induced Respiratory Depression",
    "Insulin Peak and Duration Logic",
    "ACE Inhibitor Hyperkalemia Risk",
    "Warfarin INR Monitoring",
    "SSRI Serotonin Syndrome",
    "Digoxin Toxicity Signs",
    "Potassium Sparing Diuretics",
    "Deteriorating Vital Sign Trends",
    "V-Tach and V-Fib EKG Recognition",
    "Critical Potassium and Sodium Levels",
    "Post-Op Diagnostic Nursing Care",
    "ARDS Ventilation Management",
    "Acute MI Priority Interventions",
    "Septic Shock Fluid Resuscitation",
    "DKA Insulin Protocol",
    "Preeclampsia Magnesium Toxicity",
    "Pediatric Epiglottitis Emergency",
    "Liver Cirrhosis Lactulose Therapy",
    "AKI vs CKD Care Planning",
    "Blood Transfusion Reactions",
    "Chemotherapy Safety Precautions",
    "Tension Pneumothorax Chest Tube Care",
    "Compartment Syndrome Assessment",
    "Sickle Cell Vaso-occlusive Crisis",
    "Myasthenia Gravis Cholinergic Crisis",
    "Autonomic Dysreflexia Interventions",
    "GBS Respiratory Failure Monitoring"
];

async function generateDragAndDropCloze(topic, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN DRAG AND DROP CLOZE Item.

TOPIC: ${topic}
CATEGORY: dragAndDropCloze

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Populated EHR subsections in 'itemContext.tabs' (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR) MUST sync with the item stem.
2. SBAR: Exactly 120-160 words, military time (HH:mm). Must be realistic clinical note.
3. EXHIBITS: 
   - Vitals: Min 3 timepoints showing clinical trend.
   - Labs: Populated with relevant cues.
4. DRAG AND DROP CLOZE LOGIC:
   - Use a 'template' string with double curly braces for blanks (e.g., "The nurse should {{action}} because of {{rationale}}").
   - Provide a list of 'options' (distractors + correct answers).
   - Define 'blanks' as an array of objects with 'id' and 'correctOption'.
5. RATIONALE: Deep clinical/pathophysiological explanations in 'rationale.answerBreakdown'.
6. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "dnd_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "dragAndDropCloze",
  "stem": "Concise nursing prompt following the EHR review...",
  "template": "The nurse should {{blank1}} specifically because {{blank2}} is the priority.",
  "options": [ "Opt A", "Opt B", "Opt C", "Opt D", "Opt E" ],
  "blanks": [
    { "id": "blank1", "correctOption": "Opt A" },
    { "id": "blank2", "correctOption": "Opt C" }
  ],
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
    "cjmmStep": "takeAction",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["${topic}"]
  },
  "rationale": {
    "correct": "...",
    "incorrect": "...",
    "answerBreakdown": [ 
       { "label": "Blank 1", "content": "Pathophysiological basis...", "isCorrect": true },
       { "label": "Blank 2", "content": "Pathophysiological basis...", "isCorrect": true }
    ],
    "clinicalPearls": [ ... ],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  },
  "scoring": { "method": "polytomous", "maxPoints": 2 },
  "sentinelStatus": "healed_v2026_v8"
}

Return ONLY pure JSON. No thinking block. No markdown.`;

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
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'dragAndDropCloze');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Drag and Drop Cloze Generation: 50 Items...");

    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        console.log("[" + (i + 1) + "/50] Generating: " + topic);

        try {
            const item = await generateDragAndDropCloze(topic, i);
            const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_dragAndDrop_v2026.json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generateDragAndDropCloze(topic, i);
                const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_dragAndDrop_v2026.json";
                fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Retry Success: " + filename);
            } catch (err2) {
                console.error("   ❌ Dual Failure: " + topic);
            }
        }

        // Pacing to avoid rate limits
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
