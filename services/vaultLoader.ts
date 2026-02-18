import { MasterItem } from '../types/master';

let cachedVault: MasterItem[] | null = null;
let isLoading = false;
const listeners: ((items: MasterItem[]) => void)[] = [];

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
        // 1. Try Supabase Cloud First
        const { fetchVaultFromCloud } = await import('./supabaseService');
        const cloudItems = await fetchVaultFromCloud();

        if (cloudItems && cloudItems.length > 0) {
            cachedVault = cloudItems as MasterItem[];
            console.log(`[VaultLoader] Successfully loaded ${cachedVault.length} items from Supabase Cloud.`);
        } else {
            // 2. Fallback to local 11MB vault if cloud fails or is empty
            console.warn("[VaultLoader] Cloud empty or failed. Falling back to local vaultItems.ts...");
            const module = await import('../data/vaultItems');
            cachedVault = module.VAULT_ITEMS;
            console.log(`[VaultLoader] Successfully loaded ${cachedVault?.length} stand-alone items from Local Storage.`);
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
            const module = await import('../data/vaultItems');
            return module.VAULT_ITEMS;
        } catch (e) {
            throw error;
        }
    }
}

export function isVaultLoaded(): boolean {
    return !!cachedVault;
}
