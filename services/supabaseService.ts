
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Lazy-initialize the Supabase client.
 * We do NOT call createClient at module-load time because
 * it throws "supabaseUrl is required" when env vars are missing
 * (e.g. during some Vercel builds) and crashes the entire app.
 */
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (_supabase) return _supabase;
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase credentials missing. Cloud vault unavailable.");
        return null;
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
}

// Backward-compatible export — may be null if no credentials
export const supabase = null as unknown as SupabaseClient;

export async function fetchVaultFromCloud() {
    const client = getSupabase();
    if (!client) {
        console.warn("[Supabase] No credentials — returning null.");
        return null;
    }

    const { data, error } = await client
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
