/**
 * NCLEX-RN NGN Clinical Simulator — Data Factory
 * Generates validated sample case studies for development/demo.
 */

import {
    CaseStudy, Patient, ClinicalData, SBARNote, VitalSign,
    LabResult, PhysicalExam, Order, MasterItem, ImagingResult,
    Medication,
} from '../types/master';

// ═══════════════════════════════════════════════════════════
//  Sample Patient
// ═══════════════════════════════════════════════════════════

function createSamplePatient(): Patient {
    return {
        id: 'pt-001',
        name: 'Margaret Thompson',
        age: 68,
        sex: 'F',
        pronouns: 'she/her',
        codeStatus: 'Full Code',
        allergies: ['Penicillin', 'Sulfa drugs'],
        weight_kg: 72.5,
        height_cm: 165,
        iso: 'Standard',
    };
}

// ═══════════════════════════════════════════════════════════
//  Sample Clinical Data
// ═══════════════════════════════════════════════════════════

function createSampleClinicalData(): ClinicalData {
    const notes: SBARNote[] = [
        {
            situation: 'Patient admitted to medical-surgical unit with exacerbation of chronic heart failure. Reports increasing dyspnea on exertion over past 3 days.',
            background: 'History of CHF (EF 35%), hypertension, type 2 diabetes mellitus. Currently on furosemide 40mg PO daily, lisinopril 20mg PO daily, metformin 500mg PO BID.',
            assessment: 'Patient appears in mild respiratory distress. Bilateral crackles noted at lung bases. 2+ pitting edema bilateral lower extremities. Weight gain of 3.2 kg from baseline.',
            recommendation: 'Recommend IV furosemide 40mg, strict I&O monitoring, daily weights, BMP in AM, cardiology consult for medication optimization and echocardiogram.',
            timestamp: '2024-01-15T08:30:00Z',
            author: 'Sarah Chen',
            authorRole: 'RN',
        },
    ];

    const vitals: VitalSign[] = [
        {
            time: '2024-01-15T06:00:00Z',
            hr: 92, sbp: 148, dbp: 88, rr: 22,
            temp: 98.6, spo2: 93, pain: 3,
            consciousness: 'Alert',
        },
        {
            time: '2024-01-15T10:00:00Z',
            hr: 98, sbp: 152, dbp: 92, rr: 24,
            temp: 99.1, spo2: 91, pain: 4,
            consciousness: 'Alert',
        },
        {
            time: '2024-01-15T14:00:00Z',
            hr: 112, sbp: 85, dbp: 55, rr: 28,
            temp: 101.5, spo2: 88, pain: 6,
            consciousness: 'Voice',
        },
    ];

    const labs: LabResult[] = [
        { name: 'Sodium', value: 132, unit: 'mEq/L', refLow: 136, refHigh: 145, timestamp: '2024-01-15T07:00:00Z', flag: 'L' },
        { name: 'Potassium', value: 5.8, unit: 'mEq/L', refLow: 3.5, refHigh: 5.0, timestamp: '2024-01-15T07:00:00Z', flag: 'H' },
        { name: 'BUN', value: 38, unit: 'mg/dL', refLow: 7, refHigh: 20, timestamp: '2024-01-15T07:00:00Z', flag: 'H' },
        { name: 'Creatinine', value: 1.8, unit: 'mg/dL', refLow: 0.7, refHigh: 1.3, timestamp: '2024-01-15T07:00:00Z', flag: 'H' },
        { name: 'BNP', value: 1250, unit: 'pg/mL', refLow: 0, refHigh: 100, timestamp: '2024-01-15T07:00:00Z', flag: 'H' },
        { name: 'Hemoglobin', value: 10.2, unit: 'g/dL', refLow: 12.0, refHigh: 16.0, timestamp: '2024-01-15T07:00:00Z', flag: 'L' },
        { name: 'Glucose', value: 186, unit: 'mg/dL', refLow: 70, refHigh: 100, timestamp: '2024-01-15T07:00:00Z', flag: 'H' },
        { name: 'Troponin', value: 0.08, unit: 'ng/mL', refLow: 0, refHigh: 0.04, timestamp: '2024-01-15T07:00:00Z', flag: 'H' },
    ];

    const physicalExam: PhysicalExam[] = [
        { system: 'Cardiovascular', findings: 'S3 gallop present, JVD noted, 2+ bilateral pedal edema, cap refill 3 seconds', isAbnormal: true },
        { system: 'Respiratory', findings: 'Bilateral crackles at bases, diminished breath sounds right lower lobe, using accessory muscles', isAbnormal: true },
        { system: 'Neurological', findings: 'Oriented x3, GCS 14 (E3 V5 M6), responds to voice with mild delay', isAbnormal: true },
        { system: 'Gastrointestinal', findings: 'Abdomen soft, non-tender, bowel sounds present all quadrants, mild hepatomegaly', isAbnormal: true },
        { system: 'Integumentary', findings: 'Skin warm, pale, diaphoretic; sacral edema noted; no wounds or pressure injuries', isAbnormal: true },
    ];

    const orders: Order[] = [
        { id: 'ord-001', type: 'medication', description: 'Furosemide 40mg IV push NOW', priority: 'stat', status: 'active', timestamp: '2024-01-15T08:45:00Z' },
        { id: 'ord-002', type: 'medication', description: 'Potassium chloride 20mEq PO x1', priority: 'urgent', status: 'active', timestamp: '2024-01-15T08:45:00Z' },
        { id: 'ord-003', type: 'lab', description: 'Basic Metabolic Panel in AM', priority: 'routine', status: 'active', timestamp: '2024-01-15T08:45:00Z' },
        { id: 'ord-004', type: 'imaging', description: 'Chest X-ray PA and Lateral', priority: 'urgent', status: 'active', timestamp: '2024-01-15T09:00:00Z' },
        { id: 'ord-005', type: 'activity', description: 'Strict I&O, daily weights, HOB elevated 45 degrees', priority: 'routine', status: 'active', timestamp: '2024-01-15T08:45:00Z' },
        { id: 'ord-006', type: 'consult', description: 'Cardiology consult for medication optimization', priority: 'routine', status: 'active', timestamp: '2024-01-15T09:00:00Z' },
        { id: 'ord-007', type: 'diet', description: '2g sodium, 1500mL fluid restriction', priority: 'routine', status: 'active', timestamp: '2024-01-15T08:45:00Z' },
    ];
    const imaging: ImagingResult[] = [
        {
            type: 'X-Ray',
            view: 'Chest PA and Lateral',
            findings: 'Heart size is enlarged with cardiomegaly noted. Prominent pulmonary vascular congestion is present bilaterally. Small bilateral pleural effusions are developing. Kerley B lines are visible in the periphery.',
            impression: 'Findings are consistent with pulmonary edema associated with congestive heart failure.',
            timestamp: '2024-01-15T09:30:00Z',
            status: 'final',
        },
    ];

    const pearlAnnotations = [
        { target: 'BNP', category: 'lab' as const, pearl: 'BNP > 100 pg/mL suggests heart failure. Values > 500 pg/mL strongly indicate acute decompensation. Always correlate with clinical presentation.' },
        { target: 'spo2', category: 'vital' as const, pearl: 'SpO₂ < 90% requires immediate oxygen intervention. In heart failure, desaturation often indicates pulmonary edema — auscultate for crackles.' },
        { target: 'Potassium', category: 'lab' as const, pearl: 'K⁺ > 5.0 mEq/L is dangerous in heart failure patients on ACE inhibitors. Monitor for peaked T-waves on ECG and paresthesias.' },
        { target: 'Cardiovascular', category: 'exam' as const, pearl: 'S3 gallop + JVD + edema = classic right-sided HF triad. S3 is caused by rapid ventricular filling against a stiff wall.' },
        { target: 'Troponin', category: 'lab' as const, pearl: 'Mildly elevated troponin (0.04–0.1 ng/mL) in HF can indicate myocardial stress rather than acute MI. Serial trending is key to differentiation.' },
    ];

    const medications: Medication[] = [
        {
            id: 'med-001',
            name: 'Furosemide',
            dose: '40 mg',
            route: 'IV Push',
            frequency: 'Once (Stat)',
            status: 'scheduled',
            scheduledTime: '2024-01-15T08:45:00Z',
            indication: 'Acute volume overload / pulmonary edema',
            requirements: ['Check K+', 'Check BP', 'Check I&O'],
        },
        {
            id: 'med-002',
            name: 'Lisinopril',
            dose: '20 mg',
            route: 'PO',
            frequency: 'Daily',
            status: 'scheduled',
            scheduledTime: '2024-01-15T09:00:00Z',
            indication: 'Hypertension / Heart Failure management',
            requirements: ['Check SBP > 100'],
        },
        {
            id: 'med-003',
            name: 'Metformin',
            dose: '500 mg',
            route: 'PO',
            frequency: 'BID',
            status: 'scheduled',
            scheduledTime: '2024-01-15T09:00:00Z',
            indication: 'Type 2 Diabetes Mellitus',
        },
    ];

    return { notes, vitals, labs, physicalExam, orders, imaging, medications, pearlAnnotations };
}

