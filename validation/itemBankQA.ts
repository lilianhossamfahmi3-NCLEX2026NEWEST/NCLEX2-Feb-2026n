/**
 * NCLEX-RN NGN Clinical Simulator — Item Bank Quality Assurance Engine
 * "SentinelQA" — Automated Item Integrity Verification System
 *
 * Validates every item in the vault across 8 QA dimensions:
 *   1. Completeness       — Are all required fields present?
 *   2. Type Structure     — Does the item match its declared type schema?
 *   3. Scoring Accuracy   — Are scoring rules correct & maxPoints consistent?
 *   4. Pedagogy           — Are bloom/CJMM/NCLEX category/difficulty valid?
 *   5. Rationale Quality  — Are correct/incorrect rationale & review units present?
 *   6. Option Logic       — Do options, correctOptionId, correctOptionIds, blanks match?
 *   7. Data References    — Are labs/meds/imaging references realistic?
 *   8. Error Detection    — No "System Diagnostic Error", empty strings, NaN, etc.
 *
 * MISSION 500 COMPLIANCE: Includes deep-fix ability using Gemini Pro and 2026 Standards.
 */

// Types are imported at runtime from master.ts via the items passed in

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════

export type QASeverity = 'critical' | 'warning' | 'info';

export interface QADiagnostic {
    dimension: QADimension;
    severity: QASeverity;
    code: string;
    message: string;
    field?: string;
}

export type QADimension =
    | 'completeness'
    | 'typeStructure'
    | 'scoringAccuracy'
    | 'pedagogy'
    | 'rationaleQuality'
    | 'optionLogic'
    | 'dataReferences'
    | 'errorDetection';

export type QAVerdict = 'pass' | 'warn' | 'fail';

export interface QAItemReport {
    itemId: string;
    itemType: string;
    verdict: QAVerdict;
    diagnostics: QADiagnostic[];
    checkedAt: string;
    score: number;         // 0–100
    dimensionScores: Record<QADimension, number>;
}

