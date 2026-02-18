import fs from 'fs/promises';
import path from 'path';
import { promptAI } from './engine.js';

/**
 * NCLEX-RN NGN Standalone Item Generator
 * Generates items for the Vault.
 */

const VAULT_DIR = path.resolve('data/ai-generated/vault');

async function generateAndSaveItems(type: string, count: number, template: string) {
    const dir = path.join(VAULT_DIR, type);
    await fs.mkdir(dir, { recursive: true });

    console.log(`🚀 Starting generation for type: ${type} (${count} items)`);

    for (let i = 0; i < count; i++) {
        const prompt = `
You are a Board-Certified Nurse Educator. 
Generate a HIGH-QUALITY NGN Standalone Item of type "${type}".

REQUIREMENTS:
1. Format: STRICT JSON matching the schema for ${type}.
2. Clinical Topic: Choose a high-yield NCLEX topic (Respiratory, Cardiac, Neuro, Renal, etc.).
3. Content: Must be medically accurate, following 2026 NGN standards.
4. Structure: ${template}

Return ONLY the JSON. No conversational text.
`;

        try {
            const item = await promptAI(prompt);
            const slug = item.id || `${type}_${Date.now()}_${i}`;
            const filePath = path.join(dir, `${slug}_v1.json`);

            await fs.writeFile(filePath, JSON.stringify(item, null, 4));
            console.log(`✅ [${i + 1}/${count}] Saved: ${filePath}`);
        } catch (e) {
            console.error(`❌ Failed to generate item ${i + 1} for ${type}:`, e);
        }
    }
}

// Templates for prompt
const TEMPLATES: Record<string, string> = {
    priorityAction: "Include a clinical stem (max 50 words), 4 options (exactly 4), correctOptionId, and high-fidelity rationale with answerBreakdown, clinicalPearls, and questionTrap.",
    selectN: "Include a clinical stem (must say 'Select the N most...'), options (5-8), correctOptionIds (exactly N), and high-fidelity rationale.",
    bowtie: "Include causes (options for left), condition (correct condition text for center), actions (options for right), parameters (options for right), correctCauseIds, correctActionIds, correctParameterIds, and rationale.",
    trend: "Include dataPoints (at least 3 time points with vital/lab values), a specific question about the trend, options, correctOptionId, and rationale.",
    chartExhibit: "Include 1-3 exhibits (title/content with HTML tables/notes), 4 options, correctOptionId, and rationale.",
    hotspot: "Include imageUrl (use matching medical placeholder), hotspots (id, x, y, width, height, label), correctHotspotIds, and rationale.",
    graphic: "Include options where each option has an id, imageUrl, and altText. 4 options total. correctOptionId and rationale.",
    audioVideo: "Include mediaUrl, mediaType ('audio'|'video'), 4 options, correctOptionId, and rationale."
};

async function main() {
    const typesToGenerate = [
        'priorityAction',
        'selectN',
        'bowtie',
        'trend',
        'chartExhibit',
        'hotspot',
        'graphic',
        'audioVideo'
    ];

    for (const type of typesToGenerate) {
        await generateAndSaveItems(type, 10, TEMPLATES[type]);
    }
}

main().catch(console.error);
