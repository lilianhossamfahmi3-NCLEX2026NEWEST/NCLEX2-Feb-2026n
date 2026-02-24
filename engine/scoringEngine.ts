/**
 * NCLEX-RN NGN Clinical Simulator — Scoring Engine
 * Pure functions — no side effects.
 */

import {
    MasterItem,
    HighlightItem,
    SelectAllItem,
    SelectNItem,
    OrderedResponseItem,
    MatrixMatchItem,
    ClozeDropdownItem,
    DragAndDropClozeItem,
    BowtieItem,
    HotspotItem,
    ScoringRule
} from '../types/master';

// ═══════════════════════════════════════════════════════════
//  Score Result
// ═══════════════════════════════════════════════════════════

export interface ScoreResult {
    earned: number;
    max: number;
    ratio: number;
}

// ═══════════════════════════════════════════════════════════
//  Score Item (Router)
// ═══════════════════════════════════════════════════════════

export function scoreItem(item: MasterItem, answer: unknown): ScoreResult {
    // Safety: if no item or answer, bail gracefully
    if (!item || answer === undefined || answer === null) {
        return { earned: 0, max: item?.scoring?.maxPoints ?? 1, ratio: 0 };
    }

    // 1. Handle Linkage scoring method first if defined
    if ((item.scoring as ScoringRule)?.method === 'linkage') {
        return scoreLinkage(item, answer);
    }

    switch (item.type) {
        case 'highlight': return scoreHighlight(item, answer as number[]);
        case 'multipleChoice': return scoreDichotomous((item as any).correctOptionId, answer as string);
        case 'selectAll': return scoreSelectAll(item, answer as string[]);
        case 'selectN': return scoreSelectN(item, answer as string[]);
        case 'orderedResponse': return scoreOrdered(item, answer as string[]);
        case 'matrixMatch': return scoreMatrix(item, answer as Record<string, string>);
        case 'clozeDropdown': return scoreClozeDropdown(item, answer as Record<string, string>);
        case 'dragAndDropCloze': return scoreDragCloze(item, answer as Record<string, string>);
        case 'bowtie': return scoreBowtie(item, answer as { causes: string[]; actions: string[]; parameters: string[] });
        case 'trend': return scoreDichotomous((item as any).correctOptionId, answer as string);
        case 'priorityAction': return scoreDichotomous((item as any).correctOptionId, answer as string);
        case 'hotspot': return scoreHotspot(item, answer as string[]);
        case 'graphic': return scoreDichotomous((item as any).correctOptionId, answer as string);
        case 'audioVideo': return scoreDichotomous((item as any).correctOptionId, answer as string);
        case 'chartExhibit': return scoreDichotomous((item as any).correctOptionId, answer as string);
        default: return { earned: 0, max: 1, ratio: 0 };
    }
}

// ═══════════════════════════════════════════════════════════
//  Linkage (Rationales / Triads)
// ═══════════════════════════════════════════════════════════

function scoreLinkage(item: MasterItem, answer: any): ScoreResult {
    // Standard NCSBN Linkage: 
    // - Dyad (Rationale): 1 point if BOTH parts are correct.
    // - Triad: 1-2 points depending on which links are correct.

    // For universal linkage (0/1 total), we simply check if all answers match.
    if (item.type === 'clozeDropdown') {
        const cloze = item as ClozeDropdownItem;
        const allCorrect = cloze.blanks.every(b => answer[b.id] === b.correctOption);
        return { earned: allCorrect ? 1 : 0, max: 1, ratio: allCorrect ? 1 : 0 };
    }

    if (item.type === 'dragAndDropCloze') {
        const drag = item as DragAndDropClozeItem;
        const allCorrect = drag.blanks.every(b => answer[b.id] === b.correctOption);
        return { earned: allCorrect ? 1 : 0, max: 1, ratio: allCorrect ? 1 : 0 };
    }

    // Default linkage: 1 if everything is correct, 0 otherwise
    return { earned: 0, max: 1, ratio: 0 };
}

