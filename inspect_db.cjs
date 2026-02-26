require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
    const { data, error } = await supabase
        .from('clinical_vault')
        .select('*')
        .ilike('id', 'New-v26-%')
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else if (data && data.length > 0) {
        data.forEach(item => {
            console.log(`\n--- Item: ${item.id} ---`);
            const itemData = typeof item.item_data === 'string' ? JSON.parse(item.item_data) : item.item_data;
            console.log("Type:", itemData.type);
            console.log("Pedagogy:", JSON.stringify(itemData.pedagogy, null, 2));
            console.log("First 100 chars of stem:", itemData.stem?.substring(0, 100));
        });
    } else {
        console.log("No items found with New-v26- prefix.");
    }
}

inspect();
