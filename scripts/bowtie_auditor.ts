/**
 * BARA: Bowtie Auditor & Remediation Agent
 * 
 * Objectives:
 * 1. Deep-scan all bowtie items.
 * 2. Enforce 60-90 words SBAR, 2-3 sentence stems, 1-10 word options.
 * 3. Add missing Study Companion data (Pearls, Traps, Mnemonics).
 * 4. Auto-remediate using 2026 Architectural Standards.
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

class BARAKeyRotator {
    private current = 0;
    getNextKey() {
        if (KEYS.length === 0) return null;
        const key = KEYS[this.current];
        this.current = (this.current + 1) % KEYS.length;
        return key;
    }
}
const rotator = new BARAKeyRotator();

async function promptAI(prompt: string, model: string = 'gemini-2.5-pro', attempts = 0): Promise<any> {
    if (attempts > KEYS.length) throw new Error("BARA: All API keys exhausted for today.");

    const key = rotator.getNextKey();
    if (!key) throw new Error("BARA: Physical API Key Depletion.");

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

        if (resp.status === 429) {
            console.warn(`   [Quota] Key exhausted. Rotating and retrying... (${attempts + 1}/${KEYS.length})`);
            return await promptAI(prompt, model, attempts + 1);
        }

        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`BARA AI Engine Failure: ${resp.status} - ${err}`);
        }

        const data = await resp.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e: any) {
        if (e.message.includes('429')) {
            return await promptAI(prompt, model, attempts + 1);
        }
        console.error(`   [AI Error] ${e.message}`);
        return null;
    }
}

// --- BARA CONSTANTS ---
const BOWTIE_DIR = path.join(process.cwd(), 'data', 'ai-generated', 'vault', 'bowtie');
const REPORT_PATH = path.join(process.cwd(), 'BARA_AUDIT_REPORT.json');

interface AuditIssue {
    itemID: string;
    issues: string[];
    action: string;
}

const auditLog: AuditIssue[] = [];
let totalScanned = 0;
let itemsRemediated = 0;

function countWords(str: string): number {
    return (str || "").split(/\s+/).filter(Boolean).length;
}

function countSentences(str: string): number {
    return (str || "").split(/[.!?]+/).filter(Boolean).length;
}

function walk(dir: string, results: string[] = []) {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) walk(fullPath, results);
        else if (file.endsWith('.json') && fullPath.includes('bowtie')) results.push(fullPath);
    }
    return results;
}

const VAULT_DIR = path.join(process.cwd(), 'data', 'ai-generated', 'vault');

async function auditAndRemediate() {
    console.log('🚀 BARA: Bowtie Auditor & Remediation Agent Init...');

    if (!fs.existsSync(VAULT_DIR)) {
        console.error('❌ Vault directory not found.');
        return;
    }

    const files = walk(VAULT_DIR);
    totalScanned = files.length;
    console.log(`Total Bowtie Items Identified for Scan: ${totalScanned}`);

    let count = 0;
    for (const filePath of files) {
        if (count >= 10) break;
        const fileName = path.basename(filePath);
        const item = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const issues: string[] = [];

        // 1. Audit: SBAR (60-90 words preferred, 120-160 acceptable for improvement)
        const sbar = item.itemContext?.sbar || "";
        const sbarWC = countWords(sbar);
        if (sbarWC < 60 || sbarWC > 105) {
            issues.push(`SBAR needs improvement: ${sbarWC} words (Targeting 60-90 for high-precision).`);
        }

        // 2. Audit: Stem (2-3 sentences preferred)
        const stem = item.stem || "";
        const stemSC = countSentences(stem);
        const stemWC = countWords(stem);
        if (stemSC > 3 || stemWC > 60) {
            issues.push(`Stem is too verbose: ${stemSC} sentences. Shrink to 2-3 for maximum impact.`);
        }

        // 3. Audit: Options (1-10 words)
        const allOptions = [...(item.actions || []), ...(item.parameters || [])];
        for (const opt of allOptions) {
            const optWC = countWords(opt.text);
            if (optWC > 10) {
                issues.push(`Option text needs precision: ${optWC} words.`);
                break;
            }
        }

        // 4. Audit: Missing EHR Tabs logic
        const tabIds = (item.itemContext?.tabs || []).map((t: any) => t.id);
        if (stem.toLowerCase().includes('potassium') && !tabIds.includes('labs')) {
            issues.push('Missing Labs tab despite clinical reference in stem.');
        }

        if (issues.length > 0) {
            console.log(`🔎 Improving [${fileName}] -> Refinement needed for 2026 specs.`);
            const remediated = await remediateItem(item, issues);
            if (remediated) {
                fs.writeFileSync(filePath, JSON.stringify(remediated, null, 4));
                itemsRemediated++;
                auditLog.push({ itemID: item.id || fileName, issues, action: 'BARA Remediation applied: Structural & Content Alignment' });
                console.log(` ✅ Remediated [${fileName}]`);
                count++;
            } else {
                console.log(` ❌ Remediation failed for [${fileName}]`);
            }
            // Rate limit protection
            await new Promise(r => setTimeout(r, 1000));
        } else {
            console.log(` ✨ Item compliant [${fileName}]`);
        }
    }

    const finalReport = {
        timestamp: new Date().toISOString(),
        total_items_scanned: totalScanned,
        items_remediated: itemsRemediated,
        changelog: auditLog
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(finalReport, null, 4));
    console.log(`\n🏆 BARA EXECUTION COMPLETE.`);
    console.log(`Report saved to: ${REPORT_PATH}`);
}

async function remediateItem(item: any, issues: string[]) {
    const baraPrompt = `
You are the Bowtie Auditor & Remediation Agent (BARA).
Your task is to REWRITE and SYNC this NCLEX NGN Bowtie item to 100% High-Fidelity 2,026 Standards.

ISSUES IDENTIFIED:
${issues.join('\n')}

STRICT ARCHITECTURAL STANDARDS (TARGET):
1. Clinical Feed (SBAR): 60-90 words. Format must be SBAR. Military Time (HH:mm) mandatory.
2. Question Stem: 2-3 sentences (25-50 words). Include Scenario + Condition + Prompt.
3. Answer Options (Actions & Parameters): 1 to 10 words per option.
4. Hover Rationales: Every Action and Parameter must have an associated Hover Rationale (1-3 sentences, 15-45 words). 
   - Correct = Pathophysiology/Safety basis.
   - Incorrect = Clinical flaw / Counter-indication / Lower priority.
5. STUDY COMPANION MODULE: You MUST include a "rationale" object with:
   - "clinicalPearls": Array of 3+ short, testable nursing rules.
   - "questionTrap": { "trapDescription": "...", "strategy": "..." }.
   - "mnemonic": { "frontsideText": "...", "backsideText": "..." }.
6. HIDE/REMOVE: 'answerBreakdown' or 'Clinical Evidence Analysis' fields.
7. EHR SYNC: Ensure Patient Header (Age, ISO, Allergies) matches the stem. Add 'labs' or 'mar' tabs if referenced in options.
8. PRESERVE METADATA: You MUST include "qualityMark": "NGN-2026-HI-FI" and "healedAt": "${new Date().toISOString()}".

CURRENT ITEM:
${JSON.stringify(item, null, 2)}

OUTPUT REQUIREMENTS: Return the FULL remediated JSON object. No markdown filler.
`;

    return await promptAI(baraPrompt);
}

auditAndRemediate();
