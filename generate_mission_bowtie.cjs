/**
 * NCLEX-RN NGN 2026 Master Bulk Generator - BOWTIE MISSION 50
 * Strictly adheres to NGN_2026_STANDARDS_SPECIFICATION.md
 * Target: 50 Bowtie Items
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

// 1. Initialize API Key Rotator (Full 14-Key Spectrum)
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

// 2. Clinical Topics (Extracted from User Request)
const TOPICS = [
    { category: 'Management of Care', topic: 'Delegation Rules (RN vs LPN vs UAP)' },
    { category: 'Management of Care', topic: 'Prioritization Framework (ABCs/Maslow)' },
    { category: 'Management of Care', topic: 'Legal/Ethical Issues (Consent/Advance Directives)' },
    { category: 'Management of Care', topic: 'Disaster Triage (START System)' },
    { category: 'Management of Care', topic: 'Assignment Decision-Making' },
    { category: 'Safety and Infection Prevention', topic: 'Infection Control & Isolation Precautions' },
    { category: 'Safety and Infection Prevention', topic: 'PPE Donning/Doffing Order' },
    { category: 'Safety and Infection Prevention', topic: 'Client Safety (Falls/Restraints)' },
    { category: 'Safety and Infection Prevention', topic: 'Hand Hygiene' },
    { category: 'Health Promotion and Maintenance', topic: 'Developmental Milestones' },
    { category: 'Health Promotion and Maintenance', topic: 'Prenatal Care' },
    { category: 'Health Promotion and Maintenance', topic: 'Immunization Schedules' },
    { category: 'Health Promotion and Maintenance', topic: 'Newborn Assessment' },
    { category: 'Psychosocial Integrity', topic: 'Therapeutic Communication' },
    { category: 'Psychosocial Integrity', topic: 'Psych Crisis Interventions (Suicide)' },
    { category: 'Psychosocial Integrity', topic: 'Abuse/Neglect Recognition' },
    { category: 'Psychosocial Integrity', topic: 'Mental Health Conditions (Schizophrenia/Mania)' },
    { category: 'Psychosocial Integrity', topic: 'Substance Misuse (Withdrawal)' },
    { category: 'Basic Care and Comfort', topic: 'Pain Assessment' },
    { category: 'Basic Care and Comfort', topic: 'Nutritional Needs (Therapeutic Diets)' },
    { category: 'Basic Care and Comfort', topic: 'Mobility Assistive Devices (Cane/Walker)' },
    { category: 'Basic Care and Comfort', topic: 'Skin Integrity (Pressure Ulcer Staging)' },
    { category: 'Pharmacological Therapies', topic: 'Antibiotics (Penicillins/Cephalosporins)' },
    { category: 'Pharmacological Therapies', topic: 'Opioids (Morphine/Naloxone)' },
    { category: 'Pharmacological Therapies', topic: 'Insulin (Hypoglycemia Treatment)' },
    { category: 'Pharmacological Therapies', topic: 'Antihypertensives (ACE/Beta-blockers)' },
    { category: 'Pharmacological Therapies', topic: 'Anticoagulants (Heparin/Warfarin)' },
    { category: 'Pharmacological Therapies', topic: 'Psychiatric Meds (SSRIs/Benzos)' },
    { category: 'Pharmacological Therapies', topic: 'Cardiac Glycosides (Digoxin Toxicity)' },
    { category: 'Pharmacological Therapies', topic: 'Diuretics (Loop/Potassium-sparing)' },
    { category: 'Reduction of Risk Potential', topic: 'Vital Signs Interpretation' },
    { category: 'Reduction of Risk Potential', topic: 'Cardiac Arrhythmias (EKG)' },
    { category: 'Reduction of Risk Potential', topic: 'Laboratory Values (Critical Results)' },
    { category: 'Reduction of Risk Potential', topic: 'Diagnostic Testing' },
    { category: 'Physiological Adaptation', topic: 'Respiratory Emergencies (COPD/ARDS)' },
    { category: 'Physiological Adaptation', topic: 'Cardiac Conditions (Heart Failure/MI)' },
    { category: 'Physiological Adaptation', topic: 'Shock (Sepsis/Anaphylaxis)' },
    { category: 'Physiological Adaptation', topic: 'Diabetic Emergencies (DKA/HHS)' },
    { category: 'Physiological Adaptation', topic: 'OB Emergencies (Preeclampsia/Hemorrhage)' },
    { category: 'Physiological Adaptation', topic: 'Pediatric Urgent Conditions (Croup/Epiglottitis)' },
    { category: 'Physiological Adaptation', topic: 'Liver Failure/Cirrhosis' },
    { category: 'Physiological Adaptation', topic: 'Renal Conditions (AKI/CKD)' }
];

// 3. AI Generation Logic
async function generateBowtieItem(topicObj, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;

    const prompt = `
You are a Senior NGN Psychometrician (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN BOWTIE Item.

TOPIC: ${topicObj.topic}
NCLEX CATEGORY: ${topicObj.category}

STRICT SPECIFICATIONS:
1. ITEM TYPE: Bowtie (Actions to Take | Potential Condition | Parameters to Monitor).
2. EHR SYNC:
   - itemContext.tabs: SBAR, Vitals, Labs, PhysicalExam, Orders, MAR, Radiology.
   - SBAR: Exactly 120-160 words, military time (HH:mm), SBAR format.
   - Vitals: Minimum 3 timepoints showing a clear clinical trend related to the topic.
   - Labs: Populated with relevant values (High/Low) that provide cues for the bowtie condition.
3. BOWTIE STRUCTURE:
   - actions: [{ id: 'a1', text: '...' }, ...] - Provide 5-6 total actions (Exactly 2 correct).
   - potentialConditions: string[] - Provide 4-5 total conditions (Exactly 1 is the target 'condition').
   - condition: The single correct condition from 'potentialConditions'.
   - parameters: [{ id: 'p1', text: '...' }, ...] - Provide 5-6 total parameters (Exactly 2 correct).
   - correctActionIds: string[] - IDs of the 2 correct actions.
   - correctParameterIds: string[] - IDs of the 2 correct parameters.
4. PEDAGOGY:
   - nclexCategory: '${topicObj.category}'
   - difficulty: 4 or 5.
   - cjmmStep: 'takeAction' or 'prioritizeHypotheses'.
   - bloomLevel: 'analyze' or 'evaluate'.
5. RATIONALE (Deep Pathophysiology):
   - rationale.answerBreakdown MUST explain every choice (Action, Condition, Parameter) and why it's correct or incorrect.
   - rationale.correct: Comprehensive summary of the clinical logic.
   - rationale.incorrect: Why the distractors are wrong (early signs, lower priority, or clinically incorrect).
6. EXTRAS: Mandatory 'clinicalPearls' (3+ strings), 'questionTrap' (strategy), and 'mnemonic'.

Return ONLY PURE JSON matching the MasterItem interface (specifically BowtieItem). No markdown, no preamble.
`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 1.0,
            response_mime_type: "application/json"
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);

    const data = await resp.json();
    const text = data.candidates[0].content.parts[0].text;

    // Safety parse
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleaned = jsonMatch ? jsonMatch[0] : text;
        const item = JSON.parse(cleaned);

        // Basic Bowtie Validation
        if (!item.actions || !item.potentialConditions || !item.condition || !item.parameters) throw new Error("Missing Bowtie fields");
        if (item.correctActionIds.length !== 2) throw new Error("Must have exactly 2 correct action IDs");
        if (item.correctParameterIds.length !== 2) throw new Error("Must have exactly 2 correct parameter IDs");

        item.type = 'bowtie'; // Force it
        item.sentinelStatus = 'healed_v2026_v8'; // Mark as current spec

        return item;
    } catch (err) {
        console.error("JSON PARSE ERROR. RAW TEXT:", text.substring(0, 200));
        throw err;
    }
}

// 4. Main Execution Loop
async function runMissionBowtie() {
    console.log(`--- INITIATING MISSION BOWTIE: 50 NGN 2026 ELITE ITEMS ---`);
    console.log(`Active Keys: ${KEYS.length} | Target: 50 Items`);

    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    for (let i = 1; i <= 50; i++) {
        const topicObj = TOPICS[(i - 1) % TOPICS.length];

        try {
            console.log(`[${i}/50] [Key ${keyIndex + 1}] Generating BOWTIE on ${topicObj.topic}...`);
            const item = await generateBowtieItem(topicObj, i);

            const filename = `bowtie_${topicObj.topic.replace(/[\s\/()]/g, '_').toLowerCase()}_v26_${i}.json`;
            fs.writeFileSync(path.join(rootDir, filename), JSON.stringify(item, null, 4));
            console.log(`   ✅ Saved: ${filename}`);

        } catch (e) {
            console.error(`   ❌ ERROR at [${i}/50]:`, e.message);
            i--; // Retry
            await new Promise(r => setTimeout(r, 5000));
        }

        // 3s Pace for Gemini 2.0 Flash
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log('--- MISSION COMPLETE: REGENERATING INDEX ---');
    try {
        const { execSync } = require('child_process');
        execSync('node regen_vault_index.cjs');
        console.log('Manifest synchronized.');

        console.log('--- PUSHING TO GITHUB ---');
        execSync('git add data/ai-generated/vault/bowtie/*.json');
        execSync('git commit -m "feat(vault): add 50 fresh elite NGN Bowtie items (MISSION BOWTIE)"');
        execSync('git push origin main');
        console.log('Successfully pushed to GitHub & Vercel Triggered.');

    } catch (e) {
        console.error('Final sync/push failed:', e.message);
    }
}

runMissionBowtie();
