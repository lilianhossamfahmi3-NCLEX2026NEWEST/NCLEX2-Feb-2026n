require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ═══════════════════════════════════════════════════════════
//  Configuration & API Keys
// ═══════════════════════════════════════════════════════════
console.log("Initializing Supabase...");
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const API_KEYS = [
    process.env.VITE_GEMINI_API_KEY_1, process.env.VITE_GEMINI_API_KEY_2,
    process.env.VITE_GEMINI_API_KEY_3, process.env.VITE_GEMINI_API_KEY_4,
    process.env.VITE_GEMINI_API_KEY_5, process.env.VITE_GEMINI_API_KEY_6,
    process.env.VITE_GEMINI_API_KEY_7, process.env.VITE_GEMINI_API_KEY_8,
    process.env.VITE_GEMINI_API_KEY_9, process.env.VITE_GEMINI_API_KEY_10,
    process.env.VITE_GEMINI_API_KEY_11, process.env.VITE_GEMINI_API_KEY_12,
    process.env.VITE_GEMINI_API_KEY_13, process.env.VITE_GEMINI_API_KEY_14
].filter(Boolean);

console.log(`Loaded ${API_KEYS.length} API keys.`);

let keyIndex = 0;
function getNextKey() {
    const key = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    return key;
}

const NGN_2026_PROMPT_TEMPLATE = `
You are a Lead NGN Psychometrician (2026 Edition).
TASK: REPAIR the following item to meet 100% SentinelQA compliance.
Return ONLY PURE JSON matching the MasterItem interface.
{{ITEM_JSON}}
`;

function normalize(item) {
    if (!item) return null;
    const type = item.type || item.itemType || 'multipleChoice';
    item.type = type;

    // 1. Rationales (Must be strings)
    if (item.rationale) {
        ['correct', 'incorrect'].forEach(k => {
            if (Array.isArray(item.rationale[k])) item.rationale[k] = item.rationale[k].join(' ');
        });
    }

    // 2. Options Normalization
    if (item.options && Array.isArray(item.options)) {
        item.options = item.options.map((opt, i) => {
            const id = String.fromCharCode(97 + i);
            if (typeof opt === 'string') return { id, text: opt };
            if (!opt.id) return { ...opt, id };
            return opt;
        });
    }

    // 3. Pedagogy Normalization (CRITICAL FIX)
    if (!item.pedagogy) item.pedagogy = {};

    const bloomMap = { 'Remember': 'remember', 'Understand': 'understand', 'Apply': 'apply', 'Analyze': 'analyze', 'Evaluate': 'evaluate', 'Create': 'create', 'Remembering': 'remember', 'Understanding': 'understand', 'Applying': 'apply', 'Analyzing': 'analyze', 'Evaluating': 'evaluate', 'Creating': 'create' };
    item.pedagogy.bloomLevel = bloomMap[item.pedagogy.bloomLevel] || item.pedagogy.bloomLevel?.toLowerCase() || 'apply';

    const cjmmMap = {
        'Recognize Cues': 'recognizeCues', 'Analyze Cues': 'analyzeCues',
        'Prioritize Hypotheses': 'prioritizeHypotheses', 'Generate Solutions': 'generateSolutions',
        'Take Action': 'takeAction', 'Evaluate Outcomes': 'evaluateOutcomes',
        'Analyze': 'analyzeCues', 'Action': 'takeAction', 'Recognize': 'recognizeCues'
    };
    item.pedagogy.cjmmStep = cjmmMap[item.pedagogy.cjmmStep] || item.pedagogy.cjmmStep || 'analyzeCues';

    const catMap = {
        'Safe and Effective Care Environment': 'Management of Care',
        'Safety and Infection Control': 'Safety and Infection Prevention and Control',
        'Health Promotion': 'Health Promotion and Maintenance',
        'Psychosocial': 'Psychosocial Integrity',
        'Basic Care': 'Basic Care and Comfort',
        'Pharmacological': 'Pharmacological and Parenteral Therapies',
        'Risk Potential': 'Reduction of Risk Potential',
        'Physiological': 'Physiological Adaptation'
    };
    const validCats = [
        'Management of Care', 'Safety and Infection Prevention and Control',
        'Health Promotion and Maintenance', 'Psychosocial Integrity',
        'Basic Care and Comfort', 'Pharmacological and Parenteral Therapies',
        'Reduction of Risk Potential', 'Physiological Adaptation'
    ];
    if (!validCats.includes(item.pedagogy.nclexCategory)) {
        item.pedagogy.nclexCategory = catMap[item.pedagogy.nclexCategory] || item.pedagogy.nclexCategory || 'Physiological Adaptation';
    }

    // 4. Tabs
    const mandatoryIds = ['sbar', 'vitals', 'labs', 'physicalExam', 'radiology', 'carePlan', 'mar'];
    const currentTabs = Array.isArray(item.itemContext?.tabs) ? item.itemContext.tabs : [];
    const finalTabs = mandatoryIds.map(id => {
        const existing = currentTabs.find(t => (t.id || t.title || '').toLowerCase() === id.toLowerCase());
        if (existing) return { ...existing, id };
        return { id, title: id.charAt(0).toUpperCase() + id.slice(1), content: '<p>No significant findings at this time.</p>' };
    });
    if (!item.itemContext) item.itemContext = {};
    item.itemContext.tabs = finalTabs;

    return item;
}

