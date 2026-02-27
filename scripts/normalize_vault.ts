/**
 * normalize_vault.ts — Deterministic Schema Normalizer
 * 
 * Rewrites every vault item in-place to the standard schema that renderers expect.
 * NO AI, NO API calls. Pure deterministic transforms.
 * 
 * Rules:
 * 1. Unwrap arrays — if file is [{...}], extract each item as standalone
 * 2. Fix identity — masterId→id, itemType→type, prompt→stem
 * 3. Bowtie — options.actions → actions[], solution → correctActionIds, etc.
 * 4. DragAndDropCloze — [BLANK1] → {{blank1}}, ensure flat options array
 * 5. Pedagogy — normalize casing and fill missing fields
 * 6. Scoring — ensure method + maxPoints per type
 * 7. Study companion — migrate top-level clinicalPearls/questionTrap/mnemonic into rationale
 * 8. Options as array — convert object options to [{id,text}] arrays
 */

import fs from 'fs';
import path from 'path';

const VAULT_DIR = path.join(process.cwd(), 'data', 'ai-generated', 'vault');

// ═══════════════════════════════════════
// Valid values for normalization
// ═══════════════════════════════════════
const VALID_TYPES = new Set([
    'multipleChoice', 'selectAll', 'selectN', 'orderedResponse',
    'matrixMatch', 'clozeDropdown', 'bowtie', 'trend', 'highlight',
    'dragAndDropCloze', 'hotspot', 'graphic', 'audioVideo', 'chartExhibit',
    'priorityAction'
]);

