/**
 * NCLEX-RN NGN Clinical Simulator — Test Suite
 * (c) 2024 Advanced Agentic Coding Team
 */

import * as clinical from '../engine/clinicalHelpers';
import { scoreItem } from '../engine/scoringEngine';
import { validateItem, validateCaseStudy } from '../validation/validationGate';
import { createSampleCaseStudy } from '../services/dataFactory';
import { detectStress } from '../engine/stressEngine';
import { VitalSign, LabResult, AuditEntry, MultipleChoiceItem, SelectAllItem } from '../types/master';

// --- (1) Unit Tests: clinicalHelpers.ts ---

describe('clinicalHelpers.ts', () => {
    test('calculateMAP computes correct values', () => {
        // MAP = DBP + (SBP - DBP) / 3
        const map = clinical.calculateMAP(120, 80);
        expect(map).toBeCloseTo(93.3, 0);
    });

    test('calculateMEWS scores high for critical vitals', () => {
        const vitals: VitalSign = {
            time: '2024-01-15T10:00:00Z',
            hr: 135,
            sbp: 75,
            dbp: 40,
            rr: 32,
            temp: 103.5,
            spo2: 85,
            pain: 8,
            consciousness: 'Pain',
        };
        const score = clinical.calculateMEWS(vitals);
        expect(score).toBeGreaterThanOrEqual(10);
    });

    test('flagLab identifies high, low, normal, and critical', () => {
        const normalLab: LabResult = {
            name: 'Potassium', value: 4.0, unit: 'mEq/L',
            refLow: 3.5, refHigh: 5.0, timestamp: '',
        };
        expect(clinical.flagLab(normalLab)).toBe('N');

        const highLab: LabResult = { ...normalLab, value: 5.5 };
        expect(clinical.flagLab(highLab)).toBe('H');

        const lowLab: LabResult = { ...normalLab, value: 3.0 };
        expect(clinical.flagLab(lowLab)).toBe('L');

        const criticalLab: LabResult = { ...normalLab, value: 7.0 };
        expect(clinical.flagLab(criticalLab)).toBe('C');
    });
});

// --- (2) Unit Tests: scoringEngine.ts ---

describe('scoringEngine.ts', () => {
    test('scores a MultipleChoice item correctly', () => {
        const item: MultipleChoiceItem = {
            id: 'test-1',
            type: 'multipleChoice',
            stem: 'Which is correct?',
            options: [
                { id: 'a', text: 'Option A' },
                { id: 'b', text: 'Option B' },
                { id: 'c', text: 'Option C' },
                { id: 'd', text: 'Option D' },
            ],
            correctOptionId: 'b',
            pedagogy: {
                bloomLevel: 'apply',
                cjmmStep: 'recognizeCues',
                nclexCategory: 'Physiological Adaptation',
                difficulty: 3,
                topicTags: ['test'],
            },
            rationale: {
                correct: 'This is correct because of clinical reasoning.',
                incorrect: 'This is incorrect because of clinical reasoning.',
                reviewUnits: [{ heading: 'Review', body: 'Review content goes here for the student to learn from this item.' }],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
        };

        const correct = scoreItem(item, 'b');
        expect(correct.earned).toBe(1);
        expect(correct.ratio).toBe(1);

        const incorrect = scoreItem(item, 'a');
        expect(incorrect.earned).toBe(0);
    });

    test('scores a SelectAll item with polytomous scoring', () => {
        const item: SelectAllItem = {
            id: 'test-2',
            type: 'selectAll',
            stem: 'Select all that apply to the clinical scenario.',
            options: [
                { id: 'a', text: 'A' },
                { id: 'b', text: 'B' },
                { id: 'c', text: 'C' },
                { id: 'd', text: 'D' },
            ],
            correctOptionIds: ['a', 'b', 'c'],
            pedagogy: {
                bloomLevel: 'analyze',
                cjmmStep: 'analyzeCues',
                nclexCategory: 'Physiological Adaptation',
                difficulty: 3,
                topicTags: ['test'],
            },
            rationale: {
                correct: 'These options are correct based on evidence-based practice.',
                incorrect: 'These options are not supported by clinical evidence.',
                reviewUnits: [{ heading: 'Review', body: 'Review content for polytomous scoring and SATA item types in NGN.' }],
            },
            scoring: { method: 'polytomous', maxPoints: 3 },
        };

        // All correct: 3 points
        const perfect = scoreItem(item, ['a', 'b', 'c']);
        expect(perfect.earned).toBe(3);

        // Partial with one wrong: 2 correct - 0.5 penalty = 1.5
        const partial = scoreItem(item, ['a', 'b', 'd']);
        expect(partial.earned).toBe(1.5);
    });
});

// --- (3) Validation ---

describe('Validation', () => {
    test('validateItem rejects invalid item shape', () => {
        const bad = { type: 'multipleChoice', stem: '' };
        const result = validateItem(bad);
        expect(result.success).toBe(false);
    });

    test('factory case study passes validation', () => {
        const cs = createSampleCaseStudy();
        const result = validateCaseStudy(cs);
        expect(result.success).toBe(true);
    });
});

// --- (4) Stress Detection ---

describe('Stress Detection', () => {
    test('detects panic from rapid answer changes', () => {
        const now = Date.now();
        const entries: AuditEntry[] = [];
        for (let i = 0; i < 8; i++) {
            entries.push({
                timestamp: new Date(now + (i * 200)).toISOString(),
                action: 'answerSelect',
                target: 'option-' + i,
                sessionId: 'test-session',
                itemId: 'test-item',
            });
        }
        const state = detectStress(entries);
        expect(state).toBe('panic');
    });

    test('detects focused state under normal conditions', () => {
        const now = Date.now();
        const entries: AuditEntry[] = [
            { timestamp: new Date(now).toISOString(), action: 'answerSelect', target: 'opt-a', sessionId: 's1' },
            { timestamp: new Date(now + 5000).toISOString(), action: 'submit', target: 'q1', sessionId: 's1' },
        ];
        const state = detectStress(entries);
        expect(state).toBe('focused');
    });
});