// ═══════════════════════════════════════════════════════════
//  Dichotomous (0/1)
// ═══════════════════════════════════════════════════════════

function scoreDichotomous(correctId: string | undefined, answer: string | undefined): ScoreResult {
    if (!correctId || !answer) return { earned: 0, max: 1, ratio: 0 };
    const earned = answer === correctId ? 1 : 0;
    return { earned, max: 1, ratio: earned };
}

// ═══════════════════════════════════════════════════════════
//  Polytomous Helpers (NCSBN Models)
// ═══════════════════════════════════════════════════════════

function scoreHighlight(item: HighlightItem, selectedIndices: number[]): ScoreResult {
    if (!item.correctSpanIndices || !Array.isArray(selectedIndices)) {
        return { earned: 0, max: item.scoring?.maxPoints ?? 1, ratio: 0 };
    }
    const correctSet = new Set(item.correctSpanIndices);
    let correctCount = 0;
    let incorrectCount = 0;

    for (const idx of selectedIndices) {
        if (correctSet.has(idx)) correctCount++;
        else incorrectCount++;
    }

    // NCSBN +/- model: +1 per correct, -1 per incorrect, floor at 0
    const earned = Math.max(0, correctCount - incorrectCount);
    // Max points is usually the total number of correct options in +/- items
    const max = item.scoring?.maxPoints || item.correctSpanIndices.length;
    return { earned, max, ratio: max > 0 ? earned / max : 0 };
}

function scoreSelectAll(item: SelectAllItem, selected: string[]): ScoreResult {
    if (!item.correctOptionIds || !Array.isArray(selected)) {
        return { earned: 0, max: item.scoring?.maxPoints ?? 1, ratio: 0 };
    }
    const correctSet = new Set(item.correctOptionIds);
    let correctCount = 0;
    let incorrectCount = 0;

    for (const id of selected) {
        if (correctSet.has(id)) correctCount++;
        else incorrectCount++;
    }

    // NCSBN +/- model: +1 per correct, -1 per incorrect, floor at 0
    const earned = Math.max(0, correctCount - incorrectCount);
    const max = item.scoring?.maxPoints || item.correctOptionIds.length;
    return { earned, max, ratio: max > 0 ? earned / max : 0 };
}

// NCSBN 0/1 model for Select N: +1 per correct, 0 penalty for incorrect
function scoreSelectN(item: SelectNItem, selected: string[]): ScoreResult {
    const correctSet = new Set(item.correctOptionIds);
    let correctCount = 0;

    // In Select N, we limit to the first N selections if the UI didn't already
    const validSelections = selected.slice(0, item.n);
    for (const id of validSelections) {
        if (correctSet.has(id)) correctCount++;
    }

    const max = item.scoring.maxPoints;
    return { earned: correctCount, max, ratio: max > 0 ? correctCount / max : 0 };
}

function scoreOrdered(item: OrderedResponseItem, answer: string[]): ScoreResult {
    // NCSBN Ordered Response is typically all-or-nothing (dichotomous)
    const isExact = item.correctOrder.length === answer.length &&
        item.correctOrder.every((id, i) => id === answer[i]);
    return { earned: isExact ? 1 : 0, max: 1, ratio: isExact ? 1 : 0 };
}

function scoreMatrix(item: MatrixMatchItem, answer: Record<string, string>): ScoreResult {
    let correctCount = 0;

    // NCSBN Matrix is 0/1 per row. No penalty for incorrect columns.
    for (const [rowId, colId] of Object.entries(answer)) {
        if (item.correctMatches[rowId] === colId) correctCount++;
    }

    const max = item.scoring.maxPoints;
    return { earned: correctCount, max, ratio: max > 0 ? correctCount / max : 0 };
}

