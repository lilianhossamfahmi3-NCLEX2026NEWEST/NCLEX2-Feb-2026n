const dotenv = require('dotenv');
dotenv.config();

const KEYS = [];
for (let i = 1; i <= 14; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) KEYS.push({ id: i, key });
}

async function verify(keyObj) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + keyObj.key;
    try {
        const resp = await fetch(url);
        if (resp.ok) {
            console.log("Key " + keyObj.id + ": SUCCESS");
            return true;
        } else {
            const err = await resp.json();
            console.log("Key " + keyObj.id + ": FAILED (" + resp.status + ") - " + err.error.message);
            return false;
        }
    } catch (e) {
        console.log("Key " + keyObj.id + ": ERROR - " + e.message);
        return false;
    }
}

async function run() {
    console.log('Verifying 14 API Keys...');
    for (const keyObj of KEYS) {
        await verify(keyObj);
    }
}

run();
