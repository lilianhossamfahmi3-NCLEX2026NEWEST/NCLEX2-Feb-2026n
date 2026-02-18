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
    'Acute Pancreatitis', 'Hypertensive Crisis', 'Sepsis Recognition', 'Stroke Management',
    'Diabetes Insipidus', 'SIADH Management', 'Preeclampsia Priority', 'Cystic Fibrosis Nursing',
    'Lithium Toxicity', 'Serotonin Syndrome', 'Multiple Sclerosis Relapse', 'ARDS Ventilation',
    'Pulmonary Embolism', 'Myocardial Infarction', 'Heart Failure Decompensation', 'AKI Management',
    'CKD & Hemodialysis', 'Cirrhosis & Ascites', 'GI Bleed Priority', 'Schizophrenia Safety',
    'Major Depressive Disorder', 'Bipolar Mania Nursing', 'Anaphylactic Shock', 'Burn Surface Area Calculation',
    'Fluid Resuscitation in Burns', 'Compartment Syndrome', 'Fat Embolism Syndrome', 'Total Knee Arthroplasty',
    'Post-Op Atelectasis', 'Thoracic Surgery Safety', 'Hyperthyroidism/Grave\'s', 'Hypothyroidism/Myxedema',
    'Addisonian Crisis', 'Cushing\'s Syndrome', 'Pheochromocytoma', 'Autonomic Dysreflexia',
    'Guillain-Barre Syndrome', 'Myasthenia Gravis', 'Duchenne Muscular Dystrophy', 'Spina Bifida'
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

    const uniquenessSalt = `Scenario Seed ID: BATCH-300-${iteration}-${Date.now()}`;

    const prompt = `You are a Senior NCLEX-RN NGN Content Scientist (Standard 2026). 
Generate ONE ultra-high-fidelity NGN standalone question.

TOPIC: ${topic}
TYPE: ${type}
DIFFICULTY: Random (3-5)

CRITICAL REQUIREMENTS:
1. LOGIC & ACCURACY: Ensure 100% accuracy and internal synchronization between the scenario, the question, and the rationales. No clinical gaps.
2. DUPLICATE PREVENTION: Use this unique seed: ${uniquenessSalt}.
3. POINT-TO-POINT RATIONALE: Provide a specific clinical explanation for EVERY SINGLE option, blank, or finding in 'answerBreakdown'.
4. CJMM ALIGNMENT: Focus on one of the 6 CJMM steps.
5. STRUCTURE: Output pure JSON matching the MasterItem interface.

Return ONLY PURE JSON.`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.9 }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    let item = JSON.parse(data.candidates[0].content.parts[0].text);

    // POST-PROCESSING: Ensure randomization
    if (item.options) shuffleArray(item.options);
    if (item.actions) shuffleArray(item.actions);
    if (item.parameters) shuffleArray(item.parameters);
    if (item.potentialConditions) shuffleArray(item.potentialConditions);

    return item;
}

async function bulkGenerate(count) {
    console.log(`--- INITIATING BATCH 300: HIGH-FIDELITY GENERATION ---`);
    const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_bulk_v3');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 1; i <= count; i++) {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        const type = TYPES[Math.floor(Math.random() * TYPES.length)];

        try {
            console.log(`[${i}/${count}] Generating high-fidelity ${type} on ${topic}...`);
            const item = await promptAI(topic, type, i);
            const safeTopic = topic.replace(/[\s\/\\]+/g, '_').toLowerCase();
            const fileName = `${type}_${safeTopic}_v3_${Date.now()}_${i}.json`;
            fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(item, null, 4));
        } catch (e) {
            console.error(`Failed at iteration ${i}:`, e.message);
            await new Promise(r => setTimeout(r, 10000));
            i--;
        }

        // Taking a "breath" between generations to prevent hallucinations and AI exhaustion
        await new Promise(r => setTimeout(r, 6000));
    }

    console.log('--- GENERATION COMPLETE. SYNCING MASTER INDEX ---');
    try {
        const { execSync } = require('child_process');
        execSync('node regen_vault_index.cjs');
    } catch (err) {
        console.error('Index sync failed.');
    }
}

bulkGenerate(300);
