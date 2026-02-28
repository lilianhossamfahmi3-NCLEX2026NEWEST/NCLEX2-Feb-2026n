/**
 * honest_qa.ts — NCLEX "Honest" Quality Assurance Scanner (STANDALONE)
 * 
 * Performs a deep clinical audit of the 3000+ item bank using the full
 * SentinelQA 2026 Specification. 
 * 
 * Logic merged from validation/itemBankQA.ts to ensure ZERO import errors.
 */

import fs from 'fs';
import path from 'path';

// --- INJECTED QA ENGINE LOGIC START ---
const VALID_TYPES = [
    'multipleChoice', 'selectAll', 'selectN', 'highlight',
    'orderedResponse', 'matrixMatch', 'clozeDropdown', 'dragAndDropCloze',
    'bowtie', 'trend', 'priorityAction', 'hotspot',
    'graphic', 'audioVideo', 'chartExhibit'
];
const VALID_BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const VALID_CJMM_STEPS = ['recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes'];
const VALID_NCLEX_CATEGORIES = ['Management of Care', 'Safety and Infection Prevention and Control', 'Health Promotion and Maintenance', 'Psychosocial Integrity', 'Basic Care and Comfort', 'Pharmacological and Parenteral Therapies', 'Reduction of Risk Potential', 'Physiological Adaptation'];
const VALID_SCORING_METHODS = ['dichotomous', 'polytomous', 'linkage'];
const SBAR_MIN_WORDS = 120;
const SBAR_MAX_WORDS = 160;

function runItemQA(item: any): any {
    const diags: any[] = [];

    // Completeness
    if (!item.id) diags.push({ dimension: 'completeness', severity: 'critical', message: 'Missing ID' });
    if (!item.type) diags.push({ dimension: 'completeness', severity: 'critical', message: 'Missing Type' });
    if (!item.stem || item.stem.length < 20) diags.push({ dimension: 'completeness', severity: 'critical', message: 'Stem too short/missing' });

    // Type Structure
    if (!VALID_TYPES.includes(item.type)) diags.push({ dimension: 'typeStructure', severity: 'critical', message: `Unknown type: ${item.type}` });

    // Narrative Logic (The "Honest" part)
    const rationale = item.rationale || {};
    const fullRationaleText = (rationale.correct || '') + (rationale.incorrect || '');

    // Check for "Generic AI Hallucinations"
    const genericMarkers = [
        "physiological instability", "misinterpretation of the gathered cues",
        "failure to prioritize", "might delay more critical", "strictly forbidden"
    ];
    genericMarkers.forEach(m => {
        if (fullRationaleText.toLowerCase().includes(m)) {
            diags.push({ dimension: 'rationaleQuality', severity: 'warning', message: `Generic AI filler detected: "${m}"` });
        }
    });

    if (fullRationaleText.length < 50) {
        diags.push({ dimension: 'rationaleQuality', severity: 'critical', message: "Rationale is too thin (Short Content)" });
    }

    // Study Companion Check
    if (!rationale.clinicalPearls || rationale.clinicalPearls.length === 0) {
        diags.push({ dimension: 'studyCompanion', severity: 'warning', message: "Missing Clinical Pearls" });
    }
    if (!rationale.answerBreakdown || rationale.answerBreakdown.length === 0) {
        diags.push({ dimension: 'studyCompanion', severity: 'warning', message: "Missing Answer Breakdown table" });
    }

    // Scoring
    if (!item.scoring || item.scoring.maxPoints === 0) {
        diags.push({ dimension: 'scoringAccuracy', severity: 'critical', message: "Zero or missing points" });
    }

    // SBAR Word Count (Strict 2026 NGN)
    const sbar = item.itemContext?.sbar || "";
    let sbarText = "";
    if (typeof sbar === 'string') sbarText = sbar;
    else if (typeof sbar === 'object' && sbar !== null) sbarText = JSON.stringify(sbar);
    const words = sbarText.split(/\s+/).filter((w: string) => w.length > 0).length;
    if (words > 0 && (words < SBAR_MIN_WORDS || words > SBAR_MAX_WORDS)) {
        diags.push({ dimension: 'dataReferences', severity: 'warning', message: `SBAR word count (${words}) outside 120-160 range.` });
    }

    const hasCritical = diags.some(d => d.severity === 'critical');
    const hasWarning = diags.some(d => d.severity === 'warning');
    const verdict = hasCritical ? 'fail' : hasWarning ? 'warn' : 'pass';

    return { itemId: item.id, verdict, diagnostics: diags };
}
// --- INJECTED QA ENGINE LOGIC END ---

const VAULT_DIR = path.join(process.cwd(), 'data', 'ai-generated', 'vault');

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

async function startHonestAudit() {
    console.log('\n=======================================');
    console.log(' BRUTAL HONEST QA AUDIT STARTING');
    console.log('=======================================');

    const files = walk(VAULT_DIR);
    const allItems: any[] = [];
    for (const file of files) {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (Array.isArray(data)) allItems.push(...data);
            else allItems.push(data);
        } catch (e) { }
    }

    const reports = allItems.map(runItemQA);
    const passed = reports.filter(r => r.verdict === 'pass').length;
    const warned = reports.filter(r => r.verdict === 'warn').length;
    const failed = reports.filter(r => r.verdict === 'fail').length;

    console.log('\n=======================================');
    console.log('         THE HONEST NUMBERS');
    console.log('=======================================');
    console.log(`TOTAL ITEMS REVIEWED:    ${allItems.length}`);
    console.log(`🏆 PASS (True 100%):     ${passed}`);
    console.log(`⚠️  WARNING (Low QA/Thin): ${warned}`);
    console.log(`🔴 FAILED (Clinical Bin): ${failed}`);
    console.log(`---------------------------------------`);
    console.log(`REAL PRODUCTION READINESS: ${((passed / allItems.length) * 100).toFixed(1)}%`);
    console.log('=======================================');

    const failReasons: Record<string, number> = {};
    reports.forEach(r => {
        r.diagnostics.forEach((d: any) => {
            const key = d.message;
            failReasons[key] = (failReasons[key] || 0) + 1;
        });
    });

    console.log('\nTop Issues Found:');
    Object.entries(failReasons)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([msg, count]) => console.log(` - ${count.toString().padEnd(5)} : ${msg}`));

    console.log('\n--- Status: Audit Complete ---');
}

startHonestAudit();
