const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function push() {
    try {
        console.log(`[${new Date().toLocaleTimeString()}] Checking for changes...`);
        const status = execSync('git status --short').toString();
        if (status) {
            console.log("  Changes detected. Pushing to Vercel/Git...");
            execSync('git add .');
            execSync('git commit -m "feat: batch update of new generated items"');
            execSync('git push origin main');
            console.log("  Push successful.");
        } else {
            console.log("  No changes to push.");
        }
    } catch (e) {
        console.error("  Push error:", e.message);
    }
}

// Push every 2 minutes
setInterval(push, 120000);
push();
