/**
 * NCLEX-RN NGN Clinical Simulator — Master Type System
 * Single Source of Truth for every data shape.
 * (c) 2024 Advanced Agentic Coding Team
 */

// ═══════════════════════════════════════════════════════════
//  CORE CLINICAL INTERFACES
// ═══════════════════════════════════════════════════════════

// ─── Patient ─────────────────────────────────────────────
export interface Patient {
    id: string;
    name: string;
    age: number;
    sex: 'M' | 'F' | 'Other';
    pronouns: string;
    codeStatus: 'Full Code' | 'DNR' | 'DNI' | 'DNR/DNI' | 'Comfort Measures Only';
    allergies: string[];
    weight_kg: number;
    height_cm: number;
    iso: string;
    diagnosis?: string;
    admissionDate?: string;
    precautions?: string;
}

// ─── SBAR Note ───────────────────────────────────────────
export interface SBARNote {
    id?: string;
    title?: string; // For compatibility
    content?: string; // For compatibility
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
    timestamp: string;
    author: string;
    authorRole?: 'RN' | 'MD' | 'NP' | 'PA' | 'RT' | 'PharmD';
}

// ─── Vital Signs ─────────────────────────────────────────
export interface VitalSign {
    time: string;
    hr: number;
    sbp: number;
    dbp: number;
    rr: number;
    temp: number;
    spo2: number;
    spo2Source?: string;
    intensity?: string; // e.g. "Post-Op", "At Rest"
    pain: number;
    consciousness: 'Alert' | 'Voice' | 'Pain' | 'Unresponsive' | 'Agitated' | 'Confused' | 'Lethargic' | 'Somnolent' | 'Obtunded' | 'Stuporous' | 'Panic' | 'Anxious' | 'Irritable' | 'Post-ictal' | 'Weak' | 'Disoriented';
}

// ─── Lab Result ──────────────────────────────────────────
export interface LabResult {
    id?: string;
    name: string;
    value: number;
    unit: string;
    refLow: number;
    refHigh: number;
    timestamp: string;
    flag?: 'H' | 'L' | 'C';
}

// ─── Physical Exam ───────────────────────────────────────
export interface PhysicalExam {
    system: string;
    findings: string;
    isAbnormal: boolean;
}

// ─── Order ───────────────────────────────────────────────
export interface Order {
    id: string;
    type: 'medication' | 'lab' | 'imaging' | 'procedure' | 'diet' | 'activity' | 'consult';
    description: string;
    priority: 'routine' | 'urgent' | 'stat';
    status: 'active' | 'completed' | 'discontinued';
    timestamp: string;
}

// ─── Imaging ─────────────────────────────────────────────
export interface ImagingResult {
    type: string; // e.g., 'X-Ray', 'CT Scan', 'MRI'
    view: string; // e.g., 'Chest PA/Lateral'
    findings: string;
    impression: string;
    imageUrl?: string;
    timestamp: string;
    status: 'preliminary' | 'final';
}

// ─── Medication (MAR) ────────────────────────────────────
export interface Medication {
    id: string;
    name: string;
    dose: string;
    dosage?: string; // For compatibility
    route: string;
    frequency: string;
    status: 'scheduled' | 'administered' | 'held' | 'overdue' | 'discontinued';
    scheduledTime: string;
    lastAdministered?: string;
    lastAdmin?: string; // For compatibility
    indication?: string;
    requirements?: string[];
}

export interface MedicationAdministration {
    medId: string;
    timestamp: string;
    itemIndex: number; // item index when it was given
    rightsChecked: string[]; // List of the 15 rights verified
    administeredBy: string;
}

export interface PearlAnnotation {
    target: string;       // e.g., 'BNP', 'SpO2', 'Cardiovascular'
    category: 'lab' | 'vital' | 'exam' | 'order';
    pearl: string;
}

// ─── Aggregated Clinical Data ────────────────────────────
export interface ClinicalData {
    notes: SBARNote[];
    vitals: VitalSign[];
    labs: LabResult[];
    physicalExam: PhysicalExam[];
    orders: Order[];
    imaging: ImagingResult[];
    medications: Medication[];
    pearlAnnotations?: PearlAnnotation[];
}

