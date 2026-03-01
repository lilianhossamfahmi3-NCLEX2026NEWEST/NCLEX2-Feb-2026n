/**
 * Standalone Auditor & Remediation Agent (SARA) - Structural Standards
 * Specifically for: mcq_single, priorityAction, sata_multiple, select_n
 * Strictly following the NCLEX-RN NGN 2026 Architectural Standards.
 */

export type StandaloneType = 'mcq_single' | 'priorityAction' | 'sata_multiple' | 'select_n';

export interface StandaloneItem2026 {
    id: string;
    type: StandaloneType;
    stem: string; // Strictly 2-3 sentences (25-50 words). Scenario -> Condition -> Prompt.
    options: Array<{
        id: string;
        text: string; // Strictly 1-15 words. Parallel structure.
        isCorrect: boolean;
        hoverRationale: string; // Strictly 1-3 sentences (15-45 words).
    }>;
    itemContext?: {
        patient: {
            name?: string;
            age: number | string; // Must sync with stem
            gender: string; // Must sync with stem
            allergies: string[];
            iso?: string;
        };
    };
    rationale: {
        // Study Companion Bundle
        clinicalPearls: string[]; // Array of short, testable facts
        questionTrap: {
            trapDescription: string;
            strategy: string;
        };
        mnemonic: {
            frontsideText: string;
            backsideText: string;
        };
    };
    pedagogy: {
        bloomLevel: string;
        cjmmStep: string;
        nclexCategory: string;
        difficulty: number;
        topicTags: string[];
    };
    qualityMark?: 'NGN-2026-HI-FI';
    healedAt?: string;
}

export interface SARA_AuditReport {
    service_id: "Service_2_Standalone_Audit";
    timestamp: string;
    total_items_scanned: number;
    items_remediated: number;
    changelog: Array<{
        itemID: string;
        itemType: StandaloneType;
        issues_identified: string;
        action_taken: string;
    }>;
}
