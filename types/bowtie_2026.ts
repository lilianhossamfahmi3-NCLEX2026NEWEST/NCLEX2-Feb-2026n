/**
 * Bowtie Auditor & Remediation Agent (BARA) - Structural Standards
 * Strictly following the NCLEX-RN NGN 2026 Architectural Standards.
 */

export interface Bowtie2026 {
    id: string;
    type: 'bowtie';
    stem: string; // Strictly 2-3 sentences (25-50 words)
    itemContext: {
        patient: {
            name: string;
            age: number | string; // Must match stem
            gender: string;
            allergies: string[]; // Must reflect stem
            iso: string; // Must match condition in stem
        };
        sbar: string; // Strictly 60-90 words, SBAR format, Military Time (HH:mm)
        tabs: Array<{
            id: string;
            title: string;
            content: string | any;
        }>;
    };
    actions: Array<{
        id: string;
        text: string; // Strictly 1-10 words
        correct?: boolean;
        rationale?: string; // Strictly 1-3 sentences (15-45 words)
    }>;
    potentialConditions: string[]; // Select 1
    condition: string; // The single most likely diagnosis
    parameters: Array<{
        id: string;
        text: string; // Strictly 1-10 words
        correct?: boolean;
        rationale?: string; // Strictly 1-3 sentences (15-45 words)
    }>;
    scoring: {
        method: 'polytomous' | 'linkage';
        maxPoints: number; // 5 points typical
    };
    rationale: {
        correct: string;
        incorrect: string;
        clinicalPearls: string[]; // Array of short, testable facts
        questionTrap: {
            trapDescription: string;
            strategy: string;
        };
        mnemonic: {
            frontsideText: string;
            backsideText: string;
        };
        reviewUnits?: any[];
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

export interface StudyCompanion {
    pearls: string[];
    traps: Array<{
        trapDescription: string;
        strategy: string;
    }>;
    mnemonics: Array<{
        frontsideText: string;
        backsideText: string;
    }>;
}
