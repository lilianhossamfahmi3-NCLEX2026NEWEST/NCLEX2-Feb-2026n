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
    if (item.itemContext?.tabs && !Array.isArray(item.itemContext.tabs)) {
        item.itemContext.tabs = Object.entries(item.itemContext.tabs).map(([id, d]) => ({
            id, title: id.charAt(0).toUpperCase() + id.slice(1),
            content: typeof d === 'string' ? d : JSON.stringify(d)
        }));
    }
    if (!item.id || !item.id.startsWith('New-')) item.id = `New-v26-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return item;
}

const { validateItem } = require('./validation/sentinel_validator.cjs');

async function main() {
    console.log("🚀 STARTING FINAL BULK GEN (500 ITEMS)");
    const TARGET = 500;
    let saved = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');
    if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

    const TOPICS = ['Cardiovascular', 'Respiratory', 'Renal', 'Neurological', 'Sepsis', 'Maternal', 'Pediatric', 'Mental Health'];
    const TYPES = ['multipleChoice', 'selectAll', 'clozeDropdown', 'dragAndDropCloze', 'bowtie', 'trend', 'matrixMatch', 'highlight', 'priorityAction'];

    while (saved < TARGET) {
        const tasks = [];
        for (let i = 0; i < 4; i++) {
            tasks.push((async () => {
                const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
                const type = TYPES[Math.floor(Math.random() * TYPES.length)];

                const prompt = `You are a Lead NGN Psychometrician. Generate ONE NGN ${type} for "${topic}".
                MUST FOLLOW MASTERITEM SCHEMA:
                - stem (string)
                - itemContext { patient { name, age, gender, allergies, iso }, sbar (string, >130 words), tabs [ {id, title, content(HTML)} ] }
                - rationale { correct, incorrect, clinicalPearls [], questionTrap {trap, howToOvercome}, mnemonic {title, expansion} }
                - pedagogy { bloomLevel, cjmmStep, nclexCategory, difficulty, topicTags [] }
                - scoring { method, maxPoints }
                - type-specific fields (e.g., options, correctOptionId, rows, columns, correctMatches, etc.)
                Return ONLY JSON. NO markdown.`;

                let raw = await callAI(prompt);
                let item = normalize(raw, type);
                if (!item) return null;

                let report = validateItem(item);
                if (report.score >= 60) {
                    // One auto-repair pass if not perfect
                    if (report.score < 95) {
                        const repairPrompt = `NGN REPAIR: SCORE ${report.score}%. ERRORS: ${report.diags.join(', ')}. 
                        Provide perfect JSON for: ${JSON.stringify(item)}`;
                        const repaired = await callAI(repairPrompt);
                        if (repaired) {
                            item = normalize(repaired, type);
                            report = validateItem(item);
                        }
                    }

                    if (report.score >= 80) {
                        item.sentinelStatus = 'healed_v2026_v16_final';
                        const typeDir = path.join(rootDir, item.type);
                        if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
                        fs.writeFileSync(path.join(typeDir, `${item.id}.json`), JSON.stringify(item, null, 2));
                        await supabase.from('clinical_vault').upsert({ id: item.id, item_data: item, type: item.type }).catch(() => { });
                        return item.id;
                    }
                }
                return null;
            })());
        }
        const results = await Promise.all(tasks);
        saved += results.filter(Boolean).length;
        process.stdout.write(`\rProgress: ${saved}/${TARGET}`);
        await new Promise(r => setTimeout(r, 4000));
    }
}
main();
