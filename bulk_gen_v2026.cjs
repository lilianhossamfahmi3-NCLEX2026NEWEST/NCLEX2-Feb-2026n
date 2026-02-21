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

async function generateBowtie(topic, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = "You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).\nMISSION: Generate ONE Elite-Level Standalone NGN BOWTIE Item.\n\nTOPIC: " + topic + "\nCATEGORY: Bowtie\n\n2026 MASTER SPECIFICATION COMPLIANCE:\n1. TAB SYNC: Populated EHR subsections in 'itemContext.tabs' (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR) MUST sync with the item stem.\n2. SBAR: Exactly 120-160 words, military time (HH:mm). Must be realistic clinical note.\n3. EXHIBITS: \n   - Vitals: Min 3 timepoints showing clinical trend.\n   - Labs: Populated with relevant cues (values/units/ranges).\n   - Care Plan & MAR: Must be populated if relevant to the condition.\n4. BOWTIE LOGIC:\n   - Column 1: Actions to Take (Exactly 2 correct).\n   - Column 2: Potential Condition (Exactly 1 correct).\n   - Column 3: Parameters to Monitor (Exactly 2 correct).\n5. RATIONALE: Deep pathophysiology explanations for ALL options (Rationale.answerBreakdown).\n6. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap' (strategy), and 'mnemonic'.\n\nJSON STRUCTURE:\n{\n  \"id\": \"bowtie_" + topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_v2026\",\n  \"type\": \"bowtie\",\n  \"stem\": \"Concise nursing prompt following the EHR review...\",\n  \"itemContext\": {\n    \"tabs\": [\n       { \"id\": \"sbar\", \"title\": \"Nurses' Notes\", \"content\": \"120-160 word SBAR...\" },\n       { \"id\": \"vitals\", \"title\": \"Vital Signs\", \"content\": \"Flowsheet string or HTML table...\" },\n       { \"id\": \"labs\", \"title\": \"Lab Results\", \"content\": \"...\" },\n       { \"id\": \"exam\", \"title\": \"Physical Exam\", \"content\": \"...\" },\n       { \"id\": \"orders\", \"title\": \"Care Plan\", \"content\": \"...\" },\n       { \"id\": \"mar\", \"title\": \"MAR\", \"content\": \"...\" }\n    ]\n  },\n  \"actions\": [ { \"id\": \"a1\", \"text\": \"...\" }, ... ],\n  \"potentialConditions\": [ \"C1\", \"C2\", \"C3\", \"C4\" ],\n  \"condition\": \"Target Condition\",\n  \"parameters\": [ { \"id\": \"p1\", \"text\": \"...\" }, ... ],\n  \"correctActionIds\": [\"aX\", \"aY\"],\n  \"correctParameterIds\": [\"pX\", \"pY\"],\n  \"pedagogy\": {\n    \"bloomLevel\": \"analyze\",\n    \"cjmmStep\": \"takeAction\",\n    \"nclexCategory\": \"Physiological Adaptation\",\n    \"difficulty\": 4,\n    \"topicTags\": [\"" + topic + "\"]\n  },\n  \"rationale\": {\n    \"correct\": \"...\",\n    \"incorrect\": \"...\",\n    \"answerBreakdown\": [ ... ],\n    \"clinicalPearls\": [ ... ],\n    \"questionTrap\": { \"trap\": \"...\", \"howToOvercome\": \"...\" },\n    \"mnemonic\": { \"title\": \"...\", \"expansion\": \"...\" }\n  },\n  \"scoring\": { \"method\": \"polytomous\", \"maxPoints\": 5 },\n  \"sentinelStatus\": \"healed_v2026_v8\"\n}\n\nReturn ONLY pure JSON. No thinking block. No markdown.";

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
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 Starting Bowtie Generation: 50 Items...");

    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        console.log("[" + (i + 1) + "/50] Generating: " + topic);

        try {
            const item = await generateBowtie(topic, i);
            const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_bowtie_v2026.json";
            fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
            console.log("   ✅ Success: " + filename);
        } catch (err) {
            console.error("   ❌ Failed: " + topic + " - " + err.message);
            await new Promise(r => setTimeout(r, 5000));
            try {
                const item = await generateBowtie(topic, i);
                const filename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_') + "_bowtie_v2026.json";
                fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Retry Success: " + filename);
            } catch (err2) {
                console.error("   ❌ Dual Failure: " + topic);
            }
        }

        // Pacing
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log("🏁 Batch Complete.");
}

runBatch();
