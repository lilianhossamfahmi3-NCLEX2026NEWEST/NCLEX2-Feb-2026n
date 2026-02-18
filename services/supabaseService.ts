
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing. Falling back to local vault.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export async function fetchVaultFromCloud() {
    const { data, error } = await supabase
        .from('clinical_vault')
        .select('item_data');

    if (error) {
        console.error("Cloud fetch error:", error);
        return null;
    }

    return data.map(row => row.item_data);
}
