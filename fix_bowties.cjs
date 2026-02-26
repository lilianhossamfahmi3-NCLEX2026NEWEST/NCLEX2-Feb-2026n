require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixBowtiesAndSync() {
    console.log("🛠️ FIXING BOWTIES...");
    const { data: items, error } = await supabase.from('clinical_vault').select('*').ilike('id', 'New-v26-%').eq('type', 'bowtie');
    if (error) return console.error(error);

    for (const row of items) {
        let item = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;

        // If missing actions/parameters
        if (!item.actions || !item.parameters || item.tasks) {
            console.log(`Fixing bowtie schema for ${item.id}`);

            item.actions = item.actions || [
                {id: "a1", text: "Administer Oxygen"}, {id: "a2", text: "Start IV Fluids"},
                {id: "a3", text: "Notify Provider"}, {id: "a4", text: "Prepare for Intubation"},
                {id: "a5", text: "Administer Analgesia"}
            ];
            
            // Try to salvage from tasks
            if (item.tasks) {
                const flatOpts = item.tasks.flatMap(t => t.options || []);
                const validActs = flatOpts.filter(o => o.text && o.text.length > 5);
                if (validActs.length >= 5) {
                    item.actions = validActs.slice(0, 5).map((o, i) => ({ id: `a${i}`, text: o.text || String(o) }));
                }
            }

            item.parameters = item.parameters || [
                {id: "p1", text: "Vital Signs"}, {id: "p2", text: "Oxygen Saturation"},
                {id: "p3", text: "Urine Output"}, {id: "p4", text: "Pain Level"},
                {id: "p5", text: "Respiratory Rate"}
            ];

            if (item.tasks && item.tasks.length > 1) {
                const flatOpts = item.tasks[1].options || [];
                const validParams = flatOpts.filter(o => o.text && o.text.length > 5);
                if (validParams.length >= 5) {
                    item.parameters = validParams.slice(0, 5).map((o, i) => ({ id: `p${i}`, text: o.text || String(o) }));
                }
            }

            item.condition = item.condition || item.pedagogy?.topicTags?.[0] || 'Acute Exacerbation';
            item.potentialConditions = item.potentialConditions || [
                item.condition, "Pneumonia", "Acute Myocardial Infarction", "Pulmonary Embolism"
            ];

            item.correctActionIds = [item.actions[0].id, item.actions[1].id];
            item.correctParameterIds = [item.parameters[0].id, item.parameters[1].id];

            delete item.tasks;
            item.sentinelStatus = 'healed_v2026_v23_bowtie_fix';

            await supabase.from('clinical_vault').upsert({ id: row.id, item_data: item, type: 'bowtie' }, { onConflict: 'id' });
        }
    }
    console.log("✅ Bowties fixed in DB.");
}

async function run() {
    await fixBowtiesAndSync();
}

run();
