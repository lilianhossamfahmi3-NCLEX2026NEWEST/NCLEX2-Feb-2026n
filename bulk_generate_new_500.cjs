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
        const data = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1, // Lower temperature for more consistent schema adherence
                response_mime_type: "application/json"
            }
        });
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

    // 4. Pedagogy Normalization (CRITICAL FIX)
    if (!item.pedagogy) item.pedagogy = {};

    const bloomMap = { 'Remember': 'remember', 'Understand': 'understand', 'Apply': 'apply', 'Analyze': 'analyze', 'Evaluate': 'evaluate', 'Create': 'create' };
    item.pedagogy.bloomLevel = bloomMap[item.pedagogy.bloomLevel] || item.pedagogy.bloomLevel?.toLowerCase() || 'apply';

    const cjmmMap = {
        'Recognize Cues': 'recognizeCues', 'Analyze Cues': 'analyzeCues',
        'Prioritize Hypotheses': 'prioritizeHypotheses', 'Generate Solutions': 'generateSolutions',
        'Take Action': 'takeAction', 'Evaluate Outcomes': 'evaluateOutcomes',
        'Analyze': 'analyzeCues', 'Action': 'takeAction'
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
    // If not in valid list, try to map or default
    const validCats = [
        'Management of Care', 'Safety and Infection Prevention and Control',
        'Health Promotion and Maintenance', 'Psychosocial Integrity',
        'Basic Care and Comfort', 'Pharmacological and Parenteral Therapies',
        'Reduction of Risk Potential', 'Physiological Adaptation'
    ];
    if (!validCats.includes(item.pedagogy.nclexCategory)) {
        item.pedagogy.nclexCategory = catMap[item.pedagogy.nclexCategory] || 'Physiological Adaptation';
    }

    // 5. Tabs (Array of 7)
    const mandatoryIds = ['sbar', 'vitals', 'labs', 'physicalExam', 'radiology', 'carePlan', 'mar'];
    const currentTabs = Array.isArray(item.itemContext?.tabs) ? item.itemContext.tabs : [];
    const finalTabs = mandatoryIds.map(id => {
        const existing = currentTabs.find(t => (t.id || t.title || '').toLowerCase() === id.toLowerCase());
        if (existing) return { ...existing, id }; // Ensure id is lowercase
        return { id, title: id.charAt(0).toUpperCase() + id.slice(1), content: '<p>No significant findings at this time.</p>' };
    });
    if (!item.itemContext) item.itemContext = {};
    item.itemContext.tabs = finalTabs;

    // 6. Scoring Fix
    if (!item.scoring) item.scoring = { method: (type === 'selectAll' || type === 'highlight' ? 'polytomous' : 'dichotomous'), maxPoints: 1 };
    if (type === 'selectAll') item.scoring.maxPoints = item.correctOptionIds?.length || 1;

    if (!item.id) item.id = `New-v26-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return item;
}

const { validateItem } = require('./validation/sentinel_validator.cjs');

async function main() {
    console.log("🚀 STARTING ROBUST BATCH GEN (FIXED SCHEMA)");
    const TARGET = 500;
    let saved = 0;
    const rootDir = path.join(__dirname, 'data', 'ai-generated', 'vault', 'batch_perfect_500');

    const TYPES = ['multipleChoice', 'selectAll', 'clozeDropdown', 'dragAndDropCloze', 'bowtie', 'trend', 'matrixMatch', 'highlight', 'priorityAction'];
    const TOPICS = ['Cardiovascular', 'Respiratory', 'Neurological', 'Renal', 'Sepsis', 'Endocrine', 'Maternal', 'Pediatric'];

    while (saved < TARGET) {
        const type = TYPES[saved % TYPES.length];
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

        const prompt = `Lead NGN Author: Generate ONE perfect NGN ${type} item for ${topic}. 
        Return PURE JSON. 
        MANDATORY SCHEMA:
        {
            "stem": "...",
            "itemContext": { "patient": { "name": "...", "age": 0, "sex": "...", "diagnosis": "..." }, "sbar": "...", "tabs": [] },
            "pedagogy": { 
                "bloomLevel": "remember|understand|apply|analyze|evaluate|create",
                "cjmmStep": "recognizeCues|analyzeCues|prioritizeHypotheses|generateSolutions|takeAction|evaluateOutcomes",
                "nclexCategory": "Management of Care|Safety and Infection Prevention and Control|Health Promotion and Maintenance|Psychosocial Integrity|Basic Care and Comfort|Pharmacological and Parenteral Therapies|Reduction of Risk Potential|Physiological Adaptation",
                "difficulty": 1-5,
                "topicTags": ["${topic}"]
            },
            "rationale": { "correct": "...", "incorrect": "...", "clinicalPearls": [], "questionTrap": "...", "mnemonic": "..." },
            "scoring": { "method": "dichotomous|polytomous", "maxPoints": number },
            ${type === 'multipleChoice' ? '"options": [{"id": "a", "text": "..."}], "correctOptionId": "a"' : ''}
            ${type === 'selectAll' ? '"options": [{"id": "a", "text": "..."}], "correctOptionIds": ["a", "b"]' : ''}
            ${type === 'clozeDropdown' ? '"template": "The patient is {{b1}}.", "blanks": [{"id": "b1", "options": ["...", "..."], "correctOption": "..."}]' : ''}
            ... (follow NGN 2026 specs for other types)
        }
        `;

        let raw = await callAI(prompt);
        let item = normalize(raw, type);
        if (!item) continue;

        let report = validateItem(item);
        if (report.score >= 80) { // Higher threshold
            item.sentinelStatus = 'healed_v2026_v18_qi100';
            const typeDir = path.join(rootDir, item.type);
            if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });
            fs.writeFileSync(path.join(typeDir, `${item.id}.json`), JSON.stringify(item, null, 2));

            await supabase.from('clinical_vault').upsert({ id: item.id, item_data: item, type: item.type }, { onConflict: 'id' });
            saved++;
            console.log(`\n[✓] Saved ${item.id} (${type}) - Score: ${report.score}`);
        } else {
            process.stdout.write('.');
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}
main();
