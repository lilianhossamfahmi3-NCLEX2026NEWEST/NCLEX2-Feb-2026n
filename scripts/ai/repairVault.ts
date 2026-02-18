
console.log("Script starting...");
import * as fs from 'fs';
import * as path from 'path';
import { promptAI } from './engine.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERIC_MARKERS = [
    "physiological instability identified during assessment",
    "represents a misinterpretation of the gathered cues",
    "failure to prioritize physiological needs",
    "might delay more critical interventions",
    "is incorrect as it introduces clinical risk",
    "deviates from standard triage logic",
    "common distractor; it is either a non-specific finding",
    "represents a critical metric that must be monitored"
];

function isGeneric(text: string): boolean {
    const lower = text.toLowerCase();
    return GENERIC_MARKERS.some(marker => lower.includes(marker.toLowerCase()));
}

const VAULT_ROOT = path.join(__dirname, '..', '..', 'data', 'ai-generated', 'vault');

async function repairSingleItem(item: any): Promise<any> {
    // Force the AI to be creative by removing the bad templates from the context
    const strippedItem = JSON.parse(JSON.stringify(item));
    if (strippedItem.rationale) {
        delete strippedItem.rationale.answerBreakdown;
        delete strippedItem.rationale.clinicalPearls;
        delete strippedItem.rationale.questionTrap;
        delete strippedItem.rationale.mnemonic;
        delete strippedItem.rationale.reviewUnits;
    }

    const repairPrompt = `
You are an Elite NCLEX-RN NGN Psychometrician & Content Scientist (Standard 2026).
Your task is to REPAIR and UPGRADE this specific NGN item to 100% High-Fidelity 2026 Standards.
The previous rationales were generic; you must provide SPECIFIC, pathophysiology-based content.

CURRENT ITEM CONTEXT:
${JSON.stringify(strippedItem, null, 2)}

SPECIFIC REPAIR INSTRUCTIONS:
1. answerBreakdown: Create a unique 'content' for EVERY option. Explain EXACTLY why that specific option is correct or incorrect for this case.
2. Pathophysiology: Rationales must explain the 'why' (e.g., fluid dynamics, electrolyte roles, safety risks).
3. questionTrap & mnemonics: Produce high-yield, specific content for this topic.
4. CRITICAL: DO NOT use generic phrases like "physiological instability", "represents a misinterpretation", or "might delay interventions". These are strictly forbidden.
5. PRESERVE ID: The 'id' MUST remain: "${item.id}".

OUTPUT: Return ONLY the upgraded JSON object.
`;

    const upgraded = await promptAI(repairPrompt, 'gemini-2.5-pro');
    if (upgraded && item.id) upgraded.id = item.id;
    return upgraded;
}

async function repairFile(filePath: string) {
    console.log(`[Repair] File: ${path.relative(VAULT_ROOT, filePath)}`);
    const content = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(content);

    if (Array.isArray(data)) {
        console.log(`  -> Array detected (${data.length} items). Processing sub-items...`);
        for (let i = 0; i < data.length; i++) {
            // Only repair if it contains a generic marker
            const itemString = JSON.stringify(data[i]);
            if (isGeneric(itemString)) {
                console.log(`    [${i + 1}/${data.length}] Repairing item ${data[i].id || i}...`);
                try {
                    data[i] = await repairSingleItem(data[i]);
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) {
                    console.error(`    [!] Partial failure on item ${i}. Skipping upgrade for this item.`);
                }
            }
        }
    } else {
        data = await repairSingleItem(data);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    console.log(`[Success] File updated: ${filePath}`);
}

async function runRepair() {
    console.log("--- STARTING GRANULAR CLINICAL VAULT AI REPAIR (10-KEY ROTATION) ---");

    const filesToRepair: string[] = [];

    function walk(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name.endsWith('.json')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (isGeneric(content)) {
                    filesToRepair.push(fullPath);
                }
            }
        }
    }

    walk(VAULT_ROOT);
    console.log(`Total files identified for repair: ${filesToRepair.length}`);

    for (let i = 0; i < filesToRepair.length; i++) {
        const file = filesToRepair[i];
        console.log(`\n--- File ${i + 1}/${filesToRepair.length} ---`);
        try {
            await repairFile(file);
            await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
            console.error(`Error at ${file}:`, e);
        }
    }

    console.log("\n--- REPAIR SEQUENCE COMPLETE ---");

    try {
        console.log("Syncing vault manifest...");
        const { execSync } = await import('child_process');
        execSync('node regen_vault_index.cjs');
        console.log("Manifest synced.");
    } catch (e) {
        console.error("Manifest sync failed:", e);
    }
}

runRepair();