export interface QABankReport {
    totalItems: number;
    passed: number;
    warned: number;
    failed: number;
    overallScore: number;
    itemReports: QAItemReport[];
    checkedAt: string;
    dimensionSummary: Record<QADimension, { passed: number; warned: number; failed: number }>;
    typeDistribution: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════

const VALID_TYPES = [
    'multipleChoice', 'selectAll', 'selectN', 'highlight',
    'orderedResponse', 'matrixMatch', 'clozeDropdown', 'dragAndDropCloze',
    'bowtie', 'trend', 'priorityAction', 'hotspot',
    'graphic', 'audioVideo', 'chartExhibit'
];

const VALID_BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const VALID_CJMM_STEPS = ['recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes'];
const VALID_NCLEX_CATEGORIES = [
    'Management of Care',
    'Safety and Infection Prevention and Control',
    'Health Promotion and Maintenance',
    'Psychosocial Integrity',
    'Basic Care and Comfort',
    'Pharmacological and Parenteral Therapies',
    'Reduction of Risk Potential',
    'Physiological Adaptation',
];
const VALID_SCORING_METHODS = ['dichotomous', 'polytomous', 'linkage'];

// 2026 Standards Constants
const SBAR_MIN_WORDS = 120;
const SBAR_MAX_WORDS = 160;
const MILITARY_TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const AI_BLOOM_MAP: Record<string, string> = {
    'Remembering': 'remember', 'Understanding': 'understand', 'Applying': 'apply',
    'Analyzing': 'analyze', 'Evaluating': 'evaluate', 'Creating': 'create',
};

const AI_CJMM_MAP: Record<string, string> = {
    'Recognize Cues': 'recognizeCues', 'Analyze Cues': 'analyzeCues',
    'Prioritize Hypotheses': 'prioritizeHypotheses', 'Generate Solutions': 'generateSolutions',
    'Take Action': 'takeAction', 'Evaluate Outcomes': 'evaluateOutcomes',
};

// ═══════════════════════════════════════════════════════════
//  Dimension Checkers
// ═══════════════════════════════════════════════════════════

function checkCompleteness(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'completeness';

    if (!item.id) diags.push({ dimension: dim, severity: 'critical', code: 'COMP-001', message: 'Missing item ID.' });
    if (!item.type) diags.push({ dimension: dim, severity: 'critical', code: 'COMP-002', message: 'Missing item type.' });
    if (!item.stem || (typeof item.stem === 'string' && item.stem.trim().length < 10))
        diags.push({ dimension: dim, severity: 'critical', code: 'COMP-003', message: 'Stem is missing or too short (<10 chars).', field: 'stem' });
    if (!item.scoring) diags.push({ dimension: dim, severity: 'warning', code: 'COMP-004', message: 'Missing scoring rule.', field: 'scoring' });
    if (!item.rationale) diags.push({ dimension: dim, severity: 'warning', code: 'COMP-005', message: 'Missing rationale.', field: 'rationale' });
    if (!item.pedagogy) diags.push({ dimension: dim, severity: 'warning', code: 'COMP-006', message: 'Missing pedagogy metadata.', field: 'pedagogy' });

    return diags;
}

function checkTypeStructure(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'typeStructure';

    if (!VALID_TYPES.includes(item.type)) {
        diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-001', message: `Unknown item type: "${item.type}".`, field: 'type' });
        return diags;
    }

    switch (item.type) {
        case 'multipleChoice':
        case 'priorityAction':
        case 'trend':
        case 'graphic':
        case 'audioVideo':
        case 'chartExhibit':
            if (!item.options || !Array.isArray(item.options) || item.options.length < 2)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-010', message: `${item.type} requires ≥2 options.`, field: 'options' });
            if (!item.correctOptionId)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-011', message: `${item.type} requires correctOptionId.`, field: 'correctOptionId' });
            break;

        case 'selectAll':
        case 'selectN':
            if (!item.options || !Array.isArray(item.options) || item.options.length < 4)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-020', message: `${item.type} requires ≥4 options.`, field: 'options' });
            if (!item.correctOptionIds || !Array.isArray(item.correctOptionIds) || item.correctOptionIds.length < 2)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-021', message: `${item.type} requires ≥2 correctOptionIds.`, field: 'correctOptionIds' });
            if (item.type === 'selectN' && (!item.n || typeof item.n !== 'number'))
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-022', message: 'selectN requires a numeric "n" field.', field: 'n' });
            break;

        case 'highlight':
            if (!item.passage || typeof item.passage !== 'string' || item.passage.length < 30)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-030', message: 'Highlight requires a passage (≥30 chars).', field: 'passage' });
            if (!item.correctSpanIndices || !Array.isArray(item.correctSpanIndices) || item.correctSpanIndices.length < 1)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-031', message: 'Highlight requires ≥1 correctSpanIndices.', field: 'correctSpanIndices' });
            break;

        case 'orderedResponse':
            if (!item.options || !Array.isArray(item.options) || item.options.length < 3)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-040', message: 'OrderedResponse requires ≥3 options.', field: 'options' });
            if (!item.correctOrder || !Array.isArray(item.correctOrder))
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-041', message: 'OrderedResponse requires correctOrder.', field: 'correctOrder' });
            break;

        case 'matrixMatch':
            if (!item.rows || !Array.isArray(item.rows) || item.rows.length < 2)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-050', message: 'MatrixMatch requires ≥2 rows.', field: 'rows' });
            if (!item.columns || !Array.isArray(item.columns) || item.columns.length < 2)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-051', message: 'MatrixMatch requires ≥2 columns.', field: 'columns' });
            if (!item.correctMatches || typeof item.correctMatches !== 'object')
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-052', message: 'MatrixMatch requires correctMatches.', field: 'correctMatches' });
            break;

        case 'clozeDropdown':
        case 'dragAndDropCloze':
            if (!item.template || typeof item.template !== 'string')
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-060', message: `${item.type} requires a template string.`, field: 'template' });
            if (!item.blanks || !Array.isArray(item.blanks) || item.blanks.length < 1)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-061', message: `${item.type} requires ≥1 blanks.`, field: 'blanks' });
            // Check that each blank has correctOption
            if (item.blanks && Array.isArray(item.blanks)) {
                item.blanks.forEach((b: any, idx: number) => {
                    if (!b.correctOption)
                        diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-062', message: `Blank ${idx} missing correctOption.`, field: `blanks[${idx}].correctOption` });
                });
            }
            break;

        case 'bowtie':
            if (!item.causes && !item.conditions)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-070', message: 'Bowtie requires causes/conditions.', field: 'causes' });
            if (!item.interventions && !item.actions)
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-071', message: 'Bowtie requires interventions/actions.', field: 'interventions' });
            break;

        case 'hotspot':
            if (!item.hotspots || !Array.isArray(item.hotspots))
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-080', message: 'Hotspot requires hotspots array.', field: 'hotspots' });
            if (!item.correctHotspotIds || !Array.isArray(item.correctHotspotIds))
                diags.push({ dimension: dim, severity: 'critical', code: 'TYPE-081', message: 'Hotspot requires correctHotspotIds.', field: 'correctHotspotIds' });
            break;
    }

    return diags;
}

function checkScoringAccuracy(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'scoringAccuracy';

    if (!item.scoring) {
        diags.push({ dimension: dim, severity: 'warning', code: 'SCORE-001', message: 'No scoring rule defined.', field: 'scoring' });
        return diags;
    }

    const scoring = item.scoring;

    // Check valid method
    if (!VALID_SCORING_METHODS.includes(scoring.method)) {
        diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-002', message: `Invalid scoring method: "${scoring.method}".`, field: 'scoring.method' });
    }

    // Check maxPoints is a positive integer
    if (scoring.maxPoints === undefined || scoring.maxPoints === null) {
        diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-003', message: 'scoring.maxPoints is missing.', field: 'scoring.maxPoints' });
    } else if (typeof scoring.maxPoints !== 'number' || scoring.maxPoints < 1 || !Number.isInteger(scoring.maxPoints)) {
        diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-004', message: `scoring.maxPoints must be a positive integer, got: ${scoring.maxPoints}.`, field: 'scoring.maxPoints' });
    }

    // ─── Scoring Consistency Checks (the core "scoring accuracy" checks) ───

    // Dichotomous types should have maxPoints = 1
    const dichotomousTypes = ['multipleChoice', 'priorityAction', 'trend', 'graphic', 'audioVideo', 'chartExhibit', 'orderedResponse'];
    if (dichotomousTypes.includes(item.type) && scoring.method === 'dichotomous' && scoring.maxPoints !== 1) {
        diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-010', message: `Dichotomous scoring for "${item.type}" should have maxPoints=1, got ${scoring.maxPoints}.`, field: 'scoring.maxPoints' });
    }

    // For selectAll: maxPoints should match correctOptionIds count
    if (item.type === 'selectAll' && item.correctOptionIds) {
        const expected = item.correctOptionIds.length;
        if (scoring.maxPoints !== expected) {
            diags.push({ dimension: dim, severity: 'warning', code: 'SCORE-020', message: `selectAll maxPoints (${scoring.maxPoints}) doesn't match correctOptionIds count (${expected}).`, field: 'scoring.maxPoints' });
        }
    }

    // For highlight: maxPoints should match correctSpanIndices count
    if (item.type === 'highlight' && item.correctSpanIndices) {
        const expected = item.correctSpanIndices.length;
        if (scoring.maxPoints !== expected) {
            diags.push({ dimension: dim, severity: 'warning', code: 'SCORE-021', message: `highlight maxPoints (${scoring.maxPoints}) doesn't match correctSpanIndices count (${expected}).`, field: 'scoring.maxPoints' });
        }
    }

    // For clozeDropdown / dragAndDropCloze: maxPoints should match blanks count
    if ((item.type === 'clozeDropdown' || item.type === 'dragAndDropCloze') && item.blanks) {
        const expected = item.blanks.length;
        if (scoring.maxPoints !== expected && scoring.method !== 'linkage') {
            diags.push({ dimension: dim, severity: 'warning', code: 'SCORE-022', message: `${item.type} maxPoints (${scoring.maxPoints}) doesn't match blanks count (${expected}).`, field: 'scoring.maxPoints' });
        }
    }

    // For matrixMatch: maxPoints should match rows count
    if (item.type === 'matrixMatch' && item.rows) {
        const expected = item.rows.length;
        if (scoring.maxPoints !== expected) {
            diags.push({ dimension: dim, severity: 'warning', code: 'SCORE-023', message: `matrixMatch maxPoints (${scoring.maxPoints}) doesn't match rows count (${expected}).`, field: 'scoring.maxPoints' });
        }
    }

    // For bowtie: maxPoints typically = correct causes + correct interventions + 1 condition
    if (item.type === 'bowtie') {
        const causeCount = item.correctCauseIds?.length || item.correctActionIds?.length || 0;
        const intCount = item.correctInterventionIds?.length || item.correctParameterIds?.length || 0;
        const expected = causeCount + intCount + 1; // +1 for condition
        if (scoring.maxPoints !== expected && scoring.maxPoints !== (causeCount + intCount)) {
            diags.push({ dimension: dim, severity: 'info', code: 'SCORE-024', message: `bowtie maxPoints (${scoring.maxPoints}) may not match expected (${expected} or ${causeCount + intCount}).`, field: 'scoring.maxPoints' });
        }
    }

    // For selectN: maxPoints should match n
    if (item.type === 'selectN' && item.n) {
        if (scoring.maxPoints !== item.n) {
            diags.push({ dimension: dim, severity: 'warning', code: 'SCORE-025', message: `selectN maxPoints (${scoring.maxPoints}) doesn't match n (${item.n}).`, field: 'scoring.maxPoints' });
        }
    }

    // Correct option must exist in options (for dichotomous types)
    if (item.correctOptionId && item.options && Array.isArray(item.options)) {
        const exists = item.options.some((o: any) => o.id === item.correctOptionId);
        if (!exists) {
            diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-030', message: `correctOptionId "${item.correctOptionId}" not found in options array.`, field: 'correctOptionId' });
        }
    }

    // For selectAll/selectN: all correctOptionIds must exist in options
    if (item.correctOptionIds && item.options && Array.isArray(item.options)) {
        const optIds = new Set(item.options.map((o: any) => o.id));
        for (const cid of item.correctOptionIds) {
            if (!optIds.has(cid)) {
                diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-031', message: `correctOptionIds contains "${cid}" which is not in options.`, field: 'correctOptionIds' });
            }
        }
    }

    // For blanks: each blank's correctOption must be in its options (clozeDropdown)
    if (item.type === 'clozeDropdown' && item.blanks && Array.isArray(item.blanks)) {
        item.blanks.forEach((b: any, idx: number) => {
            if (b.options && Array.isArray(b.options) && b.correctOption) {
                if (!b.options.includes(b.correctOption)) {
                    diags.push({ dimension: dim, severity: 'critical', code: 'SCORE-032', message: `Blank ${idx} correctOption "${b.correctOption}" not in its options.`, field: `blanks[${idx}].correctOption` });
                }
            }
        });
    }

    return diags;
}

function checkPedagogy(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'pedagogy';

    if (!item.pedagogy) return diags; // Already caught by completeness

    const p = item.pedagogy;

    // Bloom Level
    const normalizedBloom = AI_BLOOM_MAP[p.bloomLevel] || p.bloomLevel?.toLowerCase?.();
    if (!VALID_BLOOM_LEVELS.includes(normalizedBloom)) {
        diags.push({ dimension: dim, severity: 'warning', code: 'PED-001', message: `Invalid bloomLevel: "${p.bloomLevel}". Expected one of: ${VALID_BLOOM_LEVELS.join(', ')}.`, field: 'pedagogy.bloomLevel' });
    }

    // CJMM Step
    const normalizedCjmm = AI_CJMM_MAP[p.cjmmStep] || p.cjmmStep;
    if (!VALID_CJMM_STEPS.includes(normalizedCjmm)) {
        diags.push({ dimension: dim, severity: 'warning', code: 'PED-002', message: `Invalid cjmmStep: "${p.cjmmStep}". Expected one of: ${VALID_CJMM_STEPS.join(', ')}.`, field: 'pedagogy.cjmmStep' });
    }

    // NCLEX Category
    if (!VALID_NCLEX_CATEGORIES.includes(p.nclexCategory)) {
        diags.push({ dimension: dim, severity: 'warning', code: 'PED-003', message: `Invalid nclexCategory: "${p.nclexCategory}".`, field: 'pedagogy.nclexCategory' });
    }

    // Difficulty
    const diff = Number(p.difficulty);
    if (isNaN(diff) || diff < 1 || diff > 5) {
        if (typeof p.difficulty === 'string') {
            // AI sometimes uses "Moderate" etc.
            const map: Record<string, number> = { 'Easy': 1, 'Low': 1, 'Moderate': 3, 'Medium': 3, 'Hard': 4, 'High': 4, 'Expert': 5 };
            if (!map[p.difficulty]) {
                diags.push({ dimension: dim, severity: 'info', code: 'PED-004', message: `Difficulty "${p.difficulty}" is not a numeric 1–5 value.`, field: 'pedagogy.difficulty' });
            }
        } else {
            diags.push({ dimension: dim, severity: 'warning', code: 'PED-004', message: `Difficulty must be 1–5, got: ${p.difficulty}.`, field: 'pedagogy.difficulty' });
        }
    }

    // Topic Tags
    if (!p.topicTags || !Array.isArray(p.topicTags) || p.topicTags.length === 0) {
        diags.push({ dimension: dim, severity: 'info', code: 'PED-005', message: 'No topicTags provided.', field: 'pedagogy.topicTags' });
    }

    return diags;
}

function checkRationaleQuality(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'rationaleQuality';

    if (!item.rationale) return diags;

    const r = item.rationale;

    if (!r.correct || typeof r.correct !== 'string' || r.correct.length < 20) {
        diags.push({ dimension: dim, severity: 'warning', code: 'RAT-001', message: 'Rationale "correct" explanation is missing or too short (<20 chars).', field: 'rationale.correct' });
    }

    if (!r.incorrect || typeof r.incorrect !== 'string' || r.incorrect.length < 20) {
        diags.push({ dimension: dim, severity: 'warning', code: 'RAT-002', message: 'Rationale "incorrect" explanation is missing or too short (<20 chars).', field: 'rationale.incorrect' });
    }

    if (!r.reviewUnits || !Array.isArray(r.reviewUnits) || r.reviewUnits.length === 0) {
        diags.push({ dimension: dim, severity: 'info', code: 'RAT-003', message: 'No reviewUnits provided.', field: 'rationale.reviewUnits' });
    }

    // Check for generic/template rationales (AI sometimes produces these)
    const genericPhrases = [
        'Focus on the pathophysiology, assessment cues, and priority interventions',
        'correctly completes the clinical hypothesis based on assessment cues',
        'NGN Clinical Excellence Guide 2026',
    ];
    const rationaleText = `${r.correct || ''} ${r.incorrect || ''}`;
    for (const phrase of genericPhrases) {
        if (rationaleText.includes(phrase)) {
            diags.push({ dimension: dim, severity: 'warning', code: 'RAT-010', message: `Rationale contains generic AI template text: "${phrase.substring(0, 40)}..."`, field: 'rationale' });
        }
    }

    // Check for identical correct/incorrect explanations
    if (r.correct && r.incorrect && r.correct === r.incorrect) {
        diags.push({ dimension: dim, severity: 'critical', code: 'RAT-011', message: 'Correct and incorrect rationale explanations are identical.', field: 'rationale' });
    }

    return diags;
}

function checkOptionLogic(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'optionLogic';

    if (item.options && Array.isArray(item.options)) {
        // Duplicate option IDs
        const ids = item.options.map((o: any) => o.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
            diags.push({ dimension: dim, severity: 'critical', code: 'OPT-001', message: 'Duplicate option IDs found.', field: 'options' });
        }

        // Empty option text
        item.options.forEach((o: any, idx: number) => {
            if (!o.text || (typeof o.text === 'string' && o.text.trim().length === 0)) {
                diags.push({ dimension: dim, severity: 'warning', code: 'OPT-002', message: `Option ${idx} (id: "${o.id}") has empty text.`, field: `options[${idx}].text` });
            }
        });

        // Duplicate option text
        const texts = item.options.map((o: any) => o.text?.trim?.()?.toLowerCase?.());
        const uniqueTexts = new Set(texts.filter(Boolean));
        if (uniqueTexts.size < texts.filter(Boolean).length) {
            diags.push({ dimension: dim, severity: 'warning', code: 'OPT-003', message: 'Duplicate option text found.', field: 'options' });
        }
    }

    // For multipleChoice: exactly one correct answer
    if (item.type === 'multipleChoice' && item.correctOptionId && item.options) {
        const correctOptions = item.options.filter((o: any) => o.id === item.correctOptionId);
        if (correctOptions.length === 0) {
            diags.push({ dimension: dim, severity: 'critical', code: 'OPT-010', message: 'correctOptionId references a nonexistent option.', field: 'correctOptionId' });
        }
    }

    // For blanks: check template has corresponding placeholder
    if ((item.type === 'clozeDropdown' || item.type === 'dragAndDropCloze') && item.template && item.blanks) {
        item.blanks.forEach((b: any) => {
            const placeholder = `{{${b.id}}}`;
            if (!item.template.includes(placeholder)) {
                diags.push({ dimension: dim, severity: 'warning', code: 'OPT-020', message: `Template missing placeholder "${placeholder}" for blank "${b.id}".`, field: 'template' });
            }
        });
    }

    return diags;
}

function checkDataReferences(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'dataReferences';

    // Check for items referencing itemContext (AI-generated format)
    if (item.itemContext) {
        diags.push({ dimension: dim, severity: 'info', code: 'DATA-001', message: 'Item has itemContext metadata (AI-generated format).', field: 'itemContext' });

        // 2026 STANDARD: EHR SYNC SBAR CHECK
        const context = item.itemContext;
        const sbarText = context.sbar || (context.tabs && context.tabs.find((t: any) => t.id === 'sbar')?.content);

        if (sbarText) {
            const wordCount = sbarText.split(/\s+/).filter(Boolean).length;
            if (wordCount < SBAR_MIN_WORDS || wordCount > SBAR_MAX_WORDS) {
                diags.push({ dimension: dim, severity: 'warning', code: 'DATA-2026-SBAR', message: `2026 Compliance: SBAR word count (${wordCount}) is outside the required 120-160 range.`, field: 'itemContext.sbar' });
            }

            // Check for military time
            const timeMatches = sbarText.match(/\d{1,2}:\d{2}/g);
            if (timeMatches) {
                for (const time of timeMatches) {
                    if (!MILITARY_TIME_REGEX.test(time)) {
                        diags.push({ dimension: dim, severity: 'warning', code: 'DATA-2026-TIME', message: `2026 Compliance: Invalid military time format found: "${time}". Expected HH:mm.`, field: 'itemContext.sbar' });
                    }
                }
            } else {
                diags.push({ dimension: dim, severity: 'info', code: 'DATA-2026-TIME-MISSING', message: '2026 Compliance: No timestamps found in SBAR. Military time (HH:mm) is recommended.', field: 'itemContext.sbar' });
            }
        }
    }

    // answerBreakdown should exist for rich rationale
    if (item.answerBreakdown && typeof item.answerBreakdown === 'object') {
        // Check that breakdown keys match option IDs
        if (item.options && Array.isArray(item.options)) {
            const optionIds = new Set(item.options.map((o: any) => o.id));
            const breakdownKeys = Object.keys(item.answerBreakdown);
            for (const key of breakdownKeys) {
                if (!optionIds.has(key)) {
                    diags.push({ dimension: dim, severity: 'info', code: 'DATA-010', message: `answerBreakdown key "${key}" doesn't match any option ID.`, field: 'answerBreakdown' });
                }
            }
        }
    }

    // Check for mandatory Rationale elements (2026 Spec)
    const rationale = item.rationale || {};
    if (!rationale.clinicalPearls) diags.push({ dimension: dim, severity: 'warning', code: 'DATA-2026-PEARLS', message: '2026 Compliance: Missing clinicalPearls.', field: 'rationale.clinicalPearls' });
    if (!rationale.questionTrap) diags.push({ dimension: dim, severity: 'warning', code: 'DATA-2026-TRAP', message: '2026 Compliance: Missing questionTrap.', field: 'rationale.questionTrap' });
    if (!rationale.mnemonic) diags.push({ dimension: dim, severity: 'warning', code: 'DATA-2026-MNEMONIC', message: '2026 Compliance: Missing mnemonic.', field: 'rationale.mnemonic' });

    return diags;
}

function checkErrorDetection(item: any): QADiagnostic[] {
    const diags: QADiagnostic[] = [];
    const dim: QADimension = 'errorDetection';

    // Deep scan for "System Diagnostic Error" or similar error strings
    const jsonStr = JSON.stringify(item);
    const errorPatterns = [
        'System Diagnostic Error',
        'undefined',
        'NaN',
        'null',
        '[object Object]',
        'ERROR:',
        'FIXME',
        'TODO:',
        'PLACEHOLDER',
    ];

    for (const pattern of errorPatterns) {
        // Skip 'null' in JSON since it's valid JSON; check for literal "null" in text fields
        if (pattern === 'null') {
            const textFields = [item.stem, item.rationale?.correct, item.rationale?.incorrect];
            for (const field of textFields) {
                if (typeof field === 'string' && field.includes('null') && !field.includes('nullify')) {
                    diags.push({ dimension: dim, severity: 'info', code: 'ERR-002', message: `Text field contains literal "null".`, field: 'text' });
                    break;
                }
            }
            continue;
        }
        if (pattern === 'undefined') {
            const textFields = [item.stem, item.rationale?.correct, item.rationale?.incorrect];
            for (const field of textFields) {
                if (typeof field === 'string' && field.includes('undefined')) {
                    diags.push({ dimension: dim, severity: 'warning', code: 'ERR-003', message: `Text field contains literal "undefined".`, field: 'text' });
                    break;
                }
            }
            continue;
        }

        if (jsonStr.includes(pattern)) {
            diags.push({ dimension: dim, severity: pattern === 'System Diagnostic Error' ? 'critical' : 'info', code: 'ERR-001', message: `Item contains error-like pattern: "${pattern}".`, field: 'general' });
        }
    }

    // Check for extremely short stems that might be errors
    if (item.stem && typeof item.stem === 'string' && item.stem.length < 25) {
        diags.push({ dimension: dim, severity: 'warning', code: 'ERR-010', message: `Stem is suspiciously short (${item.stem.length} chars).`, field: 'stem' });
    }

    return diags;
}

// ═══════════════════════════════════════════════════════════
//  Main QA Runner
// ═══════════════════════════════════════════════════════════

export function runItemQA(item: any): QAItemReport {
    const allDiags: QADiagnostic[] = [
        ...checkCompleteness(item),
        ...checkTypeStructure(item),
        ...checkScoringAccuracy(item),
        ...checkPedagogy(item),
        ...checkRationaleQuality(item),
        ...checkOptionLogic(item),
        ...checkDataReferences(item),
        ...checkErrorDetection(item),
    ];

    // Calculate per-dimension scores
    const dimensions: QADimension[] = [
        'completeness', 'typeStructure', 'scoringAccuracy', 'pedagogy',
        'rationaleQuality', 'optionLogic', 'dataReferences', 'errorDetection',
    ];

    const dimensionScores: Record<QADimension, number> = {} as any;
    for (const d of dimensions) {
        const dimDiags = allDiags.filter(diag => diag.dimension === d);
        const criticals = dimDiags.filter(diag => diag.severity === 'critical').length;
        const warnings = dimDiags.filter(diag => diag.severity === 'warning').length;
        const infos = dimDiags.filter(diag => diag.severity === 'info').length;

        if (criticals > 0) dimensionScores[d] = Math.max(0, 100 - criticals * 40 - warnings * 10);
        else if (warnings > 0) dimensionScores[d] = Math.max(40, 100 - warnings * 15 - infos * 5);
        else if (infos > 0) dimensionScores[d] = Math.max(80, 100 - infos * 5);
        else dimensionScores[d] = 100;
    }

    // Overall score (weighted average)
    const weights: Record<QADimension, number> = {
        completeness: 20,
        typeStructure: 20,
        scoringAccuracy: 20,
        pedagogy: 10,
        rationaleQuality: 10,
        optionLogic: 10,
        dataReferences: 5,
        errorDetection: 5,
    };
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const overallScore = dimensions.reduce((sum, d) => sum + dimensionScores[d] * weights[d], 0) / totalWeight;

    // Verdict
    const hasCritical = allDiags.some(d => d.severity === 'critical');
    const hasWarning = allDiags.some(d => d.severity === 'warning');
    const verdict: QAVerdict = hasCritical ? 'fail' : hasWarning ? 'warn' : 'pass';

    return {
        itemId: item.id || 'unknown',
        itemType: item.type || 'unknown',
        verdict,
        diagnostics: allDiags,
        checkedAt: new Date().toISOString(),
        score: Math.round(overallScore),
        dimensionScores,
    };
}

export function runBankQA(items: any[]): QABankReport {
    const itemReports = items.map(runItemQA);

    const passed = itemReports.filter(r => r.verdict === 'pass').length;
    const warned = itemReports.filter(r => r.verdict === 'warn').length;
    const failed = itemReports.filter(r => r.verdict === 'fail').length;

    const overallScore = itemReports.length > 0
        ? Math.round(itemReports.reduce((sum, r) => sum + r.score, 0) / itemReports.length)
        : 0;

    // Dimension summary
    const dimensions: QADimension[] = [
        'completeness', 'typeStructure', 'scoringAccuracy', 'pedagogy',
        'rationaleQuality', 'optionLogic', 'dataReferences', 'errorDetection',
    ];
    const dimensionSummary: Record<QADimension, { passed: number; warned: number; failed: number }> = {} as any;
    for (const d of dimensions) {
        dimensionSummary[d] = {
            passed: itemReports.filter(r => r.dimensionScores[d] === 100).length,
            warned: itemReports.filter(r => r.dimensionScores[d] >= 40 && r.dimensionScores[d] < 100).length,
            failed: itemReports.filter(r => r.dimensionScores[d] < 40).length,
        };
    }

    // Type distribution
    const typeDistribution: Record<string, number> = {};
    for (const r of itemReports) {
        typeDistribution[r.itemType] = (typeDistribution[r.itemType] || 0) + 1;
    }

    return {
        totalItems: items.length,
        passed,
        warned,
        failed,
        overallScore,
        itemReports,
        checkedAt: new Date().toISOString(),
        dimensionSummary,
        typeDistribution,
    };
}
// ═══════════════════════════════════════════════════════════
//  Self-Healing (Repair) Logic
// ═══════════════════════════════════════════════════════════

/**
 * Attempts to automatically "heal" an item by fixing deterministic errors
 * identified by the QA diagnostics.
 */
export function repairItem(item: any): { repaired: any; changes: string[] } {
    const report = runItemQA(item);
    const changes: string[] = [];
    if (report.verdict === 'pass') return { repaired: item, changes: [] };

    // Work on a deep clone
    const repaired = JSON.parse(JSON.stringify(item));

    // 1. Fix Missing/Wrong Scoring Defaults
    if (!repaired.scoring) {
        repaired.scoring = { method: 'polytomous', maxPoints: 1 };
        changes.push('Added missing scoring object');
    }

    // 2. Fix maxPoints for selectAll (Dichotomous vs Polytomous common error)
    if (repaired.type === 'selectAll' && repaired.correctOptionIds) {
        const expected = repaired.correctOptionIds.length;
        if (repaired.scoring.maxPoints !== expected) {
            repaired.scoring.maxPoints = expected;
            repaired.scoring.method = 'polytomous';
            changes.push(`Corrected selectAll maxPoints to ${expected}`);
        }
    }

    // 3. Fix maxPoints for Multiple Choice (Must be 1)
    const dichotomousTypes = ['multipleChoice', 'priorityAction', 'trend', 'graphic', 'audioVideo', 'chartExhibit'];
    if (dichotomousTypes.includes(repaired.type) && (repaired.scoring.maxPoints !== 1 || repaired.scoring.method !== 'dichotomous')) {
        repaired.scoring.maxPoints = 1;
        repaired.scoring.method = 'dichotomous';
        changes.push(`Normalized ${repaired.type} to dichotomous/1pt`);
    }

    // 4. Normalize Pedagogy Casing
    if (repaired.pedagogy) {
        if (AI_BLOOM_MAP[repaired.pedagogy.bloomLevel]) {
            const old = repaired.pedagogy.bloomLevel;
            repaired.pedagogy.bloomLevel = AI_BLOOM_MAP[old];
            changes.push(`Normalized Bloom: ${old} -> ${repaired.pedagogy.bloomLevel}`);
        }
        if (AI_CJMM_MAP[repaired.pedagogy.cjmmStep]) {
            const old = repaired.pedagogy.cjmmStep;
            repaired.pedagogy.cjmmStep = AI_CJMM_MAP[old];
            changes.push(`Normalized CJMM: ${old} -> ${repaired.pedagogy.cjmmStep}`);
        }
    }

    // 5. Fix passage padding in Highlight
    if (repaired.type === 'highlight' && repaired.passage) {
        if (!repaired.passage.startsWith(' ') && !repaired.passage.endsWith(' ')) {
            // Optional: Ensure span-friendly padding if needed by renderer
        }
    }

    return { repaired, changes };
}

/**
 * Runs repair on a batch of items
 */
export function repairBank(items: any[]): { repairedItems: any[]; totalChanges: number } {
    let totalChanges = 0;
    const repairedItems = items.map(item => {
        const { repaired, changes } = repairItem(item);
        totalChanges += changes.length;
        return repaired;
    });
    return { repairedItems, totalChanges };
}

/**
 * NCLEX-RN NGN 2026 MASTER FIX LOGIC
 * strictly adheres to NGN_2026_STANDARDS_SPECIFICATION.md
 */

export const NGN_2026_PROMPT_TEMPLATE = `
You are a Lead NGN Psychometrician at NCLEX-RN Central (2026 Edition).
TASK: REPAIR the following item to meet 100% SentinelQA compliance.

SPECIFICATIONS:
1. TAB SYNC: EHR subsections (SBAR, Labs, Vitals, Radiology, MAR) MUST match the item logic.
2. SBAR: Exactly 120-160 words, military time (HH:mm), SBAR format.
3. SCORING RULES:
   - SATA/Highlight: Polytomous (+/- 1.0 penalty factor).
   - Matrix/Cloze: 0/1 (no penalty).
   - Bowtie: Linked Dyad/Triad scoring.
4. RATIONALE: Deep clinical/pathophysiological explanations. Add clinicalPearls, questionTrap, and mnemonic.

CURRENT ITEM:
{{ITEM_JSON}}

Return ONLY PURE JSON matching the MasterItem interface.
`;

export async function runDeepAIRepair(item: any, apiKey: string): Promise<{ repaired: any; changes: string[] }> {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = NGN_2026_PROMPT_TEMPLATE.replace('{{ITEM_JSON}}', JSON.stringify(item, null, 2));

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,
            response_mime_type: "application/json"
        }
    };

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!resp.ok) throw new Error(`AI Repair Failed: ${resp.status}`);

        const data = await resp.json();
        const repaired = JSON.parse(data.candidates[0].content.parts[0].text);

        // Final deterministic correction for common AI slips
        if (repaired.type === 'selectAll' || repaired.type === 'highlight') {
            repaired.scoring = {
                method: 'polytomous',
                maxPoints: repaired.correctOptionIds?.length || repaired.correctSpanIndices?.length || 1
            };
        }

        return { repaired, changes: ["2026 Specification Deep Clinical Alignment", "Rationale Enrichment", "EHR/SBAR Synchronization"] };
    } catch (e: any) {
        console.error("Deep AI Repair Error:", e);
        throw e;
    }
}
