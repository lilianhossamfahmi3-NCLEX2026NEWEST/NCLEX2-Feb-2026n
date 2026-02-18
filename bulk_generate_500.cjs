const fs = require('fs');
const path = require('path');

const KEYS = [
    'AIzaSyCGBsatIVorw0mlj-c2mNl7n4iUarLQbLU',
    'AIzaSyDxfULa7oK-3dxmHMcKmQL3rNjFhyBOMF0',
    'AIzaSyBbN5d9Cpz3O__l9H5lQydqGtrAZlATut0',
    'AIzaSyBeVY1qKlAljfGPkESHabNxtXDk24YK5X8',
    'AIzaSyAdHhHYugOXZT55hDvFWxODaMujBcQ96Ts',
    'AIzaSyB-2ZrAXzeLJgqvs52vImSkNzCTJNUeZ4A',
    'AIzaSyBCkx-5OPtyKYw9tJNi_BgIMfUE_-IO3rw',
    'AIzaSyDN6hn3iRdbvmuDaQ8PAh6tpVpLTvarHzc',
    'AIzaSyBZsMEpJnohvU_TYFUFHq4v3wKMRQS5yS4',
    'AIzaSyBm7tNmXPD8z4YqZm9VZE0fCdAM935OH8A'
];

let currentKey = 0;
function getNextKey() {
    const key = KEYS[currentKey];
    currentKey = (currentKey + 1) % KEYS.length;
    return key;
}

const TOPICS = [
    'Acute Heart Failure Decompensation', 'Cardiogenic Shock', 'Ventricular Fibrillation', 'Atrial Fibrillation with RVR',
    'Pulmonary Embolism', 'Septic Shock Bundle', 'Acute Respiratory Distress Syndrome (ARDS)', 'Chest Tube Tension Pneumothorax',
    'Ischemic Stroke (tPA window)', 'Increased Intracranial Pressure (Cushing Traid)', 'Diabetic Ketoacidosis (DKA)',
    'Hyperosmolar Hyperglycemic State (HHS)', 'Adrenal Crisis (Addisonian)', 'Thyroid Storm', 'Hyperkalemia Emergency',
    'Acute Kidney Injury (AKI)', 'Dialysis Complications', 'Tension Pneumothorax', 'Preeclampsia with HELLP',
    'Autonomic Dysreflexia', 'Serotonin Syndrome', 'Neuroleptic Malignant Syndrome', 'Lithium Toxicity',
    'Anaphylactic Shock', 'Burn Resuscitation (Parkland Formula)', 'Compartment Syndrome', 'Fat Embolism Syndrome',
    'Abdominal Aortic Aneurysm Rupture', 'Placenta Abruption', 'Epiglottitis (Pediatric Priority)', 'Hyperkalemia with EKG changes',
    'Digoxin Toxicity & Electrolytes', 'Warfarin/Heparin Bridge Safety', 'tPA Contraindications Audit', 'Chest Tube Continuous Bubbling'
];

const TYPES = [
    'multipleChoice', 'selectAll', 'clozeDropdown', 'bowtie',
    'matrixMatch', 'orderedResponse', 'highlight', 'trend',
    'priorityAction', 'selectN'
];

function shuffleArray(array) {
    if (!array) return;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function promptAI(topic, type, iteration) {
    const key = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`;

    const uniquenessSalt = `Scenario Seed ID: MISSION-500-${iteration}-${Date.now()}`;

    const prompt = `You are an Elite NCLEX-RN NGN Psychometrician & Content Scientist (Standard 2026).
Generate ONE ultra-high-fidelity NGN standalone question.

MISSION: Focus on "DON'T PROCEED" / "SAFETY STOP" clinical logic. 
Scenario where the student MUST recognize a contraindication, an error, or a life-threatening change that requires IMMEDIATE independent nursing action or withholding a treatment.

TOPIC: ${topic}
TYPE: ${type}
DIFFICULTY: Level 4-5 (Highly Discriminating)

CRITICAL REQUIREMENTS:
1. INTERNAL LOGIC SYNCHRONIZATION: There must be 100% data accuracy and biological plausibility between the EHR tabs (Notes), the Vital Signs Trend, and the Lab/Radiology findings. 
   - If the patient has Sepsis, the labs MUST show elevated Lactate/WBC and the Vitals MUST show Tachycardia/Hypotension.
   - The question and rationales MUST link back to these specific cues.
2. DUPLICATE PREVENTION: Use this unique seed: ${uniquenessSalt}. 
3. SAFETY STOP LOGIC: Focus on "DON'T PROCEED" clinical logic.
4. POINT-TO-POINT RATIONALE: Provide a specific clinical justification for EVERY option in 'answerBreakdown'.
5. 2026 STANDARDS: Integrate Health Equity or SDOH cues if relevant.
6. STRUCTURE: Output pure JSON matching the MasterItem interface. Ensure NO GAPS in the data.

Return ONLY PURE JSON.`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.95 }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    let item = JSON.parse(data.candidates[0].content.parts[0].text);

    // POST-PROCESSING: Seeded Randomization for JSON content
    if (item.options) shuffleArray(item.options);
    if (item.actions) shuffleArray(item.actions);
    if (item.parameters) shuffleArray(item.parameters);
    if (item.potentialConditions) shuffleArray(item.potentialConditions);

    return item;
}

async function mission_500() {
    console.log(`--- INITIATING MISSION 500: ELITE NGN GENERATION ---`);
    console.log(`Focus: Safety "Don't Proceed" Logic | Model: Gemini 2.5 Pro`);

    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'mission_500_v1');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const totalCount = 500;
    for (let i = 1; i <= totalCount; i++) {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const type = TYPES[Math.floor(Math.random() * TYPES.length)];

        try {
            console.log(`[${i}/${totalCount}] Generating high-acuity ${type} on ${topic}...`);
            const item = await promptAI(topic, type, i);
            const safeTopic = topic.replace(/[\s\/\\]+/g, '_').toLowerCase();
            const fileName = `${type}_v3_elite_${safeTopic}_${Date.now()}_${i}.json`;
            fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(item, null, 4));
        } catch (e) {
            console.error(`ERROR at iteration ${i}:`, e.message);
            await new Promise(r => setTimeout(r, 10000));
            i--; // Retry
        }

        // Taking a "breath" between generations to prevent hallucinations and AI exhaustion
        await new Promise(r => setTimeout(r, 6000));
    }

    console.log('--- GENERATION COMPLETE. SYNCING MASTER ARCHIVES ---');
    try {
        const { execSync } = require('child_process');
        execSync('node regen_vault_index.cjs');
    } catch (err) {
        console.error('Final Index Sync Failed.');
    }
}

mission_500();
