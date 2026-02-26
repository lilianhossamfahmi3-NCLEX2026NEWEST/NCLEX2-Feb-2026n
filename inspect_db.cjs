require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
    const { data, error } = await supabase.from('clinical_vault').select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Columns:", Object.keys(data[0]));
        console.log("Sample row:", JSON.stringify(data[0], null, 2));
    }
}

inspect();
