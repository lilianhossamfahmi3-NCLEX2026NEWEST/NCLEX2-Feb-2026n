/**
 * NCLEX-RN NGN Clinical Simulator — useSession Hook
 * Session state management: answers, scoring, navigation, stress.
 */

import { useReducer, useEffect, useMemo, useCallback } from 'react';
import {
    CaseStudy, SessionState, CJMMStep, StressState, MasterItem, ClinicalData
} from '../types/master';
import { scoreItem, calculateBayesianPassProbability } from '../engine/scoringEngine';
import { detectStress } from '../engine/stressEngine';
import { auditService } from '../services/auditService';

// ─── Actions ─────────────────────────────────────────────

type SessionAction =
    | { type: 'SUBMIT_ANSWER'; itemId: string; answer: unknown }
    | { type: 'NEXT_ITEM' }
    | { type: 'COMPLETE' }
    | { type: 'UPDATE_STRESS'; stressState: StressState }
    | { type: 'ADMINISTER_MED'; medId: string; rights: string[]; nurseName: string }
    | { type: 'RESUME_SESSION'; session: SessionState }
    | { type: 'TICK' };

// ─── Reducer ─────────────────────────────────────────────

function createInitialState(cs: CaseStudy): SessionState {
    const cjmmProfile: Record<CJMMStep, number> = {
        recognizeCues: 0,
        analyzeCues: 0,
        prioritizeHypotheses: 0,
        generateSolutions: 0,
        takeAction: 0,
        evaluateOutcomes: 0,
    };

    return {
        id: crypto.randomUUID(),
        caseStudy: cs,
        currentItemIndex: 0,
        answers: {},
        scores: {},
        startTime: new Date().toISOString(),
        status: 'active',
        stressState: 'focused',
        cjmmProfile,
        administeredMeds: {},
        activeClinicalData: { ...cs.clinicalData }, // Start with initial state
    };
}

function mergeClinicalData(current: ClinicalData, updates: Partial<ClinicalData>): ClinicalData {
    return {
        ...current,
        notes: [...current.notes, ...(updates.notes || [])],
        vitals: [...current.vitals, ...(updates.vitals || [])],
        labs: [...current.labs, ...(updates.labs || [])],
        physicalExam: updates.physicalExam ? [...current.physicalExam, ...updates.physicalExam] : current.physicalExam,
        orders: [...current.orders, ...(updates.orders || [])],
        imaging: [...current.imaging, ...(updates.imaging || [])],
        medications: [...current.medications, ...(updates.medications || [])],
        pearlAnnotations: [...(current.pearlAnnotations || []), ...(updates.pearlAnnotations || [])],
    };
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
    switch (action.type) {
        case 'SUBMIT_ANSWER': {
            const item = state.caseStudy.items.find(i => i.id === action.itemId);
            if (!item) return state;

            const result = scoreItem(item, action.answer);

            const newAnswers = { ...state.answers, [action.itemId]: action.answer };
            const newScores = { ...state.scores, [action.itemId]: result.earned };

            // Update CJMM profile (safely — items from cloud may lack pedagogy)
            const newProfile = { ...state.cjmmProfile };
            const step = item.pedagogy?.cjmmStep;
            if (step) {
                const stepItems = state.caseStudy.items.filter(i => i.pedagogy?.cjmmStep === step);
                const stepScores = stepItems
                    .map(i => newScores[i.id])
                    .filter((s): s is number => s !== undefined);
                const stepMaxes = stepItems
                    .filter(i => newScores[i.id] !== undefined)
                    .map(i => (i.scoring?.maxPoints ?? 1));

                if (stepScores.length > 0) {
                    const totalEarned = stepScores.reduce((a, b) => a + b, 0);
                    const totalMax = stepMaxes.reduce((a, b) => a + b, 0);
                    newProfile[step] = totalMax > 0 ? totalEarned / totalMax : 0;
                }
            }

            return {
                ...state,
                answers: newAnswers,
                scores: newScores,
                cjmmProfile: newProfile,
            };
        }

        case 'NEXT_ITEM': {
            const nextIdx = Math.min(
                state.currentItemIndex + 1,
                state.caseStudy.items.length - 1
            );

            // Check for EHR Phase updates
            let newActiveData = state.activeClinicalData;
            if (state.caseStudy.ehrPhases && state.caseStudy.ehrPhases[nextIdx]) {
                newActiveData = mergeClinicalData(state.activeClinicalData, state.caseStudy.ehrPhases[nextIdx]);
            }

            return {
                ...state,
                currentItemIndex: nextIdx,
                activeClinicalData: newActiveData
            };
        }

        case 'COMPLETE':
            return {
                ...state,
                status: 'completed',
                endTime: new Date().toISOString(),
            };

        case 'UPDATE_STRESS':
            return { ...state, stressState: action.stressState };

        case 'ADMINISTER_MED': {
            const newAdmin = {
                medId: action.medId,
                timestamp: new Date().toISOString(),
                itemIndex: state.currentItemIndex,
                rightsChecked: action.rights,
                administeredBy: action.nurseName
            };
            return {
                ...state,
                administeredMeds: {
                    ...state.administeredMeds,
                    [action.medId]: newAdmin
                }
            };
        }

        case 'RESUME_SESSION':
            return { ...action.session, caseStudy: state.caseStudy }; // Keep current case study ref

        default:
            return state;
    }
}

