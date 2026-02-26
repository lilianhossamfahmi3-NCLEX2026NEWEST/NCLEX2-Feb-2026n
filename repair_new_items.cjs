require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function normalize(item) {
    if (!item) return null;
    const type = item.type;

    // 1. Pedagogy Normalization (EXHAUSTIVE)
    if (!item.pedagogy) item.pedagogy = {};

    // Bloom
    const bloomMap = {
        'remembering': 'remember', 'remember': 'remember',
        'understanding': 'understand', 'understand': 'understand',
        'applying': 'apply', 'apply': 'apply',
        'analyzing': 'analyze', 'analyze': 'analyze',
        'evaluating': 'evaluate', 'evaluate': 'evaluate',
        'creating': 'create', 'create': 'create'
    };
    const b = String(item.pedagogy.bloomLevel || '').toLowerCase();
    item.pedagogy.bloomLevel = bloomMap[b] || 'apply';

    // CJMM
    const cjmmMap = {
        'recognizing cues': 'recognizeCues', 'recognize cues': 'recognizeCues', 'recognize': 'recognizeCues', 'recognizing': 'recognizeCues',
        'analyzing cues': 'analyzeCues', 'analyze cues': 'analyzeCues', 'analyze': 'analyzeCues', 'analyzing': 'analyzeCues',
        'prioritize hypotheses': 'prioritizeHypotheses', 'prioritizing hypotheses': 'prioritizeHypotheses', 'prioritize': 'prioritizeHypotheses',
        'generate solutions': 'generateSolutions', 'generating solutions': 'generateSolutions', 'solutions': 'generateSolutions',
        'take action': 'takeAction', 'taking action': 'takeAction', 'action': 'takeAction', 'implement': 'takeAction', 'implementation': 'takeAction',
        'evaluate outcomes': 'evaluateOutcomes', 'evaluating outcomes': 'evaluateOutcomes', 'evaluate': 'evaluateOutcomes', 'evaluation': 'evaluateOutcomes'
    };
    const c = String(item.pedagogy.cjmmStep || '').toLowerCase();
    item.pedagogy.cjmmStep = cjmmMap[c] || 'analyzeCues';

    // NCLEX Category
    const validCats = [
        'Management of Care', 'Safety and Infection Prevention and Control',
        'Health Promotion and Maintenance', 'Psychosocial Integrity',
        'Basic Care and Comfort', 'Pharmacological and Parenteral Therapies',
        'Reduction of Risk Potential', 'Physiological Adaptation'
    ];

    const catStr = String(item.pedagogy.nclexCategory || '').toLowerCase();
    let finalCat = 'Physiological Adaptation';

    if (catStr.includes('management')) finalCat = 'Management of Care';
    else if (catStr.includes('safety') || catStr.includes('infection')) finalCat = 'Safety and Infection Prevention and Control';
    else if (catStr.includes('promotion') || catStr.includes('maintenance')) finalCat = 'Health Promotion and Maintenance';
    else if (catStr.includes('psychosocial')) finalCat = 'Psychosocial Integrity';
    else if (catStr.includes('basic care')) finalCat = 'Basic Care and Comfort';
    else if (catStr.includes('pharmacological') || catStr.includes('parenteral')) finalCat = 'Pharmacological and Parenteral Therapies';
    else if (catStr.includes('risk')) finalCat = 'Reduction of Risk Potential';
    else if (catStr.includes('physiological') || catStr.includes('adaptation')) finalCat = 'Physiological Adaptation';

    item.pedagogy.nclexCategory = finalCat;

    if (!item.pedagogy.difficulty) item.pedagogy.difficulty = 3;
    if (!item.pedagogy.topicTags || !Array.isArray(item.pedagogy.topicTags)) item.pedagogy.topicTags = ['General'];

    item.sentinelStatus = 'healed_v2026_v20_qi_final';
    return item;
}

async function startRepair() {
    const { data: items, error } = await supabase
        .from('clinical_vault')
        .select('*')
        .ilike('id', 'New-v26-%');

    if (error) return console.error(error);
    console.log(`Repairing ${items.length} items (with flat column updates)...`);

    let count = 0;
    for (const row of items) {
        let item = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;
        const repairedItem = normalize(item);

        await supabase.from('clinical_vault').upsert({
            id: row.id,
            item_data: repairedItem,
            type: repairedItem.type,
            nclex_category: repairedItem.pedagogy.nclexCategory,
            topic_tags: repairedItem.pedagogy.topicTags,
            difficulty: repairedItem.pedagogy.difficulty
        }, { onConflict: 'id' });

        count++;
        if (count % 100 === 0) console.log(`${count}...`);
    }
    console.log("Done!");
}

startRepair();
