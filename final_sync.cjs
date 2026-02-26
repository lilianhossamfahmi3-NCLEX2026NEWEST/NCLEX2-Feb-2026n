const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("🚀 STARTING FINAL DEPLOYMENT SYNC...");

    try {
        // 1. Sync Supabase to Disk
        console.log("\nStep 1: Syncing Supabase to Disk...");
        execSync('node disk_sync.cjs', { stdio: 'inherit' });

        // 2. Regenerate Vault Index
        console.log("\nStep 2: Regenerating Vault Index...");
        execSync('node regen_vault_index.cjs', { stdio: 'inherit' });

        // 3. Git Status check
        console.log("\nStep 3: Checking Git Status...");
        const status = execSync('git status --short').toString();
        if (status) {
            console.log("Changes detected. Preparing push...");
            execSync('git add .');
            execSync('git commit -m "fix: pedagogy schema alignment & QI recovery"');
            console.log("Pushing to origin...");
            execSync('git push origin main');
            console.log("✅ PUSH SUCCESSFUL.");
        } else {
            console.log("No changes detected.");
        }

    } catch (e) {
        console.error("❌ Sync failed:", e.message);
    }
}

run();
