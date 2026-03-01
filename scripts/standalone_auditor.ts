/**
 * SARA: Standalone Auditor & Remediation Agent
 * 
 * Objective: 
 * Scan and remediate all standalone NGN items (mcq_single, priorityAction, sata_multiple, select_n).
 * Enforce: 2-3 sentence stems, 1-15 word options, 15-45 word hover rationales, 
 * and full Study Companion integration.
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// --- AI ENGINE (20 KEY ROTATOR) ---
const KEYS: string[] = [];
for (let i = 1; i <= 20; i++) {
    const key = process.env[`VITE_GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY_${i}`];
    if (key) KEYS.push(key);
}

class SARAKeyRotator {
    private current = 0;
    getNextKey() {
        if (KEYS.length === 0) return null;
        const key = KEYS[this.current];
        this.current = (this.current + 1) % KEYS.length;
        return key;
    }
}
const rotator = new SARAKeyRotator();

async function promptAI(prompt: string, model: string = 'gemini-2.5-pro', attempts = 0): Promise<any> {
    if (attempts > KEYS.length) throw new Error("SARA: All API keys exhausted.");
    const key = rotator.getNextKey();
    if (!key) throw new Error("SARA: Key Depletion.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
    };

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (resp.status === 429) return await promptAI(prompt, model, attempts + 1);
        if (!resp.ok) throw new Error(`SARA AI Error: ${resp.status}`);

        const data = await resp.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

// --- UTILITIES ---
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

function countWords(str: string): number {
    return (str || "").split(/\s+/).filter(Boolean).length;
}

function countSentences(str: string): number {
    return (str || "").split(/[.!?]+/).filter(Boolean).length;
}

// --- CONFIG ---
const VAULT_DIR = path.join(process.cwd(), 'data', 'ai-generated', 'vault');
const REPORT_PATH = path.join(process.cwd(), 'SARA_AUDIT_REPORT.json');
const STANDALONE_TYPES = ['mcq_single', 'priorityAction', 'sata_multiple', 'select_n', 'sata'];

const auditLog: any[] = [];
let totalScanned = 0;
let itemsRemediated = 0;

async function runSARA() {
    console.log('🚀 SARA: Standalone Auditor & Remediation Agent Init...');
    const allFiles = walk(VAULT_DIR);

    // Filter for standalone types
    const filesToAudit = [];
    for (const file of allFiles) {
        const raw = fs.readFileSync(file, 'utf8');
        try {
            const json = JSON.parse(raw);
            const type = json.type || json.itemType;
            if (STANDALONE_TYPES.includes(type)) {
                filesToAudit.push({ path: file, data: json });
            }
        } catch (e) { }
    }

    totalScanned = filesToAudit.length;
    console.log(`Auditing ${totalScanned} standalone items...`);

    let processedCount = 0;
    for (const itemObj of filesToAudit) {
        if (processedCount >= 20) break; // Batch of 20 for testing/quota safety

        const item = itemObj.data;
        const issues: string[] = [];

        // 1. Stem Audit
        const stem = item.stem || item.question || "";
        const stemWC = countWords(stem);
        const stemSC = countSentences(stem);
        if (stemSC < 2 || stemSC > 3 || stemWC < 25 || stemWC > 55) {
            issues.push(`Stem structure mismatch: ${stemSC} sentences, ${stemWC} words.`);
        }

        // 2. Options Audit
        const options = item.options || [];
        for (const opt of options) {
            const optWC = countWords(opt.text || opt.content || "");
            if (optWC < 1 || optWC > 16) {
                issues.push(`Option length mismatch: ${optWC} words.`);
                break;
            }
            if (!opt.hoverRationale && !opt.rationale) {
                issues.push(`Missing hover rationale for option.`);
                break;
            }
        }

        // 3. Companion Audit
        if (!item.rationale?.clinicalPearls || !item.rationale?.mnemonic) {
            issues.push(`Missing Study Companion (Pearls/Mnemonics).`);
        }

        if (issues.length > 0) {
            console.log(`🔎 Remediating [${path.basename(itemObj.path)}]...`);
            const remediated = await remediateStandalone(item, issues);
            if (remediated) {
                fs.writeFileSync(itemObj.path, JSON.stringify(remediated, null, 4));
                itemsRemediated++;
                auditLog.push({
                    itemID: item.id || path.basename(itemObj.path),
                    itemType: item.type || item.itemType,
                    issues_identified: issues.join('; '),
                    action_taken: "SARA: Stem/Options/Rationale normalized to 2026 specs."
                });
                console.log(` ✅ Healed.`);
                processedCount++;
            }
        } else {
            console.log(` ✨ Compliant [${path.basename(itemObj.path)}]`);
        }
    }

    const report = {
        service_id: "Service_2_Standalone_Audit",
        timestamp: new Date().toISOString(),
        total_items_scanned: totalScanned,
        items_remediated: itemsRemediated,
        changelog: auditLog
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 4));
    console.log(`🏆 SARA Complete. Report: ${REPORT_PATH}`);
}

async function remediateStandalone(item: any, issues: string[]) {
    const prompt = `
You are SARA: Standalone Auditor & Remediation Agent.
Goal: Transform this Standalone NCLEX item into a 100% High-Fidelity 2026 version.

STANDARDS:
1. Stem: Strictly 2-3 sentences (25-50 words). Format: Scenario -> Condition -> Action-Prompt.
2. Options: Strictly 1-15 words. Parallel structure.
3. Hover Rationales: EVERY option needs a hoverRationale (1-3 sentences, 15-45 words). Correct=Pathophysiology; Incorrect=Clinical Flaw.
4. Study Companion: rationale.clinicalPearls (array), rationale.questionTrap (object), rationale.mnemonic (object).
5. Sync: Stem demographics must match itemContext.patient.
6. Metadata: Add "qualityMark": "NGN-2026-HI-FI" and "healedAt": "${new Date().toISOString()}".

ISSUES: ${issues.join(' | ')}

INPUT:
${JSON.stringify(item, null, 2)}

OUTPUT: FULL JSON ONLY.
`;
    return await promptAI(prompt);
}

runSARA();
