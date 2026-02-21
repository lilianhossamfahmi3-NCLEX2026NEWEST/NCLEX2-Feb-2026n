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
    "RN vs LPN vs UAP Delegation"
];

async function generateBowtie(topic, index) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const prompt = `
You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN BOWTIE Item.

TOPIC: \${topic}
CATEGORY: Bowtie

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Populated EHR subsections in 'itemContext.tabs' (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR) MUST sync with the item stem.
2. SBAR: Exactly 120-160 words, military time (HH:mm). Must be realistic clinical note.
3. EXHIBITS: 
   - Vitals: Min 3 timepoints showing clinical trend.
   - Labs: Populated with relevant cues (values/units/ranges).
   - Care Plan & MAR: Must be populated if relevant to the condition.
4. BOWTIE LOGIC:
   - Column 1: Actions to Take (Exactly 2 correct).
   - Column 2: Potential Condition (Exactly 1 correct).
   - Column 3: Parameters to Monitor (Exactly 2 correct).
5. RATIONALE: Deep pathophysiology explanations for ALL options (Rationale.answerBreakdown).
6. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap' (strategy), and 'mnemonic'.

JSON STRUCTURE:
{
  "id": "bowtie_\${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2026",
  "type": "bowtie",
  "stem": "Concise nursing prompt following the EHR review...",
  "itemContext": {
    "tabs": [
       { "id": "sbar", "title": "Nurses' Notes", "content": "120-160 word SBAR..." },
       { "id": "vitals", "title": "Vital Signs", "content": "Flowsheet string or HTML table..." },
       { "id": "labs", "title": "Lab Results", "content": "..." },
       { "id": "exam", "title": "Physical Exam", "content": "..." },
       { "id": "orders", "title": "Care Plan", "content": "..." },
       { "id": "mar", "title": "MAR", "content": "..." }
    ]
  },
  "actions": [ { "id": "a1", "text": "..." }, ... ],
  "potentialConditions": [ "C1", "C2", "C3", "C4" ],
  "condition": "Target Condition",
  "parameters": [ { "id": "p1", "text": "..." }, ... ],
  "correctActionIds": ["aX", "aY"],
  "correctParameterIds": ["pX", "pY"],
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "takeAction",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["\${topic}"]
  },
  "rationale": {
    "correct": "...",
    "incorrect": "...",
    "answerBreakdown": [ ... ],
    "clinicalPearls": [ ... ],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  },
  "scoring": { "method": "polytomous", "maxPoints": 5 },
  "sentinelStatus": "healed_v2026_v8"
}

Return ONLY pure JSON. No thinking block. No markdown.
`;

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
        const errText = await resp.text();
        throw new Error(\`API Error \${resp.status}: \${errText}\`);
    }

    const data = await resp.json();
    let text = data.candidates[0].content.parts[0].text;
    // Strip markdown if AI ignored instruction
    text = text.replace(/^\`\\`\\`json\\n/, '').replace(/\\n\`\\`\\`$/, '');
    return JSON.parse(text);
}

const outputDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'bowtie');

async function test() {
    console.log('Testing single generation...');
    try {
        const item = await generateBowtie(TOPICS[0], 0);
        console.log('Successfully generated item:');
        console.log(JSON.stringify(item, null, 2).substring(0, 500) + '...');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        const filename = \`\${TOPICS[0].toLowerCase().replace(/[^a-z0-9]/g, '_')}_bowtie_v2026.json\`;
        fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(item, null, 2));
        console.log(\`Saved to \${filename}\`);
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