// ═══════════════════════════════════════════════════════════
//  PEDAGOGY & RATIONALE
// ═══════════════════════════════════════════════════════════

export type CJMMStep =
    | 'recognizeCues'
    | 'analyzeCues'
    | 'prioritizeHypotheses'
    | 'generateSolutions'
    | 'takeAction'
    | 'evaluateOutcomes';

export interface ReviewUnit {
    heading: string;
    body: string;
    source?: string;
}

export interface QuestionTrap {
    trap: string;
    howToOvercome: string;
}

export interface Mnemonic {
    title: string;
    expansion: string;
}

export interface AnswerBreakdownItem {
    label: string;             // e.g., "A", "Step 1", "BNP → Expected", "Cause"
    content: string;           // Explanation text
    isCorrect?: boolean;       // true = correct answer, false = wrong, undefined = neutral
    group?: string;            // For grouping (e.g., "causes" vs "interventions" in bowtie)
}

export interface Rationale {
    correct: string;
    incorrect: string;
    reviewUnits: ReviewUnit[];
    clinicalPearls?: string[];
    questionTrap?: QuestionTrap;
    mnemonic?: Mnemonic;
    answerBreakdown?: AnswerBreakdownItem[];
}

export type NclexCategory =
    | 'Management of Care'
    | 'Safety and Infection Prevention and Control'
    | 'Health Promotion and Maintenance'
    | 'Psychosocial Integrity'
    | 'Basic Care and Comfort'
    | 'Pharmacological and Parenteral Therapies'
    | 'Reduction of Risk Potential'
    | 'Physiological Adaptation';

export interface Pedagogy {
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    cjmmStep: CJMMStep;
    nclexCategory: NclexCategory;
    difficulty: 1 | 2 | 3 | 4 | 5;
    topicTags: string[];
}

// ═══════════════════════════════════════════════════════════
//  SCORING TYPES
// ═══════════════════════════════════════════════════════════

export type ScoringRule =
    | { method: 'dichotomous'; maxPoints: 1 }
    | { method: 'polytomous'; maxPoints: number }
    | { method: 'linkage'; maxPoints: number; partialMap: Record<string, number> };

// ═══════════════════════════════════════════════════════════
//  ITEM BASE
// ═══════════════════════════════════════════════════════════

export interface ItemBase {
    id: string;
    type: string;
    stem: string;
    pedagogy: Pedagogy;
    rationale: Rationale;
    scoring: ScoringRule;
    status?: 'draft' | 'live';
    qaiScore?: number;
    createdAt?: string;
    updatedAt?: string;
}

// ═══════════════════════════════════════════════════════════
//  14 NGN QUESTION TYPES
// ═══════════════════════════════════════════════════════════

