import fs from 'fs/promises';
import { promptAI } from './engine.js';

async function run() {
    console.log('Generating Priority Action item...');
    const prompt = `
You are a Board-Certified Nurse Educator. 
Generate a HIGH-QUALITY NGN Standalone Item of type "priorityAction".
Topic: Malignant Hyperthermia.
Include a clinical stem (max 50 words), 4 options, correctOptionId, and high-fidelity rationale.
Return ONLY JSON.
`;
    try {
        const item = await promptAI(prompt);
        await fs.writeFile('data/ai-generated/vault/priorityAction/malignant_hyperthermia_priorityAction_v1.json', JSON.stringify(item, null, 4));
        console.log('Success!');
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}
run();
