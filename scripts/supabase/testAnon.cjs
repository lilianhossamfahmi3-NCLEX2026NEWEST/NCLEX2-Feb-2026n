const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
    console.log('Testing with ANON key (same as frontend)...');
    console.log('URL:', process.env.VITE_SUPABASE_URL);

    const { data, error, count } = await supabase
        .from('clinical_vault')
        .select('id', { count: 'exact', head: true });

    if (error) {
        console.error('ERROR:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        console.error('Code:', error.code);
    } else {
        console.log('Anon key can read clinical_vault. Count:', count);
    }

    // Also try fetching a few items the same way as the frontend
    const { data: items, error: fetchErr } = await supabase
        .from('clinical_vault')
        .select('item_data')
        .limit(3);

    if (fetchErr) {
        console.error('Fetch error:', fetchErr.message);
    } else {
        console.log('Fetched items count:', items?.length);
        if (items?.length > 0) {
            console.log('Sample item type:', items[0]?.item_data?.type);
        }
    }
}

check();