// ═══════════════════════════════════════════════════════════
//  Sample Items (6+ covering various types)
// ═══════════════════════════════════════════════════════════

function createSampleItems(): MasterItem[] {
    const basePedagogy = {
        bloomLevel: 'analyze' as const,
        nclexCategory: 'Physiological Adaptation' as const,
        topicTags: ['heart failure', 'fluid overload', 'nursing assessment'],
    };

    const sharedReviewUnits = [
        {
            heading: 'Heart Failure Management',
            body: 'Acute decompensated heart failure requires immediate assessment of fluid status, respiratory function, and hemodynamic stability. Key interventions include diuretic therapy, oxygen support, fluid restriction, and continuous monitoring of vital signs and intake/output.',
            source: 'Hinkle & Cheever (2018). Brunner & Suddarth\'s Textbook of Medical-Surgical Nursing, 14th ed.',
        },
    ];

    return [
        // ── 1. Multiple Choice ──────────────────────────────────
        {
            id: 'item-001',
            type: 'multipleChoice',
            stem: 'Based on the patient\'s current vital signs and lab results, which finding requires the nurse\'s most immediate attention?',
            pedagogy: { ...basePedagogy, cjmmStep: 'recognizeCues' as const, difficulty: 3 as const },
            rationale: {
                correct: 'An SpO₂ of 88% indicates hypoxemia and requires immediate intervention. Oxygen saturation below 90% threatens tissue perfusion and is the most time-critical finding among the options presented.',
                incorrect: 'While the other values are abnormal, they do not pose the same immediate threat to life. Elevated glucose, tachycardia, and low-grade fever all need attention but are less immediately dangerous than hypoxemia.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'An S3 heart sound (ventricular gallop) is strongly associated with heart failure and volume overload — if you hear it, think fluid.',
                    'BNP > 100 pg/mL is a key biomarker for HF. Values > 500 pg/mL strongly suggest acute decompensation.',
                    'Daily weight is the single most reliable indicator of fluid status. A gain of 1 kg ≈ 1 liter of fluid retention.',
                ],
                questionTrap: {
                    trap: 'Trainees often fixate on the highest numeric value (glucose 186 or HR 112) rather than the most clinically dangerous one. The NCLEX tests your ability to prioritize by acuity, not by which number "looks worst."',
                    howToOvercome: 'Apply ABCs — Airway, Breathing, Circulation. SpO₂ is a Breathing parameter. Any answer related to oxygenation or airway almost always takes priority over other findings.',
                },
                mnemonic: {
                    title: 'ABCs',
                    expansion: 'Airway → Breathing → Circulation: Always assess and intervene in this order. SpO₂ = Breathing. If the patient can\'t oxygenate, nothing else matters.',
                },
                answerBreakdown: [
                    { label: 'A', content: 'Blood glucose 186 mg/dL — Elevated but not immediately life-threatening. Can be managed with sliding scale insulin. This is a metabolic concern, not an ABC priority.', isCorrect: false },
                    { label: 'B', content: 'Oxygen saturation 88% — CORRECT. Below the critical 90% threshold. Indicates impaired gas exchange and hypoxemia. This is a Breathing priority per ABCs and requires immediate oxygen administration.', isCorrect: true },
                    { label: 'C', content: 'Heart rate 112 bpm — Tachycardia is concerning but is compensatory in HF. The body is trying to maintain cardiac output. Address the underlying cause (hypoxemia) first.', isCorrect: false },
                    { label: 'D', content: 'Temperature 101.5°F — Low-grade fever may indicate infection but is not immediately life-threatening. It does not compromise oxygenation or perfusion acutely.', isCorrect: false },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
            options: [
                { id: 'a', text: 'Blood glucose of 186 mg/dL' },
                { id: 'b', text: 'Oxygen saturation of 88%' },
                { id: 'c', text: 'Heart rate of 112 bpm' },
                { id: 'd', text: 'Temperature of 101.5°F' },
            ],
            correctOptionId: 'b',
        },
        // ── 2. Select All That Apply ────────────────────────────
        {
            id: 'item-002',
            type: 'selectAll',
            stem: 'Which assessment findings are consistent with the diagnosis of acute decompensated heart failure? Select all that apply.',
            pedagogy: { ...basePedagogy, cjmmStep: 'analyzeCues' as const, difficulty: 3 as const },
            rationale: {
                correct: 'Bilateral crackles, S3 gallop, elevated BNP, and peripheral edema are all classic manifestations of heart failure — they reflect fluid overload, impaired cardiac function, and neurohormonal activation.',
                incorrect: 'Elevated blood glucose and mild anemia are abnormal findings but are NOT specific to heart failure. They may be comorbid conditions but do not confirm an HF diagnosis.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'SATA questions on NCLEX typically have 2–5 correct answers. "All" or "none" are rarely correct. If you\'ve only selected one, re-read the options.',
                    'BNP (B-type Natriuretic Peptide) is released by ventricular myocytes in response to stretching. It\'s the gold standard biomarker for HF diagnosis.',
                    '2+ pitting edema means the indentation takes 10–15 seconds to rebound. Grade it: 1+ (2 mm) → 2+ (4 mm) → 3+ (6 mm) → 4+ (8 mm).',
                ],
                questionTrap: {
                    trap: 'In SATA questions, the trap is including RELATED but non-specific findings. Elevated glucose and mild anemia may co-exist with HF but are NOT diagnostic of it. The question asks "consistent with the diagnosis" — meaning you need findings that are pathophysiologically linked.',
                    howToOvercome: 'For each option, ask: "Is this caused by the pathophysiology of heart failure?" Crackles (pulmonary congestion) → YES. S3 (volume overload) → YES. BNP (cardiac stress) → YES. Edema (fluid retention) → YES. Glucose (metabolic) → NO. Anemia (hematologic) → NO.',
                },
                mnemonic: {
                    title: 'FACES',
                    expansion: 'Fatigue • Activity intolerance • Congestion (pulmonary/peripheral) • Edema • Shortness of breath — the cardinal symptoms of heart failure that patients present with.',
                },
                answerBreakdown: [
                    { label: 'A', content: 'Bilateral crackles at lung bases — SELECT. Caused by pulmonary congestion from left-sided HF. Fluid backs up into the lungs because the left ventricle can\'t pump effectively.', isCorrect: true },
                    { label: 'B', content: 'S3 gallop rhythm — SELECT. A hallmark auscultatory finding of HF. Caused by rapid filling of a non-compliant ventricle. Remember: "Tennessee" = S3 gallop.', isCorrect: true },
                    { label: 'C', content: 'Elevated BNP of 1250 pg/mL — SELECT. BNP > 100 confirms HF. A value of 1250 indicates severe decompensation. Released when ventricular walls are stretched.', isCorrect: true },
                    { label: 'D', content: '2+ pitting edema bilateral lower extremities — SELECT. Peripheral edema indicates right-sided fluid overload. Gravity-dependent fluid accumulation in the lower extremities.', isCorrect: true },
                    { label: 'E', content: 'Blood glucose 186 mg/dL — DO NOT SELECT. Elevated but not pathophysiologically related to HF. This is a metabolic finding, likely from diabetes or stress hyperglycemia.', isCorrect: false },
                    { label: 'F', content: 'Hemoglobin 10.2 g/dL — DO NOT SELECT. Mild anemia is a comorbidity, not a diagnostic criterion for HF. It may worsen HF symptoms but doesn\'t confirm the diagnosis.', isCorrect: false },
                ],
            },
            scoring: { method: 'polytomous', maxPoints: 4 },
            options: [
                { id: 'a', text: 'Bilateral crackles at lung bases' },
                { id: 'b', text: 'S3 gallop rhythm' },
                { id: 'c', text: 'Elevated BNP of 1250 pg/mL' },
                { id: 'd', text: '2+ pitting edema bilateral lower extremities' },
                { id: 'e', text: 'Blood glucose of 186 mg/dL' },
                { id: 'f', text: 'Hemoglobin of 10.2 g/dL' },
            ],
            correctOptionIds: ['a', 'b', 'c', 'd'],
        },
        // ── 3. Priority Action ──────────────────────────────────
        {
            id: 'item-003',
            type: 'priorityAction',
            stem: 'The patient\'s SpO2 has dropped to 88% and she is using accessory muscles to breathe. What is the nurse\'s priority action?',
            pedagogy: { ...basePedagogy, cjmmStep: 'prioritizeHypotheses' as const, difficulty: 4 as const },
            rationale: {
                correct: 'Supplemental oxygen must be applied FIRST because it directly addresses the immediate life-threatening problem — hypoxemia. This is an independent nursing action that doesn\'t require a provider order in an emergency.',
                incorrect: 'All other options are appropriate interventions but are NOT the FIRST priority. ABCs dictate that breathing takes precedence. You cannot administer medication or notify a provider until the patient\'s oxygenation is stabilized.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'Accessory muscle use (sternocleidomastoid, intercostals) is a late sign of respiratory distress. If you see it, ACT immediately.',
                    'NC delivers 1–6 LPM (24–44% FiO₂). Non-rebreather delivers 10–15 LPM (60–100% FiO₂). Match the device to the severity.',
                    'In HF, the root cause of hypoxemia is pulmonary edema — fluid in the alveoli prevents gas exchange. Oxygen helps but diuretics address the cause.',
                ],
                questionTrap: {
                    trap: 'The NCLEX often includes "Notify the healthcare provider" as a tempting answer. While communication is vital, if the question asks what the nurse should do FIRST or PRIORITY, the answer is usually a direct nursing intervention you can do independently.',
                    howToOvercome: 'Use the ABCs (Airway, Breathing, Circulation) and Maslow\'s hierarchy to identify the physiological priority. Ask yourself: "Can I do something RIGHT NOW to help this patient before calling the provider?" If yes, that is likely the answer.',
                },
                mnemonic: {
                    title: 'LMNOP',
                    expansion: 'Lasix (furosemide) • Morphine (reduces preload) • Nitrates (vasodilation) • Oxygen (supplemental O₂) • Position (high Fowler\'s) — the classic management sequence for acute pulmonary edema.',
                },
                answerBreakdown: [
                    { label: 'A', content: 'Administer furosemide — Not the priority. While diuretics treat the underlying fluid overload, the patient needs oxygen NOW. Furosemide takes 5–20 min to work; hypoxemia can cause brain damage in minutes.', isCorrect: false },
                    { label: 'B', content: 'Apply supplemental oxygen — CORRECT PRIORITY. This is an independent nursing intervention that directly addresses the ABCs. Breathing = oxygen. Don\'t wait for orders. Apply O₂ first, then address everything else.', isCorrect: true },
                    { label: 'C', content: 'Notify healthcare provider — Not the priority. This IS the classic NCLEX trap. Communication is essential but you must STABILIZE the patient first. The nurse should intervene independently before calling.', isCorrect: false },
                    { label: 'D', content: 'Obtain a stat ABG — Not the priority. An ABG gives diagnostic information about acid-base status, but getting it delays the actual intervention. Treat the patient, not the number.', isCorrect: false },
                    { label: 'E', content: 'Elevate HOB to high Fowler\'s — Close second, but not #1. Positioning aids breathing by reducing venous return and easing diaphragm excursion. Usually done simultaneously with O₂ but oxygen itself is the therapeutic intervention.', isCorrect: false },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
            options: [
                { id: 'a', text: 'Administer the scheduled dose of furosemide' },
                { id: 'b', text: 'Apply supplemental oxygen via nasal cannula or non-rebreather mask' },
                { id: 'c', text: 'Notify the healthcare provider of the change in condition' },
                { id: 'd', text: 'Obtain a stat arterial blood gas' },
                { id: 'e', text: 'Elevate the head of bed to high Fowler\'s position' },
            ],
            correctOptionId: 'b',
        },
        // ── 4. Ordered Response ──────────────────────────────────
        {
            id: 'item-004',
            type: 'orderedResponse',
            stem: 'Place the following nursing interventions in the correct priority order for this patient experiencing acute respiratory distress from heart failure.',
            pedagogy: { ...basePedagogy, cjmmStep: 'generateSolutions' as const, difficulty: 4 as const },
            rationale: {
                correct: 'The correct sequence follows the clinical priority framework: ABCs first (oxygen), then positioning to optimize respiratory effort, then medication management (diuretics), then communication (provider notification), then diagnostics (ECG).',
                incorrect: 'A common error is placing "notify the provider" too early or prioritizing diagnostics over interventions. Remember: stabilize → treat → communicate → evaluate.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'Ordered response questions test your ability to SEQUENCE interventions, not just identify them. Think: "What would kill the patient first?" → address that first.',
                    'High Fowler\'s position (60–90°) reduces preload by pooling blood in lower extremities and allows the diaphragm to descend fully for better lung expansion.',
                ],
                questionTrap: {
                    trap: 'Students often place "Notify the healthcare provider" as Step 1 or 2. On NCLEX, unless the question specifically requires a provider order for the next step, direct nursing interventions come first.',
                    howToOvercome: 'Use this mental framework: STABILIZE → TREAT → COMMUNICATE → EVALUATE. Oxygen and positioning stabilize. Furosemide treats. Provider notification communicates. ECG evaluates.',
                },
                mnemonic: {
                    title: 'STCE',
                    expansion: 'Stabilize (oxygen, position) → Treat (medications) → Communicate (notify provider) → Evaluate (diagnostics, reassess) — the universal priority sequence for nursing interventions.',
                },
                answerBreakdown: [
                    { label: 'Step 1', content: 'Apply supplemental oxygen — Breathing is the immediate ABC priority. The patient\'s SpO₂ is 88%. Every second of hypoxemia risks tissue damage. O₂ goes on first, always.', isCorrect: true, group: 'sequence' },
                    { label: 'Step 2', content: 'Position in high Fowler\'s — Done nearly simultaneously with O₂. Reduces preload, decreases venous return to the heart, and allows the diaphragm to descend for maximum lung expansion.', isCorrect: true, group: 'sequence' },
                    { label: 'Step 3', content: 'Administer IV furosemide — Now treat the underlying cause. Loop diuretics remove excess fluid from the pulmonary vasculature. IV onset is 5 min. Addresses WHY the patient can\'t breathe.', isCorrect: true, group: 'sequence' },
                    { label: 'Step 4', content: 'Notify healthcare provider — After stabilizing and initiating treatment, communicate the situation using SBAR. The provider needs to know and may order additional interventions.', isCorrect: true, group: 'sequence' },
                    { label: 'Step 5', content: 'Obtain 12-lead ECG — Diagnostic evaluation comes last. Important for ruling out acute MI or arrhythmia, but it doesn\'t change immediate management and can wait until the patient is stabilized.', isCorrect: true, group: 'sequence' },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
            options: [
                { id: 'a', text: 'Apply supplemental oxygen' },
                { id: 'b', text: 'Position patient in high Fowler\'s' },
                { id: 'c', text: 'Administer IV furosemide as ordered' },
                { id: 'd', text: 'Notify the healthcare provider' },
                { id: 'e', text: 'Obtain a 12-lead ECG' },
            ],
            correctOrder: ['a', 'b', 'c', 'd', 'e'],
        },
        // ── 5. Matrix Match ──────────────────────────────────────
        {
            id: 'item-005',
            type: 'matrixMatch',
            stem: 'For each assessment finding, determine whether it is expected or unexpected for a patient with acute decompensated heart failure.',
            pedagogy: { ...basePedagogy, cjmmStep: 'takeAction' as const, difficulty: 3 as const },
            rationale: {
                correct: 'Expected findings in ADHF include indicators of fluid overload (elevated BNP, S3, weight gain) and impaired cardiac output. Unexpected findings are those not directly caused by the HF pathophysiology.',
                incorrect: 'The most common mistake is marking ALL abnormal findings as "expected." Abnormal ≠ expected. The question asks whether a finding is a CHARACTERISTIC presentation of heart failure.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'BNP and weight gain are the two most reliable objective markers to CONFIRM HF exacerbation. If both are elevated, strong evidence.',
                    'Fever is NOT caused by heart failure itself. If a HF patient has fever, think: infection (common trigger for HF decompensation), endocarditis, or drug reaction.',
                ],
                questionTrap: {
                    trap: '"Expected" does NOT mean "normal." On NCLEX, expected means "characteristic of the condition." An S3 gallop is abnormal but expected in HF. A temperature of 101.5°F is abnormal AND unexpected in HF.',
                    howToOvercome: 'For each finding, ask: "Would a textbook say this is a typical clinical manifestation of this disease?" If yes → Expected. If no → Unexpected, even if it\'s abnormal.',
                },
                mnemonic: {
                    title: 'CHAMP',
                    expansion: 'Crackles • Heart sounds (S3/S4) • Ascites/edema • MAP changes (BP shifts) • Puffy weight gain — the Expected findings in HF decompensation.',
                },
                answerBreakdown: [
                    { label: 'BNP 1250 pg/mL', content: '→ EXPECTED. BNP is released by stretched ventricular myocytes. Values > 500 strongly confirm acute decompensation. This is the gold standard lab for HF.', isCorrect: true, group: 'expected' },
                    { label: 'S3 gallop', content: '→ EXPECTED. The S3 "ventricular gallop" is caused by rapid filling of a non-compliant, dilated ventricle. Hallmark auscultatory finding of systolic HF.', isCorrect: true, group: 'expected' },
                    { label: 'Temp 101.5°F', content: '→ UNEXPECTED. Fever is not a manifestation of heart failure. Suggests a concurrent process: infection, endocarditis, or medication reaction. Must be investigated separately.', isCorrect: false, group: 'unexpected' },
                    { label: 'Weight gain 3.2 kg', content: '→ EXPECTED. 3.2 kg ≈ 3.2 liters of fluid retention. Rapid weight gain (>1 kg/day) is the earliest objective indicator of fluid overload in HF.', isCorrect: true, group: 'expected' },
                ],
            },
            scoring: { method: 'polytomous', maxPoints: 4 },
            rows: [
                { id: 'r1', text: 'BNP 1250 pg/mL' },
                { id: 'r2', text: 'S3 gallop' },
                { id: 'r3', text: 'Temperature 101.5°F' },
                { id: 'r4', text: 'Weight gain 3.2 kg' },
            ],
            columns: [
                { id: 'expected', text: 'Expected Finding' },
                { id: 'unexpected', text: 'Unexpected Finding' },
            ],
            correctMatches: { r1: 'expected', r2: 'expected', r3: 'unexpected', r4: 'expected' },
        },
        // ── 6. Cloze Dropdown ────────────────────────────────────
        {
            id: 'item-006',
            type: 'clozeDropdown',
            stem: 'Complete the following nursing documentation using the most appropriate clinical terms.',
            pedagogy: { ...basePedagogy, cjmmStep: 'evaluateOutcomes' as const, difficulty: 3 as const, nclexCategory: 'Pharmacological and Parenteral Therapies' as const },
            rationale: {
                correct: '"Fluid overload" is the correct nursing assessment for bilateral crackles + low SpO₂. "High Fowler\'s position" optimizes respiratory effort. "IV furosemide" is the priority intervention for pulmonary congestion.',
                incorrect: 'Dehydration would present with dry mucous membranes and concentrated urine — the opposite. Supine would worsen respiratory distress. Normal saline would add MORE fluid to an already overloaded patient.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'Cloze/drop-down questions test your clinical documentation skills. Think: "What would a competent nurse write in the chart?"',
                    'IV furosemide onset is 5 min, peak 20–60 min, duration 2 hours. PO onset is 30–60 min. In acute distress, IV is always preferred.',
                ],
                questionTrap: {
                    trap: 'The distractor "IV normal saline" is dangerous because in HF, giving additional isotonic fluid would WORSEN pulmonary edema. This tests your understanding of fluid balance — the patient needs fluid REMOVED, not added.',
                    howToOvercome: 'Always link the intervention to the pathophysiology. Crackles + low SpO₂ = fluid in lungs. Treatment = remove fluid (diuretic), not add fluid (NS bolus).',
                },
                mnemonic: {
                    title: 'LMNOP',
                    expansion: 'Lasix (furosemide) • Morphine (reduces preload) • Nitrates (vasodilation) • Oxygen (supplemental O₂) • Position (high Fowler\'s) — the classic management sequence for acute pulmonary edema.',
                },
                answerBreakdown: [
                    { label: 'Blank 1: Assessment', content: '"Fluid overload" — Bilateral crackles + SpO₂ 88% = fluid in the alveoli impairing gas exchange. NOT pneumonia (no fever/productive cough), NOT dehydration (opposite presentation), NOT anemia (incorrect focus).', isCorrect: true, group: 'fill' },
                    { label: 'Blank 2: Position', content: '"High Fowler\'s position" — Elevating the HOB to 60–90° reduces preload and optimizes diaphragm excursion. Supine would pool fluid in lungs. Trendelenburg would increase preload and worsen congestion.', isCorrect: true, group: 'fill' },
                    { label: 'Blank 3: Intervention', content: '"IV furosemide" — Loop diuretic that acts on the Loop of Henle to excrete excess sodium and water. Directly addresses fluid overload. Antibiotics = for infection. NS = worsens overload.', isCorrect: true, group: 'fill' },
                ],
            },
            scoring: { method: 'polytomous', maxPoints: 3 },
            template: 'The patient is experiencing {{blank_1}} as evidenced by bilateral crackles and SpO2 of 88%. The nurse should position the patient in {{blank_2}} and anticipate an order for {{blank_3}}.',
            blanks: [
                { id: 'blank_1', options: ['fluid overload', 'dehydration', 'pneumonia', 'anemia'], correctOption: 'fluid overload' },
                { id: 'blank_2', options: ['supine position', 'high Fowler\'s position', 'Trendelenburg position', 'left lateral'], correctOption: 'high Fowler\'s position' },
                { id: 'blank_3', options: ['IV antibiotics', 'IV furosemide', 'blood transfusion', 'IV normal saline'], correctOption: 'IV furosemide' },
            ],
        },
        // ── 7. Bowtie ────────────────────────────────────────────
        {
            id: 'item-007',
            type: 'bowtie',
            stem: 'Analyze the relationship between the causes, the patient\'s condition, and the appropriate nursing interventions.',
            pedagogy: { ...basePedagogy, cjmmStep: 'analyzeCues' as const, difficulty: 5 as const },
            rationale: {
                correct: 'Decreased cardiac output and fluid volume overload are the two pathophysiologic causes driving this patient\'s ADHF. The appropriate interventions target these causes: diuretics (remove fluid), oxygen (support gas exchange), and I&O monitoring (track fluid balance).',
                incorrect: 'Respiratory infection is incorrect — there is no evidence of infection (no productive cough, WBC not markedly elevated). IV antibiotics and medication non-adherence are distractors.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'Bowtie items test your ability to trace the ENTIRE clinical reasoning chain: Etiology → Diagnosis → Intervention. This mirrors the CJMM framework.',
                    'In HF, decreased CO and fluid overload are interrelated — decreased CO activates RAAS, which causes sodium/water retention, which worsens fluid overload. It\'s a vicious cycle.',
                ],
                questionTrap: {
                    trap: '"Respiratory infection" is a tempting cause because the patient has crackles. But HF crackles are caused by pulmonary edema (fluid), not infection (bacteria). One is bilateral and wet (HF); the other has associated fever and productive cough (pneumonia).',
                    howToOvercome: 'Differentiate by associated findings: HF crackles → bilateral, BNP elevated, edema, S3. Pneumonia crackles → focal, fever, productive cough, elevated WBCs.',
                },
                mnemonic: {
                    title: 'RAAS',
                    expansion: 'Renin → Angiotensin → Aldosterone → Sodium/water retention: The neurohormonal cascade that worsens heart failure. Decreased CO triggers RAAS, leading to MORE fluid retention. ACE inhibitors break this cycle.',
                },
                answerBreakdown: [
                    { label: 'Decreased cardiac output', content: 'CORRECT CAUSE. The failing ventricle can\'t pump effectively, reducing CO. This triggers compensatory tachycardia and activates the RAAS system.', isCorrect: true, group: 'causes' },
                    { label: 'Fluid volume overload', content: 'CORRECT CAUSE. RAAS activation from decreased CO causes sodium and water retention. This increases preload, worsens congestion, and causes pulmonary edema.', isCorrect: true, group: 'causes' },
                    { label: 'Respiratory infection', content: 'INCORRECT CAUSE. No evidence supports infection: no productive cough, no focal consolidation, low-grade temperature could be from poor perfusion.', isCorrect: false, group: 'causes' },
                    { label: 'Medication non-adherence', content: 'INCORRECT CAUSE. While it could be a behavioral trigger, the question asks about pathophysiologic causes. No chart data supports non-adherence.', isCorrect: false, group: 'causes' },
                    { label: 'Administer IV diuretics', content: 'CORRECT INTERVENTION. Directly addresses fluid overload. Loop diuretics remove excess volume, reducing preload and pulmonary congestion.', isCorrect: true, group: 'interventions' },
                    { label: 'Apply supplemental oxygen', content: 'CORRECT INTERVENTION. Treats impaired gas exchange caused by pulmonary edema. Maintains SpO₂ > 94% while diuretics work.', isCorrect: true, group: 'interventions' },
                    { label: 'Administer IV antibiotics', content: 'INCORRECT INTERVENTION. No infection is present. Antibiotics would only be indicated if the cause were respiratory infection.', isCorrect: false, group: 'interventions' },
                    { label: 'Monitor strict I&O', content: 'CORRECT INTERVENTION. Essential for tracking fluid balance. Negative fluid balance (output > input) indicates effective diuresis.', isCorrect: true, group: 'interventions' },
                    { label: 'Fluid restriction', content: 'NOT SELECTED but also a correct supportive measure. Limiting intake to 1.5–2 L/day prevents additional fluid accumulation.', isCorrect: false, group: 'interventions' },
                ],
            },
            scoring: { method: 'polytomous', maxPoints: 5 },
            potentialConditions: [
                'Decreased cardiac output',
                'Fluid volume overload',
                'Respiratory infection',
                'Medication non-adherence'
            ],
            condition: 'Acute Decompensated Heart Failure',
            actions: [
                { id: 'a1', text: 'Administer IV diuretics' },
                { id: 'a2', text: 'Apply supplemental oxygen' },
                { id: 'a3', text: 'Administer IV antibiotics' },
                { id: 'a4', text: 'Fluid restriction' },
            ],
            parameters: [
                { id: 'p1', text: 'Urine output and fluid balance' },
                { id: 'p2', text: 'SpO₂ and respiratory status' },
                { id: 'p3', text: 'Serum glucose levels' },
                { id: 'p4', text: 'Daily weight' },
            ],
            correctActionIds: ['a1', 'a2'],
            correctParameterIds: ['p1', 'p2', 'p4'],
        },
        // ── 8. Trend ─────────────────────────────────────────────
        {
            id: 'item-008',
            type: 'trend',
            stem: 'Review the patient\'s vital signs over the past 8 hours and answer the following question.',
            pedagogy: { ...basePedagogy, cjmmStep: 'evaluateOutcomes' as const, difficulty: 3 as const },
            rationale: {
                correct: 'The vital signs show a clear deteriorating trajectory: HR rising (92→112), SpO₂ falling (93→88), RR increasing (22→28), and SBP dropping (148→85). This indicates progressive cardiac failure with worsening hypoxemia and developing cardiogenic shock.',
                incorrect: '"Stable" is incorrect because multiple parameters are worsening. "Improving" is incorrect because all trends are moving in the wrong direction. Trend questions require you to analyze the DIRECTION of change, not individual values.',
                reviewUnits: sharedReviewUnits,
                clinicalPearls: [
                    'Trend questions test pattern recognition across TIME. Don\'t evaluate individual values — look at the DIRECTION. Is each parameter getting better or worse?',
                    'Falling SBP + rising HR is classic for developing shock (cardiogenic in this case). The heart is beating faster to compensate for falling output.',
                    'SBP dropping from 148 to 85 mmHg is critical — this suggests the heart is failing as a pump and the patient may be developing cardiogenic shock.',
                ],
                questionTrap: {
                    trap: 'Some students see the initial SpO₂ of 93% and think "that\'s still above 90%, so it\'s okay." But trend questions are about TRAJECTORY, not current values. A value that was 93 and is now 88 tells you the patient is heading toward respiratory failure.',
                    howToOvercome: 'Create a mental arrow for each parameter: HR ↑ (bad), SpO₂ ↓ (bad), RR ↑ (bad), SBP ↓ (bad). When ALL arrows point in the wrong direction, the patient is deteriorating.',
                },
                mnemonic: {
                    title: '4 Ds',
                    expansion: 'Dropping SpO₂ • Dropping BP • Distress (rising RR) • Driving HR up — the four trend patterns that signal clinical deterioration in heart failure.',
                },
                answerBreakdown: [
                    { label: 'HR Trend', content: '92 → 98 → 112 bpm (↑ Worsening). Progressive tachycardia = compensatory response to falling cardiac output. The heart is working harder to maintain perfusion.', isCorrect: undefined, group: 'trend' },
                    { label: 'SpO₂ Trend', content: '93% → 91% → 88% (↓ Worsening). Below 90% is critical. Progressive desaturation indicates worsening pulmonary edema and impaired gas exchange.', isCorrect: undefined, group: 'trend' },
                    { label: 'RR Trend', content: '22 → 24 → 28 breaths/min (↑ Worsening). Increasing respiratory rate is the body\'s attempt to compensate for hypoxemia. An early warning sign.', isCorrect: undefined, group: 'trend' },
                    { label: 'SBP Trend', content: '148 → 152 → 85 mmHg (↓ Critical drop). The dramatic fall from 152 to 85 suggests the heart can no longer compensate. The most alarming single trend.', isCorrect: undefined, group: 'trend' },
                    { label: 'A: Stable', content: 'INCORRECT. Multiple parameters are changing significantly. Stability means values remain within a narrow range over time — none of these do.', isCorrect: false },
                    { label: 'B: Improving', content: 'INCORRECT. No parameter is moving toward normal. Improvement would show HR decreasing, SpO₂ rising, RR normalizing, and BP stabilizing.', isCorrect: false },
                    { label: 'C: Deteriorating', content: 'CORRECT. All four vital sign parameters are trending in dangerous directions simultaneously. This is a patient in acute decompensation progressing toward cardiogenic shock.', isCorrect: true },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
            dataPoints: [
                { time: '06:00', values: { HR: 92, SpO2: 93, RR: 22, SBP: 148 } },
                { time: '10:00', values: { HR: 98, SpO2: 91, RR: 24, SBP: 152 } },
                { time: '14:00', values: { HR: 112, SpO2: 88, RR: 28, SBP: 85 } },
            ],
            question: 'Based on the trending vital signs, what is the patient\'s overall clinical trajectory?',
            options: [
                { id: 'a', text: 'Stable — vitals are within acceptable limits' },
                { id: 'b', text: 'Improving — vitals are trending toward normal' },
                { id: 'c', text: 'Deteriorating — vitals show worsening clinical status' },
            ],
            correctOptionId: 'c',
        },
        // ── 9. Highlight ──────────────────────────────────────────
        {
            id: 'item-009',
            type: 'highlight',
            stem: 'Review the following nursing progress note. Click to highlight the cues that indicate the patient\'s heart failure is decompensating.',
            passage: 'Patient reports awakened by shortness of breath 2 hours ago. Physical exam reveals +3 pitting edema in bilateral ankles. Auscultation of heart sounds reveals an S3 gallop. Lung sounds show fine crackles in the bases. Patient is oriented to person and place only. Heart rate is 112 bpm and blood pressure is 152/92 mmHg.',
            pedagogy: { ...basePedagogy, cjmmStep: 'recognizeCues' as const, difficulty: 3 as const },
            rationale: {
                correct: 'The highlighted cues reflect acute fluid overload and respiratory distress. Orthopnea (waking up gasping), significant peripheral edema, S3 gallop (volume overload), and crackles are all cardinal signs of ADHF.',
                incorrect: 'General orientation or vitals like high BP are important but are secondary to the clinical findings of congestion and heart failure specific decompensation cues.',
                reviewUnits: sharedReviewUnits,
                answerBreakdown: [
                    { label: 'Shortness of breath 2 hours ago', content: 'Paroxysmal nocturnal dyspnea (PND) — a key indicator of fluid shifting into the lungs while supine.', isCorrect: true },
                    { label: '+3 pitting edema', content: 'Significant peripheral fluid retention. +3 indicates 6mm indentation that takes 1 minute to rebound.', isCorrect: true },
                    { label: 'S3 gallop', content: 'Hallmark of volume overload and increased ventricular filling pressure. Diagnostic for HF.', isCorrect: true },
                    { label: 'Fine crackles in the bases', content: 'Direct evidence of pulmonary edema caused by fluid leaking into the alveoli.', isCorrect: true },
                    { label: 'Oriented to person and place only', content: 'Change in mental status can be from low CO, but isn\'t a primary "decompensation" cue compared to others.', isCorrect: false },
                ],
            },
            correctSpanIndices: [0, 1, 2, 3],
            scoring: { method: 'polytomous', maxPoints: 4 },
        },
        // ── 10. Drag and Drop Cloze ──────────────────────────────
        {
            id: 'item-010',
            type: 'dragAndDropCloze',
            stem: 'Complete the discharge instructions for this patient by dragging the appropriate terms to the blanks.',
            template: 'The patient should be instructed to monitor their weight daily and notify the provider if they gain more than {{weight_gain}} in 2 days. The patient should also adhere to a {{diet}} and report any increase in {{symptom}}.',
            options: ['2 lbs', '5 lbs', '10 lbs', 'Low sodium diet', 'Fluid restriction', 'Dyspnea', 'Headache', 'Rash'],
            blanks: [
                { id: 'weight_gain', correctOption: '2 lbs' },
                { id: 'diet', correctOption: 'Low sodium diet' },
                { id: 'symptom', correctOption: 'Dyspnea' },
            ],
            pedagogy: { ...basePedagogy, cjmmStep: 'generateSolutions' as const, difficulty: 3 as const },
            rationale: {
                correct: 'Weight management and dietary sodium restriction are the cornerstones of heart failure self-care. Early reporting of dyspnea prevents re-hospitalization.',
                incorrect: 'Larger weight gains (5 or 10 lbs) delay notification too long. Fluid restriction is often ordered but sodium is the primary dietary instruction.',
                reviewUnits: sharedReviewUnits,
                answerBreakdown: [
                    { label: 'Weight Gain', content: '2 lbs in 2 days (or 5 lbs in a week) is the clinical threshold for requiring contact with the provider. Small gains can be managed before crisis.', isCorrect: true },
                    { label: 'Diet', content: 'Sodium restriction (usually 2g/day) is essential to prevent fluid retention. Water follows sodium.', isCorrect: true },
                    { label: 'Symptom', content: 'Dyspnea (shortness of breath) is the most sensitive symptom of worsening HF and pulmonary congestion.', isCorrect: true },
                ],
            },
            scoring: { method: 'polytomous', maxPoints: 3 },
        },
        // ── 11. Hotspot ──────────────────────────────────────────
        {
            id: 'item-011',
            type: 'hotspot',
            stem: 'The nurse is preparing to auscultate for an S3 gallop. Click on the anatomical location (landmark) where this sound is typically heard best.',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-217359f4762c?auto=format&fit=crop&q=80&w=800',
            hotspots: [
                { id: 'aortic', x: 35, y: 35, width: 8, height: 8, label: 'Aortic Area' },
                { id: 'pulmonic', x: 65, y: 35, width: 8, height: 8, label: 'Pulmonic Area' },
                { id: 'tricuspid', x: 50, y: 65, width: 8, height: 8, label: 'Tricuspid Area' },
                { id: 'mitral', x: 45, y: 72, width: 10, height: 10, label: 'Mitral Area (Apex)' }
            ],
            correctHotspotIds: ['mitral'],
            pedagogy: { ...basePedagogy, cjmmStep: 'takeAction' as const, difficulty: 4 as const },
            rationale: {
                correct: 'The S3 gallop is a low-pitched sound heard in early diastole. It is best auscultated at the apex (Mitral area) with the bell of the stethoscope.',
                incorrect: 'Other valves (Aortic, Pulmonic, Tricuspid) are better for hearing closure sounds (S2) or specific murmurs, but S3 is a ventricular filling sound best heard over the LV apex.',
                reviewUnits: sharedReviewUnits,
                answerBreakdown: [
                    { label: 'Mitral Area', content: 'Correct. High-flow ventricular filling sounds are projected to the cardiac apex at the 5th intercostal space, mid-clavicular line.', isCorrect: true },
                    { label: 'Aortic/Pulmonic', content: 'Incorrect. These are at the 2nd intercostal space — too distant to accurately hear a ventricular gallop.', isCorrect: false },
                ],
            },
            scoring: { method: 'polytomous', maxPoints: 1 },
        },
        // ── 12. Graphic ──────────────────────────────────────────
        {
            id: 'item-012',
            type: 'graphic',
            stem: 'Which ECG rhythm strip is most consistent with the patient\'s current heart rate of 112 bpm and compensatory response to low cardiac output?',
            imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
            options: [
                { id: 'a', text: 'Sinus Tachycardia' },
                { id: 'b', text: 'Sinus Bradycardia' },
                { id: 'c', text: 'Atrial Fibrillation' },
                { id: 'd', text: 'Ventricular Tachycardia' }
            ],
            correctOptionId: 'a',
            pedagogy: { ...basePedagogy, cjmmStep: 'recognizeCues' as const, difficulty: 2 as const },
            rationale: {
                correct: 'Sinus tachycardia (rate > 100) is the body\'s typical compensatory mechanism for low cardiac output and hypoxemia in heart failure.',
                incorrect: 'The rate is 112, which defines tachycardia, not bradycardia. While AFib is common in HF, Sinus Tachycardia is a more direct response to the acute stressors.',
                reviewUnits: sharedReviewUnits,
                answerBreakdown: [
                    { label: 'Sinus Tachycardia', content: 'Rate > 100 with regular P-waves. Direct response to sympathetic nervous system activation and RAAS stimulus.', isCorrect: true },
                    { label: 'Other Rhythms', content: 'Bradycardia would worsen symptoms. AFib lacks P-waves. VT is a lethal arrhythmia not indicated by the current vitals.', isCorrect: false },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
        },
        // ── 13. Audio/Video ──────────────────────────────────────
        {
            id: 'item-013',
            type: 'audioVideo',
            stem: 'Listen to the provided audio clip of the patient\'s lung sounds. Which finding is most clearly demonstrated?',
            mediaUrl: 'https://www.learningmedicine.com/assets/media/audio/crackles.mp3',
            mediaType: 'audio',
            options: [
                { id: 'a', text: 'Fine crackles' },
                { id: 'b', text: 'Wheezing' },
                { id: 'c', text: 'Stridor' },
                { id: 'd', text: 'Clear breath sounds' }
            ],
            correctOptionId: 'a',
            pedagogy: { ...basePedagogy, cjmmStep: 'recognizeCues' as const, difficulty: 3 as const },
            rationale: {
                correct: 'Crackles (rales) are short, explosive, popping sounds heard during inspiration. They indicate fluid within the small airways and alveoli, typical of heart failure.',
                incorrect: 'Wheezing indicates bronchoconstriction (as in asthma). Stridor is an upper airway emergency. Fine crackles are the hallmark of pulmonary edema.',
                reviewUnits: sharedReviewUnits,
                answerBreakdown: [
                    { label: 'Fine Crackles', content: 'The popping sound heard suggests fluid-filled alveoli snapping open during inspiration. Hallmarks of LV failure.', isCorrect: true },
                    { label: 'Distractors', content: 'The clip does not contain the high-pitched musical notes of wheezing or the harsh bark of stridor.', isCorrect: false },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
        },
        // ── 14. Chart Exhibit ────────────────────────────────────
        {
            id: 'item-014',
            type: 'chartExhibit',
            stem: 'Review the Cardiology Consult Note. Based on the physician\'s recommendations, which medication adjustment does the nurse anticipate?',
            exhibits: [
                { title: 'Cardiology Consult', content: '<p><b>Impression:</b> Acute on chronic systolic heart failure with severe volume overload. <b>Recommendations:</b> Transition from PO to IV diuresis immediately. Increase ACE inhibitor dose as tolerated. Hold beta-blocker if HR < 60.</p>' }
            ],
            options: [
                { id: 'a', text: 'Switch to IV Furosemide' },
                { id: 'b', text: 'Discontinue Lisinopril' },
                { id: 'c', text: 'Start Oral Potassium' },
                { id: 'd', text: 'Increase Metformin' }
            ],
            correctOptionId: 'a',
            pedagogy: { ...basePedagogy, cjmmStep: 'recognizeCues' as const, difficulty: 3 as const },
            rationale: {
                correct: 'IV diuresis is the most appropriate next step for severe volume overload to ensure rapid fluid removal and improved bioavailability compared to PO.',
                incorrect: 'Increasing ACE inhibitors is recommended, but "discontinuing" them is wrong. Switching to IV is the priority for acute decompensation.',
                reviewUnits: sharedReviewUnits,
                answerBreakdown: [
                    { label: 'Switch to IV', content: 'Correct. IV diuretics work faster and are more effective than oral meds when the gut is congested from HF.', isCorrect: true },
                    { label: 'Others', content: 'Consult does not suggest stopping ACEi or adjusting DM meds. Potassium is often needed but not specified here.', isCorrect: false },
                ],
            },
            scoring: { method: 'dichotomous', maxPoints: 1 },
        },
    ];
}

// ═══════════════════════════════════════════════════════════
//  Factory Export
// ═══════════════════════════════════════════════════════════

export function createSampleCaseStudy(): CaseStudy {
    const allItems = createSampleItems();
    // NCSBN: Case study = exactly 6 items, one per NCJMM step, in order
    const caseStudyItems = allItems.slice(0, 6);
    return {
        id: 'case-001',
        title: 'Acute Decompensated Heart Failure — Margaret Thompson',
        patient: createSamplePatient(),
        clinicalData: createSampleClinicalData(),
        items: caseStudyItems,
        timeLimit: 3600,
    };
}

// Standalone NGN items (not tied to any case study)
export function createStandaloneItems(): MasterItem[] {
    const allItems = createSampleItems();
    return allItems.slice(6); // Items 7-14 are standalone
}
