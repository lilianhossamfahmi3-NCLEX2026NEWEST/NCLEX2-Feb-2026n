import { MasterItem } from '../types/master';

let cachedVault: MasterItem[] | null = null;
let isLoading = false;
const listeners: ((items: MasterItem[]) => void)[] = [];

/**
 * Loads the local vault JSON at runtime via fetch().
 * This avoids importing the massive .ts file which crashes TypeScript.
 */
async function loadLocalVault(): Promise<MasterItem[]> {
    const response = await fetch('/data/vaultItems.json');
    if (!response.ok) {
        throw new Error(`Failed to fetch local vault: ${response.status}`);
    }
    const items: MasterItem[] = await response.json();
    return items;
}

/**
 * NCLEX-RN NGN Simulator — Lazy Vault Loader
 * Prevents main bundle bloat by loading the 11MB vault on demand.
 */
export async function getVaultItems(): Promise<MasterItem[]> {
    if (cachedVault) {
        return cachedVault;
    }

    if (isLoading) {
        return new Promise((resolve) => {
            listeners.push(resolve);
        });
    }

    isLoading = true;
    console.log("[VaultLoader] Initializing NGN vault load (Cloud Primary)...");

    try {
        // 1. Load Local Vault First (Always consistent with Git codebase)
        console.log("[VaultLoader] Loading local vaultItems.json...");
        const localItems = await loadLocalVault();

        // 2. Try Supabase Cloud Second (Layered data)
        const { fetchVaultFromCloud } = await import('./supabaseService');
        const cloudItems = await fetchVaultFromCloud();

        if (cloudItems && cloudItems.length > 0) {
            // Merge logic: Start with local, add cloud items that don't conflict, 
            // OR prefer cloud for existing IDs? 
            // Usually, cloud is "more recent" edits, so cloud wins on ID collision.
            const itemMap = new Map<string, MasterItem>();

            // Local items (baseline)
            localItems.forEach(item => {
                if (item.id) itemMap.set(item.id, item);
            });

            // Cloud items (overwrites/additions)
            cloudItems.forEach((item: any) => {
                if (item.id) itemMap.set(item.id, item as MasterItem);
            });

            cachedVault = Array.from(itemMap.values());
            console.log(`[VaultLoader] Successfully merged ${localItems.length} local items with ${cloudItems.length} cloud items. Total: ${cachedVault.length}`);
        } else {
            cachedVault = localItems;
            console.log(`[VaultLoader] Successfully loaded ${cachedVault.length} stand-alone items from Local Storage only.`);
        }

        // Notify any pending listeners
        listeners.forEach(resolve => resolve(cachedVault!));
        listeners.length = 0;

        return cachedVault!;
    } catch (error) {
        console.error("[VaultLoader] Failed to load NGN vault:", error);
        isLoading = false;

        // Final desperate fallback if even the above fails
        try {
            return await loadLocalVault();
        } catch (e) {
            throw error;
        }
    }
}

export function isVaultLoaded(): boolean {
    return !!cachedVault;
}
