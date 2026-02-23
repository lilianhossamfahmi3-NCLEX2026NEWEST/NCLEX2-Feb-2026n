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
    "Compensating vs Decompensating Heart Failure",
    "Sepsis to Septic Shock Transition",
    "DKA Resolution with Insulin/Fluid",
    "Increased ICP Trending with Interventions",
    "AKI to CRRT Requirement Progression",
    "Post-Op Hemorrhage / Internal Bleeding",
    "Respiratory Failure / ARDS Progression",
    "Thyroid Storm with Treatment Response",
    "Preeclampsia to Eclampsia Development",
    "Compartment Syndrome Pain/Vascular Trend",
    "Digoxin Toxicity / EKG Change Trend",
    "Hyperkalemia Treatment Response",
    "Neurovascular Status Post-Fracture",
    "GBS Ascending Paralysis Trend",
    "Myasthenia Gravis Crisis Development",
    "Maternal Labor Progression / FHR Baseline",
    "Newborn Neonatal Abstinence Syndrome (NAS)",
    "Alcohol Withdrawal CIWA Trending",
    "Lithium Level vs Neuro Symptoms",
    "Warfarin INR Adjustment Response",
    "Heparin PTT Maintenance Trend",
    "Burn Parkland Fluid Response (UOP)",
    "Pneumothorax Resolution / Chest Tube Output",
    "Appendicitis to Peritonitis Shift",
    "Pancreatitis Lipase/Pain Trending",
    "DKA/HHS Glucose & Electrolyte Shift",
    "Status Epilepticus / Post-Ictal Trends",
    "Liver Failure Ammonia/LOC Correlation",
    "Anaphylaxis / Epinephrine Rebound",
    "Retinal Detachment Visual Field Change",
    "Heat Stroke Cooling Rate Response",
    "Carbon Monoxide Treatment / Carboxyhemoglobin",
    "Meningitis CSF Result Trends",
    "Tuberculosis Therapy Sputum Status",
    "Late Deceleration Trend in Labor",
    "Magnesium Toxicity Reflex Trend",
    "Cushing Triad (BP/HR/RR) Trend",
    "Pulmonary Edema / Diuretic Response",
    "ACS / Troponin Leeching Pattern",
    "Aortic Dissection BP Stability",
    "Fat Embolism / Respiratory/Skin Pattern",
    "HIT / Platelet Trend Post-Heparin",
    "Post-Op Bladder Irrigation Flow/Color",
    "LVAD / Flow & Power Stability Trend",
    "Arterial Line Waveform Damping Trend",
    "Pediatric Dehydration Weight/UOP Trend",
    "Failure to Thrive / Growth Curve Trend",
    "Kawasaki Disease Fever/Inflammation Trend",
    "Reye Syndrome AST/ALT & LOC Trend",
    "Total Hip Replacement Drainage/Pain Trend"
];

async function generateTrendItem(topic, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN TREND Item.

TOPIC: ${topic}
CATEGORY: trend

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Full EHR subsections.
2. Vitals: MUST include minimum 3 time-points showing a clear clinical trend (improvement or deterioration).
3. ITEM LOGIC: Trend items ask the nurse to compare data across time points (e.g., 'Review the Nurse's Notes/Vitals from 0800 to 1200. Which finding indicates the client's condition is worsening?').
4. RATIONALE: Deep clinical analysis of the trend.
5. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "trend_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "trend",
  "stem": "The nurse reviews the clinical data from 0800 to 1100. Which finding most clearly indicates a therapeutic response to the interventions?",
  "options": [ ... 4 options ... ],
  "correctOptionId": "...",
  "itemContext": {
    "tabs": [
       { "id": "vitals", "title": "Vital Signs", "content": "Flowsheet with 3+ timestamps..." },
       { "id": "sbar", "title": "Nurses' Notes", "content": "Longitudinal notes..." },
       ...
    ]
  },
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "evaluateOutcomes",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 5,
    "topicTags": ["${topic}"]
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
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'trend');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Trend Generation: 50 Items...");

    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        console.log("[" + (i + 1) + "/50] Generating: " + topic);

        try {
            const item = await generateTrendItem(topic, i);
            const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_trend_v2026.json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generateTrendItem(topic, i);
                const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_trend_v2026.json";
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
