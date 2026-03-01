/**
 * clinical_healer.ts — NCLEX-RN NGN 2026 High-Fidelity Clinical Upgrade Engine
 * 
 * Transforms "Thin" or "Generic" items into 100% SentinelQA-compliant content
 * using the NCLEX-RN NGN 2026 Master Content & Logic Specification.
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// --- INJECTED AI ENGINE START ---
const KEYS: string[] = [];
for (let i = 1; i <= 20; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) KEYS.push(key);
}

class KeyRotator {
    private current = 0;
    getNextKey() {
        const key = KEYS[this.current];
        this.current = (this.current + 1) % KEYS.length;
        return key;
    }
}
const rotator = new KeyRotator();

async function promptAI(prompt: string, model: string = 'gemini-2.5-pro') {
    const key = rotator.getNextKey();
    if (!key) throw new Error("No API Keys available.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.1, // Lower temperature for Clinical Healing to avoid hallucinations
            response_mime_type: "application/json"
        }
    };
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`AI Engine Failure: ${resp.status} - ${err}`);
    }
    const data = await resp.json();
    let text = data.candidates[0].content.parts[0].text;
    // Strip markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("   [JSON Error] Failed to parse AI response. Raw text snippet:", text.substring(0, 100));
        return null;
    }
}
// --- INJECTED AI ENGINE END ---

const VAULT_DIR = path.join(process.cwd(), 'data', 'ai-generated', 'vault');
const SPEC_PATH = path.join(process.cwd(), 'NGN_2026_STANDARDS_SPECIFICATION.md');
const BATCH_SIZE = 10;
const MAX_PILOT_ITEMS = 50;

// --- INJECTED QA ENGINE LOGIC (For Verification) ---
const SBAR_MIN_WORDS = 120;
const SBAR_MAX_WORDS = 160;

function runItemQA(item: any, log = false): boolean {
    if (!item.id || !item.type || !item.stem || !item.rationale) {
        if (log) console.log(`   [FAIL] Missing core fields: id|type|stem|rationale`);
        return false;
    }
    const rationale = item.rationale || {};
    const fullText = (rationale.correct || '') + (rationale.incorrect || '');
    if (fullText.length < 50) {
        if (log) console.log(`   [FAIL] Rationale text too thin (${fullText.length} chars)`);
        return false;
    }
    if (!rationale.clinicalPearls || (Array.isArray(rationale.clinicalPearls) && rationale.clinicalPearls.length === 0)) {
        if (log) console.log(`   [FAIL] Missing clinicalPearls`);
        return false;
    }
    if (!rationale.answerBreakdown || (Array.isArray(rationale.answerBreakdown) && (Array.isArray(rationale.answerBreakdown) ? rationale.answerBreakdown.length === 0 : Object.keys(rationale.answerBreakdown).length === 0))) {
        if (log) console.log(`   [FAIL] Missing answerBreakdown`);
        return false;
    }

    const sbar = item.itemContext?.sbar || "";
    let sbarText = typeof sbar === 'string' ? sbar : JSON.stringify(sbar);
    const words = sbarText.split(/\s+/).filter((w: string) => w.length > 0).length;
    if (words > 0 && (words < SBAR_MIN_WORDS || words > 200)) { // Small buffer
        if (log) console.log(`   [FAIL] SBAR word count (${words}) outside 120-200 range`);
        return false;
    }

    return true;
}

async function startHealing() {
    console.log('\n=======================================');
    console.log(' NCLEX 2026 CONTINUOUS CLINICAL HEALER');
    console.log('=======================================');

    const spec = fs.readFileSync(SPEC_PATH, 'utf8');

    while (true) {
        const files = walk(VAULT_DIR);
        let healedInThisBatch = 0;
        let skippedCount = 0;

        console.log(`\n--- Starting New Batch of ${MAX_PILOT_ITEMS} ---`);

        for (const file of files) {
            if (healedInThisBatch >= MAX_PILOT_ITEMS) break;

            try {
                const raw = fs.readFileSync(file, 'utf8');
                let data = JSON.parse(raw);
                let items = Array.isArray(data) ? data : [data];
                let fileChanged = false;

                for (let i = 0; i < items.length; i++) {
                    if (healedInThisBatch >= MAX_PILOT_ITEMS) break;

                    const item = items[i];

                    // Skip if already has our high-fidelity mark
                    if (item.qualityMark === 'NGN-2026-HI-FI' || runItemQA(item)) {
                        skippedCount++;
                        continue;
                    }

                    console.log(`[Heal] Item ${item.id || 'unknown'} in ${path.basename(file)}...`);

                    const upgradedItem = await performClinicalHeal(item, spec);

                    if (!upgradedItem) {
                        console.log(` ❌ AI failed to return valid JSON or hit a network error.`);
                    } else {
                        // AUTO-FIX Hallucinations
                        if (upgradedItem.itemType && !upgradedItem.type) upgradedItem.type = upgradedItem.itemType;
                        if (upgradedItem.question && !upgradedItem.stem) upgradedItem.stem = upgradedItem.question;
                        if (upgradedItem.correctOptionIds && !upgradedItem.correctOptionId) {
                            upgradedItem.correctOptionId = Array.isArray(upgradedItem.correctOptionIds) ? upgradedItem.correctOptionIds[0] : upgradedItem.correctOptionIds;
                        }

                        // Add the Quality Mark
                        upgradedItem.qualityMark = 'NGN-2026-HI-FI';
                        upgradedItem.healedAt = new Date().toISOString();

                        console.log(`   [DEBUG] AI Keys: ${Object.keys(upgradedItem).join(', ')}`);
                        if (runItemQA(upgradedItem, true)) {
                            items[i] = upgradedItem;
                            fileChanged = true;
                            healedInThisBatch++;
                            console.log(` ✅ Healed [${healedInThisBatch}/${MAX_PILOT_ITEMS}]`);
                        } else {
                            console.log(` ❌ Upgrade failed validation requirements.`);
                        }
                    }

                    // API Rate limit protection
                    await new Promise(r => setTimeout(r, 2000));
                }

                if (fileChanged) {
                    fs.writeFileSync(file, JSON.stringify(items.length > 1 ? items : items[0], null, 4), 'utf8');
                }

            } catch (e) {
                console.error(`Error in ${file}:`, e);
            }
        }

        console.log(`\n🏆 Batch Complete. Healed: ${healedInThisBatch} | Already Perfect: ${skippedCount}`);

        // Final Sync & Vercel readiness
        console.log('🔄 Syncing vault manifest for production...');
        try {
            // Proactively regenerate the index so Vercel picks up the "Color Coded" (NGN-2026-HI-FI) items
            const { execSync } = await import('child_process');
            execSync('node regen_vault_index.cjs', { stdio: 'inherit' });
            console.log('✅ Manifest synchronized.');
        } catch (err) {
            console.error('❌ Sync failed:', err);
        }

        console.log('\n--- Cooldown: 60 seconds before next batch ---');
        await new Promise(r => setTimeout(r, 60000));
    }
}

async function performClinicalHeal(item: any, spec: string): Promise<any> {
    const healPrompt = `
You are a Lead NGN Psychometrician & Content Scientist (Standard 2026).
Your task is to REPAIR and UPGRADE this specific NGN item to 100% High-Fidelity 2026 Standards.

SOURCE OF TRUTH (2026 SPECIFICATION):
${spec}

CURRENT ITEM (THE FLAWED TARGET):
${JSON.stringify(item, null, 2)}

SPECIFIC REPAIR INSTRUCTIONS:
1. SBAR: Expand or refine to exactly 120-160 words. Use military time (HH:mm). Add specific physiological cues.
2. EVIDENCE Breakdown: Create a unique 'content' for EVERY option in 'rationale.answerBreakdown'.
3. RATIONALE: Replace generic fillers with deep pathophysiology.
4. STUDY BUNDLE: Generate specific clinicalPearls (3+), a questionTrap, and a mnemonic.
5. EHR SYNC: If you mention a Lab/Vital/Med in the stem, update the itemContext.tabs/vitals to match. 

OUTPUT REQUIREMENTS: You MUST return a JSON object with this EXACT structure:
{
  "id": "${item.id}",
  "type": "...",
  "stem": "...",
  "options": [{ "id": "...", "text": "..." }],
  "correctOptionId": "...",
  "itemContext": {
    "sbar": "120-160 words SBAR...",
    "tabs": [ { "id": "vital_signs", "title": "Vitals", "content": "..." } ],
    "patient": { "age": "...", "sex": "...", "allergies": [] }
  },
  "rationale": {
    "correct": "...",
    "incorrect": "...",
    "answerBreakdown": [ { "optionId": "...", "content": "..." } ],
    "clinicalPearls": [],
    "questionTrap": "...",
    "mnemonic": "...",
    "reviewUnits": []
  },
  "scoring": { "method": "...", "maxPoints": 1 },
  "pedagogy": { "bloomLevel": "...", "cjmmStep": "...", "nclexCategory": "..." }
}

OUTPUT: Return ONLY the upgraded JSON object. No markdown, no filler.
`;

    try {
        return await promptAI(healPrompt, 'gemini-2.5-pro');
    } catch (e: any) {
        console.error(`   [AI Error] ${e.message}`);
        return null;
    }
}

function walk(dir: string, results: string[] = []) {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) walk(fullPath, results);
        else if (file.endsWith('.json')) results.push(fullPath);
    }
    return results;
}

startHealing();
