require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching cloud items...");
    // Need to paginate if more than 1000 items
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
        let item = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;
        let changed = false;

        // 0. AI Schema Migration (Fixing "Flat" generated items)
        if (item.itemType && !item.type) {
            item.type = item.itemType;
            changed = true;
        }

        if (!item.pedagogy && (item.cognitiveLevel || item.clientNeed || item.contentArea)) {
            item.pedagogy = {
                bloomLevel: (item.cognitiveLevel || 'apply').toLowerCase(),
                cjmmStep: item.clinicalProcess || 'analyzeCues',
                nclexCategory: item.clientNeed || 'Physiological Adaptation',
                topicTags: item.contentArea ? [item.contentArea] : ['Uncategorized'],
                difficulty: parseInt(item.difficulty) || 3
            };
            changed = true;
        }

        if (typeof item.rationale === 'string') {
            const strRationale = item.rationale;
            item.rationale = {
                correct: strRationale,
                incorrect: '',
                clinicalPearls: item.clinicalPearls ? [item.clinicalPearls] : [],
                questionTrap: item.questionTrap ? { trap: 'Focus Area', howToOvercome: item.questionTrap } : undefined,
                mnemonic: item.mnemonic ? { title: 'HINT', expansion: item.mnemonic } : undefined,
                answerBreakdown: [],
                reviewUnits: []
            };
            changed = true;
        }

        if (item.options && Array.isArray(item.options)) {
            const correctOpts = item.options.filter(o => o.isCorrect === true);
            if (correctOpts.length > 0) {
                if (item.type === 'multipleChoice' && !item.correctOptionId) {
                    item.correctOptionId = correctOpts[0].id;
                    changed = true;
                }
                if (item.type === 'selectAll' && !item.correctOptionIds) {
                    item.correctOptionIds = correctOpts.map(o => o.id);
                    changed = true;
                }
                if (item.type === 'highlight' && !item.correctSpanIndices) {
                    item.correctSpanIndices = correctOpts.map((o, idx) => idx);
                    item.passage = item.passage || item.options.map(o => o.text).join(' ');
                    changed = true;
                }
            }
        }

        // 1. Fix Missing/Wrong Scoring Defaults
        if (!item.scoring) {
            item.scoring = { method: 'polytomous', maxPoints: 1 };
            changed = true;
        }

        // 2. Fix maxPoints for selectAll (Dichotomous vs Polytomous common error)
        if (item.type === 'selectAll' && item.correctOptionIds) {
            const expected = item.correctOptionIds.length;
            if (item.scoring.maxPoints !== expected) {
                item.scoring.maxPoints = expected;
                item.scoring.method = 'polytomous';
                changed = true;
            }
        }

        // 3. Fix maxPoints for Multiple Choice (Must be 1)
        const dichotomousTypes = ['multipleChoice', 'priorityAction', 'trend', 'graphic', 'audioVideo', 'chartExhibit'];
        if (dichotomousTypes.includes(item.type) && (item.scoring.maxPoints !== 1 || item.scoring.method !== 'dichotomous')) {
            item.scoring.maxPoints = 1;
            item.scoring.method = 'dichotomous';
            changed = true;
        }

        if (changed) {
            updates.push({
                id: row.id,
                type: item.type || 'unknown',
                item_data: item,
                topic_tags: item.pedagogy?.topicTags || [],
                nclex_category: item.pedagogy?.nclexCategory || null,
                difficulty: typeof item.pedagogy?.difficulty === 'number' ? item.pedagogy.difficulty : (parseInt(item.pedagogy?.difficulty) || 3)
            });
        }
    }

    console.log(`Found ${updates.length} items needing cloud migration.`);

    // Process in batches to avoid timeout/limits
    const BATCH_SIZE = 50;
    let successCount = 0;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        const { error: upsertErr } = await supabase.from('clinical_vault').upsert(batch, { onConflict: 'id' });
        if (upsertErr) console.error("Batch error:", upsertErr);
        else {
            successCount += batch.length;
            console.log(`Migrated cloud items ${i + 1} to ${i + batch.length}...`);
        }
    }
    console.log(`Cloud Migration Complete. Updated ${successCount} items.`);
}

run();