// Type 1: Highlight
export interface HighlightItem extends ItemBase {
    type: 'highlight';
    passage: string;
    correctSpanIndices: number[];
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 2: Multiple Choice
export interface MultipleChoiceItem extends ItemBase {
    type: 'multipleChoice';
    options: { id: string; text: string }[];
    correctOptionId: string;
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// Type 3: Select All That Apply
export interface SelectAllItem extends ItemBase {
    type: 'selectAll';
    options: { id: string; text: string }[];
    correctOptionIds: string[];
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 3b: Select N (exactly N options, 0/1 scoring — no penalty)
export interface SelectNItem extends ItemBase {
    type: 'selectN';
    n: number; // Exactly how many the student must select
    options: { id: string; text: string }[];
    correctOptionIds: string[];
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 4: Ordered Response
export interface OrderedResponseItem extends ItemBase {
    type: 'orderedResponse';
    options: { id: string; text: string }[];
    correctOrder: string[];
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// Type 5: Matrix Match
export interface MatrixMatchItem extends ItemBase {
    type: 'matrixMatch';
    rows: { id: string; text: string }[];
    columns: { id: string; text: string }[];
    correctMatches: Record<string, string>;
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 6: Cloze Dropdown
export interface ClozeDropdownItem extends ItemBase {
    type: 'clozeDropdown';
    template: string;
    blanks: {
        id: string;
        options: string[];
        correctOption: string;
    }[];
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 7: Drag and Drop Cloze
export interface DragAndDropClozeItem extends ItemBase {
    type: 'dragAndDropCloze';
    template: string;
    options: string[]; // Pool of drag items
    blanks: { id: string; correctOption: string }[]; // Specific blanks in the template
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 8: Bowtie (NCSBN 3-column: Actions to Take, Potential Condition, Parameters to Monitor)
export interface BowtieItem extends ItemBase {
    type: 'bowtie';
    actions: { id: string; text: string }[];            // Pool for Column 1
    potentialConditions: string[];                       // Pool for Column 2
    condition: string;                                   // Correct answer for Column 2
    parameters: { id: string; text: string }[];          // Pool for Column 3
    correctActionIds: string[];                          // Exactly 2 IDs
    correctParameterIds: string[];                       // Exactly 2 IDs
    scoring: { method: 'polytomous'; maxPoints: 5 };    // 2 (actions) + 1 (condition) + 2 (params) = 5
}

// Type 9: Trend
export interface TrendItem extends ItemBase {
    type: 'trend';
    dataPoints: {
        time: string;
        values: Record<string, number>;
    }[];
    question?: string; // Optional if stem is used
    options: { id: string; text: string }[];
    correctOptionId: string;
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// Type 10: Priority Action
export interface PriorityActionItem extends ItemBase {
    type: 'priorityAction';
    options: { id: string; text: string }[];
    correctOptionId: string;
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// Type 11: Hotspot
export interface HotspotItem extends ItemBase {
    type: 'hotspot';
    imageUrl: string;
    hotspots: {
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        label: string;
    }[];
    correctHotspotIds: string[];
    scoring: { method: 'polytomous'; maxPoints: number };
}

// Type 12: Graphic
export interface GraphicItem extends ItemBase {
    type: 'graphic';
    imageUrl: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// Type 13: Audio/Video
export interface AudioVideoItem extends ItemBase {
    type: 'audioVideo';
    mediaUrl: string;
    mediaType: 'audio' | 'video';
    options: { id: string; text: string }[];
    correctOptionId: string;
    transcript?: string;
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// Type 14: Chart Exhibit
export interface ChartExhibitItem extends ItemBase {
    type: 'chartExhibit';
    exhibits: { title: string; content: string }[];
    options: { id: string; text: string }[];
    correctOptionId: string;
    scoring: { method: 'dichotomous'; maxPoints: 1 };
}

// ═══════════════════════════════════════════════════════════
//  MASTER ITEM (Discriminated Union)
// ═══════════════════════════════════════════════════════════

export type MasterItem =
    | HighlightItem
    | MultipleChoiceItem
    | SelectAllItem
    | SelectNItem
    | OrderedResponseItem
    | MatrixMatchItem
    | ClozeDropdownItem
    | DragAndDropClozeItem
    | BowtieItem
    | TrendItem
    | PriorityActionItem
    | HotspotItem
    | GraphicItem
    | AudioVideoItem
    | ChartExhibitItem;

// ═══════════════════════════════════════════════════════════
//  CASE STUDY
// ═══════════════════════════════════════════════════════════

export interface CaseStudy {
    id: string;
    title: string;
    patient: Patient;
    clinicalData: ClinicalData;
    items: MasterItem[];
    timeLimit?: number;
    ehrPhases?: Record<number, Partial<ClinicalData>>; // Maps itemIndex to EHR updates
}

// ═══════════════════════════════════════════════════════════
//  SESSION & AUDIT
// ═══════════════════════════════════════════════════════════

export type StressState = 'focused' | 'hesitant' | 'panic' | 'paralysis';

export interface SessionState {
    id: string;
    caseStudy: CaseStudy;
    currentItemIndex: number;
    answers: Record<string, unknown>;
    scores: Record<string, number>;
    startTime: string;
    endTime?: string;
    status: 'active' | 'completed' | 'abandoned';
    stressState: StressState;
    cjmmProfile: Record<CJMMStep, number>;
    administeredMeds: Record<string, MedicationAdministration>;
    activeClinicalData: ClinicalData;
}

export interface AuditEntry {
    timestamp: string;
    action:
    | 'click'
    | 'tabChange'
    | 'answerSelect'
    | 'answerDeselect'
    | 'submit'
    | 'navigation'
    | 'highlight'
    | 'drag'
    | 'drop';
    target: string;
    metadata?: Record<string, unknown>;
    itemId?: string;
    sessionId: string;
}
