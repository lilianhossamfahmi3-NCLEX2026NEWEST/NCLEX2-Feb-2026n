require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log("Testing Supabase connection...");
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('clinical_vault').select('id').limit(1);
    if (error) console.error("Supabase Error:", error);
    else console.log("Supabase OK, first ID:", data[0]?.id);

    console.log("Testing File Walk...");
    const vaultDir = path.join(__dirname, 'data', 'ai-generated', 'vault');
    console.log("Vault Dir:", vaultDir);
}
main();