function scoreClozeDropdown(item: ClozeDropdownItem, answer: Record<string, string>): ScoreResult {
    if (!item.blanks || !Array.isArray(item.blanks) || !answer || typeof answer !== 'object') {
        return { earned: 0, max: item.scoring?.maxPoints ?? 1, ratio: 0 };
    }
    let correctCount = 0;
    // NCSBN Cloze is 0/1 per blank.
    for (const blank of item.blanks) {
        if (blank && answer[blank.id] === blank.correctOption) correctCount++;
    }
    const max = item.scoring?.maxPoints ?? item.blanks.length;
    return { earned: correctCount, max, ratio: max > 0 ? correctCount / max : 0 };
}

// NCSBN 0/1 model for Drag-Drop Cloze: +1 per correct blank, no penalty
function scoreDragCloze(item: DragAndDropClozeItem, answer: Record<string, string>): ScoreResult {
    if (!item.blanks || !Array.isArray(item.blanks) || !answer || typeof answer !== 'object') {
        return { earned: 0, max: item.scoring?.maxPoints ?? 1, ratio: 0 };
    }
    let correctCount = 0;

    // NCSBN Drag-Drop Cloze is 0/1 per blank.
    item.blanks.forEach(blank => {
        if (blank && answer[blank.id] === blank.correctOption) correctCount++;
    });

    const max = item.scoring?.maxPoints ?? item.blanks.length;
    return { earned: correctCount, max, ratio: max > 0 ? correctCount / max : 0 };
}

// NCSBN Bowtie: 0/1 per element across all wings (5 elements total: 2 actions, 1 condition, 2 parameters)
function scoreBowtie(item: BowtieItem | any, answer: { actions?: string[]; condition?: string; parameters?: string[] }): ScoreResult {
    const correctActions = new Set(item.correctActionIds || item.correctAnswers?.actions || []);
    const correctParams = new Set(item.correctParameterIds || item.correctAnswers?.parameters || []);
    const condition = item.condition || item.correctAnswers?.condition || '';

    let correctCount = 0;

    // 1. Condition (Center)
    if (answer?.condition === condition) {
        correctCount++;
    }

    // 2. Actions (Left)
    if (answer?.actions && Array.isArray(answer.actions)) {
        for (const id of answer.actions) {
            if (correctActions.has(id)) correctCount++;
        }
    }

    // 3. Parameters (Right)
    if (answer?.parameters && Array.isArray(answer.parameters)) {
        for (const id of answer.parameters) {
            if (correctParams.has(id)) correctCount++;
        }
    }

    const max = item.scoring?.maxPoints || 5;
    return { earned: correctCount, max, ratio: max > 0 ? correctCount / max : 0 };
}

function scoreHotspot(item: HotspotItem, selected: string[]): ScoreResult {
    const correctSet = new Set(item.correctHotspotIds);
    let correctCount = 0;
    let incorrectCount = 0;

    for (const id of selected) {
        if (correctSet.has(id)) correctCount++;
        else incorrectCount++;
    }

    // NCSBN +/- model: +1 per correct, -1 per incorrect, floor at 0
    const earned = Math.max(0, correctCount - incorrectCount);
    const max = item.scoring.maxPoints || item.correctHotspotIds.length;
    return { earned, max, ratio: max > 0 ? earned / max : 0 };
}

// ═══════════════════════════════════════════════════════════
//  Bayesian Pass Probability
// ═══════════════════════════════════════════════════════════

export function calculateBayesianPassProbability(
    scores: number[],
    totalPossible: number[]
): number {
    let prior = 0.5;

    for (let i = 0; i < scores.length; i++) {
        // We use a sensitivity weighting: harder questions or larger max points have slightly more impact
        const performanceRatio = totalPossible[i] > 0 ? scores[i] / totalPossible[i] : 0;

        // Simulating Likelihood Function L(p|x)
        const likelihood = performanceRatio;
        const complementLikelihood = 1 - performanceRatio;

        const denominator = (likelihood * prior) + (complementLikelihood * (1 - prior));
        if (denominator < 0.001) continue; // Avoid instability

        prior = (likelihood * prior) / denominator;
    }

    return Math.max(0, Math.min(1, prior));
}

