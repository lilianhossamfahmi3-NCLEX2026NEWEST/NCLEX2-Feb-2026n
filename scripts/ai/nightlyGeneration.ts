import fs from 'fs/promises';
import path from 'path';
import { promptAI } from './engine';

/**
 * NCLEX-RN NGN Nightly Autonomous Intelligence Lab
 * Generates 140 high-fidelity items every cycle.
 */

const VAULT_DIR = path.resolve('data/ai-generated/vault');

const ITEM_TYPES = [
    'highlight',
    'multipleChoice',
    'selectAll',
    'selectN',
    'orderedResponse',
    'matrixMatch',
    'clozeDropdown',
    'dragAndDropCloze',
    'bowtie',
    'trend',
    'priorityAction',
    'hotspot',
    'graphic',
    'audioVideo',
    'chartExhibit'
];

const TOPICS = {
    trending: [
        'AI in Nursing Diagnostics',
        'Post-COVID Cardiovascular Sequelae',
        'Ethical Implications of Genomic Testing',
        'Emerging Viral Hemorrhagic Fevers',
        'Telehealth Triage Protocols'
    ],
    specialized: [
        'ECMO Circuit Management & Complications',
        'CAR-T Cell Therapy Adverse Effects',
        'Neonatal Abstinence Syndrome (NAS)',
        'Advanced Ventilator Modes (APRV/PRVC)',
        'Continuous Renal Replacement Therapy (CRRT)'
    ],
    general: [
        'Pharmacology - High Alert Medications',
        'Fundamentals - Pressure Injury Staging',
        'Maternity - Postpartum Hemorrhage',
        'Psychiatric - Serotonin Syndrome',
        'Med-Surg - Acid-Base Interpretation'
    ]
};

async function generateBatch() {
    console.log('🌙 Starting Nightly Clinical Generation Sequence at 10 PM...');

    for (const type of ITEM_TYPES) {
        console.log(`📡 Processing Item Type: ${type}`);

        for (let i = 0; i < 10; i++) {
            // Difficulty logic: 2 out of 10 must be Level 5
            const difficulty = i < 2 ? 5 : Math.floor(Math.random() * 3) + 2; // 2, 3, or 4

            // Topic rotation
            const category = i % 3 === 0 ? 'trending' : i % 3 === 1 ? 'specialized' : 'general';
            const topics = TOPICS[category as keyof typeof TOPICS];
            const topic = topics[Math.floor(Math.random() * topics.length)];

            const prompt = `
You are a Board-Certified Nurse Educator.
Generate a HIGH-QUALITY NGN Standalone Item of type "${type}".

REQUIREMENTS:
1. Format: STRICT JSON matching the ${type.toUpperCase()} interface.
2. Clinical Topic: ${topic}
3. Difficulty Level: ${difficulty} (on a scale of 1-5)
4. Pedagogical Accuracy: Must be medically accurate and comply with 2026 NCSBN standards.
5. Completeness: Include detailed rationale, clinical pearls, and a 'questionTrap'.

Return ONLY the JSON. No conversational text.
`;

            try {
                const item = await promptAI(prompt);
                item.createdAt = new Date().toISOString();
                item.pedagogy = {
                    ...item.pedagogy,
                    difficulty,
                    topicTags: [...(item.pedagogy?.topicTags || []), category, 'nightly-auto']
                };

                const dir = path.join(VAULT_DIR, type);
                await fs.mkdir(dir, { recursive: true });

                const filePath = path.join(dir, `${item.id || Date.now()}_v1.json`);
                await fs.writeFile(filePath, JSON.stringify(item, null, 4));

                console.log(`✅ [${type}] ${i + 1}/10: ${item.id} (Diff: ${difficulty})`);
            } catch (error) {
                console.error(`❌ Generation error for ${type} at index ${i}:`, error);
            }
        }
    }

    console.log('🏁 Nightly Generation Sequence Complete.');
}

if (require.main === module) {
    generateBatch().catch(console.error);
}

export { generateBatch };
