
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

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

    // item_data may be stored as a JSON string (text column) rather than JSONB.
    // Parse it if needed so the frontend gets usable objects.
    return data.map(row => {
        const raw = row.item_data;
        if (typeof raw === 'string') {
            try { return JSON.parse(raw); }
            catch { return raw; }
        }
        return raw;
    });
}
