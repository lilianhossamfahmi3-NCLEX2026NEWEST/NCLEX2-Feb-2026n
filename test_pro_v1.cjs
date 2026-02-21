const dotenv = require('dotenv');
dotenv.config();
const key = process.env.VITE_GEMINI_API_KEY_1;

async function test() {
    console.log("Testing gemini-1.5-pro with v1...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${key}`;
        const body = { contents: [{ parts: [{ text: "Hello" }] }] };
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await resp.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
