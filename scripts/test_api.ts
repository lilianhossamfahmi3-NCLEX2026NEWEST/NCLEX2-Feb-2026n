import 'dotenv/config';

const model = 'gemini-2.5-pro';
const key = process.env.VITE_GEMINI_API_KEY_1;
const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;

const body = {
    contents: [{ parts: [{ text: "echo 'hello'" }] }]
};

async function test() {
    console.log(`Testing URL: https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=REDACTED`);
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        console.log(`Status: ${resp.status}`);
        const data = await resp.json();
        console.log(`Response: ${JSON.stringify(data).substring(0, 200)}...`);
    } catch (e: any) {
        console.error(`Error: ${e.message}`);
    }
}

test();
