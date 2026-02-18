import fs from 'fs/promises';
import path from 'path';
import { promptAI, GENERATION_PROMPT_TEMPLATE } from './engine.js';

/**
 * NCLEX-RN NGN Batch Generator
 * Saves generated case studies to data/ai-generated/case-studies/
 */

const OUTPUT_DIR = path.resolve('data/ai-generated/case-studies');

async function generateCaseStudy(topic: string, difficulty: number) {
    const slug = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `cs_${slug}.json`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    // Best Utilization: Local Caching
    try {
        await fs.access(filePath);
        console.log(`⏩ Skipping: ${topic} already exists in local storage.`);
        return;
    } catch {
        // Continue to generation
    }

    console.log(`🚀 Starting generation for: ${topic} (Difficulty: ${difficulty})`);

    const prompt = GENERATION_PROMPT_TEMPLATE
        .replace('{{TOPIC}}', topic)
        .replace('{{DIFFICULTY}}', difficulty.toString());

    try {
        const caseStudy = await promptAI(prompt);

        // Ensure ID is file-safe
        await fs.writeFile(filePath, JSON.stringify(caseStudy, null, 2));
        console.log(`✅ Success! Case study saved to: ${filePath}`);
        return caseStudy;
    } catch (e) {
        console.error(`❌ Failed to generate: ${topic}`, e);
    }
}

// Example usage (uncomment to run via vite-node or similar)
// generateCaseStudy('Septic Shock in a Geriatric Patient', 5);
