/**
 * NCLEX-RN NGN Clinical Simulator — Schema Registry
 * Zod schemas for runtime validation of every type in master.ts.
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
//  Primitives
// ═══════════════════════════════════════════════════════════

const iso8601Schema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
const nonEmptyString = z.string().trim().min(1);

// ═══════════════════════════════════════════════════════════
//  Clinical Schemas
// ═══════════════════════════════════════════════════════════

export const PatientSchema = z.object({
    id: nonEmptyString,
    name: nonEmptyString,
    age: z.number().int().min(0).max(120),
    sex: z.enum(['M', 'F', 'Other']),
    pronouns: nonEmptyString,
    codeStatus: z.enum(['Full Code', 'DNR', 'DNI', 'DNR/DNI', 'Comfort Measures Only']),
    allergies: z.array(z.string()).min(0),
    weight_kg: z.number().min(0.5).max(350),
    height_cm: z.number().min(20).max(275),
    iso: nonEmptyString,
}).strict();

export const SBARNoteSchema = z.object({
    situation: z.string().min(20),
    background: z.string().min(20),
    assessment: z.string().min(20),
    recommendation: z.string().min(20),
    timestamp: iso8601Schema,
    author: nonEmptyString,
    authorRole: z.enum(['RN', 'MD', 'NP', 'PA', 'RT', 'PharmD']),
}).strict();

export const VitalSignSchema = z.object({
    time: iso8601Schema,
    hr: z.number().min(20).max(300),
    sbp: z.number().min(40).max(300),
    dbp: z.number().min(20).max(200),
    rr: z.number().min(0).max(60),
    temp: z.number().min(85).max(110),
    spo2: z.number().min(0).max(100),
    pain: z.number().int().min(0).max(10),
    consciousness: z.enum(['Alert', 'Voice', 'Pain', 'Unresponsive']),
}).strict().refine(d => d.dbp < d.sbp, { message: 'Diastolic must be less than systolic' });

export const LabResultSchema = z.object({
    name: nonEmptyString,
    value: z.number(),
    unit: nonEmptyString,
    refLow: z.number(),
    refHigh: z.number(),
    timestamp: iso8601Schema,
    flag: z.enum(['H', 'L', 'C']).optional(),
}).strict().refine(d => d.refLow < d.refHigh, { message: 'refLow must be less than refHigh' });

export const PhysicalExamSchema = z.object({
    system: nonEmptyString,
    findings: nonEmptyString,
    isAbnormal: z.boolean(),
}).strict();

export const OrderSchema = z.object({
    id: nonEmptyString,
    type: z.enum(['medication', 'lab', 'imaging', 'procedure', 'diet', 'activity', 'consult']),
    description: nonEmptyString,
    priority: z.enum(['routine', 'urgent', 'stat']),
    status: z.enum(['active', 'completed', 'discontinued']),
    timestamp: iso8601Schema,
}).strict();

export const ImagingResultSchema = z.object({
    type: nonEmptyString,
    view: nonEmptyString,
    findings: z.string().min(20),
    impression: z.string().min(10),
    imageUrl: z.string().url().optional(),
    timestamp: iso8601Schema,
    status: z.enum(['preliminary', 'final']),
}).strict();

export const ClinicalDataSchema = z.object({
    notes: z.array(SBARNoteSchema).min(1),
    vitals: z.array(VitalSignSchema).min(1),
    labs: z.array(LabResultSchema).min(1),
    physicalExam: z.array(PhysicalExamSchema).min(1),
    orders: z.array(OrderSchema).min(0),
    imaging: z.array(ImagingResultSchema).min(0),
}).strict();

// ═══════════════════════════════════════════════════════════
//  Pedagogy & Rationale
// ═══════════════════════════════════════════════════════════

export const ReviewUnitSchema = z.object({
    heading: nonEmptyString,
    body: z.string().min(50),
    source: z.string().optional(),
}).strict();

export const QuestionTrapSchema = z.object({
    trap: z.string().min(10),
    howToOvercome: z.string().min(10),
}).strict();

export const MnemonicSchema = z.object({
    title: nonEmptyString,
    expansion: z.string().min(5),
}).strict();

export const AnswerBreakdownItemSchema = z.object({
    label: nonEmptyString,
    content: z.string().min(10),
    isCorrect: z.boolean().optional(),
    group: z.string().optional(),
}).strict();

export const RationaleSchema = z.object({
    correct: z.string().min(30),
    incorrect: z.string().min(30),
    reviewUnits: z.array(ReviewUnitSchema).min(1),
    clinicalPearls: z.array(z.string().min(10)).optional(),
    questionTrap: QuestionTrapSchema.optional(),
    mnemonic: MnemonicSchema.optional(),
    answerBreakdown: z.array(AnswerBreakdownItemSchema).optional(),
}).strict();

export const PedagogySchema = z.object({
    bloomLevel: z.enum(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']),
    cjmmStep: z.enum(['recognizeCues', 'analyzeCues', 'prioritizeHypotheses', 'generateSolutions', 'takeAction', 'evaluateOutcomes']),
    nclexCategory: z.enum([
        'Management of Care',
        'Safety and Infection Prevention and Control',
        'Health Promotion and Maintenance',
        'Psychosocial Integrity',
        'Basic Care and Comfort',
        'Pharmacological and Parenteral Therapies',
        'Reduction of Risk Potential',
        'Physiological Adaptation',
    ]),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    topicTags: z.array(z.string()).min(1),
}).strict();

// ═══════════════════════════════════════════════════════════
//  Scoring Schemas
// ═══════════════════════════════════════════════════════════

const DichotomousScoringSchema = z.object({
    method: z.literal('dichotomous'),
    maxPoints: z.literal(1),
}).strict();

const PolytomousScoringSchema = z.object({
    method: z.literal('polytomous'),
    maxPoints: z.number().int().min(2),
}).strict();

const LinkageScoringSchema = z.object({
    method: z.literal('linkage'),
    maxPoints: z.number().int().min(1),
    partialMap: z.record(z.string(), z.number()),
}).strict();

export const ScoringRuleSchema = z.discriminatedUnion('method', [
    DichotomousScoringSchema,
    PolytomousScoringSchema,
    LinkageScoringSchema,
]);

// ═══════════════════════════════════════════════════════════
//  Item Schemas (14 types)
// ═══════════════════════════════════════════════════════════

const optionSchema = z.object({ id: nonEmptyString, text: nonEmptyString });

const itemBase = {
    id: nonEmptyString,
    stem: z.string().min(10),
    pedagogy: PedagogySchema,
    rationale: RationaleSchema,
};

export const HighlightItemSchema = z.object({
    ...itemBase,
    type: z.literal('highlight'),
    passage: z.string().min(50),
    correctSpanIndices: z.array(z.number()).min(1),
    scoring: PolytomousScoringSchema,
}).strict();

export const MultipleChoiceItemSchema = z.object({
    ...itemBase,
    type: z.literal('multipleChoice'),
    options: z.array(optionSchema).min(4).max(6),
    correctOptionId: nonEmptyString,
    scoring: DichotomousScoringSchema,
}).strict();

export const SelectAllItemSchema = z.object({
    ...itemBase,
    type: z.literal('selectAll'),
    options: z.array(optionSchema).min(4),
    correctOptionIds: z.array(nonEmptyString).min(2),
    scoring: PolytomousScoringSchema,
}).strict();

export const OrderedResponseItemSchema = z.object({
    ...itemBase,
    type: z.literal('orderedResponse'),
    options: z.array(optionSchema).min(3),
    correctOrder: z.array(nonEmptyString),
    scoring: DichotomousScoringSchema,
}).strict();

export const MatrixMatchItemSchema = z.object({
    ...itemBase,
    type: z.literal('matrixMatch'),
    rows: z.array(optionSchema).min(2),
    columns: z.array(optionSchema).min(2),
    correctMatches: z.record(nonEmptyString, nonEmptyString),
    scoring: PolytomousScoringSchema,
}).strict();

const blankSchema = z.object({
    id: nonEmptyString,
    options: z.array(z.string()).min(2),
    correctOption: z.string(),
}).refine(d => d.options.includes(d.correctOption), { message: 'correctOption must be in options' });

export const ClozeDropdownItemSchema = z.object({
    ...itemBase,
    type: z.literal('clozeDropdown'),
    template: nonEmptyString,
    blanks: z.array(blankSchema).min(1),
    scoring: PolytomousScoringSchema,
}).strict();

export const DragAndDropClozeItemSchema = z.object({
    ...itemBase,
    type: z.literal('dragAndDropCloze'),
    template: nonEmptyString,
    tokens: z.array(z.string()).min(1),
    correctPlacements: z.record(nonEmptyString, z.string()),
    distractors: z.array(z.string()).optional(),
    scoring: PolytomousScoringSchema,
}).strict();

export const BowtieItemSchema = z.object({
    ...itemBase,
    type: z.literal('bowtie'),
    causes: z.array(optionSchema).min(2),
    condition: nonEmptyString,
    interventions: z.array(optionSchema).min(2),
    correctCauseIds: z.array(nonEmptyString).min(1),
    correctInterventionIds: z.array(nonEmptyString).min(1),
    scoring: PolytomousScoringSchema,
}).strict();

export const TrendItemSchema = z.object({
    ...itemBase,
    type: z.literal('trend'),
    dataPoints: z.array(z.object({ time: z.string(), values: z.record(z.string(), z.number()) })).min(3),
    question: nonEmptyString,
    options: z.array(optionSchema).min(3),
    correctOptionId: nonEmptyString,
    scoring: DichotomousScoringSchema,
}).strict();

export const PriorityActionItemSchema = z.object({
    ...itemBase,
    type: z.literal('priorityAction'),
    options: z.array(optionSchema).min(4),
    correctOptionId: nonEmptyString,
    scoring: DichotomousScoringSchema,
}).strict();

export const HotspotItemSchema = z.object({
    ...itemBase,
    type: z.literal('hotspot'),
    imageUrl: nonEmptyString,
    hotspots: z.array(z.object({
        id: nonEmptyString,
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        width: z.number().min(1).max(100),
        height: z.number().min(1).max(100),
        label: nonEmptyString,
    })).min(1),
    correctHotspotIds: z.array(nonEmptyString).min(1),
    scoring: PolytomousScoringSchema,
}).strict();

export const GraphicItemSchema = z.object({
    ...itemBase,
    type: z.literal('graphic'),
    options: z.array(z.object({ id: nonEmptyString, imageUrl: nonEmptyString, altText: nonEmptyString })).min(2),
    correctOptionIds: z.array(nonEmptyString).min(1),
    scoring: ScoringRuleSchema,
}).strict();

export const AudioVideoItemSchema = z.object({
    ...itemBase,
    type: z.literal('audioVideo'),
    mediaUrl: nonEmptyString,
    mediaType: z.enum(['audio', 'video']),
    options: z.array(optionSchema).min(2),
    correctOptionIds: z.array(nonEmptyString).min(1),
    scoring: ScoringRuleSchema,
}).strict();

export const ChartExhibitItemSchema = z.object({
    ...itemBase,
    type: z.literal('chartExhibit'),
    chartData: z.record(z.string(), z.unknown()),
    options: z.array(optionSchema).min(2),
    correctOptionIds: z.array(nonEmptyString).min(1),
    scoring: ScoringRuleSchema,
}).strict();

// ═══════════════════════════════════════════════════════════
//  Master Item Schema (Discriminated Union)
// ═══════════════════════════════════════════════════════════

export const MasterItemSchema = z.discriminatedUnion('type', [
    HighlightItemSchema,
    MultipleChoiceItemSchema,
    SelectAllItemSchema,
    OrderedResponseItemSchema,
    MatrixMatchItemSchema,
    ClozeDropdownItemSchema,
    DragAndDropClozeItemSchema,
    BowtieItemSchema,
    TrendItemSchema,
    PriorityActionItemSchema,
    HotspotItemSchema,
    GraphicItemSchema,
    AudioVideoItemSchema,
    ChartExhibitItemSchema,
]);

// ═══════════════════════════════════════════════════════════
//  Case Study Schema
// ═══════════════════════════════════════════════════════════

export const CaseStudySchema = z.object({
    id: nonEmptyString,
    title: nonEmptyString,
    patient: PatientSchema,
    clinicalData: ClinicalDataSchema,
    items: z.array(MasterItemSchema).min(6),
    timeLimit: z.number().positive().optional(),
}).strict();
