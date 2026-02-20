const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
    const { data, error } = await supabase
        .from('clinical_vault')
        .select('id, type, item_data')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const row = data[0];
    console.log('Row ID:', row.id);
    console.log('Row type:', row.type);
    console.log('item_data type:', typeof row.item_data);

    if (typeof row.item_data === 'string') {
        console.log('item_data is a STRING (needs parsing)');
        console.log('First 200 chars:', row.item_data.substring(0, 200));
        try {
            const parsed = JSON.parse(row.item_data);
            console.log('Parsed type:', parsed.type);
            console.log('Has id:', !!parsed.id);
        } catch (e) {
            console.error('Failed to parse:', e.message);
        }
    } else if (typeof row.item_data === 'object') {
        console.log('item_data is an OBJECT');
        console.log('Keys:', Object.keys(row.item_data));
        console.log('Has .type:', row.item_data?.type);
        console.log('Has .id:', row.item_data?.id);
    }
}

check();