// ─── Hook ────────────────────────────────────────────────

export function useSession(caseStudy: CaseStudy) {
    const [state, dispatch] = useReducer(
        sessionReducer,
        caseStudy,
        createInitialState
    );

    useEffect(() => {
        if (state.status !== 'active') return;

        const interval = setInterval(() => {
            const entries = auditService.getEntriesForSession(state.id);
            const stress = detectStress(entries);
            dispatch({ type: 'UPDATE_STRESS', stressState: stress });
        }, 2000);

        return () => clearInterval(interval);
    }, [state.status, state.id]);

    // Persistence: Save to LocalStorage
    useEffect(() => {
        localStorage.setItem(`nclex_session_${caseStudy.id}`, JSON.stringify(state));
    }, [state, caseStudy.id]);

    // Persistence: Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem(`nclex_session_${caseStudy.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.status === 'active') {
                    dispatch({ type: 'RESUME_SESSION', session: parsed });
                }
            } catch (e) {
                console.error('Failed to parse saved session', e);
            }
        }
    }, [caseStudy.id]);

    // Current item
    const currentItem: MasterItem = caseStudy.items[state.currentItemIndex];

    // Progress
    const progress = ((state.currentItemIndex + 1) / caseStudy.items.length) * 100;

    // Pass probability
    const passProbability = useMemo(() => {
        const scores: number[] = [];
        const totals: number[] = [];
        for (const item of caseStudy.items) {
            if (state.scores[item.id] !== undefined) {
                scores.push(state.scores[item.id]);
                totals.push(item.scoring?.maxPoints ?? 1);
            }
        }
        return calculateBayesianPassProbability(scores, totals);
    }, [state.scores, caseStudy.items]);

    // Actions
    const submitAnswer = useCallback((itemId: string, answer: unknown) => {
        dispatch({ type: 'SUBMIT_ANSWER', itemId, answer });
    }, []);

    const nextItem = useCallback(() => {
        dispatch({ type: 'NEXT_ITEM' });
    }, []);

    const completeSession = useCallback(() => {
        dispatch({ type: 'COMPLETE' });
    }, []);

    const administerMed = useCallback((medId: string, rights: string[], nurseName: string) => {
        dispatch({ type: 'ADMINISTER_MED', medId, rights, nurseName });
    }, []);

    return {
        state,
        currentItem,
        progress,
        passProbability,
        submitAnswer,
        nextItem,
        completeSession,
        administerMed,
    };
}
