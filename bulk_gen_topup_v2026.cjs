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

async function generateItem(topic, category) {
    const key = getNextKey();
    const model = 'gemini-2.0-flash';
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

    const prompt = `You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
MISSION: Generate ONE Elite-Level Standalone NGN Item.

TOPIC: ${topic}
CATEGORY: ${category}

2026 MASTER SPECIFICATION COMPLIANCE:
1. TAB SYNC: Full EHR subsections. (SBAR, Labs, Vitals, Physical Exam, Radiology, Care Plan, MAR).
2. SBAR: 120-160 words, military time.
3. RATIONALE: Deep clinical/pathophysiological explanations.
4. EXTRAS: Mandatory 'clinicalPearls', 'questionTrap', and 'mnemonic'.

Return ONLY pure JSON matching the MasterItem interface.`;

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

async function runTopUp() {
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault');

    const tasks = [
        { category: 'multipleChoice', count: 5, topic: 'Advanced Hemodynamics / Arterial Lines' },
        { category: 'multipleChoice', count: 5, topic: 'Digital Privacy & Social Media Ethics' },
        { category: 'selectAll', count: 10, topic: 'Health Equity & SDOH Barriers' },
        { category: 'selectAll', count: 10, topic: 'Advanced Patient Monitoring (LVAD/ICP)' }
    ];

    console.log("🚀 Starting Top-Up Generation...");

    for (const task of tasks) {
        const categoryDir = path.join(rootDir, task.category);
        if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });

        for (let i = 0; i < task.count; i++) {
            console.log(`[${task.category}] Generating ${i + 1}/${task.count} on ${task.topic}...`);
            try {
                const item = await generateItem(task.topic, task.category);
                const filename = `${task.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${task.category}_v2026_${Date.now()}.json`;
                fs.writeFileSync(path.join(categoryDir, filename), JSON.stringify(item, null, 2));
                console.log("   ✅ Success");
            } catch (err) {
                console.error("   ❌ Failed: " + err.message);
            }
            await new Promise(r => setTimeout(r, 4000));
        }
    }

    console.log("🏁 Top-Up Batch Complete.");
}

runTopUp();
