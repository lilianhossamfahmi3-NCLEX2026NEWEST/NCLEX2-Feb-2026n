const dotenv = require('dotenv');
dotenv.config();
const key = process.env.VITE_GEMINI_API_KEY_1;

async function test() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
test();
