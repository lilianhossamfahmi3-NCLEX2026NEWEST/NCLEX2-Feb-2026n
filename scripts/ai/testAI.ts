import { promptAI } from './engine.js';
async function test() {
    console.log('Testing AI connection...');
    try {
        const res = await promptAI('Return {"test": true}');
        console.log('Success:', res);
    } catch (e) {
        console.error('Failed:', e);
    }
}
test();