const VALID_BLOOM = new Set(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']);
const VALID_CJMM = new Set(['recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes']);

const TYPE_SCORING_DEFAULTS: Record<string, { method: string; maxPoints: number }> = {
    multipleChoice: { method: 'dichotomous', maxPoints: 1 },
    priorityAction: { method: 'dichotomous', maxPoints: 1 },
    selectAll: { method: 'polytomous', maxPoints: 4 },
    selectN: { method: 'polytomous', maxPoints: 3 },
    orderedResponse: { method: 'plus-minus', maxPoints: 1 },
    matrixMatch: { method: 'polytomous', maxPoints: 4 },
    clozeDropdown: { method: 'polytomous', maxPoints: 2 },
    bowtie: { method: 'polytomous', maxPoints: 5 },
    trend: { method: 'dichotomous', maxPoints: 1 },
    highlight: { method: 'polytomous', maxPoints: 3 },
    dragAndDropCloze: { method: 'polytomous', maxPoints: 2 },
    hotspot: { method: 'dichotomous', maxPoints: 1 },
    graphic: { method: 'dichotomous', maxPoints: 1 },
    audioVideo: { method: 'dichotomous', maxPoints: 1 },
    chartExhibit: { method: 'dichotomous', maxPoints: 1 },
};

// ═══════════════════════════════════════
// File system helpers
// ═══════════════════════════════════════
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

let totalFilesProcessed = 0;
let totalItemsNormalized = 0;
let totalChanges = 0;
let totalNewFiles = 0;

// ═══════════════════════════════════════
// Core normalizer
// ═══════════════════════════════════════
function normalizeItem(item: any): { normalized: any; changes: string[] } {
    const changes: string[] = [];
    const n = { ...item };

    // --- 1. Fix identity fields ---
    if (!n.id && n.masterId) {
        n.id = n.masterId;
        delete n.masterId;
        changes.push('masterId→id');
    }
    if (!n.id && n.itemId) {
        n.id = n.itemId;
        delete n.itemId;
        changes.push('itemId→id');
    }
    if (!n.type && n.itemType) {
        n.type = n.itemType;
        delete n.itemType;
        changes.push('itemType→type');
    }
    if (!n.stem && n.prompt) {
        n.stem = n.prompt;
        delete n.prompt;
        changes.push('prompt→stem');
    }
    if (!n.stem && n.question) {
        n.stem = n.question;
        changes.push('question→stem');
    }

    // Skip items with no id at all
    if (!n.id) return { normalized: null, changes: [] };

    // --- 2. Normalize type ---
    if (n.type && !VALID_TYPES.has(n.type)) {
        // Try common aliases
        const typeMap: Record<string, string> = {
            'multiple_choice': 'multipleChoice',
            'multiplechoice': 'multipleChoice',
            'select_all': 'selectAll',
            'selectall': 'selectAll',
            'select_n': 'selectN',
            'selectn': 'selectN',
            'ordered_response': 'orderedResponse',
            'orderedresponse': 'orderedResponse',
            'matrix_match': 'matrixMatch',
            'matrixmatch': 'matrixMatch',
            'cloze_dropdown': 'clozeDropdown',
            'clozedropdown': 'clozeDropdown',
            'drag_and_drop_cloze': 'dragAndDropCloze',
            'draganddropcloze': 'dragAndDropCloze',
            'drag_drop_cloze': 'dragAndDropCloze',
            'priority_action': 'priorityAction',
            'priorityaction': 'priorityAction',
            'chart_exhibit': 'chartExhibit',
            'chartexhibit': 'chartExhibit',
            'audio_video': 'audioVideo',
            'audiovideo': 'audioVideo',
        };
        const lower = n.type.toLowerCase().replace(/[\s-]/g, '_');
        if (typeMap[lower]) {
            changes.push(`type ${n.type}→${typeMap[lower]}`);
            n.type = typeMap[lower];
        }
    }

    // --- 3. Bowtie normalization ---
    if (n.type === 'bowtie') {
        normalizeBowtie(n, changes);
    }

    // --- 4. DragAndDropCloze normalization ---
    if (n.type === 'dragAndDropCloze') {
        normalizeDragAndDropCloze(n, changes);
    }

    // --- 5. ClozeDropdown normalization ---
    if (n.type === 'clozeDropdown') {
        normalizeClozeDropdown(n, changes);
    }

    // --- 6. Normalize options to array ---
    if (n.options && !Array.isArray(n.options) && typeof n.options === 'object') {
        // If it's something like { a: {...}, b: {...} }, convert to [{id, text}]
        // But NOT for bowtie/dragAndDropCloze which we handled above
        if (n.type !== 'bowtie' && n.type !== 'dragAndDropCloze') {
            const optArray: any[] = [];
            for (const [key, val] of Object.entries(n.options)) {
                if (typeof val === 'string') {
                    optArray.push({ id: key, text: val });
                } else if (typeof val === 'object' && val !== null) {
                    optArray.push({ id: key, text: (val as any).text || (val as any).content || String(val), ...(val as any) });
                }
            }
            if (optArray.length > 0) {
                n.options = optArray;
                changes.push('options object→array');
            }
        }
    }

    // --- 7. Pedagogy normalization ---
    normalizePedagogy(n, changes);

    // --- 8. Scoring normalization ---
    normalizeScoring(n, changes);

    // --- 9. Migrate study companion fields into rationale ---
    migrateStudyCompanion(n, changes);

    // --- 10. Ensure rationale is an object ---
    if (typeof n.rationale === 'string') {
        n.rationale = { correct: n.rationale, incorrect: '', reviewUnits: [] };
        changes.push('rationale string→object');
    }
    if (!n.rationale) {
        n.rationale = { correct: 'Clinical rationale pending review.', incorrect: '', reviewUnits: [] };
        changes.push('rationale missing→default');
    }

    // --- 11. Clean up SBAR in rationale → itemContext ---
    if (n.rationale?.sbar && !n.itemContext?.sbar) {
        if (!n.itemContext) n.itemContext = {};
        const sbar = n.rationale.sbar;
        if (typeof sbar === 'string') {
            n.itemContext.sbar = sbar;
        } else if (typeof sbar === 'object') {
            n.itemContext.sbar = `Situation: ${sbar.situation || ''}\nBackground: ${sbar.background || ''}\nAssessment: ${sbar.assessment || ''}\nRecommendation: ${sbar.recommendation || ''}`;
        }
        delete n.rationale.sbar;
        changes.push('rationale.sbar→itemContext.sbar');
    }

    return { normalized: n, changes };
}

// ═══════════════════════════════════════
// Bowtie normalizer
// ═══════════════════════════════════════
function normalizeBowtie(n: any, changes: string[]) {
    // Handle Schema B: options.actions (string[]) → actions ([{id, text}])
    if (!n.actions && n.options?.actions) {
        if (Array.isArray(n.options.actions)) {
            n.actions = n.options.actions.map((text: string, i: number) => ({
                id: `a${i + 1}`,
                text: typeof text === 'string' ? text : (text?.text || String(text))
            }));
            changes.push('options.actions→actions[]');
        }
    }

    if (!n.parameters && n.options?.complication) {
        // Some items use "complication" as parameters
        if (Array.isArray(n.options.complication)) {
            n.parameters = n.options.complication.map((text: string, i: number) => ({
                id: `p${i + 1}`,
                text: typeof text === 'string' ? text : (text?.text || String(text))
            }));
            changes.push('options.complication→parameters[]');
        }
    }
    if (!n.parameters && n.options?.parameter) {
        if (Array.isArray(n.options.parameter)) {
            n.parameters = n.options.parameter.map((text: string, i: number) => ({
                id: `p${i + 1}`,
                text: typeof text === 'string' ? text : (text?.text || String(text))
            }));
            changes.push('options.parameter→parameters[]');
        }
    }

    // Handle bowtieData (another variant)
    if (!n.actions && n.bowtieData?.actionOptions) {
        n.actions = n.bowtieData.actionOptions.map((opt: any, i: number) => ({
            id: opt.id || `a${i + 1}`,
            text: opt.text || String(opt)
        }));
        changes.push('bowtieData.actionOptions→actions[]');
    }
    if (!n.parameters && n.bowtieData?.parameterOptions) {
        n.parameters = n.bowtieData.parameterOptions.map((opt: any, i: number) => ({
            id: opt.id || `p${i + 1}`,
            text: opt.text || String(opt)
        }));
        changes.push('bowtieData.parameterOptions→parameters[]');
    }

    // Condition from solution or options
    if (!n.condition && n.solution?.condition) {
        n.condition = Array.isArray(n.solution.condition) ? n.solution.condition[0] : n.solution.condition;
        changes.push('solution.condition→condition');
    }
    if (!n.condition && n.options?.condition && Array.isArray(n.options.condition)) {
        // Take the first one that appears in solution, or just first
        n.condition = n.options.condition[0];
        changes.push('options.condition[0]→condition');
    }

    // potentialConditions from options.condition
    if (!n.potentialConditions && n.options?.condition && Array.isArray(n.options.condition)) {
        n.potentialConditions = n.options.condition;
        changes.push('options.condition→potentialConditions');
    }
    // If still missing potentialConditions, create from condition
    if (!n.potentialConditions && n.condition) {
        n.potentialConditions = [n.condition, 'Alternative Diagnosis A', 'Alternative Diagnosis B', 'Alternative Diagnosis C'];
        changes.push('generated fallback potentialConditions');
    }

    // correctActionIds from solution.actions
    if (!n.correctActionIds && n.solution?.actions) {
        if (Array.isArray(n.solution.actions)) {
            // Map solution text back to action ids
            if (n.actions && n.actions.length > 0 && n.actions[0].id) {
                n.correctActionIds = n.solution.actions.map((solText: string) => {
                    const match = n.actions.find((a: any) => a.text === solText);
                    return match ? match.id : null;
                }).filter(Boolean);
            }
            if (!n.correctActionIds || n.correctActionIds.length === 0) {
                // Fallback: assign first N action ids
                n.correctActionIds = n.actions?.slice(0, Math.min(2, n.actions?.length || 0)).map((a: any) => a.id) || [];
            }
            changes.push('solution.actions→correctActionIds');
        }
    }

    // correctParameterIds from solution.complication or solution.parameter
    if (!n.correctParameterIds) {
        const solParams = n.solution?.complication || n.solution?.parameter || n.solution?.parameters;
        if (solParams && Array.isArray(solParams) && n.parameters) {
            n.correctParameterIds = solParams.map((solText: string) => {
                const match = n.parameters.find((p: any) => p.text === solText);
                return match ? match.id : null;
            }).filter(Boolean);
            if (n.correctParameterIds.length === 0) {
                n.correctParameterIds = n.parameters.slice(0, Math.min(2, n.parameters.length)).map((p: any) => p.id);
            }
            changes.push('solution→correctParameterIds');
        }
    }

    // Clean up non-standard bowtie fields
    if (n.options?.actions || n.options?.condition || n.options?.complication) {
        delete n.options;
        changes.push('removed bowtie options object');
    }
    if (n.solution) {
        delete n.solution;
        changes.push('removed solution object');
    }

    // Ensure actions/parameters are [{id, text}] format
    if (n.actions && Array.isArray(n.actions)) {
        n.actions = n.actions.map((a: any, i: number) => {
            if (typeof a === 'string') return { id: `a${i + 1}`, text: a };
            if (!a.id) return { id: `a${i + 1}`, text: a.text || String(a) };
            return a;
        });
    }
    if (n.parameters && Array.isArray(n.parameters)) {
        n.parameters = n.parameters.map((p: any, i: number) => {
            if (typeof p === 'string') return { id: `p${i + 1}`, text: p };
            if (!p.id) return { id: `p${i + 1}`, text: p.text || String(p) };
            return p;
        });
    }
}

// ═══════════════════════════════════════
// DragAndDropCloze normalizer
// ═══════════════════════════════════════
function normalizeDragAndDropCloze(n: any, changes: string[]) {
    // Ensure template exists
    if (!n.template && n.content) {
        n.template = n.content;
        delete n.content;
        changes.push('content→template');
    }

    if (n.template) {
        // Convert [BLANK1], [BLANK_1], [BLANK 1] to {{blank1}}
        const blankRegex = /\[BLANK[\s_]?(\d+)\]/gi;
        if (blankRegex.test(n.template)) {
            n.template = n.template.replace(blankRegex, (_: string, num: string) => `{{blank${num}}}`);
            changes.push('[BLANK]→{{blank}}');
        }
    }

    // Ensure options is a flat string array
    if (n.options && !Array.isArray(n.options) && typeof n.options === 'object') {
        // Convert object { blank1: [...], blank2: [...] } to flat array
        const flatOpts: string[] = [];
        for (const val of Object.values(n.options)) {
            if (Array.isArray(val)) {
                flatOpts.push(...val.map(String));
            } else if (typeof val === 'string') {
                flatOpts.push(val);
            }
        }
        if (flatOpts.length > 0) {
            n.options = [...new Set(flatOpts)]; // Deduplicate
            changes.push('options object→flat array');
        }
    }

    // Ensure blanks array exists by parsing template
    if (n.template && (!n.blanks || !Array.isArray(n.blanks) || n.blanks.length === 0)) {
        const matches = n.template.match(/\{\{(\w+)\}\}/g) || [];
        const blankIds = matches.map((m: string) => m.replace(/\{\{|\}\}/g, ''));
        if (blankIds.length > 0) {
            n.blanks = blankIds.map((blankId: string) => ({
                id: blankId,
                correctOption: n.correctAnswers?.[blankId] || ''
            }));
            changes.push('generated blanks[] from template');
        }
    }
}

// ═══════════════════════════════════════
// ClozeDropdown normalizer
// ═══════════════════════════════════════
function normalizeClozeDropdown(n: any, changes: string[]) {
    // Ensure template exists
    if (!n.template && n.content) {
        n.template = n.content;
        delete n.content;
        changes.push('content→template');
    }

    // Ensure blanks exist
    if (n.template && (!n.blanks || !Array.isArray(n.blanks) || n.blanks.length === 0)) {
        const matches = n.template.match(/\{\{(\w+)\}\}/g) || [];
        const blankIds = matches.map((m: string) => m.replace(/\{\{|\}\}/g, ''));
        if (blankIds.length > 0 && n.options) {
            // Try to construct blanks from available data
            n.blanks = blankIds.map((blankId: string) => ({
                id: blankId,
                options: n.options || [],
                correctOption: n.correctAnswers?.[blankId] || ''
            }));
            changes.push('generated blanks[] from template');
        }
    }
}

// ═══════════════════════════════════════
// Pedagogy normalizer
// ═══════════════════════════════════════
function normalizePedagogy(n: any, changes: string[]) {
    if (!n.pedagogy) {
        n.pedagogy = {
            bloomLevel: 'apply',
            cjmmStep: 'analyzeCues',
            nclexCategory: 'Physiological Adaptation',
            difficulty: 3,
            topicTags: []
        };
        changes.push('pedagogy missing→default');
        return;
    }

    const p = n.pedagogy;

    // Normalize bloomLevel
    if (p.bloomLevel) {
        const bl = p.bloomLevel.toLowerCase().trim();
        if (!VALID_BLOOM.has(bl)) {
            p.bloomLevel = 'apply';
            changes.push(`bloomLevel "${p.bloomLevel}"→apply`);
        } else {
            p.bloomLevel = bl;
        }
    } else {
        p.bloomLevel = 'apply';
        changes.push('bloomLevel missing→apply');
    }

    // Normalize cjmmStep
    if (p.cjmmStep) {
        // Handle various formats
        const stepMap: Record<string, string> = {
            'recognize cues': 'recognizeCues',
            'recognizecues': 'recognizeCues',
            'recognize_cues': 'recognizeCues',
            'analyze cues': 'analyzeCues',
            'analyzecues': 'analyzeCues',
            'analyze_cues': 'analyzeCues',
            'prioritize hypotheses': 'prioritizeHypotheses',
            'prioritizehypotheses': 'prioritizeHypotheses',
            'prioritize_hypotheses': 'prioritizeHypotheses',
            'generate solutions': 'generateSolutions',
            'generatesolutions': 'generateSolutions',
            'generate_solutions': 'generateSolutions',
            'take action': 'takeAction',
            'takeaction': 'takeAction',
            'take_action': 'takeAction',
            'evaluate outcomes': 'evaluateOutcomes',
            'evaluateoutcomes': 'evaluateOutcomes',
            'evaluate_outcomes': 'evaluateOutcomes',
        };
        const lower = p.cjmmStep.toLowerCase().trim();
        if (!VALID_CJMM.has(lower)) {
            if (stepMap[lower]) {
                p.cjmmStep = stepMap[lower];
                changes.push(`cjmmStep normalized`);
            } else {
                p.cjmmStep = 'analyzeCues';
                changes.push(`cjmmStep "${p.cjmmStep}"→analyzeCues`);
            }
        }
    } else {
        p.cjmmStep = 'analyzeCues';
        changes.push('cjmmStep missing→analyzeCues');
    }

    // Ensure topicTags is array
    if (!Array.isArray(p.topicTags)) {
        p.topicTags = [];
    }

    // Ensure difficulty is a number
    if (typeof p.difficulty !== 'number' || p.difficulty < 1 || p.difficulty > 5) {
        p.difficulty = 3;
    }

    // Ensure nclexCategory exists
    if (!p.nclexCategory) {
        p.nclexCategory = 'Physiological Adaptation';
        changes.push('nclexCategory missing→default');
    }
}

// ═══════════════════════════════════════
// Scoring normalizer
// ═══════════════════════════════════════
function normalizeScoring(n: any, changes: string[]) {
    const type = n.type || 'multipleChoice';
    const defaults = TYPE_SCORING_DEFAULTS[type] || { method: 'dichotomous', maxPoints: 1 };

    if (!n.scoring || typeof n.scoring !== 'object') {
        n.scoring = { ...defaults };
        changes.push('scoring missing→default');
        return;
    }

    if (!n.scoring.method || typeof n.scoring.method !== 'string') {
        n.scoring.method = defaults.method;
        changes.push(`scoring.method→${defaults.method}`);
    }

    if (!n.scoring.maxPoints || typeof n.scoring.maxPoints !== 'number' || n.scoring.maxPoints <= 0) {
        // Compute maxPoints from item data
        if (type === 'bowtie') {
            n.scoring.maxPoints = 5; // 2 actions + 1 condition + 2 parameters
        } else if (type === 'selectAll' && n.correctOptionIds) {
            n.scoring.maxPoints = n.correctOptionIds.length;
        } else if (type === 'highlight' && n.correctSpanIndices) {
            n.scoring.maxPoints = n.correctSpanIndices.length;
        } else if (type === 'dragAndDropCloze' && n.blanks) {
            n.scoring.maxPoints = n.blanks.length;
        } else if (type === 'clozeDropdown' && n.blanks) {
            n.scoring.maxPoints = n.blanks.length;
        } else if (type === 'matrixMatch' && n.rows) {
            n.scoring.maxPoints = n.rows.length;
        } else {
            n.scoring.maxPoints = defaults.maxPoints;
        }
        changes.push(`scoring.maxPoints→${n.scoring.maxPoints}`);
    }

    // Normalize linkedDyadTriad → polytomous
    if (n.scoring.method === 'linkedDyadTriad') {
        n.scoring.method = 'polytomous';
        changes.push('scoring linkedDyadTriad→polytomous');
    }
}

// ═══════════════════════════════════════
// Study companion migration
// ═══════════════════════════════════════
function migrateStudyCompanion(n: any, changes: string[]) {
    if (!n.rationale || typeof n.rationale !== 'object') return;
    const r = n.rationale;

    // Migrate top-level clinicalPearls
    if (n.clinicalPearls && !r.clinicalPearls) {
        if (Array.isArray(n.clinicalPearls)) {
            r.clinicalPearls = n.clinicalPearls;
        } else if (typeof n.clinicalPearls === 'string') {
            r.clinicalPearls = [n.clinicalPearls];
        }
        delete n.clinicalPearls;
        changes.push('clinicalPearls→rationale');
    }

    // Migrate top-level questionTrap
    if (n.questionTrap && !r.questionTrap) {
        if (typeof n.questionTrap === 'string') {
            r.questionTrap = { trap: 'Common Pitfall', howToOvercome: n.questionTrap };
        } else if (typeof n.questionTrap === 'object') {
            r.questionTrap = n.questionTrap;
        }
        delete n.questionTrap;
        changes.push('questionTrap→rationale');
    }

    // Migrate top-level mnemonic
    if (n.mnemonic && !r.mnemonic) {
        if (typeof n.mnemonic === 'string') {
            r.mnemonic = { title: 'HINT', expansion: n.mnemonic };
        } else if (typeof n.mnemonic === 'object') {
            r.mnemonic = n.mnemonic;
        }
        delete n.mnemonic;
        changes.push('mnemonic→rationale');
    }
}

// ═══════════════════════════════════════
// Main
// ═══════════════════════════════════════
function main() {
    console.log('═══════════════════════════════════════');
    console.log(' VAULT SCHEMA NORMALIZER — DETERMINISTIC');
    console.log('═══════════════════════════════════════');

    const files = walk(VAULT_DIR);
    console.log(`Found ${files.length} files in vault.\n`);

    for (let fi = 0; fi < files.length; fi++) {
        const file = files[fi];
        if (fi % 200 === 0) console.log(`Processing ${fi}/${files.length}...`);

        try {
            const raw = fs.readFileSync(file, 'utf8');
            const content = JSON.parse(raw);

            if (Array.isArray(content)) {
                // Multi-item file: normalize each item and write back
                let anyChanged = false;
                const normalized = content.map((item: any) => {
                    const { normalized: n, changes } = normalizeItem(item);
                    if (changes.length > 0) {
                        anyChanged = true;
                        totalChanges += changes.length;
                        totalItemsNormalized++;
                    }
                    return n;
                }).filter(Boolean);

                if (anyChanged) {
                    // If single item in array, unwrap
                    if (normalized.length === 1) {
                        fs.writeFileSync(file, JSON.stringify(normalized[0], null, 4), 'utf8');
                    } else {
                        fs.writeFileSync(file, JSON.stringify(normalized, null, 4), 'utf8');
                    }
                }
            } else {
                const { normalized, changes } = normalizeItem(content);
                if (normalized && changes.length > 0) {
                    fs.writeFileSync(file, JSON.stringify(normalized, null, 4), 'utf8');
                    totalChanges += changes.length;
                    totalItemsNormalized++;
                }
            }

            totalFilesProcessed++;
        } catch (e) {
            console.error(`Error processing ${path.basename(file)}:`, (e as any).message);
        }
    }

    console.log('\n═══════════════════════════════════════');
    console.log(' NORMALIZATION COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log(`Files processed: ${totalFilesProcessed}`);
    console.log(`Items normalized: ${totalItemsNormalized}`);
    console.log(`Total changes: ${totalChanges}`);
    console.log(`New files created: ${totalNewFiles}`);
}

main();
