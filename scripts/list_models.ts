import 'dotenv/config';

const key = process.env.VITE_GEMINI_API_KEY_1;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function list() {
    try {
        const resp = await fetch(url);
        console.log(`Status: ${resp.status}`);
        const data = await resp.json();
        console.log(JSON.stringify(data, null, 2).substring(0, 1000));
    } catch (e: any) {
        console.error(e.message);
    }
}

list();