async function runDeepAIHeal(item) {
    const apiKey = getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = NGN_2026_PROMPT_TEMPLATE.replace('{{ITEM_JSON}}', JSON.stringify(item, null, 2));

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!resp.ok) return null;

        const data = await resp.json();
        const rawJson = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
        let repaired = JSON.parse(rawJson);
        repaired = normalize(repaired);
        repaired.sentinelStatus = 'healed_v2026_v18_master';
        return repaired;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log("🚀 STARTING GLOBAL MASTER HEAL...");
    const vaultDir = path.join(__dirname, 'data', 'ai-generated', 'vault');
    const files = [];
    const dirs = [vaultDir];
    while (dirs.length > 0) {
        const d = dirs.pop();
        if (!fs.existsSync(d)) continue;
        const list = fs.readdirSync(d);
        for (const f of list) {
            const p = path.join(d, f);
            if (fs.statSync(p).isDirectory()) dirs.push(p);
            else if (f.endsWith('.json')) files.push(p);
        }
    }

    console.log(`Found ${files.length} files.`);
    let aiCount = 0;

    for (const file of files) {
        let content = JSON.parse(fs.readFileSync(file, 'utf8'));
        let items = Array.isArray(content) ? content : [content];
        let fileChanged = false;

        for (let j = 0; j < items.length; j++) {
            const item = items[j];
            if (!item || !item.id) continue;

            const normalized = normalize(item);
            if (normalized) { items[j] = normalized; fileChanged = true; }

            if (!item.sentinelStatus?.includes('healed_v2026_v18')) {
                console.log(`Deep Healing ${item.id}...`);
                const healed = await runDeepAIHeal(items[j]);
                if (healed) { items[j] = healed; fileChanged = true; aiCount++; }
            }
        }

        if (fileChanged) {
            fs.writeFileSync(file, JSON.stringify(Array.isArray(content) ? items : items[0], null, 2));
            for (const it of items) {
                await supabase.from('clinical_vault').upsert({
                    id: it.id, type: it.type || 'unknown', item_data: it,
                    topic_tags: it.pedagogy?.topicTags || [],
                    nclex_category: it.pedagogy?.nclexCategory || null,
                    difficulty: it.pedagogy?.difficulty || 3
                }, { onConflict: 'id' });
            }
        }
    }
    console.log(`Done. AI items healed: ${aiCount}`);
}

main();
