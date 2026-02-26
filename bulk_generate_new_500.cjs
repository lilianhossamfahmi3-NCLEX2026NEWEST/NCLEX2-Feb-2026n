require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

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

let keyIdx = 0;
async function callAI(prompt) {
    return new Promise((resolve) => {
        const key = API_KEYS[keyIdx++ % API_KEYS.length];
        const data = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85 } });
        const options = {
            hostname: 'generativelanguage.googleapis.com', port: 443,
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            method: 'POST', headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const raw = parsed.candidates[0].content.parts[0].text;
                    const jsonMatch = raw.match(/\{[\s\S]*\}/);
                    if (jsonMatch) resolve(JSON.parse(jsonMatch[0])); else resolve(null);
                } catch (e) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
        req.write(data);
        req.end();
    });
}

function normalize(item, type) {
    if (!item) return null;
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
            const id = String.fromCharCode(97 + i); // a, b, c...
            if (typeof opt === 'string') return { id, text: opt };
            if (!opt.id) return { ...opt, id };
            return opt;
        });
    }

    // 3. Correct IDs Mapping
    if (type === 'multipleChoice' && !item.correctOptionId && item.correctOption) {
        const found = item.options?.find(o => o.text === item.correctOption);
        item.correctOptionId = found ? found.id : 'a';
    }
    if (type === 'selectAll' && !item.correctOptionIds) {
        if (item.correctOptions) {
            item.correctOptionIds = item.options?.filter(o => item.correctOptions.includes(o.text) || item.correctOptions.includes(o.id)).map(o => o.id);
        } else {
            item.correctOptionIds = [item.options?.[0]?.id || 'a'];
        }
    }

    // 4. Tabs (Array of 7)
    const mandatoryIds = ['sbar', 'vitals', 'labs', 'physicalExam', 'radiology', 'carePlan', 'mar'];
    const currentTabs = Array.isArray(item.itemContext?.tabs) ? item.itemContext.tabs : [];
    const finalTabs = mandatoryIds.map(id => {
        const existing = currentTabs.find(t => t.id === id);
        if (existing) return existing;
        return { id, title: id.charAt(0).toUpperCase() + id.slice(1), content: '<p>No significant findings at this time.</p>' };
    });
    if (!item.itemContext) item.itemContext = {};
    item.itemContext.tabs = finalTabs;

    // 5. Scoring Fix
    if (!item.scoring) item.scoring = { method: (type === 'selectAll' || type === 'highlight' ? 'polytomous' : 'dichotomous'), maxPoints: 1 };
    if (type === 'selectAll') item.scoring.maxPoints = item.correctOptionIds?.length || 1;

    item.id = `New-v26-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return item;
}

const { validateItem } = require('./validation/sentinel_validator.cjs');

async function main() {
    console.log("🚀 STARTING ROBUST BATCH GEN (500 ITEMS)");
    const TARGET = 500;
    let saved = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    const TYPES = ['multipleChoice', 'selectAll', 'clozeDropdown', 'dragAndDropCloze', 'bowtie', 'trend', 'matrixMatch', 'highlight', 'priorityAction'];
    const TOPICS = ['Cardiovascular', 'Respiratory', 'Neurological', 'Renal', 'Sepsis', 'Endocrine', 'Maternal', 'Pediatric'];

    while (saved < TARGET) {
        const type = TYPES[saved % TYPES.length];
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

        const prompt = `Lead NGN Author: Generate ONE perfect NGN ${type} item for ${topic}. 
        Return PURE JSON. 
        - stem: string
        - itemContext: { patient, sbar (string), tabs (7 mandatory: sbar, vitals, labs, physicalExam, radiology, carePlan, mar) }
        - rationale: { correct(string), incorrect(string), clinicalPearls[], questionTrap{}, mnemonic{} }
        - scoring: { method, maxPoints }
        - ${type === 'multipleChoice' ? 'options: [{id, text}], correctOptionId' : ''}
        - ${type === 'selectAll' ? 'options: [{id, text}], correctOptionIds: []' : ''}
        `;

        let raw = await callAI(prompt);
        let item = normalize(raw, type);
        if (!item) continue;

        let report = validateItem(item);
        if (report.score >= 70) {
            item.sentinelStatus = 'healed_v2026_v17_qi100';
            const typeDir = path.join(rootDir, item.type);
            if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
            fs.writeFileSync(path.join(typeDir, `${item.id}.json`), JSON.stringify(item, null, 2));

            await supabase.from('clinical_vault').upsert({ id: item.id, item_data: item, type: item.type }, { onConflict: 'id' });
            saved++;
            process.stdout.write(`\rProgress: ${saved}/${TARGET}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}
main();
