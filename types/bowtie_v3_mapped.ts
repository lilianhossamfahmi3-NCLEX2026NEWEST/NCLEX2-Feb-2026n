/**
 * Bowtie v3 Mapped — Fixed Architecture Standards (2026)
 * Strictly follows the NCLEX-RN NGN 2026 Clinical Logic Specification.
 */

export interface BowtieV3Mapped {
    // === MAP CODES (The Fixation Keys) ===
    scenarioMapCode: string;    // e.g., "SCN-DKA-EMERGENCY-001"
    ehr_map_code: string;       // Binds to scenarioMapCode
    bowtie_map_code: string;    // Binds to scenarioMapCode
    companion_map_code: string; // Binds to scenarioMapCode
    hud_map_code: string;       // Binds to scenarioMapCode

    // === PART 1: EHR (Patient Info Panel) ===
    id: string;
    type: 'bowtie';
    patientHeader: {
        name: string;
        age: number | string;
        gender: string;
        codeStatus: string;
        isolationStatus: string;
        allergies: string[];
    };
    ehrTabs: {
        clinicalFeed: {
            timestamp: string; // Military Time HH:mm
            content: string;   // SBAR format, 60-90 words
        };
        vitalsTelemetry: Array<{
            timestamp: string;
            temp: string;
            hr: string;
            rr: string;
            bp: string;
            spo2: string;
            pain: string;
        }>;
        labDiagnostics: Array<{
            testName: string;
            value: string;
            unit: string;
            referenceRange: string;
            status: 'High' | 'Low' | 'Normal' | 'Critical';
        }>;
        physicalExam: Array<{
            system: string;
            finding: string;
        }>;
        radiology: Array<{
            test: string;
            result: string;
        }>;
        carePlan: Array<{
            priority: string;
            intervention: string;
        }>;
        marConsole: Array<{
            medication: string;
            dose: string;
            route: string;
            status: string;
        }>;
    };

    // === PART 2: Bowtie Question Grid ===
    stem: string; // Strictly 2-3 sentences (25-50 words)
    actions: Array<{
        id: string;
        itemMapCode: string; // e.g. "ACTION-IV-FLUIDS"
        text: string;
        hoverRationale: string; // 15-45 words
    }>;
    potentialConditions: Array<{
        id: string;
        text: string;
        hoverRationale: string; // 15-45 words
    }>;
    parameters: Array<{
        id: string;
        itemMapCode: string; // e.g. "PARAM-BP-HR"
        text: string;
        hoverRationale: string; // 15-45 words
    }>;
    correctActionIds: string[];
    correctConditionId: string;
    correctParameterIds: string[];

    // === PART 3: Study Companion Module ===
    studyCompanion: {
        pearls: Array<{
            id: string;
            content: string; // High-yield facts
        }>;
        traps: Array<{
            id: string;
            trapDescription: string;
            strategy: string;
        }>;
        mnemonics: Array<{
            id: string;
            frontsideText: string;
            backsideText: string;
        }>;
    };

    // === PART 4: Expert HUD & Pedagogy ===
    pedagogy: {
        bloomLevel: string;
        cjmmDomains: string[]; // e.g. ["Recognize Cues", "Analyze Cues"]
        nclexCategory: string;
        difficulty: number;
        topicTags: string[];
    };
    scoring: {
        method: 'polytomous' | 'linkage';
        maxPoints: number; // 5 Typical
    };
    qualityMark: 'NGN-2026-HI-FI-V3-MAPPED';
}
