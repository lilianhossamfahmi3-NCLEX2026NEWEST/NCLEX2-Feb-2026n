
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

    // Supabase PostgREST returns max 1000 rows per request.
    // Paginate in batches to fetch ALL items.
    const PAGE_SIZE = 1000;
    const allRows: any[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await client
            .from('clinical_vault')
            .select('item_data')
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error("Cloud fetch error:", error);
            if (allRows.length > 0) break; // return what we have
            return null;
        }

        if (!data || data.length === 0) break;
        allRows.push(...data);

        // If we got fewer than PAGE_SIZE, we've reached the end
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    console.log(`[Supabase] Fetched ${allRows.length} total rows.`);

    // item_data may be stored as a JSON string (text column) rather than JSONB.
    // Parse it if needed so the frontend gets usable objects.
    return allRows.map(row => {
        const raw = row.item_data;
        if (typeof raw === 'string') {
            try { return JSON.parse(raw); }
            catch { return raw; }
        }
        return raw;
    });
}

/**
 * Persists an item to the Supabase cloud vault.
 */
export async function upsertItemToCloud(item: any) {
    const client = getSupabase();
    if (!client) return { error: 'Supabase not configured' };

    const { error } = await client
        .from('clinical_vault')
        .upsert({
            id: item.id,
            type: item.type || 'unknown',
            item_data: item,
            topic_tags: item.pedagogy?.topicTags || [],
            nclex_category: item.pedagogy?.nclexCategory || null,
            difficulty: typeof item.pedagogy?.difficulty === 'number' ? item.pedagogy.difficulty : (parseInt(item.pedagogy?.difficulty) || 3)
        }, { onConflict: 'id' });

    if (error) {
        console.error("Cloud upsert error:", error);
    }
    return { error };
}

/**
 * Removes an item from the cloud vault.
 */
export async function deleteItemFromCloud(itemId: string) {
    const client = getSupabase();
    if (!client) return { error: 'Supabase not configured' };

    const { error } = await client
        .from('clinical_vault')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error("Cloud delete error:", error);
    }
    return { error };
}
