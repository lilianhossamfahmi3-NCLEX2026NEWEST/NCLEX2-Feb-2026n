/**
 * NCLEX-RN NGN 2026 — ClozeDropdown Mass Generator (100 Items)
 * 
 * FEATURES:
 * - 14-key Gemini API rotation
 * - 9 Clinical Pillars coverage
 * - Full MasterItem schema compliance
 * - Detailed agreed rationale (answerBreakdown, clinicalPearls, questionTrap, mnemonic)
 * - Break after every 30 items (60-second cooldown)
 * - Auto-regenerates vault index after completion
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// ═══════════════════════════════════════════════════════════
//  1. API KEY ROTATOR (Full 14-Key Spectrum)
// ═══════════════════════════════════════════════════════════

const KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) KEYS.push(key);
}

if (KEYS.length === 0) {
    console.error('CRITICAL: No GEMINI_API_KEYs found in .env');
    process.exit(1);
}

console.log(`🔑 Initialized ${KEYS.length} API keys for rotation.`);

let keyIndex = 0;
function getNextKey() {
    const key = KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % KEYS.length;
    return key;
}

// ═══════════════════════════════════════════════════════════
//  2. THE 9 CLINICAL PILLARS (NCLEX-RN 2026)
// ═══════════════════════════════════════════════════════════

const NINE_PILLARS = [
    {
        pillar: 'Cardiac & Hemodynamic',
        topics: [
            'Acute Coronary Syndrome troponin interpretation',
            'Heart failure diuretic management',
            'Atrial fibrillation anticoagulation therapy',
            'Hypertensive crisis calcium channel blocker',
            'Cardiogenic shock dobutamine infusion',
            'Post-CABG hemodynamic monitoring',
            'Pericarditis assessment findings',
            'Cardiac tamponade Beck triad',
            'Endocarditis Duke criteria',
            'Ventricular tachycardia amiodarone protocol',
            'Post-MI rehabilitation milestones',
        ]
    },
    {
        pillar: 'Respiratory & Ventilation',
        topics: [
            'ARDS prone positioning protocol',
            'Ventilator-associated pneumonia prevention bundle',
            'COPD oxygen therapy titration',
            'Asthma peak flow zone management',
            'Pneumothorax chest tube management',
            'Pulmonary embolism heparin bridging',
            'Tracheostomy suctioning technique',
            'TB isolation precautions and INH therapy',
            'Sleep apnea CPAP compliance teaching',
            'Cystic fibrosis pancreatic enzyme timing',
            'Pleural effusion thoracentesis positioning',
        ]
    },
    {
        pillar: 'Neurological & Neurosurgical',
        topics: [
            'Increased ICP Cushing triad response',
            'Stroke tPA window and assessment',
            'Seizure post-ictal care management',
            'Meningitis lumbar puncture findings',
            'Guillain-Barré ascending paralysis monitoring',
            'Myasthenia gravis crisis differentiation',
            'Spinal cord injury level and assessment',
            'Parkinson disease levodopa timing',
            'Multiple sclerosis relapse management',
            'Brain tumor postoperative positioning',
            'Autonomic dysreflexia trigger identification',
        ]
    },
    {
        pillar: 'Renal & Fluid-Electrolyte',
        topics: [
            'Acute kidney injury BUN creatinine ratio',
            'Chronic kidney disease erythropoietin management',
            'Hyperkalemia emergency treatment cascade',
            'Hyponatremia fluid restriction protocol',
            'Metabolic acidosis bicarbonate replacement',
            'Peritoneal dialysis cloudy effluent response',
            'Hemodialysis AV fistula assessment',
            'Diuretic-induced hypokalemia potassium replacement',
            'Nephrotic syndrome albumin management',
            'Rhabdomyolysis CK levels and fluid therapy',
            'Post-kidney transplant immunosuppression',
        ]
    },
    {
        pillar: 'Maternal-Newborn & OB',
        topics: [
            'Preeclampsia magnesium sulfate monitoring',
            'Gestational diabetes insulin management',
            'Placental abruption versus previa differentiation',
            'Postpartum hemorrhage fundal massage technique',
            'Newborn hypoglycemia feeding protocol',
            'Rh incompatibility RhoGAM administration timing',
            'Preterm labor tocolytic therapy',
            'Eclampsia seizure management priorities',
            'Breastfeeding latch assessment and jaundice',
            'Shoulder dystocia McRoberts maneuver',
            'Amniotic fluid embolism emergency response',
        ]
    },
    {
        pillar: 'Pediatric & Growth',
        topics: [
            'Pyloric stenosis postoperative feeding protocol',
            'Kawasaki disease aspirin therapy phases',
            'Sickle cell crisis pain management hydration',
            'Croup versus epiglottitis differentiation',
            'Pediatric dehydration oral rehydration assessment',
            'Type 1 diabetes insulin pump management',
            'Wilms tumor preoperative precautions',
            'Intussusception barium enema reduction',
            'Congenital heart disease cyanotic spell management',
            'Lead poisoning chelation therapy monitoring',
            'Febrile seizure parent education',
        ]
    },
    {
        pillar: 'Mental Health & Psychosocial',
        topics: [
            'Suicide risk assessment and safety planning',
            'Lithium toxicity level interpretation',
            'SSRI serotonin syndrome recognition',
            'Alcohol withdrawal CIWA protocol',
            'Eating disorder refeeding syndrome monitoring',
            'Schizophrenia antipsychotic side effects',
            'Opioid overdose naloxone administration',
            'PTSD trauma-informed communication',
            'Bipolar disorder mood stabilizer teaching',
            'Delirium versus dementia differentiation',
            'Benzodiazepine withdrawal seizure prevention',
        ]
    },
    {
        pillar: 'Pharmacology & Safety',
        topics: [
            'Heparin protocol aPTT monitoring',
            'Warfarin INR management and vitamin K',
            'Insulin types onset peak duration matching',
            'Blood transfusion reaction identification',
            'Chemotherapy extravasation management',
            'Digoxin toxicity antidote administration',
            'Aminoglycoside peak trough monitoring',
            'Metformin lactic acidosis contrast dye protocol',
            'Opioid equianalgesic conversion',
            'Vancomycin red man syndrome prevention',
            'Nitroprusside cyanide toxicity monitoring',
        ]
    },
    {
        pillar: 'Leadership-Ethics & SDOH',
        topics: [
            'Scope of practice delegation to UAP',
            'Informed consent language barrier protocol',
            'Digital privacy HIPAA social media violation',
            'Cultural humility end-of-life preferences',
            'Advance directive DNR versus comfort care',
            'Mandatory reporting elder abuse assessment',
            'Health equity SDOH discharge barriers',
            'Triage disaster mass casualty prioritization',
            'Chain of command escalation procedure',
            'Organ donation referral criteria',
            'Gender-affirming care pronoun documentation',
        ]
    }
];

// ═══════════════════════════════════════════════════════════
//  3. GENERATION PROMPT (NGN 2026 Spec-Compliant)
// ═══════════════════════════════════════════════════════════

function buildPrompt(topic, pillarName, index) {
    return `You are a Lead NGN Psychometrician for NCLEX-RN 2026.

MISSION: Generate ONE Elite ClozeDropdown item. Return ONLY PURE JSON.

CLINICAL PILLAR: ${pillarName}
TOPIC: ${topic}
DIFFICULTY: ${3 + Math.floor(Math.random() * 2)} (3-4)
SEED: CLOZE-2026-${index}-${Date.now()}

SCHEMA (STRICT — follow EXACTLY):
{
  "id": "snake_case_descriptive_id_clozeDropdown_v2",
  "type": "clozeDropdown",
  "stem": "Complete the following clinical statement regarding [topic].",
  "template": "Sentence with {{blank1}} and {{blank2}} placeholders using double-brace syntax.",
  "blanks": [
    {
      "id": "blank1",
      "options": ["correct answer text", "plausible distractor 1", "plausible distractor 2"],
      "correctOption": "correct answer text"
    },
    {
      "id": "blank2",
      "options": ["correct answer text", "plausible distractor 1", "plausible distractor 2"],
      "correctOption": "correct answer text"
    }
  ],
  "pedagogy": {
    "bloomLevel": "analyze" or "apply",
    "cjmmStep": one of "recognizeCues","analyzeCues","prioritizeHypotheses","generateSolutions","takeAction","evaluateOutcomes",
    "nclexCategory": one of "Management of Care","Safety and Infection Prevention and Control","Health Promotion and Maintenance","Psychosocial Integrity","Basic Care and Comfort","Pharmacological and Parenteral Therapies","Reduction of Risk Potential","Physiological Adaptation",
    "difficulty": 3 or 4,
    "topicTags": ["Tag1", "Tag2", "Tag3"]
  },
  "rationale": {
    "correct": "Detailed pathophysiological explanation of why the correct options are right (100+ words).",
    "incorrect": "Detailed explanation of why each distractor is wrong (80+ words).",
    "answerBreakdown": [
      { "label": "Blank 1", "content": "Why the correct selection is correct.", "isCorrect": true },
      { "label": "Blank 1 Distractor", "content": "Why this distractor is wrong.", "isCorrect": false },
      { "label": "Blank 2", "content": "Why the correct selection is correct.", "isCorrect": true },
      { "label": "Blank 2 Distractor", "content": "Why this distractor is wrong.", "isCorrect": false }
    ],
    "clinicalPearls": ["High-yield clinical tip 1", "High-yield clinical tip 2"],
    "questionTrap": {
      "trap": "Name of the common test-taking trap",
      "howToOvercome": "Strategy to avoid it"
    },
    "mnemonic": {
      "title": "SHORT",
      "expansion": "Each letter stands for something clinically relevant"
    },
    "reviewUnits": [
      {
        "heading": "Key Concept Review",
        "body": "A concise educational review of the topic (80+ words)."
      }
    ]
  },
  "scoring": {
    "method": "polytomous",
    "maxPoints": 2  // (number of blanks)
  }
}

RULES:
1. Template MUST use {{blankId}} syntax (double curly braces).
2. Each blank MUST have exactly 3 options (1 correct + 2 distractors).
3. Distractors must be clinically plausible but definitively incorrect.
4. Rationale must contain deep pathophysiology, not generic filler.
5. "id" must be snake_case, descriptive, ending with "_clozeDropdown_v2".
6. "type" must be exactly "clozeDropdown".
7. All text must use professional clinical language.
8. Include 2 blanks minimum.
9. Include clinicalPearls (2), questionTrap, and mnemonic.
10. Return ONLY the JSON object — no markdown fences, no explanation.`;
}

// ═══════════════════════════════════════════════════════════
//  4. AI GENERATION LOGIC
// ═══════════════════════════════════════════════════════════

async function generateClozeItem(topic, pillarName, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const prompt = buildPrompt(topic, pillarName, index);

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json"
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`API ${resp.status}: ${errText.substring(0, 200)}`);
    }

    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini');

    let item = JSON.parse(rawText);

    // ── Post-processing validation ──
    if (!item.id) item.id = `${topic.replace(/[\s\/&]/g, '_').toLowerCase()}_clozeDropdown_v2_${index}`;
    item.type = 'clozeDropdown'; // Force correct type

    // Ensure blanks exist and have correct structure
    if (!item.blanks || !Array.isArray(item.blanks) || item.blanks.length < 2) {
        throw new Error('Item has missing or invalid blanks array');
    }

    // Ensure template uses {{}} syntax
    if (!item.template || !item.template.includes('{{')) {
        throw new Error('Template missing {{}} blank placeholders');
    }

    // Ensure scoring is set
    item.scoring = { method: 'polytomous', maxPoints: item.blanks.length };

    // Add sentinel status
    item.sentinelStatus = 'generated_v2026_batch2';
    item.createdAt = new Date().toISOString();

    return item;
}

// ═══════════════════════════════════════════════════════════
//  5. MAIN EXECUTION LOOP
// ═══════════════════════════════════════════════════════════

async function generateBatch() {
    const TARGET = 100;
    const BREAK_EVERY = 30;
    const BREAK_DURATION_MS = 60000; // 60 seconds
    const RATE_LIMIT_DELAY_MS = 4000; // 4 seconds between requests

    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'clozeDropdown');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  NCLEX-RN NGN 2026 — ClozeDropdown Generator');
    console.log('  Target: 100 Items | Keys: ' + KEYS.length + ' | 9 Pillars');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    let generated = 0;
    let failed = 0;
    let pillarIndex = 0;

    for (let i = 1; i <= TARGET; i++) {
        // Rotate through pillars
        const pillar = NINE_PILLARS[pillarIndex % NINE_PILLARS.length];
        const topicIndex = Math.floor(Math.random() * pillar.topics.length);
        const topic = pillar.topics[topicIndex];
        pillarIndex++;

        const keyNum = (keyIndex % KEYS.length) + 1;
        console.log(`[${i}/${TARGET}] [Key ${keyNum}/${KEYS.length}] [${pillar.pillar}] ${topic}...`);

        try {
            const item = await generateClozeItem(topic, pillar.pillar, i);

            const filename = `${item.id}.json`;
            const filePath = path.join(outputDir, filename);
            fs.writeFileSync(filePath, JSON.stringify(item, null, 4));
            generated++;
            console.log(`  ✓ Saved: ${filename} (${item.blanks.length} blanks)`);

        } catch (err) {
            failed++;
            console.error(`  ✗ FAILED: ${err.message}`);

            // On rate limit, wait extra time
            if (err.message.includes('429') || err.message.includes('quota')) {
                console.log('  ⏳ Rate limit detected. Cooling down 30s...');
                await new Promise(r => setTimeout(r, 30000));
                i--; // Retry this item
                continue;
            }
        }

        // Rate limit delay
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));

        // Break after every 30 items
        if (i % BREAK_EVERY === 0 && i < TARGET) {
            console.log('');
            console.log(`══ BREAK ══ ${generated} generated, ${failed} failed. Cooling for 60s...`);
            console.log('');
            await new Promise(r => setTimeout(r, BREAK_DURATION_MS));
        }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  COMPLETE: ${generated} generated | ${failed} failed`);
    console.log('═══════════════════════════════════════════════════');

    // Regenerate vault index
    console.log('');
    console.log('🔄 Regenerating vault index...');
    try {
        const { execSync } = require('child_process');
        execSync('node regen_vault_index.cjs', { stdio: 'inherit' });
        console.log('✓ Vault index regenerated.');
    } catch (e) {
        console.error('⚠ Index regeneration failed. Run `node regen_vault_index.cjs` manually.');
    }
}

generateBatch();
