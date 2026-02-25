require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BLOOM_MAP = {
    'applying': 'apply',
    'analyzing': 'analyze',
    'understanding': 'understand',
    'evaluating': 'evaluate',
    'remembering': 'remember',
    'creating': 'create'
};

const CJMM_MAP = {
    'take actions': 'takeActions',
    'analyze cues': 'analyzeCues',
    'generate solutions': 'generateSolutions',
    'evaluate outcomes': 'evaluateOutcomes',
    'prioritize hypotheses': 'prioritizeHypotheses',
    'recognize cues': 'recognizeCues'
};

function migrateItem(item) {
    let changed = false;
    let repaired = { ...item };

    // 1. Sync Type
    const oldType = repaired.type;
    if (!repaired.type && (repaired.itemType || repaired.questionType)) {
        repaired.type = repaired.itemType || repaired.questionType;
        changed = true;
    }

    // Normalize type casing (e.g. MatrixMatch -> matrixMatch)
    if (repaired.type && repaired.type[0] === repaired.type[0].toUpperCase()) {
        const lowerType = repaired.type.charAt(0).toLowerCase() + repaired.type.slice(1);
        if (lowerType !== repaired.type) {
            repaired.type = lowerType;
            changed = true;
        }
    }

    // 2. Handle missing/flat Pedagogy
    if (!repaired.pedagogy) {
        repaired.pedagogy = {
            bloomLevel: (repaired.cognitiveLevel || repaired.bloomLevel || 'apply').toLowerCase(),
            cjmmStep: repaired.clinicalProcess || repaired.cjmmStep || 'analyzeCues',
            nclexCategory: repaired.clientNeed || repaired.nclexCategory || 'Physiological Adaptation',
            topicTags: repaired.contentArea ? [repaired.contentArea] : (repaired.topicTags || ['Uncategorized']),
            difficulty: parseInt(repaired.difficulty) || 3
        };
        changed = true;
    }

    // 3. Normalize Pedagogy Fields
    if (repaired.pedagogy) {
        const p = repaired.pedagogy;

        // Normalize Bloom
        const bLow = (p.bloomLevel || 'apply').toLowerCase();
        if (BLOOM_MAP[bLow] && BLOOM_MAP[bLow] !== p.bloomLevel) {
            p.bloomLevel = BLOOM_MAP[bLow];
            changed = true;
        }

        // Normalize CJMM
        const cLow = (p.cjmmStep || 'analyzeCues').toLowerCase().replace(/_/g, ' ');
        if (CJMM_MAP[cLow] && CJMM_MAP[cLow] !== p.cjmmStep) {
            p.cjmmStep = CJMM_MAP[cLow];
            changed = true;
        }

        // Enforce Numeric Difficulty
        if (typeof p.difficulty !== 'number') {
            const oldDiff = p.difficulty;
            p.difficulty = parseInt(oldDiff) || (oldDiff === 'Moderate' || oldDiff === 'Medium' ? 3 : (oldDiff === 'Easy' ? 2 : (oldDiff === 'Hard' ? 4 : 3)));
            if (p.difficulty !== oldDiff) changed = true;
        }
    }

    // 4. Rationale Migration
    if (typeof repaired.rationale === 'string') {
        repaired.rationale = {
            correct: repaired.rationale,
            incorrect: '',
            clinicalPearls: repaired.clinicalPearls || [],
            questionTrap: repaired.questionTrap ? { trap: 'Focus Area', howToOvercome: repaired.questionTrap } : undefined,
            answerBreakdown: [],
            reviewUnits: []
        };
        changed = true;
    }

    // 5. Cleanup root-level legacy fields if they exist in pedagogy or elsewhere
    const rootMetadata = ['itemType', 'questionType', 'cognitiveLevel', 'bloomLevel', 'cjmmStep', 'clinicalProcess', 'clientNeed', 'contentArea', 'difficulty'];
    rootMetadata.forEach(key => {
        if (repaired[key] !== undefined && key !== 'type' && key !== 'id') {
            // Keep it for now to be safe, but if it's a string difficulty, definitely remove it
            if (key === 'difficulty' && typeof repaired[key] === 'string') {
                delete repaired[key];
                changed = true;
            }
        }
    });

    // 6. Fix MISSION specific issues (missing rationale/scoring)
    if (!repaired.rationale || (typeof repaired.rationale === 'object' && !repaired.rationale.correct)) {
        if (!repaired.rationale) repaired.rationale = {};
        if (!repaired.rationale.correct) {
            repaired.rationale.correct = "Clinical rationale pending deep clinical alignment.";
            changed = true;
        }
    }

    if (!repaired.scoring) {
        repaired.scoring = { method: 'polytomous', maxPoints: 1 };
        changed = true;
    }

    // Sync selectAll scoring
    if (repaired.type === 'selectAll' && repaired.correctOptionIds) {
        repaired.scoring.maxPoints = repaired.correctOptionIds.length;
        repaired.scoring.method = 'polytomous';
    }

    return { repaired, changed };
}

async function runCloudMigration() {
    console.log("Starting Cloud Deep Refresh...");
    const PAGE_SIZE = 1000;
    let allData = [];
    let from = 0;

    while (true) {
        let { data, error } = await supabase.from('clinical_vault').select('id, item_data').range(from, from + PAGE_SIZE - 1);
        if (error) { console.error(error); return; }
        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    let updates = [];
    for (let row of allData) {
        const { repaired, changed } = migrateItem(row.item_data);
        if (changed) {
            updates.push({
                id: row.id,
                type: repaired.type || 'unknown',
                item_data: repaired,
                topic_tags: repaired.pedagogy?.topicTags || [],
                nclex_category: repaired.pedagogy?.nclexCategory || null,
                difficulty: repaired.pedagogy?.difficulty || 3
            });
        }
    }

    console.log(`Cloud: ${updates.length} / ${allData.length} items need updates.`);
    const BATCH_SIZE = 50;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        const { error: upsertErr } = await supabase.from('clinical_vault').upsert(batch, { onConflict: 'id' });
        if (upsertErr) console.error("Batch error:", upsertErr);
        else console.log(`Uploaded batch ${i / BATCH_SIZE + 1}`);
    }
}

// Logic to walk local files
const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
function walk(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) walk(fullPath, results);
        else if (file.endsWith('.json')) results.push(fullPath);
    }
    return results;
}

async function runLocalMigration() {
    console.log("Starting Local Deep Refresh...");
    const files = walk(VAULT_DIR);
    let count = 0;
    for (const file of files) {
        try {
            const raw = fs.readFileSync(file, 'utf8');
            let content = JSON.parse(raw);
            const isArray = Array.isArray(content);
            let items = isArray ? content : [content];
            let fileChanged = false;

            const fixed = items.map(it => {
                const { repaired, changed } = migrateItem(it);
                if (changed) fileChanged = true;
                return repaired;
            });

            if (fileChanged) {
                fs.writeFileSync(file, JSON.stringify(isArray ? fixed : fixed[0], null, 2), 'utf8');
                count++;
            }
        } catch (e) { }
    }
    console.log(`Local: Updated ${count} files.`);
}

async function main() {
    await runLocalMigration();
    await runCloudMigration();
    console.log("Deep Refresh Complete.");
}

main();
