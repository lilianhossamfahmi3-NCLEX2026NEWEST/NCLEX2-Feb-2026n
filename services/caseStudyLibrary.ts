import { getVaultItems } from './vaultLoader';

// --- Case 1: CHF (Already in dataFactory, but we'll export it here too for the library) ---
import { createSampleCaseStudy as createCHFCase } from './dataFactory';

// --- Helper to create a base pedagogy ---
const createPedagogy = (step: any, category: any) => ({
    bloomLevel: 'analyze' as const,
    cjmmStep: step,
    nclexCategory: category,
    topicTags: ['clinical judgment', 'NGN'],
    difficulty: 3 as const
});

// --- Case 2: Acute Respiratory Distress (Asthma/COPD) ---
export function createRespiratoryCase(): CaseStudy {
    const patient: Patient = {
        id: 'p-002',
        name: 'James Rodriguez',
        age: 12,
        sex: 'M',
        pronouns: 'He/Him',
        weight_kg: 40,
        height_cm: 150,
        iso: 'None',
        admissionDate: new Date().toISOString(),
        diagnosis: 'Acute Asthma Exacerbation',
        allergies: ['Peanuts', 'Penicillin'],
        precautions: 'Standard',
        codeStatus: 'Full Code'
    };

    const clinicalData: ClinicalData = {
        vitals: [
            { time: '08:00', hr: 110, sbp: 118, dbp: 74, rr: 28, temp: 98.6, spo2: 91, spo2Source: 'RA', consciousness: 'Alert', pain: 2 }
        ],
        labs: [
            { id: 'l1', name: 'pH', value: 7.32, unit: '', refLow: 7.35, refHigh: 7.45, timestamp: '08:15' },
            { id: 'l2', name: 'PaCO2', value: 48, unit: 'mmHg', refLow: 35, refHigh: 45, timestamp: '08:15' }
        ],
        notes: [
            {
                id: 'n1',
                title: 'Triage Note',
                situation: '12yo male presenting with acute exacerbation of asthma. Significant respiratory effort noted.',
                background: 'Hx of moderate persistent asthma. Missed maintenance inhaler dose this morning.',
                assessment: 'Audible wheezing upon expiration. Suprasternal retractions observed. SpO2 91% on RA.',
                recommendation: 'Initiate continuous albuterol neb per protocol. Maintain upright positioning.',
                author: 'Nurse Miller',
                authorRole: 'RN',
                timestamp: '08:00',
                content: 'Patient sitting in tripod position. Appears anxious. Limited to 3-4 word sentences.'
            }
        ],
        imaging: [],
        medications: [
            { id: 'm1', name: 'Albuterol Nebulizer', dose: '2.5mg', dosage: '2.5mg', route: 'Inhalation', frequency: 'q20min x 3', status: 'scheduled', scheduledTime: '08:00', lastAdmin: 'Never' }
        ],
        orders: [],
        physicalExam: [
            { system: 'Respiratory', findings: 'Widespread inspiratory and expiratory wheezing. Diminished breath sounds at bases.', isAbnormal: true }
        ]
    };

    const items: MasterItem[] = [
        {
            id: 'resp-001',
            type: 'highlight',
            stem: 'Highlight the cues that indicate the patient is in respiratory distress.',
            passage: 'Patient is sitting in a tripod position. Suprasternal retractions are noted. Speech is limited to 2-3 words. Skin is cool and diaphoretic. Pulse is 110 bpm.',
            correctSpanIndices: [0, 1, 2],
            pedagogy: createPedagogy('recognizeCues', 'Physiological Adaptation'),
            rationale: { correct: 'Tripod position, retractions, and limited speech are classic signs of severe distress.', incorrect: '', reviewUnits: [] },
            scoring: { method: 'polytomous', maxPoints: 3 }
        },
        {
            id: 'resp-002',
            type: 'multipleChoice',
            stem: 'The nurse interprets the initial ABG results (pH 7.32, PaCO2 48). Which state is the patient in?',
            options: [
                { id: 'a', text: 'Respiratory Alkalosis' },
                { id: 'b', text: 'Respiratory Acidosis' },
                { id: 'c', text: 'Metabolic Acidosis' },
                { id: 'd', text: 'Compensated Alkalosis' }
            ],
            correctOptionId: 'b',
            pedagogy: createPedagogy('analyzeCues', 'Physiological Adaptation'),
            rationale: { correct: 'Low pH and high CO2 indicate respiratory acidosis.', incorrect: '', reviewUnits: [] },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'resp-003',
            type: 'multipleChoice',
            stem: 'Which hypothesis is most likely given the cues?',
            options: [
                { id: 'a', text: 'Inadequate gas exchange related to bronchoconstriction' },
                { id: 'b', text: 'Infection related to viral exposure' },
                { id: 'c', text: 'Anxiety related to breathing difficulty' }
            ],
            correctOptionId: 'a',
            pedagogy: createPedagogy('prioritizeHypotheses', 'Reduction of Risk Potential'),
            rationale: { correct: 'Bronchoconstriction is the primary pathophysiological driver.', incorrect: '', reviewUnits: [] },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'resp-004',
            type: 'selectAll',
            stem: 'Which interventions should the nurse anticipate? Select all that apply.',
            options: [
                { id: 'a', text: 'Continuous albuterol nebulization' },
                { id: 'b', text: 'Systemic corticosteroids' },
                { id: 'c', text: 'Intravenous antibiotics' },
                { id: 'd', text: 'Supplemental oxygen via nasal cannula' }
            ],
            correctOptionIds: ['a', 'b', 'd'],
            pedagogy: createPedagogy('generateSolutions', 'Pharmacological and Parenteral Therapies'),
            rationale: { correct: 'Albuterol, steroids, and oxygen are standard for asthma exacerbation.', incorrect: '', reviewUnits: [] },
            scoring: { method: 'polytomous', maxPoints: 3 }
        }
    ];

    return {
        id: 'case-002',
        title: 'Pediatric Acute Asthma — James Rodriguez',
        patient,
        clinicalData,
        items,
        timeLimit: 3600,
        ehrPhases: {
            3: { // Progressive EHR: New labs and vitals appear when moving to item index 3
                vitals: [
                    { time: '08:45', hr: 102, sbp: 115, dbp: 70, rr: 24, temp: 98.6, spo2: 94, spo2Source: '2L NC', consciousness: 'Alert', pain: 1 }
                ],
                labs: [
                    { id: 'l4', name: 'pH', value: 7.38, unit: '', refLow: 7.35, refHigh: 7.45, timestamp: '08:50' },
                    { id: 'l5', name: 'PaCO2', value: 42, unit: 'mmHg', refLow: 35, refHigh: 45, timestamp: '08:50' }
                ],
                notes: [
                    {
                        id: 'n2',
                        situation: 'Monitoring response to initial treatment.',
                        background: 'Received first nebulizer treatment at 08:30.',
                        assessment: 'Respiratory rate decreasing. Wheezing reduced. SpO2 improving on 2L NC.',
                        recommendation: 'Continue monitoring. Prepare for second treatment if needed.',
                        author: 'Nurse Miller',
                        authorRole: 'RN',
                        timestamp: '09:00'
                    }
                ]
            }
        }
    };
}

// --- Case 3: OB/Maternity - Preeclampsia ---
export function createMaternityCase(): CaseStudy {
    const patient: Patient = {
        id: 'p-003',
        name: 'Sarah Chen',
        age: 32,
        sex: 'F',
        pronouns: 'She/Her',
        weight_kg: 68,
        height_cm: 165,
        iso: 'None',
        admissionDate: new Date().toISOString(),
        diagnosis: 'Preeclampsia with Severe Features',
        allergies: ['None'],
        precautions: 'Seizure Precautions',
        codeStatus: 'Full Code'
    };

    const clinicalData: ClinicalData = {
        vitals: [
            { time: '14:00', hr: 88, sbp: 172, dbp: 108, rr: 18, temp: 98.4, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 4 }
        ],
        labs: [
            { id: 'l1', name: 'Platelets', value: 85000, unit: 'mm3', refLow: 150000, refHigh: 450000, timestamp: '14:30' },
            { id: 'l2', name: 'ALT', value: 120, unit: 'U/L', refLow: 7, refHigh: 56, timestamp: '14:30' }
        ],
        notes: [
            {
                id: 'n1',
                title: 'Intake Assessment',
                situation: '32yo G1P0 at 34wks GA presenting for evaluation of severe hypertension.',
                background: 'Hypertension noted at outpatient clinic visit this morning (168/104).',
                assessment: '+3 pitting edema in bilateral lower extremities. Frontal headache poorly responsive to Tylenol.',
                recommendation: 'Initiate Magnesium Sulfate bolus per orders. Implement seizure precautions.',
                author: 'Nurse Jones',
                authorRole: 'RN',
                timestamp: '14:00',
                content: 'Patient reports "spots" in vision field. DTRs are +4 with bilateral 2-beat clonus.'
            }
        ],
        imaging: [],
        medications: [
            { id: 'm1', name: 'Magnesium Sulfate', dose: '4g', dosage: '4g bolus', route: 'IV', frequency: 'once', status: 'scheduled', scheduledTime: '14:00', lastAdmin: 'Never' }
        ],
        orders: [],
        physicalExam: [
            { system: 'Neurological', findings: 'Hyperreflexia (+4 DTRs with clonus).', isAbnormal: true },
            { system: 'Abdominal', findings: 'Right upper quadrant tenderness upon palpation.', isAbnormal: true }
        ]
    };

    const items: MasterItem[] = [
        {
            id: 'mat-001',
            type: 'multipleChoice',
            stem: 'Which clinical finding is most concerning for impending eclampsia?',
            options: [
                { id: 'a', text: '3+ pitting edema' },
                { id: 'b', text: 'Persistent headache and visual spots' },
                { id: 'c', text: 'Lower back pain' },
                { id: 'd', text: 'Blood pressure 172/108' }
            ],
            correctOptionId: 'b',
            pedagogy: createPedagogy('recognizeCues', 'Health Promotion and Maintenance'),
            rationale: { correct: 'Headache and visual changes indicate cerebral irritability.', incorrect: '', reviewUnits: [] },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        }
    ];

    return { id: 'case-003', title: 'Obstetric Crisis — Sarah Chen', patient, clinicalData, items, timeLimit: 3600 };
}

// --- Standalone NGN Items (Single items, not part of a case) ---
export async function getStandaloneNGNItemsAsync(): Promise<MasterItem[]> {
    const vaultItems = await getVaultItems();
    return [
        ...vaultItems,
        {
            id: 'sa-h-chf',
            type: 'highlight',
            stem: 'The nurse evaluates the assessment findings. Highlight the cues that indicate the patient is experiencing a worsening of heart failure.',
            passage: 'Patient reports increasing shortness of breath and weight gain of 5 lbs over the past 2 days. Physical exam reveals bilateral 3+ pitting edema in the lower extremities. Lung auscultation shows crackles in the lower lobes. Blood pressure is 152/94 mmHg, Heart Rate is 112 bpm, and SpO2 is 94% on 2L NC.',
            correctSpanIndices: [0, 1, 2, 3],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['CHF', 'Assessment'] },
            rationale: {
                correct: 'Shortness of breath, weight gain, edema, and crackles are direct physical evidence of fluid overload and pulmonary congestion.',
                incorrect: 'The blood pressure and heart rate are elevated, but in the context of CHF, the physical symptoms of fluid volume excess are the primary cues to highlight.',
                answerBreakdown: [
                    { label: 'Shortness of breath', content: 'Correct: Indicates pulmonary congestion from left ventricular failure.', isCorrect: true },
                    { label: 'Weight gain of 5 lbs', content: 'Correct: High-priority cue for acute fluid volume excess.', isCorrect: true },
                    { label: 'Bilateral 3+ pitting edema', content: 'Correct: Classic sign of systemic fluid retention from right heart failure.', isCorrect: true },
                    { label: 'Lung crackles', content: 'Correct: Indicates fluid in the alveolar spaces.', isCorrect: true },
                    { label: 'BP 152/94', content: 'Incorrect: Elevated BP is common in heart failure but is less specific than the physical evidence of congestion.', isCorrect: false }
                ],
                clinicalPearls: ['Monitoring daily weights is the most sensitive indicator of CHF status.'],
                questionTrap: { trap: 'The Vitals Distractor', howToOvercome: 'Focus on disease-specific physical findings over mild vital sign deviations.' },
                mnemonic: { title: 'FACES', expansion: 'Fatigue, Activity limitation, Congestion, Edema, Shortness of breath' },
                reviewUnits: []
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'sa-h-sepsis',
            type: 'highlight',
            stem: 'The nurse reviews the intake assessment. Highlight the findings that are most concerning for the development of sepsis.',
            passage: 'Current temperature is 102.4°F (39.1°C). Heart rate is 118 bpm and blood pressure is 88/54 mmHg. The nurse notes that the patient\'s skin is warm and flushed. Urine is dark and cloudy with a foul odor. Respiratory rate is 24 bpm. The patient is alert and oriented to person, place, and time.',
            correctSpanIndices: [0, 1, 2, 4, 5],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Reduction of Risk Potential', difficulty: 4, topicTags: ['Sepsis'] },
            rationale: {
                correct: 'Fever, tachycardia, hypotension, and tachypnea form the SIRS component for sepsis.',
                incorrect: 'Warm skin is common in early shock but the vital sign instability is the primary concern.',
                answerBreakdown: [
                    { label: 'Temp 102.4 & HR 118', content: 'Correct: Signs of SIRS/systemic inflammatory response.', isCorrect: true },
                    { label: 'BP 88/54', content: 'Correct: Hypotension indicates progression towards septic shock.', isCorrect: true },
                    { label: 'Cloudy, Foul Urine', content: 'Correct: Identifies the urinary tract as the likely source of infection.', isCorrect: true },
                    { label: 'RR 24', content: 'Correct: Tachypnea is an early, sensitive cue of systemic deterioration.', isCorrect: true },
                    { label: 'Alert & Oriented', content: 'Incorrect: Normal mental status is not a cue for sepsis.', isCorrect: false }
                ],
                clinicalPearls: ['The "Golden Hour" for antibiotics starts at clinical recognition.'],
                questionTrap: { trap: 'Warm Shock Misconception', howToOvercome: 'Recall that early sepsis often presents with warm/flushed skin due to vasodilation.' },
                mnemonic: { title: 'TIME', expansion: 'Temperature, Infection, Mental Status, Extremely Ill' },
                reviewUnits: []
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'potassium_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with a potassium level of 3.1 mEq/L is prescribed an intravenous potassium chloride infusion. Which action by the nurse is essential for safe administration prior to starting the infusion?',
            options: [
                { id: 'a', text: 'Administer the infusion via IV push over 2 minutes.' },
                { id: 'b', text: 'Verify a minimum urinary output of 30 mL/hr.' },
                { id: 'c', text: 'Use a gravity drip to ensure rapid fluid replacement.' },
                { id: 'd', text: 'Dilute the potassium to a concentration of 100 mEq/L for peripheral use.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 3, topicTags: ['Electrolytes', 'Potassium', 'IV Therapy'] },
            rationale: {
                correct: 'Potassium is primarily excreted by the kidneys. Renal function (verified via urinary output) must be confirmed to prevent hyperkalemia.',
                incorrect: 'IV push potassium is lethal. Gravity drips are unsafe for high-alert medications.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: IV push potassium causes immediate cardiac arrest and is a lethal nursing error.', isCorrect: false },
                    { label: 'B', content: 'Correct: Verifying renal function (min 30 mL/hr) ensures the patient can safely excrete the potassium infusion.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: An electronic infusion pump is mandatory for safety and precision.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Peripheral concentrations are limited to 40 mEq/L; 100 mEq/L requires a central line.', isCorrect: false }
                ],
                clinicalPearls: ['Never Push, Always Pump, Always Dilute, Check Kidneys!'],
                questionTrap: { trap: 'Speed vs Safety', howToOvercome: 'In NGN, safety protocols for high-alert meds always take priority over the speed of replacement.' },
                mnemonic: { title: 'K-K-K', expansion: 'K (Potassium) - K (Kidneys) - K (Kill if pushed)' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'pe_recognition_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient 24 hours post-total hip arthroplasty suddenly reports sharp chest pain and dyspnea. Which diagnostic finding is the most definitive for confirming a pulmonary embolism (PE)?',
            options: [
                { id: 'a', text: 'Computed tomography pulmonary angiography (CTPA) showing a filling defect.' },
                { id: 'b', text: 'D-dimer level of 850 ng/mL.' },
                { id: 'c', text: 'Sinus tachycardia on a 12-lead electrocardiogram.' },
                { id: 'd', text: 'Chest X-ray showing bibasilar atelectasis.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ["Pulmonary Embolism", "Post-Op"] },
            rationale: {
                correct: 'CTPA is the gold standard for direct visualization of the clot.',
                incorrect: 'D-dimer is non-specific post-op. Tachycardia is non-specific.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: CTPA directly visualizes the clot (filling defect) in the pulmonary vasculature.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: D-dimers are frequently elevated post-op due to healing and cannot confirm a PE.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Tachycardia is a supportive cue but occurs in many other complications (pain, infection).', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Chest X-rays rule out pneumonia but are often non-definitive for pulmonary emboli.', isCorrect: false }
                ],
                clinicalPearls: ["Sudden dyspnea + Chest pain + Post-op = Think PE."],
                questionTrap: { trap: "The Definitive Distractor", howToOvercome: "Look for imaging that 'sees' the clot vs. blood work that 'suggests' it." },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: "digital_privacy_multipleChoice_v1",
            type: "multipleChoice",
            stem: "A nurse shares a post on a private social media account: 'Rough shift in the ICU, but we saved a patient from a 10-minute cardiac arrest! #NursingLife #CodeBlue.' No patient names or hospital details are included. Which principle of digital privacy has the nurse primarily violated?",
            options: [
                { id: "a", text: "Confidentiality, because specific clinical events can lead to patient identification." },
                { id: "b", text: "Veracity, because the hashtag use sensationalizes a medical emergency." },
                { id: "c", text: "Justice, because only certain patients were mentioned in the post." },
                { id: "d", text: "Autonomy, because the hospital was not notified of the post prior to sharing." }
            ],
            correctOptionId: "a",
            pedagogy: { bloomLevel: "apply", cjmmStep: "takeAction", nclexCategory: "Management of Care", difficulty: 3, topicTags: ["Digital Privacy", "Ethics", "Social Media"] },
            rationale: {
                correct: "The principle of confidentiality extends beyond just names. Contextual identification (time, place, clinical unique event) is a breach.",
                incorrect: "Veracity and Justice are other ethical principles but not the core privacy issue here.",
                answerBreakdown: [
                    { label: "A", content: "Correct: Contextual details can identify patients even without names.", isCorrect: true },
                    { label: "B", content: "Incorrect: Hashtags are unprofessional but not a veracity violation.", isCorrect: false },
                    { label: "C", content: "Incorrect: Justice relates to resource allocation.", isCorrect: false },
                    { label: "D", content: "Incorrect: Autonomy relates to patient decision-making.", isCorrect: false }
                ],
                clinicalPearls: ["If you can't say it in an elevator, don't post it."],
                mnemonic: { title: "POST", expansion: "Pause, Observe, Stay professional, Think" },
                reviewUnits: []
            },
            scoring: { method: "dichotomous", maxPoints: 1 }
        },
        {
            id: "icp_monitoring_multipleChoice_v1",
            type: "multipleChoice",
            stem: "The nurse is caring for a patient with an external ventricular drain (EVD) for intracranial pressure (ICP) monitoring. To ensure accurate readings, at which anatomical landmark should the nurse level the transducer?",
            options: [
                { id: "a", text: "The tragus of the ear (external auditory meatus)." },
                { id: "b", text: "The phlebostatic axis at the mid-axillary line." },
                { id: "c", text: "The xiphoid process of the sternum." },
                { id: "d", text: "The angle of Louis at the second intercostal space." }
            ],
            correctOptionId: "a",
            pedagogy: { bloomLevel: "apply", cjmmStep: "takeAction", nclexCategory: "Physiological Adaptation", difficulty: 4, topicTags: ["Advanced Monitoring", "ICP"] },
            rationale: {
                correct: "EVD transducers must be leveled with the Foramen of Monro (tragus).",
                incorrect: "Phlebostatic axis is for cardiovascular monitoring only.",
                answerBreakdown: [
                    { label: "A", content: "Correct: Tragus represents the level of the brain's ventricles.", isCorrect: true },
                    { label: "B", content: "Incorrect: Used for arterial/central venous lines.", isCorrect: false },
                    { label: "C", content: "Incorrect: Abdominal landmark, not for ICP.", isCorrect: false },
                    { label: "D", content: "Incorrect: Used for heart/lung assessment identification.", isCorrect: false }
                ],
                clinicalPearls: ["Re-level every time the HOB changes."],
                mnemonic: { title: "TRAGUS", expansion: "Tragus = Reference anatomical ground under skull" },
                reviewUnits: []
            },
            scoring: { method: "dichotomous", maxPoints: 1 }
        },
        {
            id: "unbiased_care_multipleChoice_v1",
            type: "multipleChoice",
            stem: "A nurse is admitting a patient who identifies as non-binary and uses they/them pronouns. The patient's legal name on the medical record is 'Robert Black', but the patient specifies they go by 'Robin'. Which action by the nurse best demonstrates the delivery of unbiased, professional care?",
            options: [
                { id: "a", text: "Address the patient as 'Robin' and utilize they/them pronouns in all clinical documentation and interactions." },
                { id: "b", text: "Call the patient 'Robert' until the legal identification on their wristband has been officially updated." },
                { id: "c", text: "Avoid using any pronouns or names during the shift to prevent accidental offense." },
                { id: "d", text: "Refer to the patient as 'Robin' only when no other staff members or guests are present in the room." }
            ],
            correctOptionId: "a",
            pedagogy: { bloomLevel: "apply", cjmmStep: "takeAction", nclexCategory: "Psychosocial Integrity", difficulty: 2, topicTags: ["Unbiased Care", "Gender Identity"] },
            rationale: {
                correct: "Gender-affirming care requires using the patient's affirmed name and pronouns consistently.",
                incorrect: "Deadnaming or avoiding names entirely is a barrier to the therapeutic relationship.",
                answerBreakdown: [
                    { label: "A", content: "Correct: Affirmed name and pronouns reflect respect and reduce distress.", isCorrect: true },
                    { label: "B", content: "Incorrect: Deadnaming violates inclusivity standards.", isCorrect: false },
                    { label: "C", content: "Incorrect: Passive avoidance is unprofessional.", isCorrect: false },
                    { label: "D", content: "Incorrect: Professional care must be consistent and open.", isCorrect: false }
                ],
                clinicalPearls: ["Normalize asking for pronouns during admission."],
                reviewUnits: []
            },
            scoring: { method: "dichotomous", maxPoints: 1 }
        },
        {
            id: "language_access_multipleChoice_v1",
            type: "multipleChoice",
            stem: "A patient with limited English proficiency is being prepared for an urgent surgical procedure. The patient's adult child, who is bilingual, offers to interpret the surgeon's explanation. Which action by the nurse is the priority?",
            options: [
                { id: "a", text: "Accept the offer to have the child interpret to avoid delaying the urgent procedure." },
                { id: "b", text: "Request a hospital-certified medical interpreter to facilitate the informed consent process." },
                { id: "c", text: "Provide the patient with a written consent form translated by an online application." },
                { id: "d", text: "Proceed with the consent using only the patient's existing understanding and hand gestures." }
            ],
            correctOptionId: "b",
            pedagogy: { bloomLevel: "apply", cjmmStep: "takeAction", nclexCategory: "Management of Care", difficulty: 3, topicTags: ["Health Equity", "Language Access"] },
            rationale: {
                correct: "Certified medical interpreters ensure accuracy and neutrality in high-stakes decisions.",
                incorrect: "Family interpretation is prone to bias and terminology errors.",
                answerBreakdown: [
                    { label: "B", content: "Correct: Professional interpreters ensure equitable access to informed consent.", isCorrect: true },
                    { label: "A", content: "Incorrect: Family members may protect the patient by omitting risks.", isCorrect: false },
                    { label: "C", content: "Incorrect: Translation apps lack clinical nuance and dialogue.", isCorrect: false },
                    { label: "D", content: "Incorrect: Hand gestures do not meet legal 'informed' standards.", isCorrect: false }
                ],
                clinicalPearls: ["Always document the interpreter ID."],
                questionTrap: { trap: "The Urgency Distractor", howToOvercome: "Professional interpretation is required unless death is imminent in seconds." },
                reviewUnits: []
            },
            scoring: { method: "dichotomous", maxPoints: 1 }
        },
        {
            id: "svt_management_multipleChoice_v1",
            type: "multipleChoice",
            stem: "A patient develops supraventricular tachycardia (SVT) with a heart rate of 192 bpm. The nurse is ordered to administer adenosine 6 mg IV. Which technique is most critical for success?",
            options: [
                { id: "a", text: "Administer the medication as a slow IV push over 2 to 3 minutes." },
                { id: "b", text: "Administer the medication via a rapid IV bolus followed immediately by a 20 mL saline flush." },
                { id: "c", text: "Dilute the medication in 50 mL of normal saline and use an infusion pump." },
                { id: "d", text: "Massage the carotid sinus for 60 seconds before injecting the medication." }
            ],
            correctOptionId: "b",
            pedagogy: { bloomLevel: "apply", cjmmStep: "takeAction", nclexCategory: "Pharmacological and Parenteral Therapies", difficulty: 3, topicTags: ["SVT", "Adenosine"] },
            rationale: {
                correct: "Adenosine's 10-second half-life requires high-velocity central delivery.",
                incorrect: "Slow push or dilution inactivates the drug before it hits the heart.",
                answerBreakdown: [
                    { label: "B", content: "Correct: Rapid bolus + flush ensures the drug reaches the heart before metabolism.", isCorrect: true },
                    { label: "A", content: "Incorrect: Drug will be neutralized in the vein.", isCorrect: false },
                    { label: "C", content: "Incorrect: Contraindicated for this medication.", isCorrect: false },
                    { label: "D", content: "Incorrect: Carotid massage is a separate, non-pharmacological step.", isCorrect: false }
                ],
                clinicalPearls: ["Warn the patient about a 'sense of doom' during push."],
                mnemonic: { title: "SLAM", expansion: "Slam the drug, Level the flush, Achieve conversion, Monitor." },
                reviewUnits: []
            },
            scoring: { method: "dichotomous", maxPoints: 1 }
        },
        {
            id: 'thyroid_storm_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with Graves\' disease is admitted for a thyroidectomy. Suddenly, the patient develops a temperature of 104.2°F (40.1°C), extreme tachycardia (162 bpm), and severe agitation. Which medication order should the nurse prioritize for immediate administration?',
            options: [
                { id: 'a', text: 'Propylthiouracil (PTU) 200 mg via nasogastric tube.' },
                { id: 'b', text: 'Propranolol 1 mg IV push.' },
                { id: 'c', text: 'Acetaminophen 650 mg suppositories.' },
                { id: 'd', text: 'Levothyroxine 100 mcg IV bolus.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Thyroid Storm', 'Endocrine', 'Pharmacology'] },
            rationale: {
                correct: 'In Thyroid Storm, the immediate priority is addressing the severe cardiovascular symptoms and hyperthermia. Propranolol rapidly blocks the systemic effects of excess thyroid hormone on the heart.',
                incorrect: 'PTU has a slower onset. Acetaminophen is secondary to cardiac stabilization. Levothyroxine would worsen the crisis.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: PTU blocks new synthesis but does not address pre-formed hormone already in the system.', isCorrect: false },
                    { label: 'B', content: 'Correct: Beta-blockers are the first priority to stabilize hemodynamics and reduce the risk of high-output heart failure.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Fever management with acetaminophen is supportive, not the primary stabilization medication.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Administering thyroid hormone would be fatal during a hyperthyroid crisis.', isCorrect: false }
                ],
                clinicalPearls: ['In Thyroid Storm, NEVER give Aspirin (salicylates) as it increases free T4 levels.'],
                questionTrap: { trap: 'The "Specific vs. Immediate" Trap', howToOvercome: 'Choose the one that stabilizes ABC markers first (Tachycardia/BP).' },
                mnemonic: { title: 'B-A-P', expansion: 'Block (Beta-blockers), Attack (PTU), Prevent (Iodine/Corticosteroids).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'lithium_toxicity_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient taking lithium carbonate for bipolar disorder presents with severe nausea, persistent vomiting, coarse hand tremors, and ataxia. A stat serum lithium level is 2.2 mEq/L. Which provider order should the nurse implement first?',
            options: [
                { id: 'a', text: 'Administer an extra dose of lithium to stabilize mood.' },
                { id: 'b', text: 'Initiate 0.9% Normal Saline at 150 mL/hr IV.' },
                { id: 'c', text: 'Obtain a 12-lead electrocardiogram (ECG).' },
                { id: 'd', text: 'Administer a dose of Haloperidol for agitation.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 3, topicTags: ['Lithium', 'Toxicity', 'Mental Health'] },
            rationale: {
                correct: 'Treatment for moderate to severe toxicity (2.2 mEq/L) focuses on aggressive fluid resuscitation with 0.9% Normal Saline to promote lithium clearance.',
                incorrect: 'ECG is important for monitoring but fluid replacement is the priority action. Haloperidol can lower the seizure threshold.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Lithium levels are already at toxic concentrations.', isCorrect: false },
                    { label: 'B', content: 'Correct: Saline increases lithium excretion by restoring volume and providing sodium for renal exchange.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Supportive diagnostics like ECG follow the initiation of life-saving excretion boosters (fluids).', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Chemical restraint is not indicated and does not treat the physiological toxicity.', isCorrect: false }
                ],
                clinicalPearls: ['Lithium has a narrow therapeutic index: 0.6 - 1.2 mEq/L. Anything > 1.5 is toxic.'],
                questionTrap: { trap: 'The "Supportive Care" Bias', howToOvercome: 'With toxins, you must always choose the intervention that increases and facilitates "Clearance".' },
                mnemonic: { title: 'L-I-T-H', expansion: 'Levels (Check them), Intake (High fluid/salt), Tremors (Warning sign), Hydration (Priority).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'pyloric_stenosis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A 6-week-old infant is brought to the clinic for "projectile vomiting" after every feeding. The nurse palpates the infant\'s abdomen. Which finding, combined with the history, is most indicative of hypertrophic pyloric stenosis?',
            options: [
                { id: 'a', text: 'A sausage-shaped mass in the right upper quadrant.' },
                { id: 'b', text: 'An olive-shaped mass in the epigastric area.' },
                { id: 'c', text: 'Currant jelly-like stools.' },
                { id: 'd', text: 'Visible peristaltic waves from right to left.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 2, topicTags: ['Pyloric Stenosis', 'Pediatrics', 'GI'] },
            rationale: {
                correct: 'The classic physical finding is a firm, non-tender, "olive-shaped" mass in the epigastric region.',
                incorrect: 'Sausage-shaped mass and currant jelly stools are classic for intussusception. Peristaltic waves typically move left to right.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Indicative of intussusception.', isCorrect: false },
                    { label: 'B', content: 'Correct: The "olive-shaped" mass is the hallmark cue for pyloric stenosis diagnosis.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Characteristic of intussusception due to mucosal sloughing.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Peristaltic waves move from left to right in pyloric stenosis.', isCorrect: false }
                ],
                clinicalPearls: ['The mass is often best palpated when the infant\'s stomach is empty and relaxed.'],
                questionTrap: { trap: 'The "Related Finding" Distractor', howToOvercome: 'Differentiate by the "Shape" of the mass (Olive = Pyloric | Sausage = Intussusception).' },
                mnemonic: { title: 'P-O-V', expansion: 'Projectile vomiting, Olive-shaped mass, Visible peristalsis (Left to Right).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'abruptio_placentae_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient at 36 weeks gestation arrives at the labor unit reporting sudden, severe abdominal pain and a "board-like" abdomen. Occasional dark red vaginal bleeding is noted. Which action by the nurse is the priority?',
            options: [
                { id: 'a', text: 'Perform a sterile vaginal exam to determine cervical dilation.' },
                { id: 'b', text: 'Initiate continuous electronic fetal monitoring (EFM).' },
                { id: 'c', text: 'Obtain a clean-catch urine specimen for protein analysis.' },
                { id: 'd', text: 'Apply a warm compress to the abdomen to relax the uterus.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Abruptio Placentae', 'Maternity', 'OB Emergency'] },
            rationale: {
                correct: 'Sudden severe pain and a board-like abdomen are cardinal signs of placental abruption. The priority is to assess fetal well-being via EFM.',
                incorrect: 'Vaginal exams are contraindicated in third-trimester bleeding until previa is ruled out. Urine protein is for preeclampsia but is not priority.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Vaginal exams can trigger fatal hemorrhage if the bleeding is caused by a low-lying placenta.', isCorrect: false },
                    { label: 'B', content: 'Correct: Assessing fetal heart rate patterns is the immediate priority during a suspected abruption.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: While preeclampsia increases risk, the acute event needs emergent monitoring.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: A rigid uterus in abruption is due to blood accumulation and will not respond to heat.', isCorrect: false }
                ],
                clinicalPearls: ['Painful bleeding = Abruption | Painless bleeding = Previa.'],
                questionTrap: { trap: 'The "Contraindicated Action" Trap', howToOvercome: 'If bleeding is present in late pregnancy, almost always REJECT any "Vaginal Exam".' },
                mnemonic: { title: 'B-O-A-R-D', expansion: 'Board-like abdomen, Out-of-proportion pain, Abruption suspected, Rapid delivery likely, Dark red bleeding.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'autonomic_dysreflexia_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with a spinal cord injury at T4 reports a sudden, throbbing headache. The nurse notes the patient is flushed above the injury level and has a blood pressure of 210/110 mmHg. Which action should the nurse take first?',
            options: [
                { id: 'a', text: 'Administer the prescribed hydralazine IV push.' },
                { id: 'b', text: 'Raise the head of the bed (HOB) to 90 degrees.' },
                { id: 'c', text: 'Palpate the bladder for distention.' },
                { id: 'd', text: 'Call the healthcare provider immediately.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Autonomic Dysreflexia', 'Neuro', 'Spinal Cord Injury'] },
            rationale: {
                correct: 'The immediate priority is to lower the blood pressure through gravity by sitting the patient upright (HOB 90 degrees) to prevent stroke.',
                incorrect: 'Pharmacological intervention and stimulus removal are necessary steps, but only AFTER sitting the patient up.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Pharmacological intervention follows non-pharmacological postural stabilization.', isCorrect: false },
                    { label: 'B', content: 'Correct: Elevating the HOB is the priority action to utilize orthostatic changes to lower cerebral BP.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Assessing for trigger is the second step, only after stabilizing the BP via position.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: The nurse must act to stabilize the patient before/while notifying the provider.', isCorrect: false }
                ],
                clinicalPearls: ['Most common trigger for Autonomic Dysreflexia = Bladder distention (kinked catheter).'],
                questionTrap: { trap: 'The "Find the Trigger" Distractor', howToOvercome: 'When SBP > 200, don\'t look for the cause FIRST; sit them up FIRST to prevent a stroke.' },
                mnemonic: { title: 'B-B-B', expansion: 'Bladder (check it), Bowel (check it), BP (sit them up).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'warfarin_management_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with atrial fibrillation taking warfarin presents with generalized bruising and an INR of 4.8. Assessment reveals stable vital signs and no active bleeding. Which action should the nurse anticipate?',
            options: [
                { id: 'a', text: 'Administer 10 units of Fresh Frozen Plasma (FFP) IV stat.' },
                { id: 'b', text: 'Withhold the next dose of warfarin and monitor for bleeding signs.' },
                { id: 'c', text: 'Administer Vitamin K 10 mg by slow IV infusion.' },
                { id: 'd', text: 'Instruct the patient to increase intake of green leafy vegetables immediately.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'generateSolutions', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 3, topicTags: ['Warfarin', 'INR', 'Anticoagulation'] },
            rationale: {
                correct: 'For an INR between 4.5 and 10.0 without significant bleeding, the recommendation is to withhold the next doses and monitor closely.',
                incorrect: 'FFP and IV Vitamin K are reserved for extreme elevations or active bleeding. Dietary changes should not be used reactively.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: FFP is for major hemorrhage, not stable elevations.', isCorrect: false },
                    { label: 'B', content: 'Correct: Withholding the dose allows safe clearance while minimizing bleeding risk.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: High-dose Vitamin K is inappropriate for 4.8 without bleeding and may cause warfarin resistance upon resumption.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Diet should remain consistent, not be used as a reactive treatment.', isCorrect: false }
                ],
                clinicalPearls: ['Warfarin consistency in Vitamin K intake is more important than avoidance.'],
                questionTrap: { trap: 'The "Over-Treatment" Trap', howToOvercome: 'If the patient is stable, choose the least invasive intervention first.' },
                mnemonic: { title: 'W-A-R', expansion: 'Watch for bleeding, Avoid Vitamin K surges, Range (2.0-3.0).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'copd_exacerbation_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with chronic obstructive pulmonary disease (COPD) presents with increased dyspnea and wheezing. The patient is currently receiving 2L oxygen via nasal cannula. Which finding is most concerning for impending respiratory failure?',
            options: [
                { id: 'a', text: 'The patient\'s PaCO2 is 52 mmHg (Baseline: 50 mmHg).' },
                { id: 'b', text: 'The patient is using pursed-lip breathing while talking.' },
                { id: 'c', text: 'The patient\'s SpO2 is 89% on 2L NC.' },
                { id: 'd', text: 'The patient is increasingly somnolent and difficult to arouse.' }
            ],
            correctOptionId: 'd',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['COPD', 'Respiratory Failure', 'ABG'] },
            rationale: {
                correct: 'A change in mental status (somnolence, difficult to arouse) is a late and critical indicator of CO2 narcosis or profound hypoxia.',
                incorrect: 'PaCO2 near baseline and SpO2 in the 88-92% range are expected for COPD. Pursed-lip breathing is compensatory.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: PaCO2 of 52 is stable for a client whose baseline is 50.', isCorrect: false },
                    { label: 'B', content: 'Incorrect: Pursed-lip breathing is an expected compensatory cue.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: 89% SpO2 is within the target therapeutic range for COPD.', isCorrect: false },
                    { label: 'D', content: 'Correct: Altered mental status indicates the brain is no longer adequately oxygenated; this is an emergency.', isCorrect: true }
                ],
                clinicalPearls: ['Don\'t hyper-oxygenate COPD patients; it suppresses their hypoxemic drive.'],
                questionTrap: { trap: 'The "Number" Trap', howToOvercome: 'Don\'t just look for abnormal ABGs; look for the "Systemic Symptom" proving the labs are causing failure.' },
                mnemonic: { title: 'C-O-P-D', expansion: 'Chronic retained CO2, Oxygen (low is okay), Pursed lips, Drowsiness (Danger!).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'acute_pancreatitis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with acute pancreatitis reports severe epigastric pain radiating to the back. Which clinical finding should the nurse prioritize as an indicator of a severe complication?',
            options: [
                { id: 'a', text: 'Serum amylase level 3 times the upper limit of normal.' },
                { id: 'b', text: 'Muscle twitching and a positive Chvostek\'s sign.' },
                { id: 'c', text: 'Nausea and 200 mL of bile-colored emesis.' },
                { id: 'd', text: 'Weight loss of 2 lbs over the past 24 hours.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Pancreatitis', 'Electrolytes', 'Hypocalcemia'] },
            rationale: {
                correct: 'Severe pancreatitis can lead to hypocalcemia. Clinical tetany (Chvostek sign) is a high-priority cue for systemic complication.',
                incorrect: 'Amylase confirms diagnosis but is not a "complication". Emesis and minor weight loss are expected findings.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: confirms diagnosis but does not indicate the severity of complications.', isCorrect: false },
                    { label: 'B', content: 'Correct: Hypocalcemia is a serious complication and requires immediate calcium replacement.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Emesis is an expected symptom; management is usually NPO.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Minor weight fluctuations are expected due to fluid shifts.', isCorrect: false }
                ],
                clinicalPearls: ['Calcium levels in pancreatitis correlate with disease severity.'],
                questionTrap: { trap: 'The "Diagnostic" Distractor', howToOvercome: 'Ignore findings that simply repeat the diagnosis (Amylase) and look for a new, dangerous problem (Hypocalcemia).' },
                mnemonic: { title: 'C-A-T-S', expansion: 'Convulsions, Arrhythmias, Tetany, Spasms (Signs of Low Calcium).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'digoxin_toxicity_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with heart failure taking digoxin and furosemide reports seeing "yellow halos" around lights and feeling nauseated. Which assessment finding is most important for the nurse to verify?',
            options: [
                { id: 'a', text: 'Serum sodium level.' },
                { id: 'b', text: 'Serum potassium level.' },
                { id: 'c', text: 'Daily weight change.' },
                { id: 'd', text: 'Basilar lung crackles.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'analyzeCues', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 3, topicTags: ['Digoxin', 'Potassium', 'Pharmacology'] },
            rationale: {
                correct: 'Digoxin toxicity (halos, nausea) is triggered by hypokalemia. Furosemide causes potassium loss, so checking K+ is the immediate priority.',
                incorrect: 'Sodium and weight relate to disease monitoring, but visual changes point directly to medication toxicity mediated by electrolytes.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Sodium does not significantly impact digoxin pharmacokinetics.', isCorrect: false },
                    { label: 'B', content: 'Correct: Hypokalemia is the #1 precipitating factor for digoxin toxicity.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Weight changes do not explain visual "halo" symptoms.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Lung sounds assess pulmonary congestion, not electrolyte status.', isCorrect: false }
                ],
                clinicalPearls: ['Hold digoxin if HR < 60 bpm in adults; always check apical pulse for 1 full minute.'],
                questionTrap: { trap: 'The "Diagnosis Monitor" Trap', howToOvercome: 'Don\'t choose an option monitoring the disease (CHF = Lung sounds) when the question is about medication side effects (Halos = Digoxin).' },
                mnemonic: { title: 'K-I-L-L', expansion: 'K (Potassium) - If Low - Leads to Toxicity.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'nephrotic_syndrome_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A 4-year-old child with nephrotic syndrome presents with severe periorbital edema and weight gain. A urinalysis is performed. Which result is most characteristic of this condition?',
            options: [
                { id: 'a', text: 'Gross hematuria (cola-colored urine).' },
                { id: 'b', text: 'Proteinuria (4+ on dipstick).' },
                { id: 'c', text: 'Presence of white blood cell casts.' },
                { id: 'd', text: 'Specific gravity of 1.005.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 2, topicTags: ['Nephrotic Syndrome', 'Pediatrics', 'Renal'] },
            rationale: {
                correct: 'Nephrotic syndrome is defined by massive proteinuria (4+), leading to hypoalbuminemia and subsequent severe edema.',
                incorrect: 'Hematuria is for AGN. WBC casts indicate pyelonephritis. Specific gravity is typically high in nephrotic syndrome.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Cola-colored urine is the hallmark of AGN.', isCorrect: false },
                    { label: 'B', content: 'Correct: Massive protein loss in urine is the defining feature of nephrotic syndrome.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: WBC casts indicate infection of the renal parenchyma.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Clinical nephrosis results in high SG due to concentrated urine.', isCorrect: false }
                ],
                clinicalPearls: ['Nephrotic Syndrome = "O" for Protein loss. Glomerulonephritis = "I" for Inflammation/Blood.'],
                questionTrap: { trap: 'The "Related Disease" Trap', howToOvercome: 'Look for "Protein" for Nephrotic and "Blood" for AGN.' },
                mnemonic: { title: 'P-A-L-E', expansion: 'Proteinuria, Albumin (low), Lipids (high), Edema.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'hhs_management_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'An older adult patient with Type 2 Diabetes presents with a blood glucose level of 840 mg/dL, extreme dehydration, and confusion. No ketones are present in the urine. Which intervention is the priority for the nurse to implement first?',
            options: [
                { id: 'a', text: 'Administer 10 units of regular insulin IV bolus.' },
                { id: 'b', text: 'Initiate IV infusion of 0.9% Normal Saline at 1L/hr.' },
                { id: 'c', text: 'Administer 50 mEq of Sodium Bicarbonate IV push.' },
                { id: 'd', text: 'Apply a cooling blanket to treat hyperthermia.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['HHS', 'Diabetes', 'Fluid Resuscitation'] },
            rationale: {
                correct: 'The immediate life-threatening issue in HHS is severe hypovolemia and shock. Aggressive fluid resuscitation is the priority.',
                incorrect: 'Insulin is the second step. Bicarbonate is not indicated. Cooling is supportive.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Giving insulin before fluids can cause water to move into cells, causing circulatory collapse.', isCorrect: false },
                    { label: 'B', content: 'Correct: Volume restoration is the primary goal due to massive osmotic diuresis.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: HHS involves little to no ketoacidosis; bicarb is not indicated.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Hyperthermia is not the priority for stabilization.', isCorrect: false }
                ],
                clinicalPearls: ['HHS = Type 2 DM + No Ketones + Extreme High Glucose (> 600).'],
                questionTrap: { trap: 'The "Sugar" Trap', howToOvercome: 'When sugar is extremely high, don\'t just "chase the number" with insulin; fill the tank first.' },
                mnemonic: { title: 'H-H-S', expansion: 'High glucose, Hydration priority, Slow insulin start.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'cholinergic_crisis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with myasthenia gravis is receiving pyridostigmine. The patient arrives at the emergency department with severe muscle weakness, excessive salivation, and constricted pupils (miosis). Which medication should the nurse have available for immediate administration?',
            options: [
                { id: 'a', text: 'Atropine sulfate.' },
                { id: 'b', text: 'Edrophonium (Tensilon).' },
                { id: 'c', text: 'Neostigmine.' },
                { id: 'd', text: 'Epinephrine.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 4, topicTags: ['Myasthenia Gravis', 'Cholinergic Crisis', 'Antidotes'] },
            rationale: {
                correct: 'The patient is experiencing a cholinergic crisis (SLUDGE symptoms). The priority is an anticholinergic (Atropine) to reverse parasympathetic over-activation.',
                incorrect: 'Edrophonium and Neostigmine would worsen the crisis (depolarizing block). Epinephrine is for anaphylaxis.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Atropine is the specific antagonist for cholinergic toxicity.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Edrophonium would dangerously worsen weakness in a cholinergic crisis.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Adding more acetylcholine would increase the toxic effect.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Epinephrine does not address the cholinergic receptors.', isCorrect: false }
                ],
                clinicalPearls: ['Cholinergic Crisis = Constricted pupils (Miosis). Myasthenic Crisis = Weakness only.'],
                questionTrap: { trap: 'The "Drug Group" Trap', howToOvercome: 'Remember "Myasthenic = More meds" and "Cholinergic = Cancel meds".' },
                mnemonic: { title: 'S-L-U-D-G-E', expansion: 'Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'compartment_syndrome_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient following a tibia fracture reports "burning and tingling" in the toes of the affected leg. The patient notes that the pain is not relieved by the prescribed morphine and increases with passive extension of the toes. Which action by the nurse is most appropriate?',
            options: [
                { id: 'a', text: 'Apply an ice pack to the leg to reduce inflammation.' },
                { id: 'b', text: 'Elevate the leg above the level of the heart.' },
                { id: 'c', text: 'Call the healthcare provider immediately for a suspected compartment syndrome.' },
                { id: 'd', text: 'Re-evaluate the patient\'s pain in 30 minutes after the morphine peaks.' }
            ],
            correctOptionId: 'c',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Compartment Syndrome', 'Musculoskeletal', 'Emergency'] },
            rationale: {
                correct: 'Pain out of proportion and with passive stretch are classic early signs of compartment syndrome. This is a surgical emergency notifying the provider immediately.',
                incorrect: 'Ice and high elevation are contraindicated as they further reduce arterial pressure and inflow to the compressed limb.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Cold therapy further compromises restricted blood flow.', isCorrect: false },
                    { label: 'B', content: 'Incorrect: Elevation above the heart is contraindicated; keep at heart level.', isCorrect: false },
                    { label: 'C', content: 'Correct: Prompt surgical notification is mandatory to prevent limb loss.', isCorrect: true },
                    { label: 'D', content: 'Incorrect: Delaying care for an ischemic event leads to irreversible damage.', isCorrect: false }
                ],
                clinicalPearls: ['Paresthesia is the earliest sign among the 6 P\'s.'],
                questionTrap: { trap: 'The "Standard Musculoskeletal Care" Trap', howToOvercome: 'Normally you RICE, but in Compartment Syndrome, Ice and High Elevation are CONTRAINDICATED.' },
                mnemonic: { title: 'P-P-P', expansion: 'Pain (unrelieved), Pressure (tightness), Passive stretch (painful).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'fat_embolism_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with a floating femur fracture develops sudden confusion, dyspnea, and a petechial rash over the chest and neck. Which laboratory finding is most consistent with the suspected complication?',
            options: [
                { id: 'a', text: 'Elevated serum lipase.' },
                { id: 'b', text: 'Decreased serum calcium.' },
                { id: 'c', text: 'Increased platelet count.' },
                { id: 'd', text: 'Decreased PaO2 (Hypoxemia).' }
            ],
            correctOptionId: 'd',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Fat Embolism', 'Orthopedic', 'Respiratory'] },
            rationale: {
                correct: 'The triad of confusion, dyspnea/hypoxia, and petechial rash is classic for FES. Significant hypoxemia (decreased PaO2) is a hallmark finding.',
                incorrect: 'Thrombocytopenia (low platelets) is common, not an increased count. Lipase/Calcium are non-specific.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Lipase elevations are late and non-specific.', isCorrect: false },
                    { label: 'B', content: 'Incorrect: Not a primary cue for FES pathophysiology.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Thrombocytopenia occurs due to consumption, not a count increase.', isCorrect: false },
                    { label: 'D', content: 'Correct: Significant hypoxemia (PaO2 < 60) is the first cue of systemic failure in FES.', isCorrect: true }
                ],
                clinicalPearls: ['Petechiae in FES appear 24-48 hours after injury over the torso/neck.'],
                questionTrap: { trap: 'The "Rash" Distractor', howToOvercome: 'If you see "Petechial Rash + Fracture", it is ALWAYS Fat Embolism Syndrome.' },
                mnemonic: { title: 'F-A-T', expansion: 'Fracture (long bone), Altered mental status, Tiny hemorrhages (petechiae).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'sickle_cell_crisis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A child with sickle cell anemia is admitted for a vaso-occlusive crisis. The child reports severe pain in the joints. Which intervention should the nurse implement first?',
            options: [
                { id: 'a', text: 'Administer the prescribed meperidine IV for pain.' },
                { id: 'b', text: 'Increase the IV fluid rate to 1.5 times the maintenance rate.' },
                { id: 'c', text: 'Apply cold compresses to the swollen joints to reduce inflammation.' },
                { id: 'd', text: 'Instruct the child to perform active range-of-motion exercises.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Sickle Cell', 'Hematology', 'Hydration'] },
            rationale: {
                correct: 'Hydration is the priority to reduce blood viscosity and promote movement of sickled cells through the microvasculature.',
                incorrect: 'Meperidine is contraindicated (seizure risk). Cold causes vasoconstriction/sickling. Active range of motion is too painful/increases O2 demand.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Meperidine is associated with CNS toxicity in sickle cell and is never the drug of choice.', isCorrect: false },
                    { label: 'B', content: 'Correct: Aggressive hydration is the most critical step to reverse the sickling process.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Cold causes vasoconstriction, which traps sickled cells and exacerbates the crisis.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Rest is essential; exercise would increase oxygen consumption and sickling.', isCorrect: false }
                ],
                clinicalPearls: ['Hydration, Oxygenation, and Pain management (HOP) are the cornerstones of crisis care.'],
                questionTrap: { trap: 'The "Contraindicated Medication" Trap', howToOvercome: 'Avoid Meperidine (Demerol) in sickle cell patients; choose Morphine/Hydromorphone.' },
                mnemonic: { title: 'H-O-P', expansion: 'Hydration, Oxygenation, Pain management.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'peritonitis_dialysis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient receiving peritoneal dialysis at home reports that the effluent (drainage) has become cloudy. The patient also reports mild abdominal discomfort and a low-grade fever. Which action is the priority for the nurse?',
            options: [
                { id: 'a', text: 'Instruct the patient to increase the dwell time for the next cycle.' },
                { id: 'b', text: 'Obtain a specimen of the effluent for culture and sensitivity.' },
                { id: 'c', text: 'Administer an extra dose of phosphate binder.' },
                { id: 'd', text: 'Encourage the patient to increase dietary fiber to prevent contention.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Peritoneal Dialysis', 'Peritonitis', 'Renal'] },
            rationale: {
                correct: 'Cloudy effluent is the earliest sign of peritonitis. The priority is identifying the organism via culture to guide antibiotic therapy.',
                incorrect: 'Increased dwell time worsens progress. Fiber/binders are routine care and irrelevant to acute infection.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Increasing dwell time allows more time for membrane damage.', isCorrect: false },
                    { label: 'B', content: 'Correct: Culturing the drainage is the first clinical step to confirm peritonitis.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: For chronic electrolyte management, not acute infection.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Irrelevant to the sign of cloudy drainage.', isCorrect: false }
                ],
                clinicalPearls: ['Outflow should normally be clear and straw-colored; cloudy = infection.'],
                questionTrap: { trap: 'The "Routine Care" Distractor', howToOvercome: 'When presented with a "Change in Status", choose the action that investigates the change.' },
                mnemonic: { title: 'C-O-P', expansion: 'Cloudy, Oppressing pain, Peritonitis.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'epiglottitis_emergency_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A 3-year-old child presents to the emergency room in a tripod position, drooling, and appearing highly anxious with a high fever. Which action should the nurse take first?',
            options: [
                { id: 'a', text: 'Examine the child\'s throat with a tongue blade to assess for redness.' },
                { id: 'b', text: 'Attempt to obtain a throat culture using a sterile swab.' },
                { id: 'c', text: 'Keep the child calm and avoid any invasive procedures.' },
                { id: 'd', text: 'Place the child in a supine position for a thorough physical exam.' }
            ],
            correctOptionId: 'c',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Epiglottitis', 'Pediatrics', 'Airway'] },
            rationale: {
                correct: 'Irritation to the throat (tongue blade/swab) can cause immediate laryngospasm and total airway occlusion in epiglottitis.',
                incorrect: 'Tongue blades/cultures are strictly contraindicated. Supine positioning compromises the airway.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Can cause immediate, fatal airway obstruction via laryngospasm.', isCorrect: false },
                    { label: 'B', content: 'Incorrect: Throat swabs are contraindicated until a secure airway is established.', isCorrect: false },
                    { label: 'C', content: 'Correct: Minimizing stress prevents crying and laryngospasm while waiting for expert intubation.', isCorrect: true },
                    { label: 'D', content: 'Incorrect: Supine position increases risk of the epiglottis blocking the narrow airway.', isCorrect: false }
                ],
                clinicalPearls: ['If it\'s epiglottitis: Do NOT look in the mouth!'],
                questionTrap: { trap: 'The "Assessment First" Trap', howToOvercome: 'In Epiglottitis, physical assessment of the throat is the ONE thing you must NOT do first.' },
                mnemonic: { title: 'A-I-R-W-A-Y', expansion: 'Anxiety, Increased fever, Rapid onset, Wheezing (stridor), Already drooling.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'hellp_syndrome_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient at 35 weeks gestation with preeclampsia presents with severe right upper quadrant (RUQ) pain and nausea. The nurse reviews the lab results. Which finding indicates the development of HELLP syndrome?',
            options: [
                { id: 'a', text: 'Platelet count of 450,000/mm3.' },
                { id: 'b', text: 'Elevated liver enzymes (ALT/AST) and decreased hemoglobin.' },
                { id: 'c', text: 'Glucose level of 95 mg/dL.' },
                { id: 'd', text: 'WBC count of 12,000/mm3.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'analyzeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['HELLP Syndrome', 'OB', 'Preeclampsia'] },
            rationale: {
                correct: 'HELLP syndrome variant (Hemolysis/Elevated Liver enzymes/Low Platelets) causes RUQ pain due to liver distention.',
                incorrect: 'Platelets must be low (<100k). Glucose/WBC are not defining markers for HELLP.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Low platelets is a core requirement; 450k is normal.', isCorrect: false },
                    { label: 'B', content: 'Correct: Hemolysis (low Hgb) and Elevated Liver enzymes are the defining laboratory cues.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Glucose is typically not affected in the HELLP triad.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: WBC increase is non-specific for HELLP syndrome.', isCorrect: false }
                ],
                clinicalPearls: ['RUQ pain in pregnancy + high BP = RED FLAG for liver involvement.'],
                questionTrap: { trap: 'The "Acronym" Trap', howToOvercome: 'Mentally check the triad: Hemolysis, Elevated Liver, Low Platelets.' },
                mnemonic: { title: 'H-E-L-L-P', expansion: 'Hemolysis, Elevated Liver, Low Platelets.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'tpn_air_embolism_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'While the nurse is changing the tubing for a patient\'s total parenteral nutrition (TPN) via a central venous catheter, the patient suddenly develops shortness of breath, tachycardia, and a "churning" sound is heard over the heart. Which action is the priority?',
            options: [
                { id: 'a', text: 'Place the patient in the Trendelenburg position on the left side (Durant\'s maneuver).' },
                { id: 'b', text: 'Perform immediate chest compressions.' },
                { id: 'c', text: 'Auscultate the lungs for bilateral breath sounds.' },
                { id: 'd', text: 'Slow the TPN infusion to a KVO (Keep Vein Open) rate.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Reduction of Risk Potential', difficulty: 4, topicTags: ['TPN', 'Central Line', 'Air Embolism'] },
            rationale: {
                correct: 'Durant\'s maneuver (Left Lateral Trendelenburg) traps air in the right ventricle apex to prevent pulmonary artery occlusion.',
                incorrect: 'Compressions break up bubbles/worsen emboli. TPN must be CLAMPED, not slowed.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Left-side Trendelenburg uses gravity to trap air in the right ventricle, buying time for it to dissolve.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Compressions send smaller, more dangerous emboli into the lungs.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Priority action is contains air embolus via position.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Must CLAMP the line immediately if air entered.', isCorrect: false }
                ],
                clinicalPearls: ['Ask patient to perform the Valsalva maneuver during line changes to prevent air entry.'],
                questionTrap: { trap: 'The "Assessment" Distractor', howToOvercome: 'When unique sound (Churning) gives diagnosis, action is the priority.' },
                mnemonic: { title: 'T-L-C', expansion: 'Trendelenburg, Left side, Clamp the line.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'cardiac_tamponade_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient following a CABG procedure develops jugular venous distention (JVD), muffled heart sounds, and a narrowing pulse pressure. The nurse notes a 15 mmHg drop in systolic blood pressure during inspiration. Which assessment should the nurse perform next?',
            options: [
                { id: 'a', text: 'Assess for pulsus paradoxus.' },
                { id: 'b', text: 'Measure hourly urine output.' },
                { id: 'c', text: 'Auscultate for a pericardial friction rub.' },
                { id: 'd', text: 'Check for bilateral pedal edema.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Cardiac Tamponade', 'Becks Triad', 'Post-CABG'] },
            rationale: {
                correct: 'Beck\'s Triad and pulsus paradoxus (>10 mmHg drop in SBP on inspiration) confirm the emergency restriction of filling in cardiac tamponade.',
                incorrect: 'Friction rubs are for pericarditis (inflammation). Edema/UOP are for failure but lack acute diagnostic specificity for tamponade.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Pulsus paradoxus is the defining assessment finding confirming tamponade physiologic restriction.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Non-specific diagnostic tool for tamponade.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Friction rubs are "scratchy" sounds; muffled sounds occur in tamponade.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Does not help in acute crisis identification.', isCorrect: false }
                ],
                clinicalPearls: ['Narrow pulse pressure = Systolic and Diastolic numbers getting closer together (e.g. 90/80).'],
                questionTrap: { trap: 'The "Pericarditis vs. Tamponade" Trap', howToOvercome: 'Pericarditis = Rubs and Pain. Tamponade = Muffled sounds and Shock.' },
                mnemonic: { title: 'B-E-C-K', expansion: 'Big neck veins (JVD), Extremely low BP, Can\'t hear heart (muffled), Kiss of death (Pulsus paradoxus).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'neuro_stroke_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A 68-year-old patient presents to the emergency department with sudden right-sided facial drooping and slurred speech that began 45 minutes ago. Which action is the absolute priority for the nurse?',
            options: [
                { id: 'a', text: 'Prepare the patient for a non-contrast CT scan of the head.' },
                { id: 'b', text: 'Administer IV alteplase (tPA) according to protocol.' },
                { id: 'c', text: 'Obtain a blood sample for a complete blood count and coagulation studies.' },
                { id: 'd', text: 'Perform a bedside swallow screen to assess for dysphagia.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Stroke', 'Neuro', 'CT Scan'] },
            rationale: {
                correct: 'Before any fibrinolytic therapy can be considered, a non-contrast CT scan must be performed immediately to rule out a hemorrhagic stroke.',
                incorrect: 'Alteplase cannot be given without confirming the stroke is ischemic (via CT). Lab work and swallow screens are necessary but follow stabilization and CT scanning.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: CT scan is the "rule out" diagnostic for intracranial hemorrhage.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Dangerous if the stroke is hemorrhagic.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Secondary to imaging in the acute "Time is Brain" window.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Important for safety but does not address the underlying pathology.', isCorrect: false }
                ],
                clinicalPearls: ['Final target time for CT results is <45 minutes from arrival.'],
                questionTrap: { trap: 'The "Treat the Cause" Trap', howToOvercome: 'In stroke, you must "Confirm the Type" before "Treating the Cause".' },
                mnemonic: { title: 'F-A-S-T', expansion: 'Face, Arms, Speech, Time.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'renal_hemodialysis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient receiving hemodialysis reports severe leg cramps and dizziness. The nurse notes the blood pressure has dropped from 142/88 to 92/54 mmHg. Which action should the nurse take first?',
            options: [
                { id: 'a', text: 'Slow the ultrafiltration rate and administer a bolus of 0.9% Normal Saline.' },
                { id: 'b', text: 'Place the patient in a high-Fowler\'s position.' },
                { id: 'c', text: 'Discontinue the dialysis treatment immediately.' },
                { id: 'd', text: 'Administer the patient\'s scheduled midodrine dose.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Hemodialysis', 'Hypotension', 'Renal'] },
            rationale: {
                correct: 'Muscle cramps and hypotension during dialysis are usually due to rapid fluid removal. The priority is to restore volume and slow removal rate.',
                incorrect: 'Fowler\'s worsens hypotension. Treatment suspension is a last resort. Midodrine is for prevention, not acute crisis.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Saline bolus restores intravascular volume and reduces cramping.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Gravity will further decrease cerebral perfusion.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Prematurely stopping dialysis leaves toxins and excess fluid.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Midodrine is for maintenance, not rapid rescue.', isCorrect: false }
                ],
                clinicalPearls: ['Always withhold antihypertensives on the morning of dialysis.'],
                questionTrap: { trap: 'The "Discontinue" Reflex', howToOvercome: 'Most dialysis complications can be managed by modifying the machine settings (UFR) or repositioning.' },
                mnemonic: { title: 'D-O-W-N', expansion: 'Drop in BP, Out of fluid too fast, Wanted saline, Now reposition.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'pharm_blood_reaction_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'Ten minutes after the start of a packed red blood cell (PRBC) transfusion, the patient reports back pain, chills, and shortness of breath. Which action is the priority?',
            options: [
                { id: 'a', text: 'Stop the transfusion and disconnect the tubing at the hub.' },
                { id: 'b', text: 'Slow the infusion to a "keep vein open" (KVO) rate.' },
                { id: 'c', text: 'Administer the PRN dose of IV diphenhydramine.' },
                { id: 'd', text: 'Check the patient\'s temperature and blood pressure.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Safety and Infection Prevention and Control', difficulty: 4, topicTags: ['Blood Transfusion', 'Hemolytic Reaction', 'Safety'] },
            rationale: {
                correct: 'Lower back pain and chills during transfusion signify an acute hemolytic reaction. The priority is to stop the culprit immediately.',
                incorrect: 'Slowing the rate still allows more incompatible blood to enter. Benadryl is for minor allergic reactions (hives), not hemolytic crises.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Prevents further entry of incompatible antigens.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Dangerous—any amount of hemolytic blood is toxic.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Symptomatic treatment that does not stop the reaction.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Monitoring must not delay the cessation of the transfusion.', isCorrect: false }
                ],
                clinicalPearls: ['Always use a new saline line to keep the vein open; do not flush the existing "bloody" line.'],
                questionTrap: { trap: 'The "KVO" Trap', howToOvercome: 'In hemolytic reactions, NEVER leave the blood tubing connected, even at a slow rate.' },
                mnemonic: { title: 'S-T-O-P', expansion: 'Stop transfusion, Tubing disconnected, Oxygen/Saline, Patient stabilized.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'trauma_burns_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with full-thickness burns to the chest and abdomen (36% TBSA) is in the emergent phase of care. Which assessment finding requires the most immediate intervention?',
            options: [
                { id: 'a', text: 'Urine output of 20 mL/hr.' },
                { id: 'b', text: 'Potassium level of 5.4 mEq/L.' },
                { id: 'c', text: 'Hoarseness and increased secretions.' },
                { id: 'd', text: 'Reported pain level of 9/10.' }
            ],
            correctOptionId: 'c',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Burns', 'Inhalation Injury', 'Airway'] },
            rationale: {
                correct: 'Hoarseness and secretions are cues for impending airway obstruction due to inhalation injury, which is the #1 cause of death in early burns.',
                incorrect: 'Low urine output and high potassium are typical in burn shock/cellular injury but follow Airway (ABC) in priority.',
                answerBreakdown: [
                    { label: 'C', content: 'Correct: Airway patency is the highest priority.', isCorrect: true },
                    { label: 'A', content: 'Incorrect: Critical but falls under Circulation (after Airway).', isCorrect: false },
                    { label: 'B', content: 'Incorrect: Expected due to cell lysis; to be monitored but not #1.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Pain is significant but not life-threatening.', isCorrect: false }
                ],
                clinicalPearls: ['Any burn above the clavicles or in an enclosed space = Automatic Inhalation Risk.'],
                questionTrap: { trap: 'The "Shock" Distractor', howToOvercome: 'Always stabilize the Airway before the Circulation (Fluid resuscitation).' },
                mnemonic: { title: 'A-B-C-D', expansion: 'Airway (Soot/Singed hair), Breathing (Strider), Circulation (Fluid/Parkland), Disability.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'cardiac_afib_multipleChoice_v2',
            type: 'multipleChoice',
            stem: 'A patient in atrial fibrillation develops a heart rate of 150 bpm and a blood pressure of 78/44 mmHg. The patient is confused and diaphoretic. Which intervention should the nurse prepare for?',
            options: [
                { id: 'a', text: 'Synchronized cardioversion.' },
                { id: 'b', text: 'IV Amiodarone infusion.' },
                { id: 'c', text: 'Defibrillation (unsynchronized shock).' },
                { id: 'd', text: 'Carotid sinus massage.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'generateSolutions', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Atrial Fibrillation', 'Cardioversion', 'ACLS'] },
            rationale: {
                correct: 'The patient is "unstable" (hypotension, mental status change). Synchronized cardioversion is the mandatory treatment for unstable tachyarrhythmias.',
                incorrect: 'Amiodarone is for stable rhythm control. Defibrillation is for pulseless rhythms (VF/VT). Carotid massage is for stable SVT.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Rapidly restores cardiac output in an unstable patient.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Drugs work too slowly for an unstable patient.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Shocking on the T-wave could cause V-fib.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Ineffective for unstable A-fib.', isCorrect: false }
                ],
                clinicalPearls: ['Remember: "If they have a pulse, you synchronize. If they have no pulse, you defib."'],
                questionTrap: { trap: 'The "Drug First" Bias', howToOvercome: 'If the Blood Pressure is CRASHING, chemicals are too slow; use electricity.' },
                mnemonic: { title: 'S-Y-N-C', expansion: 'Shock on R-wave, Yes pulse, No delay, Correct rhythm.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'shock_sepsis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with septic shock has completed a 30 mL/kg fluid bolus, but the Mean Arterial Pressure (MAP) remains 54 mmHg. Which medication does the nurse anticipate administering next?',
            options: [
                { id: 'a', text: 'Norepinephrine IV infusion.' },
                { id: 'b', text: 'Dopamine IV infusion.' },
                { id: 'c', text: 'Dobutamine IV infusion.' },
                { id: 'd', text: 'Epinephrine IV push.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'generateSolutions', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 5, topicTags: ['Sepsis', 'Norepinephrine', 'Shock'] },
            rationale: {
                correct: 'Norepinephrine is the first-line vasopressor for septic shock when fluid resuscitation fails to achieve a MAP > 65 mmHg.',
                incorrect: 'Dopamine is no longer first-line due to tachyarrhythmia risk. Dobutamine is for contractility. Epi-push is for arrest.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Potent vasoconstrictor with minimal heart rate impact.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Not as effective and has higher side-effect profile.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Used for cardiogenic shock, not primary septic shock vasopressor.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Reserved for cardiac arrest or anaphylaxis.', isCorrect: false }
                ],
                clinicalPearls: ['Always assess for extravasation; have phentolamine ready if using a peripheral line.'],
                questionTrap: { trap: 'The "Which Vasopressor" Trap', howToOvercome: 'Memorize the Surviving Sepsis Campaign guidelines: Levophed (Norepi) is King.' },
                mnemonic: { title: 'L-E-V-O', expansion: 'Leaves them dead (if late), Elevates pressure, Vasoconstriction, Oxygenation focus.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'alcohol_withdrawal_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient admitted for surgery has a history of heavy alcohol use. Forty-eight hours after admission, the patient is tremulous, agitated, and has a blood pressure of 172/104 mmHg. Which medication is the priority?',
            options: [
                { id: 'a', text: 'Lorazepam 2 mg IV push.' },
                { id: 'b', text: 'Haloperidol 5 mg IM.' },
                { id: 'c', text: 'Cloning 0.1 mg PO.' },
                { id: 'd', text: 'Phenytoin 100 mg PO.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 3, topicTags: ['Alcohol Withdrawal', 'Benzodiazepines', 'Mental Health'] },
            rationale: {
                correct: 'Benzodiazepines (e.g., Lorazepam, Chlordiazepoxide) are the gold standard for preventing seizures and Delirium Tremens (DTs) in AWS.',
                incorrect: 'Antipsychotics like Haloperidol lower the seizure threshold. Clonidine helps BP but not underlying withdrawal pathology.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Stabilizes the CNS to prevent life-threatening seizures.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Increases seizure risk—dangerously contraindicated as monotherapy.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Symptomatic for BP only.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Not effective for alcohol-induced withdrawal seizures.', isCorrect: false }
                ],
                clinicalPearls: ['The CIWA-Ar scale is the best tool for objective withdrawal monitoring.'],
                questionTrap: { trap: 'The "Agitation" Distractor', howToOvercome: 'Don\'t reach for Haloperidol for AWS agitation; BZDs are the only safe way to sedate these patients.' },
                mnemonic: { title: 'B-E-N-Z-O', expansion: 'Best for withdrawal, Elevates GABA, Notable for safety, Zeroes out tremors.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'dka_management_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with Diabetic Ketoacidosis (DKA) has a blood glucose of 240 mg/dL and is receiving IV regular insulin. Which IV fluid should the nurse anticipate administering next?',
            options: [
                { id: 'a', text: '0.9% Normal Saline' },
                { id: 'b', text: '5% Dextrose in 0.45% Normal Saline' },
                { id: 'c', text: '3% Hypertonic Saline' },
                { id: 'd', text: "Lactated Ringer's" }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['DKA', 'Insulin', 'Endocrine', 'IV Fluids'] },
            rationale: {
                correct: 'When blood glucose reaches approximately 250 mg/dL in DKA, dextrose is added to the IV fluids (e.g., D5 1/2 NS) to prevent hypoglycemia and allow for the continued administration of insulin to resolve the ketosis.',
                incorrect: '0.9% NS is used for initial volume resuscitation. Hypertonic saline is for hyponatremic crises. LR is generally avoided in DKA due to potential lactate conversion issues in the liver.',
                answerBreakdown: [
                    { label: 'A', content: 'Initial fluid of choice but switched once glucose drops to ~250.', isCorrect: false },
                    { label: 'B', content: 'Correct: Prevents rapid drop in glucose and hypoglycemia while insulin continues.', isCorrect: true },
                    { label: 'C', content: 'Inappropriate for DKA management.', isCorrect: false },
                    { label: 'D', content: 'Not first-line for DKA; isotonic saline is preferred for volume.', isCorrect: false }
                ],
                clinicalPearls: ['The goal is to close the anion gap, not just lower the sugar.'],
                questionTrap: { trap: 'The "Sugar is High" Trap', howToOvercome: 'Remember that insulin must continue until acidosis resolves, requiring dextrose to be added to fluids to avoid hypoglycemia.' },
                mnemonic: { title: 'D-K-A', expansion: 'Dextrose when sugar is Down to 250, Ketones need clearing, Acidosis must end.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'addisonian_crisis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: "A patient with a history of Addison's disease is admitted with hypotension, weakness, and confusion following a severe respiratory infection. Which laboratory finding is most expected?",
            options: [
                { id: 'a', text: 'Sodium 148 mEq/L' },
                { id: 'b', text: 'Potassium 5.8 mEq/L' },
                { id: 'c', text: 'Glucose 180 mg/dL' },
                { id: 'd', text: 'Calcium 8.2 mg/dL' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Addisonian Crisis', 'Adrenal Insufficiency', 'Electrolytes'] },
            rationale: {
                correct: 'Addisonian crisis is characterized by severe deficiency in cortisol and aldosterone, leading to hyponatremia and hyperkalemia (Potassium > 5.0).',
                incorrect: 'Hypernatremia and hyperglycemia are opposite of what occurs (hyponatremia and hypoglycemia are expected). Calcium alterations are not primary cues for Addisonian crisis.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Hyponatremia (<135) is expected.', isCorrect: false },
                    { label: 'B', content: 'Correct: Hyperkalemia is a hallmark sign of aldosterone deficiency.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Hypoglycemia is common due to cortisol deficiency.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Not a primary marker for acute adrenal crisis.', isCorrect: false }
                ],
                clinicalPearls: ['Sudden cessation of long-term steroids is the most common cause of crisis.'],
                questionTrap: { trap: 'The "Cushing\'s Confusion"', howToOvercome: "Remember Addison's = 'Adding' nothing (low everything), Cushing's = 'Cushy' (high sugar/sodium)." },
                mnemonic: { title: 'A-D-D-I', expansion: 'Adrenal Down, Decreased sodium, Increased potassium.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'tension_pneumothorax_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with a blunt chest injury develops severe respiratory distress, absent breath sounds on the left, and a trachea deviated to the right. Which intervention is the absolute priority?',
            options: [
                { id: 'a', text: 'Obtain a portable chest X-ray immediately.' },
                { id: 'b', text: 'Prepare for immediate needle decompression.' },
                { id: 'c', text: 'Administer high-flow oxygen via non-rebreather mask.' },
                { id: 'd', text: 'Auscultate heart sounds for muffled tones.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 5, topicTags: ['Tension Pneumothorax', 'Trauma', 'Needle Decompression', 'Airway'] },
            rationale: {
                correct: 'Tension pneumothorax is a clinical diagnosis. Tracheal deviation and obstructive shock require immediate needle decompression (followed by chest tube) without waiting for imaging.',
                incorrect: 'Waiting for an X-ray in a symptomatic tension pneumothorax can result in cardiac arrest. Oxygen is supportive but does not fix the underlying pressure. Auscultating heart sounds checks for tamponade, but the tracheal shift points to tension pneumothorax.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Dangerous delay—clinical diagnosis is enough for action.', isCorrect: false },
                    { label: 'B', content: 'Correct: Life-saving maneuver to release trapped air pressure.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Necessary but won\'t stop the obstructive shock.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Checking for Beck\'s triad (tamponade), not the primary fix here.', isCorrect: false }
                ],
                clinicalPearls: ['Deviation occurs AWAY from the affected side.'],
                questionTrap: { trap: 'The "Image First" Trap', howToOvercome: 'In "Tension" anything (tamponade, PTX), treat the pressure BEFORE taking the picture.' },
                mnemonic: { title: 'P-U-S-H', expansion: 'Pressure Up, Shift Heart/Trachea.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'myasthenic_crisis_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with Myasthenia Gravis is admitted with generalized muscle weakness and difficulty swallowing. Which assessment finding most clearly indicates a transition to Myasthenic Crisis?',
            options: [
                { id: 'a', text: 'Forced Vital Capacity (FVC) of 12 mL/kg' },
                { id: 'b', text: 'Generalized ptosis and diplopia' },
                { id: 'c', text: 'Heart rate of 110 bpm and diaphoresis' },
                { id: 'd', text: 'Positive Tensilon (edrophonium) test' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Myasthenia Gravis', 'Myasthenic Crisis', 'Respiratory Failure'] },
            rationale: {
                correct: 'Myasthenic crisis is defined by respiratory muscle failure. A low vital capacity (typically <15-20 mL/kg) or low negative inspiratory force indicates impending respiratory arrest and the need for intubation.',
                incorrect: 'Ptosis is a common symptom of MG but not specific to crisis. Tachycardia and diaphoresis occur but are secondary. A positive Tensilon test identifies MG/Crisis but is a diagnostic maneuver, not the assessment finding indicating the critical state itself.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Directly measures respiratory reserve and indicates need for intubation.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Standard baseline finding in MG.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Non-specific signs of stress.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Confirms the type of crisis (if symptoms improve), but FVC tells you the SEVERITY.', isCorrect: false }
                ],
                clinicalPearls: ['Follow the "20/30/40 rule": Vital capacity < 20mL/kg, NIF < -30cmH2O, or RR > 40 = Intubation.'],
                questionTrap: { trap: 'The "Diagnosis vs Priority" Trap', howToOvercome: 'When a question asks for a "clear indicator" of a life-threatening change, look for the "Airway/Breathing" data.' },
                mnemonic: { title: 'B-R-E-A-T-H-E', expansion: 'Breakdown of muscles, Respiratory risk #1, Edrophonium helps, Airway priority, Thymectomy history, Hands get weak, Ever worsening.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'guillain_barre_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with Guillain-Barré Syndrome reports "tingling" and weakness in the hips and legs that is now involving the fingertips. Which assessment is the most critical for the nurse to perform regularly?',
            options: [
                { id: 'a', text: 'Continuous pulse oximetry and serial vital capacity.' },
                { id: 'b', text: 'Hourly deep tendon reflex (DTR) monitoring.' },
                { id: 'c', text: 'Daily weight and urinary output monitoring.' },
                { id: 'd', text: 'Assessment of cranial nerves III, IV, and VI.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Guillain-Barré Syndrome', 'Respiratory Failure', 'Neuro'] },
            rationale: {
                correct: 'The most serious complication of GBS is ascending paralysis reaching the thoracic nerves and diaphragm, leading to respiratory failure. Serial vital capacities are the gold standard for monitoring.',
                incorrect: 'DTRs will be absent/absent-to-weak naturally. Weights and cranial nerves are important but not as critical as the respiratory status in the ascending phase.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Detects impending diaphragmatic paralysis before overt symptoms occur.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Valuable for diagnosis but doesn\'t track safety as well as respiration.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Secondary assessment (SIADH risk is possible but not #1).', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Cranial nerve involvement happens but respiratory arrest is the killer.', isCorrect: false }
                ],
                clinicalPearls: ['Ascending = From Ground to Brain.'],
                questionTrap: { trap: 'The "Diagnosis" Trap', howToOvercome: 'GBS questions almost always focus on "Ascending" paralysis hitting the "Diaphragm".' },
                mnemonic: { title: 'G-B-S', expansion: 'Ground to Brain Syndrome (Ascending).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'eclampsia_seizure_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient at 36 weeks gestation with known preeclampsia begins to have a tonic-clonic seizure. Which action is the absolute priority during the active seizure?',
            options: [
                { id: 'a', text: 'Administer a 4 gram IV bolus of Magnesium Sulfate.' },
                { id: 'b', text: 'Turn the patient onto their left side and ensure head safety.' },
                { id: 'c', text: 'Insert a padded tongue blade to prevent tongue biting.' },
                { id: 'd', text: 'Notify the provider to prepare for an emergency C-section.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Eclampsia', 'Seizure Precautions', 'Maternity'] },
            rationale: {
                correct: 'Safety and airway protection are the priority during any active seizure. Turning the patient to the side prevents aspiration of secretions.',
                incorrect: 'Magnesium sulfate is the drug of choice to stop/prevent further seizures but is administered AFTER the immediate safety of the airway is secured. Padded tongue blades are outdated and dangerous. Delivery is the ultimate cure, but the mother must be stabilized first.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Medication is secondary to immediate physical safety/airway.', isCorrect: false },
                    { label: 'B', content: 'Correct: Prevents aspiration and trauma during the event.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: Contraindicated; can cause dental trauma or airway obstruction.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Stabilization must occur before surgical intervention.', isCorrect: false }
                ],
                clinicalPearls: ['Positioning (Lateral) = #1 Priority in Eclamptic Seizures.'],
                questionTrap: { trap: 'The "Magnesium" Distractor', howToOvercome: 'While Magnesium is the specific treatment for Eclampsia, the "Standard Seizure Rule" (Safety/Side-lying) still applies first.' },
                mnemonic: { title: 'S-I-D-E', expansion: 'Safety, Isolate from harm, Delivery prep later, Epinephrine NOT used (Mag is).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'intussusception_recognition_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'An 8-month-old infant is brought to the clinic for intermittent episodes of inconsolable crying followed by periods of lethargy. Which finding should the nurse prioritize?',
            options: [
                { id: 'a', text: 'Stool containing red mucus and blood ("currant jelly").' },
                { id: 'b', text: 'A palpable olive-shaped mass in the epigastrum.' },
                { id: 'c', text: 'Hyperactive bowel sounds in all four quadrants.' },
                { id: 'd', text: 'Ribbon-like, foul-smelling stools.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Intussusception', 'Pediatrics', 'GI'] },
            rationale: {
                correct: 'Intussusception involves the telescoping of the bowel, leading to ischemia and the classic "currant jelly" stool (blood mixed with mucus).',
                incorrect: 'Olive-shaped mass is Pyloric Stenosis. Ribbon-like stool is Hirschsprung\'s Disease. Hyperactive sounds are non-specific.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Hallmark sign of bowel ischemia in intussusception.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Distractor for Pyloric Stenosis.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Early sounds may be hyperactive, but "jelly stool" is the pathognomonic priority.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Distractor for Hirschsprung\'s Disease.', isCorrect: false }
                ],
                clinicalPearls: ['The most common site is the ileocecal valve.'],
                questionTrap: { trap: 'The "Pediatric GI Mix-up"', howToOvercome: 'Memorize: Jelly = Intussusception, Olive = Pyloric, Ribbon = Hirschsprung.' },
                mnemonic: { title: 'J-E-L-L-Y', expansion: 'Juicy blood/mucus, Empty RLQ (Dance sign), Lump (sausage-shaped), Lead-point, Yields to air enema.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'kawasaki_aspirin_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A child is diagnosed with Kawasaki Disease and is prescribed high-dose aspirin and IVIG. The parents ask why the child needs aspirin given the risk of Reye Syndrome. What is the nurse\'s best response?',
            options: [
                { id: 'a', text: 'Aspirin is the only medication that can lower the high-grade fever.' },
                { id: 'b', text: 'It is used to prevent coronary artery aneurysms and blood clots.' },
                { id: 'c', text: 'IVIG eliminates the risk of Reye Syndrome in these patients.' },
                { id: 'd', text: 'The child will only receive one dose to avoid any toxic effects.' }
            ],
            correctOptionId: 'b',
            pedagogy: { bloomLevel: 'understand', cjmmStep: 'generateSolutions', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 4, topicTags: ['Kawasaki Disease', 'Aspirin', 'Pediatrics', 'Cardiology'] },
            rationale: {
                correct: 'Kawasaki Disease is an exception to the "no aspirin for children" rule. It is used for its anti-inflammatory and anti-platelet effects to prevent coronary artery aneurysms.',
                incorrect: 'Tylenol/Ibuprofen can lower fever. IVIG does not stop Reye risk; only avoiding viral exposure during therapy helps. Aspirin is continued for weeks (low dose) after the initial high-dose phase.',
                answerBreakdown: [
                    { label: 'A', content: 'Incorrect: Other antipyretics exist; the coronary protection is the unique reason.', isCorrect: false },
                    { label: 'B', content: 'Correct: Prevents life-threatening cardiac complications.', isCorrect: true },
                    { label: 'C', content: 'Incorrect: IVIG and Aspirin are synergistic but Reye risk remains if a virus (e.g., Varicella/Flu) is caught.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: It is a daily maintenance medication during the subacute phase.', isCorrect: false }
                ],
                clinicalPearls: ['Kawasaki is the leading cause of acquired heart disease in children.'],
                questionTrap: { trap: 'The "Aspirin Taboo"', howToOvercome: 'Remember Kawasaki is the ONLY major pediatric NCLEX topic where Aspirin is indicated and prioritized.' },
                mnemonic: { title: 'C-R-A-S-H', expansion: 'Conjunctivitis, Rash, Adenopathy, Strawberry tongue, Hands/feet swelling.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'serotonin_syndrome_recognition_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient taking Sertraline for depression is admitted with agitation, tachycardia, and diaphoresis. During the physical exam, the nurse notes hyperreflexia and spontaneous muscle clonus. Which medication is the likely culprit for this worsening status?',
            options: [
                { id: 'a', text: "St. John's Wort supplement." },
                { id: 'b', text: 'Diphenhydramine for sleep.' },
                { id: 'c', text: 'Acetaminophen for a headache.' },
                { id: 'd', text: 'Atorvastatin for cholesterol.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'prioritizeHypotheses', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 3, topicTags: ['Serotonin Syndrome', 'Mental Health', 'Pharmacology'] },
            rationale: {
                correct: 'Serotonin syndrome occurs when two or more serotonergic agents are combined. St. John\'s Wort is a potent serotonergic herbal supplement that interacts dangerously with SSRIs like Sertraline.',
                incorrect: 'Benadryl, Tylenol, and Statins do not significantly increase serotonin levels. The specific combination of hyperreflexia + clonus + agitation points directly to Serotonin Syndrome.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Well-known herbal cause of serotonin syndrome when mixed with SSRIs.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Antihistamine; may cause sedation but not serotonin syndrome.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Analgesic with no serotonergic activity.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Lipid-lowering agent; unrelated to serotonin.', isCorrect: false }
                ],
                clinicalPearls: ['Clonus (muscle rhythmic contractions) is the definitive differentiator from NMS.'],
                questionTrap: { trap: 'The "Over-the-Counter" Blind Spot', howToOvercome: "Always screen for St. John's Wort and MAOIs when SSRI therapy is mentioned." },
                mnemonic: { title: 'S-S-S', expansion: 'Sweaty (Diaphoresis), Shaking (Tremor/Clonus), Sick (Diarrhea/Agitation).' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'nms_rigidity_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient receiving Haloperidol for schizophrenia develops a temperature of 105.2°F (40.7°C), severe "lead-pipe" muscle rigidity, and labile blood pressure. Which medication dose should the nurse prepare to administer?',
            options: [
                { id: 'a', text: 'Dantrolene IV.' },
                { id: 'b', text: 'Benztropine IM.' },
                { id: 'c', text: 'Lorazepam IV.' },
                { id: 'd', text: 'Fluoxetine PO.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 4, topicTags: ['Neuroleptic Malignant Syndrome', 'Haloperidol', 'Pharmacology', 'Psychiatry'] },
            rationale: {
                correct: 'This patient is experiencing Neuroleptic Malignant Syndrome (NMS). Dantrolene is a muscle relaxant used to treat the life-threatening muscle rigidity and hyperthermia associated with NMS.',
                incorrect: 'Benztropine is for EPS (dystonia/pseudoparkinsonism), not NMS. Lorazepam helps with agitation but doesn\'t treat the cause. Fluoxetine is an SSRI and could worsen the situation if it were Serotonin Syndrome.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Direct-acting muscle relaxant that targets the NMS pathophysiology.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Used for minor tremors/rigidity in Parkinsonism, not acute NMS.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Symptomatic treatment only.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Dangerous—antidepressants are unrelated to NMS management.', isCorrect: false }
                ],
                clinicalPearls: ['NMS = Fever, Rigid, and Mental Status Changes.'],
                questionTrap: { trap: 'The "NMS vs EPS" Trap', howToOvercome: 'If there is a HIGH FEVER and "LEAD-PIPE" rigidity, it\'s NMS (use Dantrolene). If just tremors/stiffness without fever, it\'s EPS (use Benztropine).' },
                mnemonic: { title: 'F-E-V-E-R', expansion: 'Fever, Encephalopathy, Vitals unstable, Elevated CPK, Rigidity.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'aortic_dissection_bp_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with a suspected aortic dissection reports sudden "tearing" chest pain radiating to the back. The blood pressure is 198/112 mmHg. Which medication is the priority for the nurse to titrate?',
            options: [
                { id: 'a', text: 'Esmolol IV infusion.' },
                { id: 'b', text: 'Dobutamine IV infusion.' },
                { id: 'c', text: 'Heparin IV bolus.' },
                { id: 'd', text: 'Norepinephrine IV infusion.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 5, topicTags: ['Aortic Dissection', 'Blood Pressure', 'Esmolol', 'Critical Care'] },
            rationale: {
                correct: 'The absolute priority in aortic dissection is controlling heart rate and blood pressure to reduce the "shearing" force (dP/dt) on the aorta. IV beta-blockers like Esmolol or Labetalol are first-line.',
                incorrect: 'Dobutamine and Norepinephrine will increase BP and heart rate, worsening the dissection. Heparin is contraindicated in an active dissection as it can worsen bleeding.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Rapidly lowers BP and heart rate to stabilize the dissection layer.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Dangerous—increases cardiac output/force.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Lethal—anticoagulation in a tearing artery leads to exsanguination.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Dangerous—pressors increase the shearing force.', isCorrect: false }
                ],
                clinicalPearls: ['Target Heart Rate: 60-80 bpm; Target SBP: 100-120 mmHg.'],
                questionTrap: { trap: 'The "MI vs Dissection" Trap', howToOvercome: 'If the pain is "Tearing" or "Ripping" and radiates to the BACK, it\'s a dissection; prioritizing BP/HR control is more important than aspirin/nitro.' },
                mnemonic: { title: 'B-B-D', expansion: 'Beta-Blockers for Dissection.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'siadh_fluid_restriction_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with small cell lung cancer has a sodium level of 122 mEq/L and a urine specific gravity of 1.035. Which intervention should the nurse implement first?',
            options: [
                { id: 'a', text: 'Initiate a strict fluid restriction of <800 mL/day.' },
                { id: 'b', text: 'Administer a 500 mL bolus of 0.45% Normal Saline.' },
                { id: 'c', text: 'Encourage the intake of potassium-rich foods.' },
                { id: 'd', text: 'Increase the IV infusion rate of 5% Dextrose.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['SIADH', 'Hyponatremia', 'Endocrine'] },
            rationale: {
                correct: 'This patient has SIADH (Syndrome of Inappropriate Antidiuretic Hormone), likely secondary to cancer. The priority treatment for dilutional hyponatremia is fluid restriction.',
                incorrect: 'Hypotonic saline (0.45% NS) or D5W will further dilute the sodium and worsen the hyponatremia. Potassium is not the primary issue in SIADH.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: First-line management to stop the dilutional drop in sodium.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Dangerous—adds free water to an already overloaded state.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Unrelated to the sodium deficit.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Dangerous—free water will worsen cerebral edema.', isCorrect: false }
                ],
                clinicalPearls: ['Small cell lung cancer is the #1 cause of paraneoplastic SIADH.'],
                questionTrap: { trap: 'The "Low Sodium = Saline" Trap', howToOvercome: 'If the Urine Specific Gravity is HIGH (Concentrated), it\'s SIADH; you must STOP the water, not just add salt.' },
                mnemonic: { title: 'S-I-A-D-H', expansion: 'Soaked Inside, All Diuretic Hormone (Too Much), Hyponatremia.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'diabetes_insipidus_evaluation_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient following a transsphenoidal hypophysectomy has a urinary output of 600 mL over the last 2 hours. Which finding indicates the patient is responding effectively to desmopressin treatment?',
            options: [
                { id: 'a', text: 'Urine specific gravity of 1.018.' },
                { id: 'b', text: 'Serum sodium of 149 mEq/L.' },
                { id: 'c', text: 'Increased thirst and dry mucous membranes.' },
                { id: 'd', text: 'Urine output of 250 mL/hr.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'evaluate', cjmmStep: 'evaluateOutcomes', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Diabetes Insipidus', 'Desmopressin', 'Endocrine'] },
            rationale: {
                correct: 'Desmopressin (synthetic ADH) should increase urine concentration in DI. A specific gravity > 1.010 indicates that the kidneys are now concentrating urine effectively.',
                incorrect: 'High sodium (149), thirst, and high urine output (250 mL/hr) are signs of UNRESOLVED Diabetes Insipidus.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Indicates effective concentration of urine by the kidneys.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Indicates continued hypernatremia/dehydration.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Indicates continued dehydration.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Excessive polyuria indicates treatment failure.', isCorrect: false }
                ],
                clinicalPearls: ['Watch for water intoxication (hyponatremia) during desmopressin therapy.'],
                questionTrap: { trap: 'The "Goal of Treatment" Trap', howToOvercome: 'When evaluating DI treatment, look for the "Normal" values coming back (Sugar/Sodium/SpG).' },
                mnemonic: { title: 'D-I', expansion: 'Dry Inside, Diuresis Increased.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'anaphylaxis_epinephrine_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient becomes acutely dyspneic with audible wheezing and hives after an IV antibiotic dose. Which action should the nurse take first?',
            options: [
                { id: 'a', text: 'Stop the antibiotic and administer IM Epinephrine.' },
                { id: 'b', text: 'Call out for the Rapid Response Team and obtain an ECG.' },
                { id: 'c', text: 'Apply high-flow oxygen and auscultate lung sounds.' },
                { id: 'd', text: 'Administer IV Diphenhydramine per PRN orders.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Anaphylaxis', 'Epinephrine', 'Safety'] },
            rationale: {
                correct: 'The priority in anaphylaxis is to stop the allergen and administer Epinephrine immediately to reverse airway constriction and vasodilation.',
                incorrect: 'RRT and Oxygen are important but follow Epinephrine in priority. Benadryl is a secondary medication that does not treat the life-threatening airway/cardiac issues.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Removes the cause and provides the primary rescue medication.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Delays the life-saving treatment.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Supportive but doesn\'t fix the underlying allergic collapse.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Too slow and ineffective for the acute phase.', isCorrect: false }
                ],
                clinicalPearls: ['Repeat Epinephrine every 5-15 minutes if symptoms persist.'],
                questionTrap: { trap: 'The "Benadryl Bias"', howToOvercome: 'Don\'t trust "Benadryl" for airway issues. If they are wheezing/swelling, choose the "Epi" first.' },
                mnemonic: { title: 'E-P-I', expansion: 'Epinephrine is #1, Pressure restore, Intubate if needed.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'ards_refractory_hypoxemia_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with septic shock develops sudden respiratory distress. The PaO2 is 55 mmHg despite being on 100% FiO2 via a non-rebreather mask. Which condition does the nurse suspect?',
            options: [
                { id: 'a', text: 'Acute Respiratory Distress Syndrome (ARDS).' },
                { id: 'b', text: 'Chronic Obstructive Pulmonary Disease (COPD).' },
                { id: 'c', text: 'Acute Pulmonary Embolism (PE).' },
                { id: 'd', text: 'Hypovolemic Shock.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'analyzeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['ARDS', 'Respiratory Failure', 'Hypoxemia'] },
            rationale: {
                correct: 'Refractory hypoxemia (low PaO2 despite high FiO2) is a hallmark sign of ARDS, often triggered by sepsis. The alveoli are filled with fluid and debris, preventing gas exchange.',
                incorrect: 'COPD does not cause sudden refractory hypoxemia without a clear exacerbation. PE causes hypoxemia but usually correlates with V/Q mismatch and chest pain. Hypovolemic shock affects perfusion, not primary lung oxygenation efficiency like ARDS.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Refractory hypoxemia is the pathognomonic cue.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: A chronic state, not an acute refractory collapse.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: While serious, it does not typically present as "refractory" to high-flow O2 in the same way as alveolar flooding.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Circulatory issue, not a gas exchange barrier.', isCorrect: false }
                ],
                clinicalPearls: ['Look for "white-out" on the chest X-ray in ARDS cases.'],
                questionTrap: { trap: 'The "Refractory" Keyword', howToOvercome: 'If you see "100% Oxygen" but "Low Pulse Ox/PaO2", always think ARDS.' },
                mnemonic: { title: 'A-R-D-S', expansion: 'Alveolar collapse, Refractory hypoxemia, Dyspnea, Sepsis cause.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'hypocalcemia_thyroidectomy_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'Four hours after a total thyroidectomy, a patient reports "tingling in the fingertips" and some muscle twitching. Which action is most appropriate to confirm the nurse\'s suspicion?',
            options: [
                { id: 'a', text: 'Inflate a blood pressure cuff on the arm for 3 minutes.' },
                { id: 'b', text: 'Auscultate the carotid arteries for bruits.' },
                { id: 'c', text: 'Ask the patient to speak their name to check for hoarseness.' },
                { id: 'd', text: 'Perform a deep palpation of the thyroid bed.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Hypocalcemia', 'Trousseau Sign', 'Thyroidectomy'] },
            rationale: {
                correct: 'Accidental removal of the parathyroid glands during thyroidectomy leads to hypocalcemia. Trousseau sign (carpal spasm with BP cuff inflation) and Chvostek sign (facial twitch) are classic ways to confirm hypocalcemia.',
                incorrect: 'Hoarseness checks for laryngeal nerve damage. Carotid bruits check for atherosclerotic disease. Palpating the thyroid bed is for hemorrhage observation, not hypocalcemia.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Trousseau sign is a sensitive indicator of latent tetany/hypocalcemia.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Unrelated to electrolyte status.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: High priority for nerve damage, but doesn\'t address the "tingling".', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Irrelevant to hypocalcemia; may be used for hematoma but not tetany.', isCorrect: false }
                ],
                clinicalPearls: ['Have Calcium Gluconate ready after every thyroidectomy.'],
                questionTrap: { trap: 'The "Nerve vs Gland" Trap', howToOvercome: 'If the symptom is "Tingling" or "Spasms", think Calcium (Parathyroid). If the symptom is "Voice Change", think Recurrent Laryngeal Nerve.' },
                mnemonic: { title: 'C-H-E-E-K', expansion: 'Chvostek = Cheek twitch, Trousseau = Tourniquet/BP cuff.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'placenta_previa_painless_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient at 32 weeks gestation presents to the labor and delivery unit reporting bright red vaginal bleeding. She denies any pain or contractions. Which action should the nurse specifically avoid?',
            options: [
                { id: 'a', text: 'Performing a digital vaginal examination.' },
                { id: 'b', text: 'Applying a continuous fetal monitor.' },
                { id: 'c', text: 'Drawing a blood sample for a Type and Crossmatch.' },
                { id: 'd', text: 'Starting a large-bore IV line.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Safety and Infection Prevention and Control', difficulty: 4, topicTags: ['Placenta Previa', 'Vaginal Bleeding', 'Maternity', 'Safety'] },
            rationale: {
                correct: 'In suspected placenta previa (painless bright red bleeding), a digital vaginal exam is strictly contraindicated until the placenta\'s location is confirmed by ultrasound, as it can cause catastrophic hemorrhage.',
                incorrect: 'Fetal monitoring, IV access, and Type/Cross are all essential for patient stabilization and monitoring safety.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Can puncture the placenta leading to massive maternal/fetal blood loss.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Necessary to monitor fetal well-being.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Critical in case transfusion is required.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Mandatory for volume replacement if bleeding worsens.', isCorrect: false }
                ],
                clinicalPearls: ['Bright Red = Previa; Dark Red/Painful = Abruption.'],
                questionTrap: { trap: 'The "Vaginal Exam" Reflex', howToOvercome: 'Never put anything in the vagina (fingers or speculum) if the mother has third-trimester bleeding without a prior ultrasound.' },
                mnemonic: { title: 'P-R-E-V-I-A', expansion: 'Painless, Red blood, Exam (Digital) NOT allowed, Vessels in the way, IV and ultrasound priority, Avoid trauma.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'hip_fracture_bucks_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with a right hip fracture is placed in Buck\'s skin traction while awaiting surgery. Which finding requires immediate correction by the nurse?',
            options: [
                { id: 'a', text: 'The 5 lb weight is resting on the floor.' },
                { id: 'b', text: 'The patient\'s right foot is slightly externally rotated.' },
                { id: 'c', text: 'The traction boot is secured with Velcro straps.' },
                { id: 'd', text: 'A pillow is placed under the patient\'s lower right leg.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'apply', cjmmStep: 'takeAction', nclexCategory: 'Basic Care and Comfort', difficulty: 3, topicTags: ['Hip Fracture', 'Buck\'s Traction', 'Orthopedics'] },
            rationale: {
                correct: 'In skin traction, the weights must hang freely at all times. If the weight is on the floor, the traction force is lost, causing muscle spasms and pain.',
                incorrect: 'External rotation is a common finding in hip fractures. Velcro straps are standard for Buck\'s. Pillows are used for positioning as long as they don\'t interfere with the line of pull.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Weights must be free-hanging to maintain effective traction.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: This is an expected symptom of the fracture itself.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Standard equipment for skin traction.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Acceptable for pressure relief if traction pull is maintained.', isCorrect: false }
                ],
                clinicalPearls: ['Buck\'s traction is for comfort/spasm control, not for long-term alignment.'],
                questionTrap: { trap: 'The "Free Hanging" Rule', howToOvercome: 'Always check: No weights on floor, ropes on pulleys, and weights not removed without a specific provider order.' },
                mnemonic: { title: 'B-U-C-K', expansion: 'Boot, Uninterrupted pull, Comfort/Spasms, Keep weights off floor.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'hepatic_encephalopathy_lactulose_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient with cirrhosis and hepatic encephalopathy is receiving lactulose. Which outcome most accurately indicates that the medication has achieved its intended clinical effect?',
            options: [
                { id: 'a', text: 'Improvement in mental status and orientation.' },
                { id: 'b', text: 'Having 3 soft, semiformed bowel movements per day.' },
                { id: 'c', text: 'Decrease in abdominal girth and ascites.' },
                { id: 'd', text: 'Reduction in serum bilirubin levels.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'evaluate', cjmmStep: 'evaluateOutcomes', nclexCategory: 'Pharmacological and Parenteral Therapies', difficulty: 4, topicTags: ['Hepatic Encephalopathy', 'Lactulose', 'Cirrhosis'] },
            rationale: {
                correct: 'The primary goal of lactulose in hepatic encephalopathy is to reduce serum ammonia levels, which directly improves cognitive function and reverses lethargy/asterixis. Mental status improvement is the "intended clinical effect".',
                incorrect: 'Frequent bowel movements are a SIDE effect (and the mechanism), not the goal itself. Ascites is treated with diuretics (spironolactone), and bilirubin is related to the underlying liver failure, not ammonia clearance specifically.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Mental status improvement proves the ammonia-clearing goal.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: This is how it works, but not the final goal (clinical goal = neurology).', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Unrelated to lactulose therapy.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Unrelated to the specific action of lactulose.', isCorrect: false }
                ],
                clinicalPearls: ['Lactulose traps ammonia as ammonium in the gut for excretion.'],
                questionTrap: { trap: 'The "Mechanisms vs Outcomes" Trap', howToOvercome: 'If a question asks for a "clinical effect", look for the improvement in the REASON the drug was given (e.g., lethargy/confusion).' },
                mnemonic: { title: 'L-A-X', expansion: 'Leaves Ammonia eXcreted.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'post_op_hemorrhage_multipleChoice_v1',
            type: 'multipleChoice',
            stem: 'A patient is 2 hours post-abdominal surgery. Which assessment finding is the earliest indicator of internal hemorrhage and impending hypovolemic shock?',
            options: [
                { id: 'a', text: 'Heart rate of 118 bpm.' },
                { id: 'b', text: 'Blood pressure of 88/54 mmHg.' },
                { id: 'c', text: 'Urinary output of 15 mL/hr.' },
                { id: 'd', text: 'Pale, cool, and clammy skin.' }
            ],
            correctOptionId: 'a',
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Hemorrhage', 'Shock', 'Post-op Care'] },
            rationale: {
                correct: 'Tachycardia is typically the FIRST compensatory sign of decreasing volume as the body tries to maintain cardiac output. Hypotension is often a LATE sign indicating compensation failure.',
                incorrect: 'Hypotension and low urine output are critical but usually appear after the initial tachycardic response. Skin changes follow sympathetic activation which matches the heart rate increase.',
                answerBreakdown: [
                    { label: 'A', content: 'Correct: Earliest compensatory sign to maintain perfusion.', isCorrect: true },
                    { label: 'B', content: 'Incorrect: Late sign of compensatory failure.', isCorrect: false },
                    { label: 'C', content: 'Incorrect: Result of decreased renal perfusion, usually following tachycardia.', isCorrect: false },
                    { label: 'D', content: 'Incorrect: Occurs alongside tachycardia but HR is a more objective initial measurement.', isCorrect: false }
                ],
                clinicalPearls: ['Always trend the heart rate; don\'t wait for "crash" BP.'],
                questionTrap: { trap: 'The "Hypotension Bias"', howToOvercome: 'When a question asks for the "EARLIEST" sign of shock, choose Tachycardia. If it asks for "Late" or "OMINOUS", choose Hypotension.' },
                mnemonic: { title: 'F-A-S-T-E-R', expansion: 'Fast heart rate, Anxious, SBP drops (late), Thirst, External/Internal bleed, Rubbish urine output.' },
                reviewUnits: []
            },
            scoring: { method: 'dichotomous', maxPoints: 1 }
        },
        {
            id: 'rsv_bronchiolitis_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses an 8-month-old infant in the urgent care clinic. Highlight the findings that indicate the infant is experiencing significant respiratory distress.',
            passage: 'An 8-month-old infant is brought to the urgent care clinic by her father. The father reports that the child has a [\'runny nose and a cough\'] for 2 days. Today, the father noticed that the child is [\'breathing very fast and is not interested in her bottle.\'] Physical assessment reveals [subcostal and intercostal retractions]. Auscultation of the lungs reveals [bilateral expiratory wheezing and fine crackles]. The infant\'s [respiratory rate is 64 breaths per minute]. [Oxygen saturation is 91% on room air]. The child is currently [sleeping in her father\'s arms]. [Nasal flaring is noted] when the infant is disturbed.',
            correctSpanIndices: [1, 2, 3, 4, 5, 7],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Pediatrics', 'RSV', 'Respiratory'] },
            rationale: {
                correct: 'Significant respiratory distress in an infant with bronchiolitis (RSV) is marked by tachypnea (64/min), a change in mental status/effort (not interested in feeding), and compensatory mechanisms like subcostal/intercostal retractions and nasal flaring. Objective lung sounds (wheezing/crackles) and hypoxia (91%) confirm lower airway obstruction.',
                incorrect: 'A "runny nose and cough" are upper respiratory symptoms common in mild viral illnesses. "Sleeping in her father\'s arms" is a normal/comforting behavior unless the infant is unarousable (lethargic), which isn\'t definitively the case here compared to the acute work-of-breathing cues.',
                clinicalPearls: ['Infants are obligatory nose breathers; nasal congestion alone can cause distress, but retractions and flaring signify lower airway resistance.'],
                reviewUnits: [{ heading: 'Pediatric Respiratory Distress Scale', body: 'Mild: Tachypnea, mild retractions. Moderate: Nasal flaring, audible wheezing, significant retractions. Severe: Grunting, cyanosis, bradycardia, lethargy.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'preeclampsia_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse reviews the assessment findings for a client at 28 weeks gestation. Highlight the cues that indicate the patient is progressing toward severe preeclampsia.',
            passage: 'A 28-week gestation client is being evaluated in the triage unit. She was diagnosed with [gestational hypertension two weeks ago]. The client reports a [persistent headache that did not improve with acetaminophen]. She also mentions [seeing \'spots\' in front of her eyes] this morning. [Blood pressure is currently 164/104 mmHg]. The nurse notes [2+ pitting edema in the lower extremities]. [Deep tendon reflexes are 3+ bilaterally with 1 beat of clonus]. The client reports that [the baby is moving frequently today]. Urinalysis shows [3+ protein on a dipstick].',
            correctSpanIndices: [1, 2, 3, 5, 7],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['OB', 'Preeclampsia', 'Maternal-Newborn'] },
            rationale: {
                correct: 'Severe preeclampsia is characterized by end-organ involvement and blood pressure ≥160/110 mmHg. Key cues include the persistent headache, visual disturbances ("spots"), hyperreflexia/clonus (3+, 1 beat), and massive proteinuria (3+), all suggesting high risk for eclampsia (seizures).',
                incorrect: 'A history of gestational hypertension is a risk factor but not a current acute cue. Lower extremity edema is a common finding in pregnancy and not a specific diagnostic criterion for severe preeclampsia. Frequent fetal movement is a reassuring sign of fetal well-being.',
                clinicalPearls: ['Visual spots (scotoma) indicate cerebral vasospasm and an imminent risk of eclampsia.'],
                reviewUnits: [{ heading: 'Preeclampsia with Severe Features', body: 'Requires BP ≥160/110 AND one or more of: visual disturbances, headache, RUQ pain, thrombocytopenia, or renal insufficiency.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'ischemic_stroke_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A client is brought to the emergency department by a family member. Highlight the cues that are most indicative of an acute ischemic stroke.',
            passage: 'A 68-year-old male with a [history of atrial fibrillation and hypertension] is evaluated for a sudden change in status. The family member states the patient was [\'fine 30 minutes ago.\'] The nurse observes [right-sided facial drooping] when the patient tries to smile. The patient is able to follow simple commands but has [slurred, garbled speech]. When asked to hold up both arms, the [right arm drifts downward within 5 seconds]. The patient\'s [blood pressure is 172/98 mmHg]. The patient reports a history of [chronic osteoarthritis in his knees]. The patient appears [confused about his current location].',
            correctSpanIndices: [1, 2, 3, 4, 7],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 2, topicTags: ['Neuro', 'Stroke', 'Critical Care'] },
            rationale: {
                correct: 'Acute ischemic stroke cues are primarily focal neurological deficits. The sudden onset ("fine 30 minutes ago"), right-sided facial drooping, slurred/garbled speech, right-sided arm drift, and confusion are all hallmark findings of cerebral ischemia.',
                incorrect: 'A history of atrial fibrillation/hypertension are significant risk factors but not acute cues of the stroke itself. Hypertension (172/98) is common during an acute stroke (compensatory or baseline) but is not a specific focal neural finding. Osteoarthritis is an unrelated chronic skeletal condition.',
                clinicalPearls: ['Time is brain; the onset time is critical for tPA eligibility.'],
                reviewUnits: [{ heading: 'Cincinnati Prehospital Stroke Scale', body: 'Includes: 1. Facial Droop. 2. Arm Drift. 3. Abnormal Speech.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'sepsis_early_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse reviews the clinical data for a patient admitted with a urinary tract infection. Highlight the findings that most strongly suggest the patient is developing sepsis.',
            passage: 'A 75-year-old male is admitted for a [suspected UTI]. His medical history includes benign prostatic hyperplasia and COPD. The patient\'s [heart rate has increased from 82 bpm to 114 bpm]. His current [respiratory rate is 26 breaths per minute]. The latest [blood pressure is 92/58 mmHg]. The nurse notes that the patient is now [confused] and \'don\'t know where he is.\' [White blood cell count is 18.2 x 10^3/uL]. The patient\'s [oxygen saturation is 94%] on 2L of oxygen. The patient last [voided 50 mL in the past 6 hours].',
            correctSpanIndices: [1, 2, 3, 4, 5, 7],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Reduction of Risk Potential', difficulty: 4, topicTags: ['Sepsis', 'Critical Care', 'Infection'] },
            rationale: {
                correct: 'Early sepsis is marked by Systemic Inflammatory Response Syndrome (SIRS) plus suspected infection. Cardinal cues include tachycardia (114 bpm), tachypnea (26/min), hypotension (92/58), altered mental status (confusion), leukocytosis (18.2), and oliguria (50 mL/6hrs), indicating poor renal perfusion.',
                incorrect: 'A history of UTI/BPH/COPD provides context for potential infection triggers but they are not acute sepsis cues. An oxygen saturation of 94% on 2L NC is a relatively stable respiratory finding that does not definitively indicate sepsis.',
                clinicalPearls: ['Oliguria is often the earliest indicator of poor end-organ perfusion in septic shock.'],
                reviewUnits: [{ heading: 'Sepsis Identification', body: '1. Source of infection. 2. qSOFA (RR ≥22, confusion, SBP ≤100). 3. Evidence of organ dysfunction.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'dka_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse is assessing a client with type 1 diabetes mellitus who was brought to the emergency department by a family member. Highlight the assessment findings that are most consistent with diabetic ketoacidosis (DKA).',
            passage: 'The client is a [22-year-old with type 1 diabetes mellitus] who presents with a [2-day history of illness]. The client reports [nausea and being unable to keep fluids down]. Upon assessment, the nurse notes the client is [lethargic] and [responds slowly] to verbal commands. The client\'s [skin is warm and dry with poor turgor]. The breath has a [distinct fruity odor], and respirations are [deep and rapid] at a rate of 32/min. The client reports [abdominal pain] rated as 6/10. A fingerstick glucose reading is [512 mg/dL]. Blood pressure is [92/58 mmHg], and the heart rate is [118 bpm].',
            correctSpanIndices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['DKA', 'Diabetes Mellitus', 'Endocrine'] },
            rationale: {
                correct: 'All highlighted cues are classic indicators of DKA. Nausea/vomiting and inability to tolerate fluids lead to dehydration. Lethargy indicates metabolic acidosis affecting CNS. Warm/dry skin and poor turgor signify severe dehydration. Fruity breath (acetone) and Kussmaul respirations (deep/rapid) are compensatory mechanisms for metabolic acidosis. Abdominal pain is common in DKA. Hyperglycemia (>250), hypotension, and tachycardia are hallmark signs of fluid volume deficit and metabolic derangement in DKA.',
                incorrect: 'Non-highlighted text provides context about the client\'s history and age, which are not specific diagnostic cues in themselves but support the clinical picture.',
                clinicalPearls: ['In DKA, the priority is fluid resuscitation followed by insulin administration. Potassium levels must be monitored closely as insulin will shift potassium back into the cells.'],
                reviewUnits: [{ heading: 'DKA Assessment', body: 'Look for the triad of hyperglycemia, ketosis, and metabolic acidosis. Physical signs include Kussmaul breathing and \'fruity\' breath.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 9 }
        },
        {
            id: 'hhs_recognition_highlight_v1',
            type: 'highlight',
            stem: 'An 82-year-old client with type 2 diabetes mellitus and a recent urinary tract infection is admitted to the medical unit. Highlight the assessment findings that indicate hyperglycemic hyperosmolar state (HHS).',
            passage: 'The [client is an elderly male] with a history of [type 2 diabetes and dementia]. The caregiver reports the client has been [increasingly confused] over the last 24 hours. Assessment reveals [dry mucous membranes] and [sunken eyes]. The skin is [flushed and hot], but there is [no odor to the breath]. Vital signs show a blood pressure of [88/44 mmHg] and a heart rate of [124 bpm]. Laboratory results show a serum [glucose of 1,150 mg/dL], [absent serum ketones], and a calculated [serum osmolality of 350 mOsm/kg]. The client\'s [urine output is 15 mL/hr].',
            correctSpanIndices: [2, 3, 4, 5, 7, 8, 9, 10, 11, 12],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['HHS', 'Diabetes Mellitus', 'Endocrine'] },
            rationale: {
                correct: 'HHS is characterized by extreme hyperglycemia (>600), hyperosmolality (>320), and severe dehydration without significant ketoacidosis. Confusion, dry membranes, and sunken eyes indicate profound dehydration. Hypotension and tachycardia (88/44, 124) indicate hypovolemic shock. High glucose (1,150) and osmolality (350) are diagnostic. Absent ketones and lack of fruity breath distinguish HHS from DKA. Low urine output (15 mL/hr) indicates impaired renal perfusion from dehydration.',
                incorrect: 'Contextual information like age and dementia are risk factors for HHS but not acute diagnostic cues for the condition itself.',
                clinicalPearls: ['HHS requires much more aggressive fluid resuscitation than DKA due to the higher degree of water loss (often 6-10 liters).'],
                reviewUnits: [{ heading: 'HHS vs. DKA', body: 'HHS occurs in Type 2, features higher glucose levels (>600), extreme dehydration, and higher mortality rate compared to DKA.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'pheochromocytoma_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A client is admitted to the hospital for evaluation of unexplained hypertension. Highlight the clinical findings that would lead the nurse to suspect pheochromocytoma.',
            passage: 'A [45-year-old client] reports episodes of [severe, pounding headache] that occur several times a week. During these episodes, the client experiences [profuse diaphoresis] and [palpitations]. The nurse observes the client is [visibly tremulous] and [extremely anxious]. Physical assessment shows a [blood pressure of 210/115 mmHg] and a [heart rate of 128 bpm]. The client reports [chest pain] and [pallor of the face]. A review of home medications shows [nothing except occasional ibuprofen].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Pheochromocytoma', 'Endocrine', 'Adrenal Gland'] },
            rationale: {
                correct: 'Pheochromocytoma is a catecholamine-secreting tumor of the adrenal medulla. The classic triad includes headache, diaphoresis, and palpitations. Severe hypertension (210/115) and tachycardia (128) are common. Tremors, anxiety, chest pain, and pallor are also reflective of excess epinephrine and norepinephrine. The mention of taking no other medications (like decongestants or cocaine) helps rule out other causes of sympathetic surge.',
                incorrect: 'The client\'s age and the fact that they are taking ibuprofen are not specific cues for pheochromocytoma.',
                clinicalPearls: ['Avoid palpating the abdomen of a client with suspected pheochromocytoma, as this can trigger a massive release of catecholamines and cause a hypertensive crisis.'],
                reviewUnits: [{ heading: 'Pheochromocytoma Triad', body: 'Pounding Headache, Profuse Sweating, and Palpitations. Often accompanied by episodic high blood pressure.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 9 }
        },
        {
            id: 'cushings_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse is evaluating a client for hypercortisolism. Highlight the physical assessment findings that are classic indicators of Cushing\'s syndrome.',
            passage: 'The [client is a 38-year-old female] who has been [taking high-dose prednisone] for lupus. Upon assessment, the nurse notes [rounding of the facial profile] and a [prominent fat pad on the upper back]. The client\'s [abdomen is protuberant] with [wide, purple striae]. The [skin on the arms is thin] with multiple [ecchymoses]. Vital signs show [blood pressure is 158/94 mmHg]. The client notes [significant muscle weakness] and [excessive facial hair growth]. A random [blood glucose is 142 mg/dL].',
            correctSpanIndices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Cushing\'s Syndrome', 'Endocrine', 'Adrenal Glands'] },
            rationale: {
                correct: 'Cushing\'s syndrome results from excessive cortisol. Classic signs include \'moon face\' (facial rounding), \'buffalo hump\' (fat pad on upper back), truncal obesity (protuberant abdomen), purple striae, thin/fragile skin, ecchymoses (easy bruising), hypertension (from sodium/water retention), muscle wasting/weakness (especially in extremities), hirsutism (excessive hair), and hyperglycemia.',
                incorrect: 'The age, sex, and history of lupus/prednisone use are relevant context/causes but are not themselves physical assessment findings characteristic of the syndrome.',
                clinicalPearls: ['Iatrogenic Cushing\'s (from corticosteroid use) is the most common cause. When symptoms occur from an ACTH-secreting pituitary tumor, it is called Cushing\'s Disease.'],
                reviewUnits: [{ heading: 'Cushing\'s Assessment', body: 'Remember \'STRESSED\': Skin fragile, Truncal obesity, Round face/Reproductive issues, Ecchymosis/Elevated BP, Striae, Sugar high, Excessive hair, Dorsocervical fat pad (Buffalo hump).' }]
            },
            scoring: { method: 'polytomous', maxPoints: 10 }
        },
        {
            id: 'addisonian_crisis_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A client with a history of Addison\'s disease is admitted to the medical unit following a severe gastrointestinal illness. Highlight the findings that indicate the client is experiencing an Addisonian crisis.',
            passage: 'The client reports a [3-day history of vomiting and diarrhea]. The nurse finds the client [severely dehydrated] and [obtunded]. Vital signs reveal a [blood pressure of 74/42 mmHg] and [heart rate of 122 bpm]. The client is [febrile at 101.4°F]. Lab results show [serum sodium of 128 mEq/L], [serum potassium of 6.2 mEq/L], and [serum glucose of 58 mg/dL]. The nurse notes [hyperpigmentation of the skin] and [syncopal episodes] during position changes. The client is [guarded during the exam].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Addisonian Crisis', 'Endocrine', 'Adrenal Glands'] },
            rationale: {
                correct: 'Addisonian crisis is a life-threatening emergency caused by acute adrenal insufficiency. Dehydration and mental status changes (obtunded) are common. Severe hypotension (74/42) and tachycardia are signs of shock. Fever can occur during crisis even without infection. Classic electrolyte patterns include hyponatremia (128), hyperkalemia (6.2), and hypoglycemia (58). Acute pain in the back/legs is a known but often overlooked sign of crisis. Hyperpigmentation (bronzing) is a sign of chronic Addison\'s while syncope indicates orthostatic hypotension/shock.',
                incorrect: 'The history of vomiting and diarrhea are the triggers but not the findings indicating the crisis itself.',
                clinicalPearls: ['Treatment of Addisonian crisis involves immediate administration of IV hydrocortisone and large volumes of normal saline with dextrose.'],
                reviewUnits: [{ heading: 'Addisonian Crisis', body: 'Sudden profound weakness, severe hypotension, hyperkalemia, hyponatremia, hypoglycemia, and potential shock.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'myasthenia_gravis_exacerbation_highlight_v1',
            type: 'highlight',
            stem: 'A client with myasthenia gravis is admitted after developing an upper respiratory infection. Highlight the assessment findings that indicate a worsening of the neuromuscular condition.',
            passage: 'The client has an [upper respiratory infection]. The nurse notes [bilateral ptosis] and a [mask-like facial expression]. The client\'s [speech is slurred and nasal]. When drinking, the client [coughs and has difficulty swallowing]. The client is [using accessory muscles to breathe] and has a [weak, nonproductive cough]. Physical assessment shows [proximal muscle weakness] that [worsens with repetitive movement]. The [vital capacity is 12 mL/kg]. The client reports [double vision] which is [more pronounced in the evening].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Myasthenia Gravis', 'Neurological'] },
            rationale: {
                correct: 'Myasthenia Gravis (MG) involves weakness of voluntary muscles. Ptosis (drooping eyes), mask-like face, and slurred/nasal speech indicate cranial nerve involvement. Dysphagia (difficulty swallowing) and coughing indicate aspiration risk. Accessory muscle use and low vital capacity (normal is >15-20 mL/kg) signal impending myasthenic crisis and respiratory failure. Proximal weakness that worsens with use is the hallmark of MG. Diplopia (double vision) and fatigue that worsens throughout the day are classic symptoms.',
                incorrect: 'The trigger (respiratory infection) is not an assessment finding of MG itself.',
                clinicalPearls: ['The Tensilon test (edrophonium) can differentiate between myasthenic crisis (improves) and cholinergic crisis (worsens). Atropine should be available.'],
                reviewUnits: [{ heading: 'Myasthenia Gravis Symptoms', body: 'Look for Eyelid drooping (ptosis), Double vision (diplopia), Difficulty chewing/swallowing, and generalized weakness that increases during periods of activity.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'guillain_barre_progression_highlight_v1',
            type: 'highlight',
            stem: 'A client presents with symptoms that began 3 days after a viral illness. Highlight the clinical findings that are most characteristic of Guillain-Barré Syndrome (GBS).',
            passage: 'A [32-year-old client] reports status [3 days after a viral illness]. The client has [paresthesia in the feet] followed by [weakness that began in the legs] and [has moved up to the hips]. The nurse notes [absent deep tendon reflexes]. The client has [unsteady gait and poor balance]. The client reports [deep muscle aching]. The client has [difficulty clearing secretions] and [shallow respirations]. Vital signs show [labile blood pressure] and [tachycardia]. The client reports [loss of bladder control].',
            correctSpanIndices: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Guillain-Barré Syndrome', 'Neurological'] },
            rationale: {
                correct: 'GBS is an acute, inflammatory polyneuropathy. The hallmark is ascending paralysis (feet → legs → hips). Paresthesia (tingling) often precedes weakness. Areflexia (absent DTRs) is a required diagnostic feature. Deep muscle pain is common. Respiratory involvement (shallow breathing, difficulty with secretions) is the most critical complication. Autonomic dysfunction (labile BP, tachycardia) and bowel/bladder issues are also characteristic as the syndrome progresses.',
                incorrect: 'The viral illness is a trigger but not a characteristic finding of the syndrome itself.',
                clinicalPearls: ['The most important monitoring for a GBS client is for respiratory failure using incentive spirometry or vital capacity measurements.'],
                reviewUnits: [{ heading: 'GBS Assessment', body: 'Look for ascending, symmetrical weakness, areflexia, and potential respiratory or autonomic involvement.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'ms_exacerbation_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A client with multiple sclerosis (MS) is visiting the neurology clinic. Highlight the cues that indicate the client is experiencing an acute exacerbation of the disease.',
            passage: 'The client is [visiting the neurology clinic]. The client reports [blurring of vision] and [pain with eye movement]. The nurse notes [scanning speech] and an [intentional tremor]. The [gait is ataxic] and they report [extreme, disabling fatigue] despite [getting 8 hours of sleep]. The client reports a [shock-like sensation down the spine] when flexing the neck. Physical exam reveals [hyperreflexia] and a [positive Babinski sign]. The client has [new-onset urinary urgency].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Multiple Sclerosis', 'Neurological'] },
            rationale: {
                correct: 'MS involves demyelination of the CNS. Optic neuritis (blurred vision/eye pain) is a common exacerbation symptom. Lhermitte\'s sign is the shock-like sensation on neck flexion. The Charcot Triad includes scanning speech, intentional tremor, and nystagmus (though nystagmus wasn\'t mentioned here). Ataxic gait, fatigue, hyperreflexia, and positive Babinski (upper motor neuron signs) are common. Bladder dysfunction (urgency/incontinence) frequently occurs during flare-ups.',
                incorrect: 'The fact that the client slept 8 hours is background information to qualify the \'disabling\' nature of the fatigue.',
                clinicalPearls: ['Fatigue in MS is often worsened by heat (Uhthoff\'s phenomenon). Clients should be advised to avoid hot baths or excessive sun exposure.'],
                reviewUnits: [{ heading: 'MS Symptoms', body: 'Visual disturbances, sensory changes, motor weakness, cerebellar symptoms (ataxia/tremors), and bowel/bladder dysfunction.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'parkinsons_autonomic_highlight_v1',
            type: 'highlight',
            stem: 'The nurse is assessing a client with advanced Parkinson\'s disease. Highlight the findings that indicate autonomic nervous system involvement.',
            passage: 'A 74-year-old client with Parkinson\'s disease is being evaluated. The client exhibits a [shuffling gait] and a [pill-rolling tremor] at rest. The caregiver reports the client often becomes [lightheaded when standing] from a seated position. The nurse observes that the client\'s [skin is extremely oily and greasy] (seborrhea). The client reports [significant constipation] and having a bowel movement only twice a week. Assessment reveals [excessive salivation and drooling] (sialorrhea). The client also mentions [difficulty with bladder emptying] and [profuse sweating] without exertion. During the meal, the client [coughs frequently] and [requires a long time to chew and swallow].',
            correctSpanIndices: [2, 3, 4, 5, 6, 7, 8, 9],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Parkinson\'s Disease', 'Neurological', 'Autonomic Nervous System'] },
            rationale: {
                correct: 'Autonomic nervous system (ANS) involvement in advanced Parkinson\'s disease manifest as orthostatic hypotension (lightheadedness on standing), oily skin (seborrheic dermatitis), significant constipation (decreased GI motility), and sialorrhea (drooling/excessive salivation). Urinary retention (difficulty with bladder emptying), profuse sweating (hyperhidrosis), and dysphagia (coughing while eating, slow swallowing) are also indicative of autonomic dysfunction.',
                incorrect: 'A shuffling gait and pill-rolling tremors are cardinal motor signs of Parkinson\'s disease resulting from dopamine depletion in the substantia nigra, not autonomic dysfunction.',
                clinicalPearls: ['Autonomic dysfunction in Parkinson\'s is often as disabling as the motor symptoms and significantly increases the risk for falls and aspiration pneumonia.'],
                reviewUnits: [{ heading: 'Non-Motor Parkinson\'s Signs', body: 'Autonomic: Orthostasis, Constipation, Bladder issues, Drooling. Cognitive: Dementia, Bradyphrenia. Mood: Depression, Anxiety.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 8 }
        },
        {
            id: 'als_respiratory_highlight_v1',
            type: 'highlight',
            stem: 'A client with amyotrophic lateral sclerosis (ALS) is admitted with a suspected respiratory infection. Highlight the cues that indicate worsening disease progression and respiratory compromise.',
            passage: 'A 58-year-old client with a 2nd-year history of ALS is being assessed. The nurse notes [progressive weakness in the arms and legs] and [muscle wasting] in the hands. The client has [fasciculations] (muscle twitching) visible in the tongue and shoulders. The client reports [difficulty speaking] and their [voice is hoarse and weak]. During the assessment, the client has [difficulty managing oral secretions] and uses a [weak, ineffective cough]. The nurse observes [shallow chest expansion] and [accessory muscle use] during breathing. The client reports [trouble sleeping] while lying flat and [morning headaches]. An [arterial blood gas shows a PaCO2 of 52 mmHg].',
            correctSpanIndices: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['ALS', 'Neurological', 'Respiratory'] },
            rationale: {
                correct: 'Worsened disease progression and respiratory compromise in ALS are indicated by bulbar symptoms like dysarthria (difficulty speaking), a hoarse/weak voice, and poor management of oral secretions. Respiratory muscle weakness is evidenced by an ineffective cough, shallow chest expansion, and accessory muscle use. Orthopnea (trouble sleeping flat) and morning headaches are signs of nocturnal hypercapnic respiratory failure, confirmed by a PaCO2 of 52 mmHg.',
                incorrect: 'While progressive limb weakness, muscle wasting, and fasciculations are hallmark signs of ALS, they represent chronic neuromuscular decline rather than the acute respiratory compromise specified in the stem.',
                clinicalPearls: ['Respiratory failure is the primary cause of death in ALS; monitoring vital capacity and nocturnal hypoventilation is essential for timely intervention.'],
                reviewUnits: [{ heading: 'ALS Respiratory Compromise', body: 'Key cues: Dysphagia, weak cough, orthopnea, morning headaches, and elevated PaCO2.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 9 }
        },
        {
            id: 'fat_embolism_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A 19-year-old client with a fractured femur is being monitored 24 hours post-injury. Highlight the clinical findings that would lead the nurse to suspect fat embolism syndrome (FES).',
            passage: 'The [19-year-old client] with a [femur fracture] is being monitored. The nurse notes the client is [suddenly restless and agitated]. Vital signs show a [heart rate of 128 bpm] and [respiratory rate of 34/min]. The [oxygen saturation is 89%]. Upon assessment, the nurse observes [fine, pinpoint spots] across the [chest and neck]. The client reports a [feeling of impending doom]. Auscultation reveals [fine crackles] in the bases. The client is [increasingly confused].',
            correctSpanIndices: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Fat Embolism Syndrome', 'Musculoskeletal', 'Emergency'] },
            rationale: {
                correct: 'Fat Embolism Syndrome (FES) typically occurs 24-72 hours after long bone fractures. The classic triad includes Respiratory distress (tachycardia, tachypnea, low O2, crackles), Neurological dysfunction (restlessness, agitation, confusion), and Petechial rash (pinpoint red-purple spots on chest/neck). A feeling of impending doom is common in embolic events. Petechiae are a late but highly specific sign of FES.',
                incorrect: 'The fact that the client is in skeletal traction is context but not a finding of FES.',
                clinicalPearls: ['Early stabilization of long bone fractures is the most important measure to prevent fat embolism. Oxygen and IV fluids are the priority treatments.'],
                reviewUnits: [{ heading: 'Fat Embolism Triad', body: '1. Respiratory Changes (hypoxia/tachypnea). 2. Neurological Changes (confusion/restlessness). 3. Petechial Rash (chest/neck/axilla).' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'compartment_syndrome_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A client with a crush injury to the lower leg is being monitored for complications. Highlight the clinical findings that are early and progressive signs of compartment syndrome.',
            passage: 'A [28-year-old client] with a [tibia fracture and cast] is assessed. The client reports [intense, deep-seated pain] that [is not relieved by morphine]. The pain [increases with passive extension] of the toes. The [lower leg is tense] with [skin that is shiny and taut]. The client reports [numbness and tingling]. Upon palpation, the [pedal pulse is present but weak]. The client is [unable to wiggle their toes]. The [toes appear pale and cool].',
            correctSpanIndices: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Compartment Syndrome', 'Musculoskeletal', 'Emergency'] },
            rationale: {
                correct: 'Compartment syndrome is a surgical emergency. The 6 Ps are: Pain (out of proportion to injury, distal to injury), Pressure (tense/edematous limb), Paresthesia (early sign), Pallor, Paralysis (late sign), and Pulselessness (very late sign). Pain with passive stretch is a highly sensitive early indicator. The fact that pain is not relieved by opioids is a major red flag. Paresthesia along a nerve distribution (between 1st/2nd toes) indicates nerve compression.',
                incorrect: 'The client\'s age and type of injury are context, not acute findings of the syndrome.',
                clinicalPearls: ['Never elevate a limb with suspected compartment syndrome, as this decreases arterial perfusion. The limb should be kept at heart level.'],
                reviewUnits: [{ heading: 'The 6 Ps of Compartment Syndrome', body: 'Pain (unrelieved/passive stretch), Paresthesia, Pressure, Pallor, Paralysis, Pulselessness.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 12 }
        },
        {
            id: 'rhabdomyolysis_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A 44-year-old client was found lying on the floor for an unknown duration following a collapse. Highlight the clinical and laboratory findings that indicate rhabdomyolysis.',
            passage: 'A [44-year-old client] was found after a collapse. The nurse notes [generalized muscle pain] in the thighs. The [skin is intact]. There is [visible edema] in the legs. The client [has not voided] since admission. Urine obtained is [dark, tea-colored]. Laboratory results show [creatine kinase of 45,000 U/L], [potassium of 5.8 mEq/L], and [creatinine of 2.4 mg/dL]. The [serum myoglobin is elevated]. The client exhibits [EKG changes of hyperkalemia].',
            correctSpanIndices: [1, 3, 4, 5, 6, 7, 8, 9, 10],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Rhabdomyolysis', 'Musculoskeletal', 'Renal'] },
            rationale: {
                correct: 'Rhabdomyolysis is the breakdown of muscle tissue that releases myoglobin into the blood. The classic triad is muscle pain, weakness, and dark urine. \'Tea-colored\' or \'cola-colored\' urine is due to myoglobinuria. Extreme elevation of CK (>5 times normal) is diagnostic. Myoglobin is toxic to renal tubules, leading to acute kidney injury (elevated creatinine, oliguria). Intracellular contents like potassium are also released, leading to hyperkalemia and associated EKG changes (e.g., peaked T waves).',
                incorrect: 'The fact that the skin is intact is a negative finding (helpful to rule out external trauma but not a sign of rhabdo). The age and history of collapse are risk factors/context.',
                clinicalPearls: ['The priority treatment for rhabdomyolysis is aggressive IV fluid resuscitation (usually 0.9% NS) to maintain a high urine output (200-300 mL/hr) and \'flush\' the myoglobin through the kidneys.'],
                reviewUnits: [{ heading: 'Rhabdomyolysis Triad', body: 'Muscle pain, weakness, and dark (tea-colored) urine. Watch for AKI and hyperkalemia.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 10 }
        },
        {
            id: 'glomerulonephritis_recognition_highlight_v1',
            type: 'highlight',
            stem: 'An 8-year-old child is brought to the clinic 2 weeks after recovering from a \'sore throat.\' Highlight the assessment findings that are consistent with acute post-streptococcal glomerulonephritis (APSGN).',
            passage: 'The [8-year-old child] is [recovering from a sore throat]. The parent reports [cloudy, tea-colored urine]. The nurse notes [periorbital edema]. The [blood pressure is 142/96 mmHg]. The child is [lethargic] and has a [headache]. The [abdomen is soft] with [bilateral 1+ pretibial edema]. Lab results show [proteinuria], [visible hematuria], and [decreased GFR]. The [ASO titer is positive]. There is a [weight increase of 1.5 kg] over 3 days.',
            correctSpanIndices: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Glomerulonephritis', 'Renal', 'Pediatrics'] },
            rationale: {
                correct: 'APSGN typically follows a strep infection by 1-2 weeks. Cues include \'smoky\' or tea-colored urine (hematuria), periorbital edema (often the first sign), hypertension (from fluid retention), and oliguria. Symptoms like lethargy, headache, and abdominal distension result from fluid volume excess and potential hypertensive encephalopathy. Laboratory markers include proteinuria, decreased GFR, and evidence of previous strep infection (positive ASO titer). Rapid weight gain also indicates edema/fluid retention.',
                incorrect: 'The child\'s age and the history of a sore throat are contextual causes but not acute assessment findings of the condition.',
                clinicalPearls: ['The focus of care is on managing fluid volume and hypertension. In severe cases, restrictions on sodium and water are necessary.'],
                reviewUnits: [{ heading: 'APSGN Assessment', body: 'Look for tea-colored urine, periorbital edema, hypertension, and recent history of strep infection.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 12 }
        },
        {
            id: 'peritonitis_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A client with a history of peptic ulcer disease presents with sudden, severe abdominal pain. Highlight the clinical findings that indicate peritonitis.',
            passage: 'A [52-year-old client] has [sudden, severe abdominal pain]. The client is [lying very still] with [knees flexed]. The [abdomen is distended] and [appears board-like and rigid]. There is [rebound tenderness]. Vital signs reveal a [temperature of 102.2°F], [heart rate of 124 bpm], and [blood pressure of 96/54 mmHg]. The client is [breathing shallowly] and has [absent bowel sounds]. The [skin is warm and dry]. The client has [nausea and vomiting].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Peritonitis', 'Gastrointestinal', 'Emergency'] },
            rationale: {
                correct: 'Peritonitis is an inflammation of the peritoneum, often due to organ perforation. Classic signs include a \'board-like\' rigid abdomen (from involuntary muscle guarding), lying still (movement exacerbates pain), and rebound tenderness. Systemic signs include fever, tachycardia, and hypotension (indicating potential septic shock). Absent bowel sounds (paralytic ileus) and shallow breathing (to avoid abdominal movement) are common. Nausea/vomiting and abdominal distension are also key cues.',
                incorrect: 'The client\'s age and history of peptic ulcer disease are contextual but not findings indicating acute peritonitis.',
                clinicalPearls: ['Peritonitis is a surgical emergency. The client should be kept NPO, and IV fluids and broad-spectrum antibiotics should be started immediately.'],
                reviewUnits: [{ heading: 'Peritonitis Signs', body: 'Rigid board-like abdomen, rebound tenderness, absent bowel sounds, fever, and tachycardia.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'intussusception_recognition_highlight_v1',
            type: 'highlight',
            stem: 'An 8-month-old infant is brought to the emergency department. Highlight the clinical findings that are classic indicators of intussusception.',
            passage: 'The [8-month-old infant] has [sudden episodes of crying] where they [draw knees up to the chest]. The infant is [lethargic and listless] between episodes. The infant is [currently being fed]. There are [episodes of bilious vomiting]. The nurse finds a [sausage-shaped mass in the RUQ]. The stool is [dark red and jelly-like]. The [abdomen is slightly distended]. [Heart rate is 162 bpm] and the [skin is pale and cool].',
            correctSpanIndices: [1, 2, 3, 5, 6, 7, 8, 9, 10],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Intussusception', 'Gastrointestinal', 'Pediatrics'] },
            rationale: {
                correct: 'Intussusception is the telescoping of one part of the intestine into another. Classic cues include sudden, episodic abdominal pain (evidenced by knees-to-chest crying), \'currant jelly\' stools (blood/mucus), and a sausage-shaped abdominal mass. Bilious vomiting, lethargy between episodes, abdominal tenderness, and signs of shock (tachycardia, pale/cool skin) are also characteristic of the condition and potential bowel ischemia or perforation.',
                incorrect: 'The fact that the infant\'s heart rate is 162 is a finding (item 9 in span but indexed as 9 if we count properly). Wait, I missed indexing one. Let\'s re-verify indices.',
                clinicalPearls: ['The diagnostic and often therapeutic intervention for intussusception is an air or saline enema. If the child passes a normal brown stool, it may indicate spontaneous reduction of the intussusception and should be reported immediately.'],
                reviewUnits: [{ heading: 'Intussusception Triad', body: 'Abdominal pain, \'Currant jelly\' stools, and Sausage-shaped abdominal mass.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 10 }
        },
        {
            id: 'hirschsprung_recognition_highlight_v1',
            type: 'highlight',
            stem: 'An infant is being evaluated for chronic constipation. Highlight the findings that would lead the nurse to suspect Hirschsprung disease (congenital aganglionic megacolon).',
            passage: 'A [3-month-old infant] with failure to thrive is assessed. The infant [failed to pass meconium within 48 hours] of birth. There is [chronic constipation] and [ribbon-like stools]. The nurse notes [marked abdominal distension]. A digital exam shows [lack of stool in the rectum] followed by a [sudden blast of liquid stool] upon withdrawal. The infant is [reluctant to feed]. The [infant\'s temperature is 98.6°F]. There is [vomiting of green, bile-stained material].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 9],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Hirschsprung Disease', 'Gastrointestinal', 'Pediatrics'] },
            rationale: {
                correct: 'Hirschsprung disease is the absence of ganglion cells in the colon. Classic cues include failure to pass meconium (80% of cases), ribbon-like stools, abdominal distension, and bile-stained vomiting. The \'blast\' sign (sudden expulsion of gas and liquid stool after digital exam) is very characteristic. Growth failure and visible peristalsis are also consistent with chronic intestinal obstruction.',
                incorrect: 'The age and history of failure to thrive are context but not the specific diagnostic cues for Hirschsprung.',
                clinicalPearls: ['The gold standard for diagnosis is a rectal biopsy showing the absence of ganglion cells. Treatment is typically a surgical \'pull-through\' procedure.'],
                reviewUnits: [{ heading: 'Hirschsprung Assessment', body: 'Look for delayed meconium passage, ribbon-like stools, and abdominal distension.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'cystic_fibrosis_malabsorption_highlight_v1',
            type: 'highlight',
            stem: 'A child with cystic fibrosis is visiting the clinic for a growth assessment. Highlight the findings that indicate fat malabsorption and inadequate pancreatic enzyme replacement.',
            passage: 'The [4-year-old child] with CF is assessed. The parent reports [large, greasy, foul-smelling stools]. The [stools are difficult to flush]. The child\'s [weight is in the 5th percentile]. The nurse notes [digital clubbing] and [thin, wasted extremities] with a [protuberant abdomen]. The [skin is dry and flaky] with [easy bruising]. The [lung sounds are clear]. The child has [low levels of fat-soluble vitamins].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8, 10],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Cystic Fibrosis', 'Gastrointestinal', 'Pediatrics'] },
            rationale: {
                correct: 'Pancreatic insufficiency in CF leads to fat and protein malabsorption. Steatorrhea (oily, foul-smelling stools) is the hallmark. Stools that float and are hard to flush indicate high fat content. Failure to thrive (low weight percentile) and muscle wasting despite high appetite are key signs. Protuberant abdomen (from gas/bulk) and deficiencies in fat-soluble vitamins (causing dry skin and bruising/Vitamin K) are classic GI/nutritional cues. Digital clubbing is common in CF but primarily reflects chronic hypoxia from lung involvement.',
                incorrect: 'The age and specific percentage of percentile are context, while the \'5th percentile\' and its relation to appetite are the cues.',
                clinicalPearls: ['Pancreatic enzymes must be taken with every meal and snack. The dose is adjusted based on the number and consistency of stools (aiming for 1-2 formed stools per day).'],
                reviewUnits: [{ heading: 'CF GI Assessment', body: 'Look for steatorrhea, failure to thrive, protuberant abdomen, and fat-soluble vitamin deficiencies.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 12 }
        },
        {
            id: 'tet_spell_recognition_highlight_v1',
            type: 'highlight',
            stem: 'An infant with Tetralogy of Fallot is admitted to the pediatric unit. Highlight the findings that indicate a hypercyanotic (\'Tet\') spell.',
            passage: 'A [4-month-old infant] is being fed when they [start crying inconsolably]. Assessment shows [deepening cyanosis] of the lips. The [respiratory rate is 68/min]. The infant is [irritable] and then [becomes limp and unresponsive]. Analysis shows a [systolic murmur that has decreased in intensity]. The infant [spontaneously pulls knees to chest]. The [oxygen saturation is 62%]. The [pedal pulses are palpable].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Tetralogy of Fallot', 'Cardiovascular', 'Pediatrics'] },
            rationale: {
                correct: 'Hypercyanotic spells (Tet spells) occur in Tetralogy of Fallot due to an acute decrease in pulmonary blood flow. Cues include sudden inconsolable crying/irritability, worsening cyanosis (blue spells), tachypnea (rapid breathing), and potential loss of consciousness/lethargy if the hypoxia is severe. Interestingly, the murmur often softens or disappears during a spell as blood bypasses the pulmonary valve entirely. The knee-chest position is a compensatory maneuver that increases systemic vascular resistance and forces more blood into the lungs.',
                incorrect: 'The age of the infant and the fact they are being fed are triggers or context, not assessment findings of the spell itself.',
                clinicalPearls: ['The immediate nursing action for a Tet spell is placing the infant in the knee-chest position, followed by oxygen, morphine, and IV fluids.'],
                reviewUnits: [{ heading: 'Tet Spell Management', body: '1. Knee-chest position. 2. 100% Oxygen. 3. Morphine. 4. IV Fluids.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 9 }
        },
        {
            id: 'coarctation_recognition_highlight_v1',
            type: 'highlight',
            stem: 'A newborn is being evaluated for a suspected congenital heart defect. Highlight the findings that are characteristic of coarctation of the aorta.',
            passage: 'The [nurse is performing an assessment]. Vital signs show [BP of 94/62 in the right arm] and [64/42 in the right leg]. The [brachial pulses are full and bounding], while the [femoral pulses are weak]. Assessment shows [lower extremities are pale and cool]. There is a [systolic murmur heard at the left infraclavicular area]. The newborn has [mild tachypnea]. The [upper body is flushed] while the [lower body remains pale]. The [infant is quiet and resting].',
            correctSpanIndices: [1, 2, 3, 4, 5, 6, 7, 8],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Coarctation of the Aorta', 'Cardiovascular', 'Pediatrics'] },
            rationale: {
                correct: 'Coarctation of the aorta is a narrowing of the aorta that restricts blood flow to the lower body. The hallmark includes high BP/bounding pulses in the upper extremities and low BP/weak pulses in the lower extremities. This leads to cooler, paler lower extremities. A systolic murmur radiating to the back is common. Flushed upper body versus pale lower body (differential cyanosis/perfusion) confirms the localized nature of the obstruction.',
                incorrect: 'The fact that the nurse is performing a newborn assessment is the context.',
                clinicalPearls: ['Screening for coarctation is done by comparing upper and lower extremity blood pressures or pulse oximetry. A difference of >10 mmHg between upper and lower extremity BP is significant.'],
                reviewUnits: [{ heading: 'Coarctation Assessment', body: 'Look for BP and pulse discrepancies between upper and lower extremities.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 11 }
        },
        {
            id: 'upper_gi_bleed_shock_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses a client presenting with \'dark, tarry stools.\' Highlight the assessment findings that are most concerning for the development of hypovolemic shock.',
            passage: 'A 52-year-old female presents to the emergency department with a 3-day history of [melena]. She has a history of [long-term NSAID use] for chronic back pain. The client\'s [heart rate is 122 bpm]. Her blood pressure while lying flat is 108/62 mmHg, but it [drops to 84/50 mmHg when she sits up]. The nurse notes the client\'s [skin is cool, pale, and clammy]. [Capillary refill time is 4 seconds] in the fingernails. The client reports a [pain level of 2 out of 10]. The client\'s [abdomen is soft and non-tender]. The client appears [restless and anxious].',
            correctSpanIndices: [0, 2, 3, 4, 5, 8],
            pedagogy: { bloomLevel: 'evaluate', cjmmStep: 'analyzeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Med-Surg', 'GI Bleed', 'Shock'] },
            rationale: {
                correct: 'Upper GI bleed patients are at high risk for hypovolemic shock. Cardinal cues include tachycardia (122 bpm), a significant drop in blood pressure when sitting up (orthostatic hypotension: 84/50), cool, pale, clammy skin, and a prolonged capillary refill of 4 seconds. Restlessness and anxiety are early neurological indicators of decreased cerebral perfusion.',
                incorrect: 'A history of NSAID use is a risk factor for developing the bleed itself but is not an assessment finding of shock. Reassuring findings like a pain level of 2/10 and a soft abdomen are distractors as they do not indicate hemodynamic instability.',
                clinicalPearls: ['In acute bleeding, the hemoglobin level may initially be normal; physical assessment and orthostatic vital signs are more reliable early indicators of volume loss.'],
                reviewUnits: [{ heading: 'Signs of Hypovolemic Shock', body: 'Skin: Cool/Clammy/Pale. Heart: Tachycardia. BP: Hypotension/Orthostasis. Kidney: Oliguria. Neuro: Restlessness/Anxiety.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'dvt_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse evaluates a client who underwent a total hip replacement 2 days ago. Highlight the cues that indicate the patient is most likely developing a deep vein thrombosis (DVT).',
            passage: 'A 72-year-old male is recovering from a right total hip arthroplasty performed 48 hours ago. He has been on [bed rest since surgery] due to pain. The nurse notes that the patient\'s [right calf is 2 cm larger] in circumference than the left calf. The right lower extremity is [warm to the touch and slightly erythematous]. The patient reports a [\'heavy, aching pain\'] in the right leg. A small amount of [serosanguinous drainage] is noted on the dressing. The patient\'s pedal [pulses are 2+ bilaterally]. The patient\'s [heart rate is 88 bpm].',
            correctSpanIndices: [1, 2, 3],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Reduction of Risk Potential', difficulty: 3, topicTags: ['Med-Surg', 'DVT', 'Post-Op'] },
            rationale: {
                correct: 'Unilateral calf swelling (2 cm difference), warmth, and erythema are the most reliable clinical indicators of DVT. Describing the pain as "heavy" or "aching" specifically in the affected limb is also a classic cue.',
                incorrect: 'Bed rest is a risk factor (stasis) but not a physical finding of the clot. Serosanguinous drainage and symmetric pedal pulses are expected findings 48 hours post-hip arthroplasty. A heart rate of 88 is within normal limits and not a specific indicator of DVT (though it would rise if a PE occurred).',
                clinicalPearls: ['Unilateral calf swelling is the most reliable clinical indicator of DVT; bilateral edema is usually cardiac or renal.'],
                reviewUnits: [{ heading: 'Virchow\'s Triad', body: '1. Stasis. 2. Endothelial injury. 3. Hypercoagulability.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 3 }
        },
        {
            id: 'copd_respiratory_failure_highlight_v1',
            type: 'highlight',
            stem: 'The nurse reviews the respiratory assessment findings for a client with a history of COPD. Highlight the findings that indicate the patient is experiencing acute respiratory failure.',
            passage: 'A 72-year-old male with a 40-pack-year smoking history is admitted for a COPD exacerbation. He is currently [receiving 2L of oxygen]. The nurse notes that the patient is [leaning forward with his hands on his knees]. His [respiratory rate is 32 breaths per minute]. The patient is [using his sternocleidomastoid muscles] to assist with breathing. When the nurse asks a question, the patient can [only answer in one-word phrases]. The patient\'s [SpO2 is currently 86%]. His [heart rate is 112 bpm] and BP is 158/92 mmHg. The patient appears [increasingly drowsy and difficult to arouse].',
            correctSpanIndices: [2, 3, 4, 5, 6, 8],
            pedagogy: { bloomLevel: 'evaluate', cjmmStep: 'analyzeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Respiratory', 'COPD', 'Emergencies'] },
            rationale: {
                correct: 'Acute respiratory failure in COPD is signaled by tachypnea (32/min), tripod positioning, accessory muscle use (sternocleidomastoid), and the inability to speak in full sentences (one-word dyspnea). An SpO2 of 86% despite oxygen therapy indicates refractory hypoxemia. Altered mental status (drowsiness/arousal difficulty) is a critical sign of CO2 narcosis and impending respiratory arrest.',
                incorrect: 'Receiving 2L of oxygen is a baseline intervention. Tachycardia (112) and hypertension (158/92) are physiological stress responses but less specific as indicators of acute failure compared to the neurological and respiratory work changes.',
                clinicalPearls: ['In a COPD exacerbation, a decreasing level of consciousness is often a more ominous sign than the O2 level, as it suggests severe hypercapnia.'],
                reviewUnits: [{ heading: 'Type II Respiratory Failure', body: 'Characterized by hypercapnia (PaCO2 >45) and acidosis (pH <7.35). Clinical cues focus on respiratory effort and mentation.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'mi_women_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The triage nurse assesses a 62-year-old female client. Highlight the cues that are most suggestive of an acute myocardial infarction in this female client.',
            passage: 'A 62-year-old female presents to the emergency department reporting [\'extreme tiredness\'] for the past 24 hours. She has a [history of type 2 diabetes mellitus and hypertension]. The client states she also [feels \'a bit nauseous\' and has vomited]. She describes a [\'dull, heavy sensation\' in her epigastric area] that feels like [\'bad indigestion\']. The nurse notes the client\'s [skin is pale and she is diaphoretic]. The client [denies any sharp, crushing chest pain]. Her [heart rate is 104 bpm] and BP is 114/76 mmHg. She reports [feeling lightheaded] when she stands up.',
            correctSpanIndices: [0, 3, 4, 5, 8],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Cardiac', 'MI', 'Health Equity'] },
            rationale: {
                correct: 'Women often experience atypical MI symptoms including profound fatigue ("extreme tiredness"), nausea/vomiting, and epigastric distress ("bad indigestion"). Objective findings like diaphoresis and lightheadedness further support the concern for decreased cardiac output and myocardial ischemia.',
                incorrect: 'History of diabetes/HTN are risk factors, not acute cues. The absence of sharp chest pain is actually common in female MI presentations and can lead to dangerous delays in care. A BP of 114/76 and HR 104 are relatively stable though suggestive of stress.',
                clinicalPearls: ['Diabetic patients may not experience typical chest pain due to autonomic neuropathy; always maintain a high index of suspicion.'],
                reviewUnits: [{ heading: 'Atypical MI Presentation', body: 'Common in women, older adults, and diabetics. Includes: SOB, fatigue, indigestion, and jaw/back pain.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'meningitis_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses a college student who presents with a severe headache. Highlight the assessment findings that indicate the client likely has bacterial meningitis.',
            passage: 'A 19-year-old college student presents with a history of fever and severe headache. The client\'s [temperature is 103.2°F]. The nurse notes that the [client has a stiff neck] and resists chin-to-chest flexion. When the nurse flexes the hip and knee to 90 degrees, the [client has severe pain in the hamstring] on extension. The [hips and knees flex involuntarily] when the neck is flexed. A [petechial rash] is observed on the trunk. The client reports that the [lights are \'too bright\']. The client\'s [heart rate is 112 bpm].',
            correctSpanIndices: [1, 2, 3, 4, 5],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Neuro', 'Meningitis', 'Infection'] },
            rationale: {
                correct: 'Nuchal rigidity ("stiff neck"), Kernig\'s sign (hamstring pain on extension), and Brudzinski\'s sign (involuntary hip flexion) are classic indicators of meningeal irritation. A petechial rash is a high-priority finding suggesting meningococcemia. Photophobia ("lights are too bright") is also a distinct cue for meningitis.',
                incorrect: 'Fever (103.2°F) and tachycardia (112 bpm) are signs of systemic infection but are not specific to the meninges and can occur with many other infectious processes.',
                clinicalPearls: ['Kernig\'s and Brudzinski\'s signs have high specificity for meningitis but may be absent in early stages.'],
                reviewUnits: [{ heading: 'Meningitis Assessment', body: '1. Nuchal Rigidity. 2. Photophobia. 3. Positive Kernig/Brudzinski. 4. Petechial Rash (Emergency).' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'thyroid_storm_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse evaluates a client with Graves\' disease following a trauma. Highlight the cues that indicate the patient is experiencing a thyroid storm.',
            passage: 'A 34-year-old female with Graves\' disease is admitted for a hip fracture. The nurse notes the patient\'s [temperature has risen to 105.4°F]. The patient\'s [heart rate is 162 bpm] with an irregular rhythm. The patient [appears extremely agitated] and is shouting. [Profuse diaphoresis] is noted on the client\'s forehead and chest. The nurse notes the patient\'s [blood pressure is 158/88 mmHg]. The patient\'s [blood glucose is 112 mg/dL]. The patient reports [having a bowel movement]. The nurse notes a [fine tremor] in the client\'s hands.',
            correctSpanIndices: [0, 1, 2, 3, 7],
            pedagogy: { bloomLevel: 'evaluate', cjmmStep: 'analyzeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Endocrine', 'Thyroid', 'Emergencies'] },
            rationale: {
                correct: 'Thyroid storm is a life-threatening hypermetabolic state. Key cues include hyperpyrexia (105.4°F), extreme tachycardia (162 bpm) with dysrhythmia, severe CNS agitation, profuse diaphoresis, and fine tremors.',
                incorrect: 'A blood pressure of 158/88 is common in stressful states but not a diagnostic indicator of thyroid storm specifically. A blood glucose of 112 is within normal limits. Normal bowel movements are non-specifically related to the hyperactive GI state often seen in hyperthyroidism but do not indicate the crisis of a storm.',
                clinicalPearls: ['Tachycardia and high fever in a patient with a history of hyperthyroidism should be treated as Thyroid Storm until proven otherwise.'],
                reviewUnits: [{ heading: 'Thyroid Storm Triad', body: '1. Fever >102°F. 2. Tachycardia >140 bpm. 3. CNS dysfunction (agitation, psychosis, coma).' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'hypoglycemia_elderly_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses an 84-year-old resident. Highlight the cues that are most suggestive of hypoglycemia in this elderly client.',
            passage: 'An 84-year-old male with type 2 diabetes is [unusually quiet] during breakfast. The nurse notes the resident is [slumping and difficult to arouse]. He is [pale, cool, and clammy]. His [heart rate is 108 bpm] and he is [trembling slightly]. The daughter mentions [chronic macular degeneration]. His [blood pressure is 112/68 mmHg]. The nurse notes a [small bruise] on his left arm.',
            correctSpanIndices: [0, 1, 2, 3, 4],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Endocrine', 'Geriatrics', 'Safety'] },
            rationale: {
                correct: 'In the elderly, hypoglycemia often presents atypically with neuroglycopenic symptoms like being "unusually quiet" or lethargic (slumping/difficulty to arouse) and sympathetic responses such as tachycardia (108 bpm), trembling, and cool/clammy skin.',
                incorrect: 'The daughter\'s mention of macular degeneration is a part of the chronic medical history but not an acute cue. A blood pressure of 112/68 is stable and a small bruise on the arm is a common finding in the elderly that does not relate to glucose levels.',
                clinicalPearls: ['Geriatric patients have a high risk of hypoglycemia unawareness; any sudden change in mentation requires a fingerstick glucose.'],
                reviewUnits: [{ heading: 'Hypoglycemia Signs', body: 'Sympathetic: Tachycardia, tremors, sweating. Neuroglycopenic: Confusion, lethargy, seizures.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'right_heart_failure_assessment_highlight_v1',
            type: 'highlight',
            stem: 'The nurse performs a physical assessment for right-sided heart failure. Highlight the findings that indicate the patient is experiencing right-sided heart failure.',
            passage: 'A 68-year-old female with COPD is admitted for worsening edema. The nurse observes [visible jugular vein pulsation] at a 45-degree angle. Upon palpation, the [liver edge is felt 4 cm below the costal margin]. The lower extremities show [3+ pitting edema]. The patient reports her [\'rings feel tight\'] and [weight gain of 6 lbs]. Lung auscultation reveals [clear breath sounds]. The patient\'s [heart rate is 92 bpm].',
            correctSpanIndices: [0, 1, 2, 3, 4],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Cardiac', 'Right Heart Failure', 'Assessment'] },
            rationale: {
                correct: 'Right-sided heart failure leads to systemic venous congestion. Key cues include jugular venous distension (visible pulsation at 45 degrees), hepatomegaly (liver edge 4 cm below costal margin), significant peripheral edema (3+ pitting), and rapid weight gain (6 lbs) resulting in tight rings.',
                incorrect: 'Clear breath sounds specifically help differentiate isolated right-sided failure from left-sided failure (which would present with crackles). A heart rate of 92 is within the normal range.',
                clinicalPearls: ['Right Heart Failure = Systemic signs (Edema, JVD). Left Heart Failure = Pulmonary signs (Crackles, SOB).'],
                reviewUnits: [{ heading: 'Cor Pulmonale', body: 'Right-sided heart failure caused by chronic lung disease (like COPD). Look for systemic congestion.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'left_heart_failure_assessment_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses for left-sided heart failure. Highlight the findings that indicate the patient is experiencing left-sided heart failure.',
            passage: 'A 70-year-old male with a history of MI is admitted with dyspnea. The patient reports having to [sleep with \'three pillows\'] to breathe. The patient develops a [cough with frothy, pink-tinged sputum]. Auscultation reveals [bibasilar crackles]. The patient\'s [respiratory rate is 28/min]. The nurse notes the patient\'s [skin is warm and dry]. The patient\'s [blood pressure is 148/94 mmHg]. The client [denies any ankle swelling].',
            correctSpanIndices: [0, 1, 2, 3],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Cardiac', 'Left Heart Failure', 'Respiratory'] },
            rationale: {
                correct: 'Left-sided heart failure causes pulmonary congestion. Cues include orthopnea (needing "three pillows" to sleep), the production of hallmark pink, frothy sputum, bibasilar crackles (alveolar fluid), and tachypnea (28/min).',
                incorrect: 'Normal findings like warm, dry skin and a blood pressure of 148/94 (which is high but not specific to the failure) do not indicate acute pulmonary edema. The absence of ankle swelling specifically points away from right-sided involvement.',
                clinicalPearls: ['Left heart failure symptoms are primarily respiratory because the left ventricle cannot pump blood into systemic circulation, causing it to back up into the lungs.'],
                reviewUnits: [{ heading: 'Flash Pulmonary Edema', body: 'Sudden, severe left heart failure. Hallmark: Pink, frothy sputum. Priority: Diuretics and oxygen.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 4 }
        },
        {
            id: 'nephrotic_syndrome_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The pediatric nurse assesses a 4-year-old child. Highlight the cues that are most indicative of minimal change nephrotic syndrome.',
            passage: 'A 4-year-old child has [\'puffy eyes\'] and [\'tight pants.\'] The nurse notes [periorbital and generalized edema]. The child\'s [weight has increased by 15%]. A urine dipstick shows [4+ protein but no blood]. Serum [albumin level is 1.8 g/dL]. The [blood pressure is 98/62 mmHg]. Serum [cholesterol is elevated at 280 mg/dL]. Temperature is [98.6°F].',
            correctSpanIndices: [0, 1, 2, 3, 4, 5, 7],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Pediatrics', 'Urinary', 'Nephrotic Syndrome'] },
            rationale: {
                correct: 'Nephrotic syndrome is characterized by massive glomerular permeability. Classic cues include "puffy eyes" and sudden weight gain (15%) due to periorbital and generalized edema. Diagnostic markers include massive proteinuria (4+), profound hypoalbuminemia (1.8 g/dL), and hyperlipidemia (cholesterol 280 mg/dL).',
                incorrect: 'Minimal change disease typically presents with a normal blood pressure (98/62) and no fever (98.6°F), helping to distinguish it from acute glomerulonephritis or infection.',
                clinicalPearls: ['"Nephrotic" has an \'O\' for prOtein; "Nephritic" has an \'I\' for Inflammation/Infection/blood.'],
                reviewUnits: [{ heading: 'Minimal Change Disease', body: 'Most common cause of nephrotic syndrome in children. Key management: Corticosteroids.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 7 }
        },
        {
            id: 'pyloric_stenosis_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses a 6-week-old infant. Highlight the findings that are most consistent with hypertrophic pyloric stenosis.',
            passage: 'A 6-week-old infant has [projectile vomiting] immediately after feeding. The infant is [\'always hungry.\'] Palpation reveals a [firm, olive-shaped mass] in the epigastrium. [Visible peristaltic waves] move across the abdomen. Lab results show [metabolic alkalosis]. [Stool is soft and yellow]. [Heart rate is 148 bpm].',
            correctSpanIndices: [0, 1, 2, 3, 4],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Pediatrics', 'GI', 'Pyloric Stenosis'] },
            rationale: {
                correct: 'Pyloric stenosis involves a gastric outlet obstruction. Hallmark cues include projectile vomiting, ravenous hunger ("always hungry"), an "olive-shaped mass" in the epigastrium (the thickened pylorus), and visible peristaltic waves. Chronic vomiting of gastric contents leads to metabolic alkalosis.',
                incorrect: 'Soft, yellow stool is a normal finding and indicates some nutrients are still passing through, though the obstruction is significant. A heart rate of 148 is elevated for a 6-week-old but is a non-specific indicator of stress or mild dehydration rather than a diagnostic sign of the stenosis itself.',
                clinicalPearls: ['The olive-shaped mass is often easiest to palpate when the infant is relaxed during a feeding or immediately after vomiting.'],
                reviewUnits: [{ heading: 'Pyloric Stenosis Triad', body: '1. Projectile vomiting. 2. Olive-shaped mass. 3. Visible peristalsis.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'hip_fracture_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses an 82-year-old client who fell. Highlight the findings that are classic indicators of a hip fracture.',
            passage: 'An 82-year-old female reports severe [pain in her right groin]. The nurse observes the [right leg is shorter] than the left. The right [foot is externally rotated]. A large [ecchymosis is present] over the trochanter. [Pedal pulses are 2+] and equal. Skin is [warm and dry]. The client [denies numbness] in her toes.',
            correctSpanIndices: [1, 2, 3],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 2, topicTags: ['Orthopedic', 'MSK', 'Geriatrics'] },
            rationale: {
                correct: 'Classic assessment findings for an intracapsular or extracapsular hip fracture include severe groin pain, a shortened limb on the affected side, and external rotation of the foot/leg due to muscle spasms and loss of bone continuity.',
                incorrect: 'Intact pedal pulses, warm/dry skin, and the absence of numbness are baseline neurovascular findings that do not indicate a fracture; however, their presence is important for ruling out concurrent vascular or nerve injury.',
                clinicalPearls: ['If you suspect a hip fracture, never attempt to range the affected limb, as this can cause further tissue damage or displace the fracture.'],
                reviewUnits: [{ heading: 'Hip Fracture Signs', body: 'Pain, inability to bear weight, shortening, and external rotation.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 4 }
        },
        {
            id: 'lupus_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses a client for Systemic Lupus Erythematosus (SLE). Highlight the cues that are characteristic of SLE.',
            passage: 'A 24-year-old female has a [flat, red rash] across the bridge of her nose. The [rash worsens after sun exposure]. She has [painful, swollen finger joints]. [Small, painless ulcers] are on the hard palate. Laboratory results show a [positive ANA titer]. Menstrual [cycles are regular]. Heart [rate is 78 bpm].',
            correctSpanIndices: [0, 1, 2, 3, 4],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Immunology', 'SLE', 'Rheumatology'] },
            rationale: {
                correct: 'Systemic Lupus Erythematosus (SLE) is a multisystem autoimmune disease. Characteristic cues include the classic malar ("butterfly") rash which worsens with UV exposure (photosensitivity), inflammatory arthritis (swollen joints), and painless oral ulcers. A positive ANA titer is the primary screening laboratory marker.',
                incorrect: 'A normal heart rate and regular menstrual cycles are unaffected by the acute manifestations of SLE and help rule out other concurrent hormonal or systemic distress syndromes.',
                clinicalPearls: ['The ANA test is highly sensitive for SLE but not specific; a positive result must be coupled with clinical criteria.'],
                reviewUnits: [{ heading: 'SLE (SOAP BRAIN MD)', body: 'S: Serositis. O: Oral ulcers. A: Arthritis. P: Photosensitivity. B: Blood disorders. R: Renal. A: ANA. I: Immunologic. N: Neurologic. M: Malar rash. D: Discoid rash.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'anorexia_physical_signs_highlight_v1',
            type: 'highlight',
            stem: 'The nurse evaluates a teen for anorexia nervosa. Highlight the physical findings that are consistent with this disorder.',
            passage: 'A 16-year-old female has a [BMI of 16.2 kg/m²]. Skin is dry with [fine, downy lanugo hair]. Heart [rate is 42 bpm] and [BP is 88/52 mmHg]. She has [not had a period in 4 months]. She reports [vision is 20/20]. She is a [straight-A student]. [Temperature is 96.8°F].',
            correctSpanIndices: [0, 1, 2, 3, 4, 7],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Physiological Adaptation', difficulty: 3, topicTags: ['Psych', 'Eating Disorders', 'Med-Surg'] },
            rationale: {
                correct: 'Anorexia nervosa leads to systemic physiological adaptations to starvation. Cues include extremely low BMI, lanugo (fine hair to conserve heat), severe bradycardia (42 bpm), hypotension (88/52), amenorrhea (period absence), and hypothermia (96.8°F).',
                incorrect: 'Normal vision (20/20) and high academic achievement ("straight-A student") are typical psychosocial profiles of perfectionism often found in patients with anorexia but are not physical findings of the disorder itself.',
                clinicalPearls: ['Hospitalization is typically required for a heart rate <40, temperature <97.0°F, or BMI <15.'],
                reviewUnits: [{ heading: 'Physiological effects of Anorexia', body: 'Hypometabolism (bradycardia, hypothermia, hypotension) and endocrine failure (amenorrhea).' }]
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        },
        {
            id: 'delirium_recognition_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses for delirium rather than dementia. Highlight the cues that indicate delirium.',
            passage: 'An 88-year-old male was fine at 20:00 but became [suddenly agitated and confused] at 02:00. [Attention span is extremely short]. He claims there are [\'large spiders\'] on the walls. [Level of consciousness fluctuates]. He has had [mild memory problems] for years. He takes a [daily multivitamin]. Speech is [garbled and incoherent].',
            correctSpanIndices: [0, 1, 2, 3, 6],
            pedagogy: { bloomLevel: 'analyze', cjmmStep: 'recognizeCues', nclexCategory: 'Psychosocial Integrity', difficulty: 4, topicTags: ['Geriatrics', 'Neuro', 'Delirium'] },
            rationale: {
                correct: 'Delirium is an acute medical emergency. Key cues that differentiate it from dementia include the rapid ("sudden") onset, acute agitation/confusion, inattention (short attention span), hallucinations ("spiders"), fluctuating level of consciousness, and garbled/incoherent speech.',
                incorrect: 'Chronic "mild memory problems" are characteristic of underlying dementia, which is a risk factor for delirium but not a diagnostic cue of the acute episode. Taking a daily multivitamin is a benign health maintenance finding.',
                clinicalPearls: ['Delirium is often the first sign of a UTI or infection in the elderly; look for a reversible cause.'],
                reviewUnits: [{ heading: 'Hyperactive vs. Hypoactive Delirium', body: 'Hyperactive: Agitation, hallucinations. Hypoactive: Lethargy, withdrawal. Both involve acute inattention.' }]
            },
            scoring: { method: 'polytomous', maxPoints: 5 }
        },
        {
            id: 'autonomic_dysreflexia_highlight_v1',
            type: 'highlight',
            stem: 'The nurse assesses for autonomic dysreflexia. Highlight the cues that indicate autonomic dysreflexia.',
            passage: 'A client with a T4 injury has a [splitting headache]. Blood pressure is [188/104 mmHg]. Face and neck are [bright red and diaphoretic]. Heart rate is [52 bpm]. Skin is [cool and pale below the injury]. Urinary [catheter is kinked]. SpO2 is [98%]. Patient has [chronic muscle spasms].',
            correctSpanIndices: [0, 1, 2, 3, 4, 5],
            pedagogy: { bloomLevel: 'evaluate', cjmmStep: 'analyzeCues', nclexCategory: 'Physiological Adaptation', difficulty: 4, topicTags: ['Neuro', 'SCI', 'Emergencies'] },
            rationale: {
                correct: 'Autonomic Dysreflexia (AD) is a life-threatening emergency in spinal cord injuries above T6. Cardinal signs include acute hypertension (188/104), a severe "splitting headache," bradycardia (52 bpm), and the classic autonomic response of flushing/sweating above the injury level with pale/cool skin below. A kinked urinary catheter is a primary noxious stimulus that triggers the syndrome.',
                incorrect: 'An SpO2 of 98% is normal and chronic muscle spasms are expected in SCI; neither are specific indicators of the acute hypertensive crisis of AD.',
                clinicalPearls: ['The first action for suspected AD is to sit the patient upright (90 degrees) to lower blood pressure via orthostatic effect.'],
                reviewUnits: [{ heading: 'Emergency AD Management', body: '1. Elevate head of bed. 2. Loosen tight clothing. 3. Check bladder (kinked tube). 4. Check bowel (impaction).' }]
            },
            scoring: { method: 'polytomous', maxPoints: 6 }
        }
    ];
}

/**
 * Wraps a single Standalone NGN item into a "Mini Case" for the simulator.
 */
export function wrapStandalone(rawItem: MasterItem): CaseStudy {
    // Normalize item to ensure scoring is at the top level
    const item = { ...rawItem };
    if (!item.scoring && (item.rationale as any)?.scoring) {
        item.scoring = (item.rationale as any).scoring;
    }
    if (!item.scoring) {
        item.scoring = { method: 'polytomous', maxPoints: 1 };
    }

    const patient: Patient = {
        id: 'standalone-pt',
        name: 'Standardized Patient',
        age:
            item.id === 'icp_monitoring_multipleChoice_v1' ? 24 :
                item.id === 'unbiased_care_multipleChoice_v1' ? 30 :
                    item.id === 'language_access_multipleChoice_v1' ? 56 :
                        item.id === 'svt_management_multipleChoice_v1' ? 65 :
                            item.id === 'pe_recognition_multipleChoice_v1' ? 70 :
                                item.id === 'potassium_multipleChoice_v1' ? 54 :
                                    item.id === 'thyroid_storm_multipleChoice_v1' ? 38 :
                                        item.id === 'lithium_toxicity_multipleChoice_v1' ? 29 :
                                            item.id === 'pyloric_stenosis_multipleChoice_v1' ? 0.1 :
                                                item.id === 'abruptio_placentae_multipleChoice_v1' ? 28 :
                                                    item.id === 'autonomic_dysreflexia_multipleChoice_v1' ? 24 :
                                                        item.id === 'warfarin_management_multipleChoice_v1' ? 68 :
                                                            item.id === 'copd_exacerbation_multipleChoice_v1' ? 72 :
                                                                item.id === 'acute_pancreatitis_multipleChoice_v1' ? 45 :
                                                                    item.id === 'digoxin_toxicity_multipleChoice_v1' ? 78 :
                                                                        item.id === 'nephrotic_syndrome_multipleChoice_v1' ? 4 :
                                                                            item.id === 'hhs_management_multipleChoice_v1' ? 82 :
                                                                                item.id === 'cholinergic_crisis_multipleChoice_v1' ? 42 :
                                                                                    item.id === 'compartment_syndrome_multipleChoice_v1' ? 19 :
                                                                                        item.id === 'fat_embolism_multipleChoice_v1' ? 22 :
                                                                                            item.id === 'sickle_cell_crisis_multipleChoice_v1' ? 10 :
                                                                                                item.id === 'peritonitis_dialysis_multipleChoice_v1' ? 64 :
                                                                                                    item.id === 'epiglottitis_emergency_multipleChoice_v1' ? 3 :
                                                                                                        item.id === 'hellp_syndrome_multipleChoice_v1' ? 31 :
                                                                                                            item.id === 'tpn_air_embolism_multipleChoice_v1' ? 55 :
                                                                                                                item.id === 'cardiac_tamponade_multipleChoice_v1' ? 66 :
                                                                                                                    item.id === 'neuro_stroke_multipleChoice_v1' ? 68 :
                                                                                                                        item.id === 'renal_hemodialysis_multipleChoice_v1' ? 62 :
                                                                                                                            item.id === 'pharm_blood_reaction_multipleChoice_v1' ? 45 :
                                                                                                                                item.id === 'trauma_burns_multipleChoice_v1' ? 45 :
                                                                                                                                    item.id === 'cardiac_afib_multipleChoice_v2' ? 74 :
                                                                                                                                        item.id === 'shock_sepsis_multipleChoice_v1' ? 66 :
                                                                                                                                            item.id === 'alcohol_withdrawal_multipleChoice_v1' ? 50 :
                                                                                                                                                item.id === 'dka_management_multipleChoice_v1' ? 19 :
                                                                                                                                                    item.id === 'addisonian_crisis_multipleChoice_v1' ? 42 :
                                                                                                                                                        item.id === 'tension_pneumothorax_multipleChoice_v1' ? 28 :
                                                                                                                                                            item.id === 'myasthenic_crisis_multipleChoice_v1' ? 45 :
                                                                                                                                                                item.id === 'guillain_barre_multipleChoice_v1' ? 34 :
                                                                                                                                                                    item.id === 'eclampsia_seizure_multipleChoice_v1' ? 26 :
                                                                                                                                                                        item.id === 'intussusception_recognition_multipleChoice_v1' ? 0.8 :
                                                                                                                                                                            item.id === 'kawasaki_aspirin_multipleChoice_v1' ? 4 :
                                                                                                                                                                                item.id === 'serotonin_syndrome_recognition_multipleChoice_v1' ? 22 :
                                                                                                                                                                                    item.id === 'nms_rigidity_multipleChoice_v1' ? 31 :
                                                                                                                                                                                        item.id === 'aortic_dissection_bp_multipleChoice_v1' ? 62 :
                                                                                                                                                                                            item.id === 'siadh_fluid_restriction_multipleChoice_v1' ? 68 :
                                                                                                                                                                                                item.id === 'diabetes_insipidus_evaluation_multipleChoice_v1' ? 45 :
                                                                                                                                                                                                    item.id === 'anaphylaxis_epinephrine_multipleChoice_v1' ? 29 :
                                                                                                                                                                                                        item.id === 'ards_refractory_hypoxemia_multipleChoice_v1' ? 52 :
                                                                                                                                                                                                            item.id === 'hypocalcemia_thyroidectomy_multipleChoice_v1' ? 38 :
                                                                                                                                                                                                                item.id === 'placenta_previa_painless_multipleChoice_v1' ? 28 :
                                                                                                                                                                                                                    item.id === 'hip_fracture_bucks_multipleChoice_v1' ? 76 :
                                                                                                                                                                                                                        item.id === 'hepatic_encephalopathy_lactulose_multipleChoice_v1' ? 58 :
                                                                                                                                                                                                                            item.id === 'post_op_hemorrhage_multipleChoice_v1' ? 45 :
                                                                                                                                                                                                                                item.id === 'rsv_bronchiolitis_highlight_v1' ? 0.8 :
                                                                                                                                                                                                                                    item.id === 'preeclampsia_recognition_highlight_v1' ? 28 :
                                                                                                                                                                                                                                        item.id === 'ischemic_stroke_recognition_highlight_v1' ? 68 :
                                                                                                                                                                                                                                            item.id === 'sepsis_early_recognition_highlight_v1' ? 75 :
                                                                                                                                                                                                                                                item.id === 'upper_gi_bleed_shock_highlight_v1' ? 52 :
                                                                                                                                                                                                                                                    item.id === 'dvt_recognition_highlight_v1' ? 72 :
                                                                                                                                                                                                                                                        item.id === 'copd_respiratory_failure_highlight_v1' ? 72 :
                                                                                                                                                                                                                                                            item.id === 'mi_women_recognition_highlight_v1' ? 62 :
                                                                                                                                                                                                                                                                item.id === 'meningitis_recognition_highlight_v1' ? 19 :
                                                                                                                                                                                                                                                                    item.id === 'thyroid_storm_recognition_highlight_v1' ? 34 :
                                                                                                                                                                                                                                                                        item.id === 'hypoglycemia_elderly_recognition_highlight_v1' ? 84 :
                                                                                                                                                                                                                                                                            item.id === 'right_heart_failure_assessment_highlight_v1' ? 68 :
                                                                                                                                                                                                                                                                                item.id === 'left_heart_failure_assessment_highlight_v1' ? 70 :
                                                                                                                                                                                                                                                                                    item.id === 'nephrotic_syndrome_recognition_highlight_v1' ? 4 :
                                                                                                                                                                                                                                                                                        item.id === 'pyloric_stenosis_recognition_highlight_v1' ? 0.1 :
                                                                                                                                                                                                                                                                                            item.id === 'hip_fracture_recognition_highlight_v1' ? 82 :
                                                                                                                                                                                                                                                                                                item.id === 'lupus_recognition_highlight_v1' ? 24 :
                                                                                                                                                                                                                                                                                                    item.id === 'anorexia_physical_signs_highlight_v1' ? 16 :
                                                                                                                                                                                                                                                                                                        item.id === 'delirium_recognition_highlight_v1' ? 88 :
                                                                                                                                                                                                                                                                                                            item.id === 'autonomic_dysreflexia_highlight_v1' ? 24 :
                                                                                                                                                                                                                                                                                                                item.id === 'dka_recognition_highlight_v1' ? 22 :
                                                                                                                                                                                                                                                                                                                    item.id === 'hhs_recognition_highlight_v1' ? 82 :
                                                                                                                                                                                                                                                                                                                        item.id === 'pheochromocytoma_recognition_highlight_v1' ? 45 :
                                                                                                                                                                                                                                                                                                                            item.id === 'cushings_recognition_highlight_v1' ? 38 :
                                                                                                                                                                                                                                                                                                                                item.id === 'addisonian_crisis_recognition_highlight_v1' ? 42 :
                                                                                                                                                                                                                                                                                                                                    item.id === 'myasthenia_gravis_exacerbation_highlight_v1' ? 45 :
                                                                                                                                                                                                                                                                                                                                        item.id === 'guillain_barre_progression_highlight_v1' ? 32 :
                                                                                                                                                                                                                                                                                                                                            item.id === 'ms_exacerbation_recognition_highlight_v1' ? 29 :
                                                                                                                                                                                                                                                                                                                                                item.id === 'parkinsons_autonomic_highlight_v1' ? 74 :
                                                                                                                                                                                                                                                                                                                                                    item.id === 'als_respiratory_highlight_v1' ? 58 :
                                                                                                                                                                                                                                                                                                                                                        item.id === 'fat_embolism_recognition_highlight_v1' ? 19 :
                                                                                                                                                                                                                                                                                                                                                            item.id === 'compartment_syndrome_recognition_highlight_v1' ? 28 :
                                                                                                                                                                                                                                                                                                                                                                item.id === 'rhabdomyolysis_recognition_highlight_v1' ? 44 :
                                                                                                                                                                                                                                                                                                                                                                    item.id === 'glomerulonephritis_recognition_highlight_v1' ? 8 :
                                                                                                                                                                                                                                                                                                                                                                        item.id === 'peritonitis_recognition_highlight_v1' ? 52 :
                                                                                                                                                                                                                                                                                                                                                                            item.id === 'intussusception_recognition_highlight_v1' ? 0.8 :
                                                                                                                                                                                                                                                                                                                                                                                item.id === 'hirschsprung_recognition_highlight_v1' ? 0.3 :
                                                                                                                                                                                                                                                                                                                                                                                    item.id === 'cystic_fibrosis_malabsorption_highlight_v1' ? 4 :
                                                                                                                                                                                                                                                                                                                                                                                        item.id === 'tet_spell_recognition_highlight_v1' ? 0.4 :
                                                                                                                                                                                                                                                                                                                                                                                            item.id === 'coarctation_recognition_highlight_v1' ? 0.1 :
                                                                                                                                                                                                                                                                                                                                                                                                item.id.includes('chf') ? 72 :
                                                                                                                                                                                                                                                                                                                                                                                                    45,
        sex:
            item.id === 'post_op_hemorrhage_multipleChoice_v1' ? 'F' :
                item.id === 'rsv_bronchiolitis_highlight_v1' ? 'F' :
                    item.id === 'preeclampsia_recognition_highlight_v1' ? 'F' :
                        item.id === 'upper_gi_bleed_shock_highlight_v1' ? 'F' :
                            item.id === 'mi_women_recognition_highlight_v1' ? 'F' :
                                item.id === 'thyroid_storm_recognition_highlight_v1' ? 'F' :
                                    item.id === 'left_heart_failure_assessment_highlight_v1' ? 'M' :
                                        item.id === 'lupus_recognition_highlight_v1' ? 'F' :
                                            item.id === 'anorexia_physical_signs_highlight_v1' ? 'F' :
                                                item.id === 'hip_fracture_recognition_highlight_v1' ? 'F' :
                                                    item.id === 'dka_recognition_highlight_v1' ? 'F' :
                                                        item.id === 'hhs_recognition_highlight_v1' ? 'M' :
                                                            item.id === 'cushings_recognition_highlight_v1' ? 'F' :
                                                                item.id === 'myasthenia_gravis_exacerbation_highlight_v1' ? 'F' :
                                                                    item.id === 'ms_exacerbation_recognition_highlight_v1' ? 'F' :
                                                                        'M',
        pronouns:
            item.id === 'unbiased_care_multipleChoice_v1' ? 'They/Them' :
                item.id === 'language_access_multipleChoice_v1' ? 'She/Her' :
                    item.id === 'pe_recognition_multipleChoice_v1' ? 'She/Her' :
                        item.id === 'potassium_multipleChoice_v1' ? 'She/Her' :
                            item.id === 'abruptio_placentae_multipleChoice_v1' ? 'She/Her' :
                                item.id === 'hellp_syndrome_multipleChoice_v1' ? 'She/Her' :
                                    item.id === 'eclampsia_seizure_multipleChoice_v1' ? 'She/Her' :
                                        item.id === 'placenta_previa_painless_multipleChoice_v1' ? 'She/Her' :
                                            item.id === 'rsv_bronchiolitis_highlight_v1' ? 'She/Her' :
                                                item.id === 'preeclampsia_recognition_highlight_v1' ? 'She/Her' :
                                                    item.id === 'upper_gi_bleed_shock_highlight_v1' ? 'She/Her' :
                                                        item.id === 'mi_women_recognition_highlight_v1' ? 'She/Her' :
                                                            item.id === 'thyroid_storm_recognition_highlight_v1' ? 'She/Her' :
                                                                item.id === 'lupus_recognition_highlight_v1' ? 'She/Her' :
                                                                    item.id === 'anorexia_physical_signs_highlight_v1' ? 'She/Her' :
                                                                        item.id === 'hip_fracture_recognition_highlight_v1' ? 'She/Her' :
                                                                            item.id === 'dka_recognition_highlight_v1' ? 'She/Her' :
                                                                                item.id === 'cushings_recognition_highlight_v1' ? 'She/Her' :
                                                                                    item.id === 'myasthenia_gravis_exacerbation_highlight_v1' ? 'She/Her' :
                                                                                        item.id === 'ms_exacerbation_recognition_highlight_v1' ? 'She/Her' :
                                                                                            'He/Him',
        weight_kg: 70,
        height_cm: 175,
        iso: 'Standard',
        diagnosis: item.pedagogy?.topicTags?.[0] || 'Clinical Evaluation',
        codeStatus: 'Full Code',
        allergies: ['None Reported']
    };

    const vitals: VitalSign[] = [
        { time: '07:00', hr: 72, sbp: 120, dbp: 80, rr: 16, temp: 98.6, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 0 }
    ];

    let labs: any[] = [];
    let imaging: any[] = [];
    let physicalExam: any[] = [];
    let orders: any[] = [];
    let medications: any[] = [];

    // Inject Dynamic Clinical Context
    if (item.id === 'sa-h-chf') {
        vitals.push({ time: '07:45', hr: 112, sbp: 152, dbp: 94, rr: 24, temp: 98.8, spo2: 89, spo2Source: 'RA', consciousness: 'Alert', pain: 1 });
        labs = [{ id: 'l1', name: 'BNP', value: 1250, unit: 'pg/mL', refLow: 0, refHigh: 100, timestamp: '08:15' }];
        physicalExam = [{ system: 'Respiratory', findings: 'Bilateral 3+ pitting edema, bibasilar crackles.', isAbnormal: true }];
        orders = [{ id: 'o1', name: 'Furosemide 40 mg IV Stat', status: 'pending', timestamp: '08:20' }];
    } else if (item.id === 'sa-h-sepsis') {
        vitals.push({ time: '07:45', hr: 118, sbp: 88, dbp: 54, rr: 24, temp: 102.4, spo2: 94, spo2Source: 'RA', consciousness: 'Alert', pain: 2 });
        orders = [
            { id: 'o2', name: 'Starting 1L Normal Saline Bolus', status: 'active', timestamp: '08:00' },
            { id: 'o3', name: 'Blood Cultures x 2', status: 'pending', timestamp: '08:00' }
        ];
    } else if (item.id === 'potassium_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 78, sbp: 116, dbp: 74, rr: 18, temp: 98.4, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 2 });
        labs = [
            { id: 'l-k', name: 'Serum Potassium', value: 3.1, unit: 'mEq/L', refLow: 3.5, refHigh: 5.0, timestamp: '07:30' },
            { id: 'l-uop', name: 'Urinary Output (Last 2 hours)', value: 15, unit: 'mL', refLow: 60, refHigh: 300, timestamp: '08:00' }
        ];
        orders = [{ id: 'o-k', name: 'Potassium Chloride 40 mEq in 100 mL NS over 4 hours', status: 'pending', timestamp: '08:05' }];
        medications = [{ id: 'm-pot', name: 'Potassium Chloride', dose: '40 mEq', route: 'IV', frequency: 'Once', status: 'due', scheduledTime: '08:10', lastAdmin: 'Never' }];
    } else if (item.id === 'icp_monitoring_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 72, sbp: 110, dbp: 68, rr: 14, temp: 98.0, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 0 });
        physicalExam = [{ system: 'Neurological', findings: 'External Ventricular Drain (EVD) in place. Transducer noted hanging at mid-shoulder level.', isAbnormal: true }];
        orders = [{ id: 'o-icp', name: 'Monitor ICP hourly; notify MD if > 20 mmHg', status: 'active', timestamp: '07:00' }];
    } else if (item.id === 'pe_recognition_multipleChoice_v1') {
        vitals.push({ time: '09:00', hr: 118, sbp: 110, dbp: 72, rr: 26, temp: 98.6, spo2: 88, spo2Source: 'RA', consciousness: 'Alert', pain: 8 });
        labs = [{ id: 'l-dd', name: 'D-dimer', value: 850, unit: 'ng/mL', refLow: 0, refHigh: 500, timestamp: '09:15' }];
        imaging = [{ type: 'CT Scan', view: 'Pulmonary Angiography', findings: 'Bilateral subsegmental filling defects.', impression: 'Findings consistent with acute pulmonary embolism.', status: 'final', timestamp: '09:45' }];
        orders = [{ id: 'o-pe', name: 'Oxygen 4L NC; monitor SpO2 continuously', status: 'active', timestamp: '09:10' }];
    } else if (item.id === 'svt_management_multipleChoice_v1') {
        vitals.push({ time: '10:00', hr: 192, sbp: 118, dbp: 74, rr: 24, temp: 98.6, spo2: 96, spo2Source: 'RA', consciousness: 'Alert', pain: 4 });
        physicalExam = [{ system: 'Cardiovascular', findings: 'Rapid, narrow-complex tachycardia noted on telemetry monitor.', isAbnormal: true }];
        orders = [{ id: 'o-aden', name: 'Adenosine 6 mg IV rapid push Stat', status: 'pending', timestamp: '10:05' }];
        medications = [{ id: 'm-aden', name: 'Adenosine', dose: '6 mg', route: 'IV', frequency: 'Once', status: 'due', scheduledTime: '10:05', lastAdmin: 'Never' }];
    } else if (item.id === 'thyroid_storm_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 162, sbp: 158, dbp: 88, rr: 28, temp: 104.2, spo2: 95, spo2Source: 'RA', consciousness: 'Agitated', pain: 3 });
        physicalExam = [{ system: 'General', findings: 'Profound diaphoresis, severe tremors, and emotional lability.', isAbnormal: true }];
        orders = [{ id: 'o-prop', name: 'Propranolol 1 mg IV push Stat', status: 'pending', timestamp: '08:05' }];
        medications = [{ id: 'm-prop', name: 'Propranolol', dose: '1 mg', route: 'IV', frequency: 'PRN', status: 'due', scheduledTime: '08:05', lastAdmin: 'Never' }];
    } else if (item.id === 'lithium_toxicity_multipleChoice_v1') {
        vitals.push({ time: '09:00', hr: 92, sbp: 102, dbp: 64, rr: 18, temp: 98.2, spo2: 98, spo2Source: 'RA', consciousness: 'Confused', pain: 2 });
        labs = [{ id: 'l-li', name: 'Serum Lithium', value: 2.2, unit: 'mEq/L', refLow: 0.6, refHigh: 1.2, timestamp: '08:30' }];
        physicalExam = [{ system: 'Neurological', findings: 'Coarse hand tremors, ataxia, and slurred speech.', isAbnormal: true }];
        orders = [{ id: 'o-ns', name: '0.9% Normal Saline at 150 mL/hr', status: 'pending', timestamp: '09:05' }];
    } else if (item.id === 'rsv_bronchiolitis_highlight_v1') {
        vitals.push({ time: '10:00', hr: 148, sbp: 80, dbp: 50, rr: 64, temp: 99.4, spo2: 91, spo2Source: 'RA', consciousness: 'Lethargic', pain: 2 });
        physicalExam = [{ system: 'Respiratory', findings: 'Subcostal/intercostal retractions; bilateral expiratory wheezing.', isAbnormal: true }];
        orders = [{ id: 'o-o2', name: 'Oxygen via high-flow nasal cannula; monitor continuously', status: 'active', timestamp: '10:05' }];
    } else if (item.id === 'preeclampsia_recognition_highlight_v1') {
        vitals.push({ time: '08:00', hr: 88, sbp: 164, dbp: 104, rr: 20, temp: 98.6, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 6 });
        physicalExam = [{ system: 'Neurological', findings: 'DTRs 3+ bilaterally; 1 beat of clonus.', isAbnormal: true }];
        orders = [{ id: 'o-mag', name: 'Magnesium Sulfate 4g IV bolus Stat', status: 'pending', timestamp: '08:15' }];
    } else if (item.id === 'ischemic_stroke_recognition_highlight_v1') {
        vitals.push({ time: '09:30', hr: 92, sbp: 172, dbp: 98, rr: 18, temp: 98.4, spo2: 96, spo2Source: 'RA', consciousness: 'Confused', pain: 0 });
        physicalExam = [{ system: 'Neurological', findings: 'Right-sided facial droop; Right arm drift.', isAbnormal: true }];
        orders = [{ id: 'o-tpa', name: 'Prepare for tPA protocol; verify onset time', status: 'active', timestamp: '09:35' }];
    } else if (item.id === 'sepsis_early_recognition_highlight_v1') {
        vitals.push({ time: '14:00', hr: 114, sbp: 92, dbp: 58, rr: 26, temp: 102.4, spo2: 94, spo2Source: '2L NC', consciousness: 'Confused', pain: 2 });
        labs = [{ id: 'l-lac', name: 'Lactic Acid', value: 3.8, unit: 'mmol/L', refLow: 0.5, refHigh: 2.2, timestamp: '14:15' }];
        orders = [{ id: 'o-bolus', name: '30 mL/kg Normal Saline bolus', status: 'pending', timestamp: '14:20' }];
    } else if (item.id === 'upper_gi_bleed_shock_highlight_v1') {
        vitals.push({ time: '11:00', hr: 122, sbp: 84, dbp: 50, rr: 24, temp: 98.0, spo2: 95, spo2Source: 'RA', consciousness: 'Agitated', pain: 2 });
        physicalExam = [{ system: 'Integumentary', findings: 'Cool, pale, clammy skin; Cap refill 4s.', isAbnormal: true }];
        orders = [{ id: 'o-type', name: 'Type and cross 2 units PRBCs', status: 'pending', timestamp: '11:05' }];
    } else if (item.id === 'dvt_recognition_highlight_v1') {
        vitals.push({ time: '08:00', hr: 88, sbp: 120, dbp: 80, rr: 18, temp: 99.2, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 6 });
        physicalExam = [{ system: 'Musculoskeletal', findings: 'Unilateral right calf swelling/warmth.', isAbnormal: true }];
        orders = [{ id: 'o-ultra', name: 'Lower extremity venous duplex ultrasound', status: 'pending', timestamp: '08:15' }];
    } else if (item.id === 'copd_respiratory_failure_highlight_v1') {
        vitals.push({ time: '11:00', hr: 112, sbp: 158, dbp: 92, rr: 32, temp: 99.0, spo2: 86, spo2Source: '2L NC', consciousness: 'Somnolent', pain: 2 });
        physicalExam = [{ system: 'Respiratory', findings: 'Tripod positioning; Accessory muscle use.', isAbnormal: true }];
        orders = [{ id: 'o-bipap', name: 'Initiate BiPAP; monitor ABGs', status: 'pending', timestamp: '11:15' }];
    } else if (item.id === 'mi_women_recognition_highlight_v1') {
        vitals.push({ time: '08:00', hr: 104, sbp: 114, dbp: 76, rr: 20, temp: 98.4, spo2: 94, spo2Source: 'RA', consciousness: 'Alert', pain: 5 });
        physicalExam = [{ system: 'General', findings: 'Pale, diaphoretic skin; Nausea.', isAbnormal: true }];
        orders = [{ id: 'o-ecg', name: '12-lead ECG; troponin I Stat', status: 'pending', timestamp: '08:05' }];
    } else if (item.id === 'meningitis_recognition_highlight_v1') {
        vitals.push({ time: '10:00', hr: 112, sbp: 110, dbp: 72, rr: 22, temp: 103.2, spo2: 97, spo2Source: 'RA', consciousness: 'Alert', pain: 8 });
        physicalExam = [{ system: 'Neurological', findings: 'Positive Kernig and Brudzinski signs; Petechial rash.', isAbnormal: true }];
        orders = [{ id: 'o-lp', name: 'Prepare for Lumbar Puncture; initiate droplet precautions', status: 'active', timestamp: '10:15' }];
    } else if (item.id === 'thyroid_storm_recognition_highlight_v1') {
        vitals.push({ time: '12:00', hr: 162, sbp: 158, dbp: 88, rr: 28, temp: 105.4, spo2: 95, spo2Source: 'RA', consciousness: 'Agitated', pain: 2 });
        orders = [{ id: 'o-cool', name: 'Cooling blanket; Ice packs to axilla/groin', status: 'pending', timestamp: '12:05' }];
    } else if (item.id === 'hypoglycemia_elderly_recognition_highlight_v1') {
        vitals.push({ time: '08:00', hr: 108, sbp: 112, dbp: 68, rr: 18, temp: 98.0, spo2: 98, spo2Source: 'RA', consciousness: 'Lethargic', pain: 0 });
        orders = [{ id: 'o-glu', name: 'Fingerstick blood glucose Stat; 15g Fast-acting carbs', status: 'pending', timestamp: '08:05' }];
    } else if (item.id === 'right_heart_failure_assessment_highlight_v1') {
        vitals.push({ time: '09:00', hr: 92, sbp: 128, dbp: 82, rr: 20, temp: 98.6, spo2: 95, spo2Source: 'RA', consciousness: 'Alert', pain: 2 });
        physicalExam = [{ system: 'Cardiovascular', findings: 'JVD at 45 degrees; Hepatomegaly.', isAbnormal: true }];
        orders = [{ id: 'o-weight', name: 'Daily weights; strict I&O', status: 'active', timestamp: '09:05' }];
    } else if (item.id === 'left_heart_failure_assessment_highlight_v1') {
        vitals.push({ time: '08:00', hr: 108, sbp: 148, dbp: 94, rr: 28, temp: 98.4, spo2: 90, spo2Source: 'RA', consciousness: 'Alert', pain: 4 });
        physicalExam = [{ system: 'Respiratory', findings: 'Bibasilar crackles; Pink, frothy sputum.', isAbnormal: true }];
        orders = [{ id: 'o-lasix', name: 'Furosemide 40 mg IV push Stat', status: 'pending', timestamp: '08:05' }];
    } else if (item.id === 'nephrotic_syndrome_recognition_highlight_v1') {
        vitals.push({ time: '08:00', hr: 110, sbp: 98, dbp: 62, rr: 24, temp: 98.6, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 1 });
        physicalExam = [{ system: 'General', findings: 'Generalized edema (anasarca).', isAbnormal: true }];
        orders = [{ id: 'o-ua', name: '24-hour urine collection for protein', status: 'active', timestamp: '08:15' }];
    } else if (item.id === 'pyloric_stenosis_recognition_highlight_v1') {
        vitals.push({ time: '09:00', hr: 148, sbp: 72, dbp: 44, rr: 32, temp: 98.8, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 4 });
        physicalExam = [{ system: 'Abdominal', findings: 'Olive-shaped mass in epigastrium.', isAbnormal: true }];
    } else if (item.id === 'hip_fracture_recognition_highlight_v1') {
        vitals.push({ time: '14:00', hr: 110, sbp: 138, dbp: 86, rr: 24, temp: 98.6, spo2: 97, spo2Source: 'RA', consciousness: 'Alert', pain: 9 });
        physicalExam = [{ system: 'Musculoskeletal', findings: 'Right leg shortened and externally rotated.', isAbnormal: true }];
    } else if (item.id === 'lupus_recognition_highlight_v1') {
        vitals.push({ time: '08:00', hr: 78, sbp: 118, dbp: 74, rr: 16, temp: 98.4, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 6 });
        physicalExam = [{ system: 'Integumentary', findings: 'Malar (butterfly) rash; photosensitivity.', isAbnormal: true }];
    } else if (item.id === 'anorexia_physical_signs_highlight_v1') {
        vitals.push({ time: '08:00', hr: 42, sbp: 88, dbp: 52, rr: 16, temp: 96.8, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 0 });
        physicalExam = [{ system: 'General', findings: 'Lanugo on back; Parotid gland enlargement.', isAbnormal: true }];
    } else if (item.id === 'delirium_recognition_highlight_v1') {
        vitals.push({ time: '02:00', hr: 98, sbp: 132, dbp: 84, rr: 20, temp: 98.6, spo2: 96, spo2Source: 'RA', consciousness: 'Confused', pain: 4 });
        physicalExam = [{ system: 'Neurological', findings: 'Fluctuating LOC; Visual hallucinations.', isAbnormal: true }];
    } else if (item.id === 'autonomic_dysreflexia_highlight_v1') {
        vitals.push({ time: '14:00', hr: 52, sbp: 188, dbp: 104, rr: 20, temp: 98.6, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 10 });
        physicalExam = [{ system: 'Integumentary', findings: 'Flushing above T4; Cool below T4.', isAbnormal: true }];
    } else if (item.id === 'pyloric_stenosis_multipleChoice_v1') {
        vitals.push({ time: '07:00', hr: 140, sbp: 70, dbp: 40, rr: 32, temp: 98.9, spo2: 99, spo2Source: 'RA', consciousness: 'Lethargic', pain: 4 });
        physicalExam = [{ system: 'Abdominal', findings: 'Firm, non-tender, olive-shaped mass in the epigastric area.', isAbnormal: true }];
        orders = [{ id: 'o-pylo', name: 'NPO status; IV fluids D5 0.45% NS with 20 mEq KCl/L', status: 'active', timestamp: '07:15' }];
    } else if (item.id === 'abruptio_placentae_multipleChoice_v1') {
        vitals.push({ time: '22:00', hr: 110, sbp: 98, dbp: 54, rr: 24, temp: 98.4, spo2: 96, spo2Source: 'RA', consciousness: 'Alert', pain: 10 });
        physicalExam = [{ system: 'Obstetric', findings: 'Uterus is firm/board-like. Minimal dark red discharge noted on pad.', isAbnormal: true }];
        orders = [{ id: 'o-efm', name: 'Continuous Electronic Fetal Monitoring', status: 'active', timestamp: '22:05' }];
    } else if (item.id === 'autonomic_dysreflexia_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 48, sbp: 210, dbp: 110, rr: 20, temp: 98.6, spo2: 97, spo2Source: 'RA', consciousness: 'Alert', pain: 9 });
        physicalExam = [{ system: 'General', findings: 'Flushed skin and Profound diaphoresis above T4; cool skin below.', isAbnormal: true }];
        orders = [{ id: 'o-hob', name: 'Raise head of bed to 90 degrees', status: 'active', timestamp: '14:02' }];
    } else if (item.id === 'warfarin_management_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 72, sbp: 124, dbp: 78, rr: 16, temp: 98.2, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 1 });
        labs = [{ id: 'l-inr', name: 'INR', value: 4.8, unit: '', refLow: 2.0, refHigh: 3.0, timestamp: '07:45' }];
        physicalExam = [{ system: 'Integumentary', findings: 'Generalized ecchymosis over bilateral forearms and shins.', isAbnormal: true }];
        orders = [{ id: 'o-war', name: 'Hold next 2 doses of warfarin', status: 'pending', timestamp: '08:05' }];
    } else if (item.id === 'copd_exacerbation_multipleChoice_v1') {
        vitals.push({ time: '11:00', hr: 108, sbp: 132, dbp: 84, rr: 26, temp: 99.0, spo2: 89, spo2Source: '2L NC', consciousness: 'Somnolent', pain: 2 });
        labs = [{ id: 'l-abg', name: 'PaCO2 (Current)', value: 52, unit: 'mmHg', refLow: 35, refHigh: 45, timestamp: '11:15' }];
        physicalExam = [{ system: 'Respiratory', findings: 'Using pursed-lip breathing. Difficult to arouse with verbal stimuli.', isAbnormal: true }];
        orders = [{ id: 'o-abg', name: 'Repeat arterial blood gas (ABG) in 1 hour', status: 'pending', timestamp: '11:20' }];
    } else if (item.id === 'acute_pancreatitis_multipleChoice_v1') {
        vitals.push({ time: '13:00', hr: 112, sbp: 108, dbp: 62, rr: 22, temp: 100.4, spo2: 95, spo2Source: 'RA', consciousness: 'Alert', pain: 9 });
        labs = [
            { id: 'l-amy', name: 'Amylase', value: 450, unit: 'U/L', refLow: 30, refHigh: 110, timestamp: '13:15' },
            { id: 'l-ca', name: 'Serum Calcium', value: 7.2, unit: 'mg/dL', refLow: 8.5, refHigh: 10.5, timestamp: '13:15' }
        ];
        physicalExam = [{ system: 'Neuromuscular', findings: 'Muscle twitching noted with BP cuff inflation (Positive Trousseau\'s).', isAbnormal: true }];
        orders = [{ id: 'o-ca', name: 'Calcium Gluconate 1g IV over 30 mins', status: 'pending', timestamp: '13:30' }];
    } else if (item.id === 'digoxin_toxicity_multipleChoice_v1') {
        vitals.push({ time: '09:00', hr: 56, sbp: 110, dbp: 68, rr: 18, temp: 98.4, spo2: 96, spo2Source: 'RA', consciousness: 'Alert', pain: 2 });
        labs = [
            { id: 'l-dig', name: 'Digoxin Level', value: 2.1, unit: 'ng/mL', refLow: 0.5, refHigh: 2.0, timestamp: '08:45' },
            { id: 'l-pot', name: 'Serum Potassium', value: 3.2, unit: 'mEq/L', refLow: 3.5, refHigh: 5.0, timestamp: '08:45' }
        ];
        physicalExam = [{ system: 'Sensory', findings: 'Patient reports "yellow-green glow" around hospital room lights.', isAbnormal: true }];
        orders = [{ id: 'o-dig', name: 'Hold Digoxin; Monitor continuous ECG', status: 'active', timestamp: '09:05' }];
    } else if (item.id === 'nephrotic_syndrome_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 110, sbp: 112, dbp: 74, rr: 24, temp: 98.6, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 1 });
        labs = [
            { id: 'l-ua', name: 'Urine Protein', value: 4, unit: '+', refLow: 0, refHigh: 0, timestamp: '08:15' },
            { id: 'l-alb', name: 'Serum Albumin', value: 2.1, unit: 'g/dL', refLow: 3.5, refHigh: 5.0, timestamp: '08:30' }
        ];
        physicalExam = [{ system: 'Integumentary', findings: 'Severe periorbital edema and 3+ pitting edema in lower extremities.', isAbnormal: true }];
        orders = [{ id: 'o-ste', name: 'Prednisone 2 mg/kg/day PO', status: 'pending', timestamp: '09:00' }];
    } else if (item.id === 'hhs_management_multipleChoice_v1') {
        vitals.push({ time: '10:00', hr: 124, sbp: 88, dbp: 52, rr: 24, temp: 99.2, spo2: 94, spo2Source: 'RA', consciousness: 'Confused', pain: 2 });
        labs = [{ id: 'l-glu', name: 'Blood Glucose', value: 840, unit: 'mg/dL', refLow: 70, refHigh: 110, timestamp: '09:45' }];
        physicalExam = [{ system: 'Integumentary', findings: 'Dry mucous membranes; skin tenting present (poor turgor).', isAbnormal: true }];
        orders = [{ id: 'o-hhs', name: '0.9% Normal Saline at 1L/hr IV', status: 'active', timestamp: '10:05' }];
    } else if (item.id === 'cholinergic_crisis_multipleChoice_v1') {
        vitals.push({ time: '11:00', hr: 52, sbp: 90, dbp: 54, rr: 10, temp: 98.0, spo2: 91, spo2Source: 'RA', consciousness: 'Lethargic', pain: 3 });
        physicalExam = [{ system: 'General', findings: 'Profuse salivation, constricted pupils (miosis), and extreme weakness.', isAbnormal: true }];
        orders = [{ id: 'o-atrop', name: 'Atropine 0.5 mg IV push Stat', status: 'pending', timestamp: '11:05' }];
    } else if (item.id === 'compartment_syndrome_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 112, sbp: 130, dbp: 82, rr: 20, temp: 98.8, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 10 });
        physicalExam = [{ system: 'Neurovascular', findings: 'Pain with passive stretch of toes. Lower leg is tense/hard to palpation.', isAbnormal: true }];
        orders = [{ id: 'o-comp', name: 'Notify orthopedic surgeon stat; keep leg at heart level', status: 'active', timestamp: '14:05' }];
    } else if (item.id === 'fat_embolism_multipleChoice_v1') {
        vitals.push({ time: '09:00', hr: 128, sbp: 110, dbp: 68, rr: 32, temp: 101.2, spo2: 84, spo2Source: 'RA', consciousness: 'Disoriented', pain: 7 });
        physicalExam = [{ system: 'Integumentary', findings: 'Fine petechial rash noted across the chest, neck, and axillae.', isAbnormal: true }];
        orders = [{ id: 'o-fat', name: 'Oxygen 100% via non-rebreather mask', status: 'active', timestamp: '09:05' }];
    } else if (item.id === 'sickle_cell_crisis_multipleChoice_v1') {
        vitals.push({ time: '15:00', hr: 118, sbp: 108, dbp: 64, rr: 24, temp: 101.4, spo2: 94, spo2Source: 'RA', consciousness: 'Alert', pain: 10 });
        physicalExam = [{ system: 'Musculoskeletal', findings: 'Warmth and swelling noted in bilateral knee joints.', isAbnormal: true }];
        orders = [{ id: 'o-sic', name: 'Increase IV D5 0.45% NS to 150 mL/hr', status: 'active', timestamp: '15:10' }];
    } else if (item.id === 'peritonitis_dialysis_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 88, sbp: 138, dbp: 86, rr: 18, temp: 100.6, spo2: 98, spo2Source: 'RA', consciousness: 'Alert', pain: 4 });
        physicalExam = [{ system: 'Abdominal', findings: 'Generalized tenderness to palpation. Rebound tenderness present.', isAbnormal: true }];
        orders = [{ id: 'o-peri', name: 'Send peritoneal fluid for culture and gram stain', status: 'pending', timestamp: '08:20' }];
    } else if (item.id === 'epiglottitis_emergency_multipleChoice_v1') {
        vitals.push({ time: '19:00', hr: 148, sbp: 90, dbp: 58, rr: 36, temp: 103.8, spo2: 92, spo2Source: 'RA', consciousness: 'Anxious', pain: 4 });
        physicalExam = [{ system: 'Respiratory', findings: 'Sitting in tripod position. Excessive drooling noted. Stridor present.', isAbnormal: true }];
        orders = [{ id: 'o-epi', name: 'Stay with child; notify Rapid Response/Anesthesia', status: 'active', timestamp: '19:05' }];
    } else if (item.id === 'hellp_syndrome_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 98, sbp: 178, dbp: 112, rr: 20, temp: 98.6, spo2: 97, spo2Source: 'RA', consciousness: 'Alert', pain: 8 });
        labs = [
            { id: 'l-ast', name: 'AST', value: 180, unit: 'U/L', refLow: 10, refHigh: 40, timestamp: '14:30' },
            { id: 'l-plt', name: 'Platelets', value: 65000, unit: 'mm3', refLow: 150000, refHigh: 450000, timestamp: '14:30' }
        ];
        physicalExam = [{ system: 'Abdominal', findings: 'Severe RUQ tenderness; liver palpated 2cm below costal margin.', isAbnormal: true }];
        orders = [{ id: 'o-mag', name: 'Magnesium Sulfate 4g IV bolus; then 2g/hr', status: 'active', timestamp: '14:45' }];
    } else if (item.id === 'tpn_air_embolism_multipleChoice_v1') {
        vitals.push({ time: '10:00', hr: 132, sbp: 88, dbp: 50, rr: 36, temp: 98.4, spo2: 82, spo2Source: 'RA', consciousness: 'Panic', pain: 4 });
        physicalExam = [{ system: 'Cardiovascular', findings: 'Loud "churning" (mill-wheel) murmur heard upon auscultation.', isAbnormal: true }];
        orders = [{ id: 'o-tpn', name: 'Place in Left Lateral Trendelenburg immediately', status: 'active', timestamp: '10:02' }];
    } else if (item.id === 'cardiac_tamponade_multipleChoice_v1') {
        vitals.push({ time: '02:00', hr: 124, sbp: 82, dbp: 74, rr: 28, temp: 98.2, spo2: 93, spo2Source: '4L NC', consciousness: 'Alert', pain: 6 });
        physicalExam = [{ system: 'Cardiovascular', findings: 'Distended neck veins (JVD). Heart sounds are muffled.', isAbnormal: true }];
        orders = [{ id: 'o-beck', name: 'Verify Pulsus Paradoxus; prepare for pericardiocentesis', status: 'active', timestamp: '02:05' }];
    } else if (item.id === 'neuro_stroke_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 88, sbp: 184, dbp: 102, rr: 20, temp: 98.6, spo2: 95, spo2Source: 'RA', consciousness: 'Alert', pain: 2 });
        physicalExam = [{ system: 'Neurological', findings: 'Right-sided facial droop and slurred speech; right-sided weakness (3/5).', isAbnormal: true }];
        orders = [{ id: 'o-ct', name: 'Stat Non-contrast Head CT Scan', status: 'pending', timestamp: '08:05' }];
    } else if (item.id === 'renal_hemodialysis_multipleChoice_v1') {
        vitals.push({ time: '11:00', hr: 110, sbp: 92, dbp: 54, rr: 22, temp: 98.4, spo2: 97, spo2Source: 'RA', consciousness: 'Alert', pain: 6 });
        orders = [{ id: 'o-saline', name: '0.9% Normal Saline 200 mL bolus via dialysis circuit', status: 'pending', timestamp: '11:05' }];
    } else if (item.id === 'pharm_blood_reaction_multipleChoice_v1') {
        vitals.push({ time: '09:15', hr: 118, sbp: 92, dbp: 58, rr: 28, temp: 101.4, spo2: 92, spo2Source: 'RA', consciousness: 'Alert', pain: 8 });
        physicalExam = [{ system: 'General', findings: 'Patient reports severe lower back pain and chills.', isAbnormal: true }];
        orders = [{ id: 'o-blood-stop', name: 'STOP BLOOD TRANSFUSION; disconnect tubing at hub', status: 'active', timestamp: '09:16' }];
    } else if (item.id === 'trauma_burns_multipleChoice_v1') {
        vitals.push({ time: '12:00', hr: 124, sbp: 104, dbp: 62, rr: 32, temp: 97.4, spo2: 91, spo2Source: 'RA', consciousness: 'Anxious', pain: 9 });
        physicalExam = [{ system: 'Respiratory', findings: 'Hoarseness noted; soot present in nares/mouth; singed nasal hairs.', isAbnormal: true }];
        orders = [{ id: 'o-park', name: 'Parkland Formula resuscitation started at 600 mL/hr', status: 'active', timestamp: '12:05' }];
    } else if (item.id === 'cardiac_afib_multipleChoice_v2') {
        vitals.push({ time: '15:00', hr: 150, sbp: 78, dbp: 44, rr: 24, temp: 98.6, spo2: 92, spo2Source: 'RA', consciousness: 'Confused', pain: 2 });
        physicalExam = [{ system: 'Cardiovascular', findings: 'Rapid, irregular heart rhythm; cool and diaphoretic skin.', isAbnormal: true }];
        orders = [{ id: 'o-sync', name: 'Prepare for Synchronized Cardioversion at 100 Joules', status: 'pending', timestamp: '15:05' }];
    } else if (item.id === 'shock_sepsis_multipleChoice_v1') {
        vitals.push({ time: '06:00', hr: 128, sbp: 74, dbp: 42, rr: 28, temp: 102.8, spo2: 92, spo2Source: 'RA', consciousness: 'Lethargic', pain: 0 });
        labs = [{ id: 'l-lact', name: 'Lactic Acid', value: 5.2, unit: 'mmol/L', refLow: 0.5, refHigh: 2.2, timestamp: '05:30' }];
        orders = [{ id: 'o-levo', name: 'Norepinephrine 8 mcg/min IV infusion', status: 'pending', timestamp: '06:05' }];
    } else if (item.id === 'alcohol_withdrawal_multipleChoice_v1') {
        vitals.push({ time: '18:00', hr: 124, sbp: 172, dbp: 104, rr: 22, temp: 101.2, spo2: 98, spo2Source: 'RA', consciousness: 'Agitated', pain: 4 });
        physicalExam = [{ system: 'Neurological', findings: 'Coarse tremors noted in bilateral upper extremities; profound agitation.', isAbnormal: true }];
        orders = [{ id: 'o-loraz', name: 'Lorazepam 2 mg IV push Stat', status: 'pending', timestamp: '18:05' }];
    } else if (item.id === 'dka_management_multipleChoice_v1') {
        vitals.push({ time: '09:00', hr: 112, sbp: 108, dbp: 62, rr: 28, temp: 99.4, spo2: 97, spo2Source: 'RA', consciousness: 'Somnolent', pain: 2 });
        labs = [{ id: 'l-dka-glu', name: 'Fingerstick Glucose', value: 240, unit: 'mg/dL', refLow: 70, refHigh: 110, timestamp: '08:50' }];
        orders = [{ id: 'o-dka-fluid', name: 'Change IV fluids to D5 0.45% NS at 150 mL/hr', status: 'pending', timestamp: '09:05' }];
    } else if (item.id === 'addisonian_crisis_multipleChoice_v1') {
        vitals.push({ time: '10:00', hr: 118, sbp: 82, dbp: 48, rr: 24, temp: 98.2, spo2: 95, spo2Source: 'RA', consciousness: 'Weak', pain: 3 });
        labs = [
            { id: 'l-add-na', name: 'Sodium', value: 128, unit: 'mEq/L', refLow: 135, refHigh: 145, timestamp: '09:30' },
            { id: 'l-add-k', name: 'Potassium', value: 5.8, unit: 'mEq/L', refLow: 3.5, refHigh: 5.0, timestamp: '09:30' }
        ];
        orders = [{ id: 'o-add-hc', name: 'Hydrocortisone 100 mg IV bolus Stat', status: 'pending', timestamp: '10:05' }];
    } else if (item.id === 'tension_pneumothorax_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 132, sbp: 78, dbp: 42, rr: 36, temp: 98.6, spo2: 82, spo2Source: '100% NRB', consciousness: 'Panic', pain: 10 });
        physicalExam = [
            { system: 'Respiratory', findings: 'Absent breath sounds on the left; hyperresonance to percussion.', isAbnormal: true },
            { system: 'Neck', findings: 'Tracheal deviation to the right; JVD present.', isAbnormal: true }
        ];
        orders = [{ id: 'o-tp-needle', name: 'Prepare for needle thoracostomy', status: 'active', timestamp: '14:02' }];
    } else if (item.id === 'myasthenic_crisis_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 110, sbp: 132, dbp: 88, rr: 32, temp: 98.4, spo2: 90, spo2Source: '2L NC', consciousness: 'Anxious', pain: 2 });
        labs = [{ id: 'l-mc-fvc', name: 'Forced Vital Capacity (FVC)', value: 12, unit: 'mL/kg', refLow: 20, refHigh: 60, timestamp: '07:45' }];
        orders = [{ id: 'o-mc-intub', name: 'Notify anesthesia for emergency intubation', status: 'pending', timestamp: '08:05' }];
    } else if (item.id === 'guillain_barre_multipleChoice_v1') {
        vitals.push({ time: '12:00', hr: 92, sbp: 110, dbp: 72, rr: 28, temp: 98.6, spo2: 93, spo2Source: 'RA', consciousness: 'Alert', pain: 6 });
        physicalExam = [{ system: 'Respiratory', findings: 'Shallow respirations with use of accessory muscles.', isAbnormal: true }];
        orders = [{ id: 'o-gb-vc', name: 'Serial Vital Capacity every 2 hours', status: 'active', timestamp: '08:00' }];
    } else if (item.id === 'eclampsia_seizure_multipleChoice_v1') {
        vitals.push({ time: '16:00', hr: 124, sbp: 188, dbp: 114, rr: 24, temp: 98.8, spo2: 92, spo2Source: 'RA', consciousness: 'Post-ictal', pain: 0 });
        orders = [{ id: 'o-ec-mag', name: 'Magnesium Sulfate 4g IV bolus over 20 mins', status: 'pending', timestamp: '16:10' }];
    } else if (item.id === 'intussusception_recognition_multipleChoice_v1') {
        vitals.push({ time: '11:00', hr: 162, sbp: 80, dbp: 44, rr: 42, temp: 100.2, spo2: 98, spo2Source: 'RA', consciousness: 'Lethargic', pain: 9 });
        physicalExam = [{ system: 'Abdominal', findings: 'Sausage-shaped mass in RUQ; Dance sign (empty RLQ). Stool contains blood and mucus.', isAbnormal: true }];
        orders = [{ id: 'o-in-enema', name: 'Prepare for air/barium enema', status: 'pending', timestamp: '11:15' }];
    } else if (item.id === 'kawasaki_aspirin_multipleChoice_v1') {
        vitals.push({ time: '09:00', hr: 148, sbp: 92, dbp: 58, rr: 32, temp: 104.2, spo2: 97, spo2Source: 'RA', consciousness: 'Irritable', pain: 5 });
        physicalExam = [{ system: 'HEENT', findings: 'Strawberry tongue, cracked lips, and non-purulent conjunctivitis.', isAbnormal: true }];
        orders = [{ id: 'o-ka-ivig', name: 'IVIG 2g/kg over 12 hours', status: 'pending', timestamp: '09:30' }];
    } else if (item.id === 'serotonin_syndrome_recognition_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 132, sbp: 158, dbp: 94, rr: 24, temp: 101.8, spo2: 95, spo2Source: 'RA', consciousness: 'Agitated', pain: 4 });
        physicalExam = [{ system: 'Neurological', findings: 'Spontaneous clonus in lower extremities; +4 hyperreflexia.', isAbnormal: true }];
        orders = [{ id: 'o-ss-cypro', name: 'Cyproheptadine 12 mg PO Stat', status: 'pending', timestamp: '14:15' }];
    } else if (item.id === 'nms_rigidity_multipleChoice_v1') {
        vitals.push({ time: '18:00', hr: 128, sbp: 172, dbp: 104, rr: 32, temp: 105.2, spo2: 92, spo2Source: 'RA', consciousness: 'Obtunded', pain: 0 });
        physicalExam = [{ system: 'Musculoskeletal', findings: 'Lead-pipe rigidity noted throughout all extremities.', isAbnormal: true }];
        orders = [{ id: 'o-nms-dant', name: 'Dantrolene 2.5 mg/kg IV push', status: 'pending', timestamp: '18:15' }];
    } else if (item.id === 'aortic_dissection_bp_multipleChoice_v1') {
        vitals.push({ time: '02:00', hr: 118, sbp: 198, dbp: 112, rr: 24, temp: 98.4, spo2: 94, spo2Source: 'RA', consciousness: 'Alert', pain: 10 });
        physicalExam = [{ system: 'Cardiovascular', findings: 'Differential blood pressure of >20 mmHg between arms.', isAbnormal: true }];
        orders = [{ id: 'o-ad-esmolol', name: 'Esmolol infusion titrate to SBP < 120 and HR < 60', status: 'pending', timestamp: '02:05' }];
    } else if (item.id === 'siadh_fluid_restriction_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 82, sbp: 128, dbp: 84, rr: 18, temp: 98.6, spo2: 98, spo2Source: 'RA', consciousness: 'Confused', pain: 1 });
        labs = [{ id: 'l-siadh-na', name: 'Serum Sodium', value: 122, unit: 'mEq/L', refLow: 135, refHigh: 145, timestamp: '07:30' }];
        orders = [{ id: 'o-siadh-fr', name: 'Fluid restriction < 800 mL/24h', status: 'active', timestamp: '08:10' }];
    } else if (item.id === 'diabetes_insipidus_evaluation_multipleChoice_v1') {
        vitals.push({ time: '11:00', hr: 112, sbp: 94, dbp: 58, rr: 20, temp: 98.2, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 1 });
        labs = [{ id: 'l-di-sg', name: 'Urine Specific Gravity', value: 1.002, unit: '', refLow: 1.010, refHigh: 1.030, timestamp: '10:45' }];
    } else if (item.id === 'anaphylaxis_epinephrine_multipleChoice_v1') {
        vitals.push({ time: '10:15', hr: 136, sbp: 84, dbp: 48, rr: 32, temp: 98.6, spo2: 86, spo2Source: 'RA', consciousness: 'Panic', pain: 0 });
        physicalExam = [{ system: 'Respiratory', findings: 'High-pitched inspiratory stridor and generalized wheezing.', isAbnormal: true }];
        orders = [{ id: 'o-ana-epi', name: 'Epinephrine 0.3 mg IM Stat', status: 'pending', timestamp: '10:16' }];
    } else if (item.id === 'ards_refractory_hypoxemia_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 122, sbp: 98, dbp: 54, rr: 36, temp: 101.2, spo2: 82, spo2Source: '100% NRB', consciousness: 'Anxious', pain: 2 });
        imaging = [{ type: 'Chest X-ray', view: 'Portable AP', findings: 'Diffuse bilateral alveolar infiltrates ("white-out").', status: 'final', timestamp: '14:30' }];
        orders = [{ id: 'o-ards-peep', name: 'Intubation; Lung-protective ventilation with high PEEP', status: 'pending', timestamp: '14:45' }];
    } else if (item.id === 'hypocalcemia_thyroidectomy_multipleChoice_v1') {
        vitals.push({ time: '20:00', hr: 88, sbp: 118, dbp: 76, rr: 18, temp: 98.4, spo2: 99, spo2Source: 'RA', consciousness: 'Alert', pain: 4 });
        physicalExam = [{ system: 'Musculoskeletal', findings: 'Positive Trousseau sign (carpal spasm with BP cuff inflation).', isAbnormal: true }];
        orders = [{ id: 'o-ca-gluc', name: 'Calcium Gluconate 1g IV over 10 mins', status: 'pending', timestamp: '20:15' }];
    } else if (item.id === 'placenta_previa_painless_multipleChoice_v1') {
        vitals.push({ time: '11:00', hr: 108, sbp: 102, dbp: 58, rr: 22, temp: 98.4, spo2: 97, spo2Source: 'RA', consciousness: 'Alert', pain: 0 });
        physicalExam = [{ system: 'Obstetric', findings: 'Painless bright red vaginal bleeding; abdomen is soft and non-tender.', isAbnormal: true }];
        orders = [{ id: 'o-previa-us', name: 'Transabdominal Ultrasound for placental localization', status: 'pending', timestamp: '11:15' }];
    } else if (item.id === 'hip_fracture_bucks_multipleChoice_v1') {
        vitals.push({ time: '08:00', hr: 92, sbp: 138, dbp: 82, rr: 18, temp: 98.6, spo2: 96, spo2Source: 'RA', consciousness: 'Alert', pain: 8 });
        physicalExam = [{ system: 'Musculoskeletal', findings: 'Right leg is shorter than left and externally rotated.', isAbnormal: true }];
        orders = [{ id: 'o-bucks', name: 'Maintain Buck\'s traction; monitor skin integrity', status: 'active', timestamp: '07:30' }];
    } else if (item.id === 'hepatic_encephalopathy_lactulose_multipleChoice_v1') {
        vitals.push({ time: '14:00', hr: 98, sbp: 110, dbp: 64, rr: 20, temp: 98.2, spo2: 95, spo2Source: 'RA', consciousness: 'Disoriented', pain: 2 });
        labs = [{ id: 'l-liver-amm', name: 'Ammonia', value: 142, unit: 'µmol/L', refLow: 10, refHigh: 80, timestamp: '13:00' }];
        physicalExam = [{ system: 'Neurological', findings: 'Asterixis (hand flapping) present when arms are extended.', isAbnormal: true }];
        orders = [{ id: 'o-lact', name: 'Lactulose 30 mL PO tid to achieve 2-3 soft stools/day', status: 'active', timestamp: '14:10' }];
    } else if (item.id === 'post_op_hemorrhage_multipleChoice_v1') {
        vitals.push({ time: '12:00', hr: 118, sbp: 102, dbp: 62, rr: 26, temp: 97.2, spo2: 94, spo2Source: 'RA', consciousness: 'Anxious', pain: 4 });
        physicalExam = [{ system: 'Integumentary', findings: 'Abdominal dressing is saturated with bright red blood; skin is cool/clammy.', isAbnormal: true }];
        orders = [{ id: 'o-hem-bolus', name: '500 mL NS bolus Stat; Draw type and match', status: 'pending', timestamp: '12:05' }];
    }

    const clinicalData: ClinicalData = {
        vitals,
        labs,
        imaging,
        physicalExam,
        notes: [
            {
                id: 'n-baseline',
                title: 'RN Admission Note',
                situation:
                    item.id === 'digital_privacy_multipleChoice_v1' ? 'General staff unit safety and protocol discussion.' :
                        item.id === 'icp_monitoring_multipleChoice_v1' ? '24yo male post-MVA with traumatic brain injury and EVD placement.' :
                            item.id === 'unbiased_care_multipleChoice_v1' ? '30yo non-binary patient admitted for elective knee arthroscopy.' :
                                item.id === 'language_access_multipleChoice_v1' ? '56yo female with severe RUQ pain requiring urgent surgical evaluation.' :
                                    item.id === 'svt_management_multipleChoice_v1' ? '65yo male reporting sudden onset of heart racing and chest palpitations.' :
                                        item.id === 'pe_recognition_multipleChoice_v1' ? '70yo female 24h post-op reporting sudden sharp chest pain.' :
                                            item.id === 'potassium_multipleChoice_v1' ? '54yo female with severe dehydration and electrolyte imbalance.' :
                                                item.id === 'thyroid_storm_multipleChoice_v1' ? '38yo post-thyroidectomy displaying extreme sympathetic overdrive.' :
                                                    item.id === 'lithium_toxicity_multipleChoice_v1' ? '29yo male with known bipolar disorder presenting with neuro-toxicity.' :
                                                        item.id === 'pyloric_stenosis_multipleChoice_v1' ? '6-week-old infant with persistent projectile vomiting.' :
                                                            item.id === 'abruptio_placentae_multipleChoice_v1' ? '28yo female at 36wks with sudden abdominal rigidity.' :
                                                                item.id === 'autonomic_dysreflexia_multipleChoice_v1' ? '24yo male with SCI T4 reporting a throbbing headache.' :
                                                                    item.id === 'warfarin_management_multipleChoice_v1' ? '68yo male with A-fib reporting spontaneous bruising.' :
                                                                        item.id === 'copd_exacerbation_multipleChoice_v1' ? '72yo male with chronic lung disease and altered mental status.' :
                                                                            item.id === 'acute_pancreatitis_multipleChoice_v1' ? '45yo male with severe back-radiating pain and positive Trousseau sign.' :
                                                                                item.id === 'digoxin_toxicity_multipleChoice_v1' ? '78yo taking digoxin reporting yellow visual halos.' :
                                                                                    item.id === 'nephrotic_syndrome_multipleChoice_v1' ? '4yo child with severe facial edema and 4+ proteinuria.' :
                                                                                        item.id === 'hhs_management_multipleChoice_v1' ? '82yo with Type 2 DM and profound hyperosmolar dehydration.' :
                                                                                            item.id === 'cholinergic_crisis_multipleChoice_v1' ? '42yo with MG presenting with SLUDGE syndrome and miosis.' :
                                                                                                item.id === 'compartment_syndrome_multipleChoice_v1' ? '19yo post-tibia fracture with pain out of proportion.' :
                                                                                                    item.id === 'fat_embolism_multipleChoice_v1' ? '22yo with femur fracture, petechiae, and hypoxia.' :
                                                                                                        item.id === 'sickle_cell_crisis_multipleChoice_v1' ? '10yo child in vaso-occlusive crisis with severe joint pain.' :
                                                                                                            item.id === 'peritonitis_dialysis_multipleChoice_v1' ? '64yo on PD reporting cloudy effluent and abdominal pain.' :
                                                                                                                item.id === 'epiglottitis_emergency_multipleChoice_v1' ? '3yo in tripod position with drooling and high fever.' :
                                                                                                                    item.id === 'hellp_syndrome_multipleChoice_v1' ? '31yo at 35wks with RUQ pain and severe hypertension.' :
                                                                                                                        item.id === 'tpn_air_embolism_multipleChoice_v1' ? '55yo on TPN with sudden SOB and mill-wheel murmur.' :
                                                                                                                            item.id === 'cardiac_tamponade_multipleChoice_v1' ? '66yo post-CABG with Beck\'s triad and muffled heart sounds.' :
                                                                                                                                item.id === 'neuro_stroke_multipleChoice_v1' ? '68yo male with sudden right-sided facial drooping and slurred speech.' :
                                                                                                                                    item.id === 'renal_hemodialysis_multipleChoice_v1' ? '62yo male on chronic hemodialysis reporting severe muscle cramps and dizziness.' :
                                                                                                                                        item.id === 'pharm_blood_reaction_multipleChoice_v1' ? '45yo male reporting back pain and chills shortly after starting PRBC transfusion.' :
                                                                                                                                            item.id === 'trauma_burns_multipleChoice_v1' ? '45yo male with 36% TBSA full-thickness burns reporting hoarseness.' :
                                                                                                                                                item.id === 'cardiac_afib_multipleChoice_v2' ? '74yo male in A-fib with extreme hypotension and confusion.' :
                                                                                                                                                    item.id === 'shock_sepsis_multipleChoice_v1' ? '66yo male with septic shock and refractory hypotension despite fluid bolus.' :
                                                                                                                                                        item.id === 'alcohol_withdrawal_multipleChoice_v1' ? '50yo male 48h post-op displaying tremors, agitation, and hypertension.' :
                                                                                                                                                            item.id === 'dka_management_multipleChoice_v1' ? '19yo with Type 1 DM presenting with Kussmaul respirations and fruity breath.' :
                                                                                                                                                                item.id === 'addisonian_crisis_multipleChoice_v1' ? '42yo with known Addison\'s presenting with profound weakness and hypotension.' :
                                                                                                                                                                    item.id === 'tension_pneumothorax_multipleChoice_v1' ? '28yo male post-trauma with unilateral absent breath sounds and tracheal shift.' :
                                                                                                                                                                        item.id === 'myasthenic_crisis_multipleChoice_v1' ? '45yo with Myasthenia Gravis presenting with acute respiratory failure.' :
                                                                                                                                                                            item.id === 'guillain_barre_multipleChoice_v1' ? '34yo presenting with progressive ascending paralysis following a viral illness.' :
                                                                                                                                                                                item.id === 'eclampsia_seizure_multipleChoice_v1' ? '26yo G1P0 at 36wks gestation having a tonic-clonic seizure.' :
                                                                                                                                                                                    item.id === 'intussusception_recognition_multipleChoice_v1' ? '8-month-old infant with episodic screaming and currant jelly stool.' :
                                                                                                                                                                                        item.id === 'kawasaki_aspirin_multipleChoice_v1' ? '4yo child with high fever, strawberry tongue, and rash.' :
                                                                                                                                                                                            item.id === 'serotonin_syndrome_recognition_multipleChoice_v1' ? '22yo presenting with agitation, hyperreflexia, and clonus.' :
                                                                                                                                                                                                item.id === 'nms_rigidity_multipleChoice_v1' ? '31yo on antipsychotics presenting with high fever and "lead-pipe" rigidity.' :
                                                                                                                                                                                                    item.id === 'aortic_dissection_bp_multipleChoice_v1' ? '62yo with sudden-onset "tearing" chest pain radiating to the back.' :
                                                                                                                                                                                                        item.id === 'siadh_fluid_restriction_multipleChoice_v1' ? '68yo with lung cancer presenting with hyponatremia and confusion.' :
                                                                                                                                                                                                            item.id === 'diabetes_insipidus_evaluation_multipleChoice_v1' ? '45yo post-hypophysectomy with massive polyuria and low specific gravity.' :
                                                                                                                                                                                                                item.id === 'anaphylaxis_epinephrine_multipleChoice_v1' ? '29yo with acute respiratory distress and hives after IV antibiotic.' :
                                                                                                                                                                                                                    item.id === 'ards_refractory_hypoxemia_multipleChoice_v1' ? '52yo in septic shock with refractory hypoxemia and white-out on CXR.' :
                                                                                                                                                                                                                        item.id === 'hypocalcemia_thyroidectomy_multipleChoice_v1' ? '38yo female post-thyroidectomy with tingling and positive Trousseau sign.' :
                                                                                                                                                                                                                            item.id === 'placenta_previa_painless_multipleChoice_v1' ? '28yo at 32wks with painless bright red vaginal bleeding.' :
                                                                                                                                                                                                                                item.id === 'hip_fracture_bucks_multipleChoice_v1' ? '76yo with hip fracture in Buck\'s traction awaiting surgery.' :
                                                                                                                                                                                                                                    item.id === 'hepatic_encephalopathy_lactulose_multipleChoice_v1' ? '58yo with cirrhosis presenting with asterixis and confusion.' :
                                                                                                                                                                                                                                        item.id === 'post_op_hemorrhage_multipleChoice_v1' ? '45yo post-op with tachycardia and saturated abdominal dressing.' :
                                                                                                                                                                                                                                            item.id === 'rsv_bronchiolitis_highlight_v1' ? '8-month-old infant with respiratory distress and wheezing.' :
                                                                                                                                                                                                                                                item.id === 'preeclampsia_recognition_highlight_v1' ? '28yo G1P0 at 28wks with severe headache and hypertension.' :
                                                                                                                                                                                                                                                    item.id === 'ischemic_stroke_recognition_highlight_v1' ? '68yo male with right-sided weakness and slurred speech.' :
                                                                                                                                                                                                                                                        item.id === 'sepsis_early_recognition_highlight_v1' ? '75yo male with suspected UTI showing signs of sepsis.' :
                                                                                                                                                                                                                                                            item.id === 'upper_gi_bleed_shock_highlight_v1' ? '52yo female with melena and orthostatic hypotension.' :
                                                                                                                                                                                                                                                                item.id === 'dvt_recognition_highlight_v1' ? '72yo male post-hip surgery with unilateral calf swelling.' :
                                                                                                                                                                                                                                                                    item.id === 'copd_respiratory_failure_highlight_v1' ? '72yo male with COPD exacerbation and somnolence.' :
                                                                                                                                                                                                                                                                        item.id === 'mi_women_recognition_highlight_v1' ? '62yo female with epigastric pain and atypical MI symptoms.' :
                                                                                                                                                                                                                                                                            item.id === 'meningitis_recognition_highlight_v1' ? '19yo student with nuchal rigidity and petechial rash.' :
                                                                                                                                                                                                                                                                                item.id === 'thyroid_storm_recognition_highlight_v1' ? '34yo female with Graves\' disease in hyperthyroid crisis.' :
                                                                                                                                                                                                                                                                                    item.id === 'hypoglycemia_elderly_recognition_highlight_v1' ? '84yo with DM2 presenting with altered consciousness.' :
                                                                                                                                                                                                                                                                                        item.id === 'right_heart_failure_assessment_highlight_v1' ? '68yo female with systemic edema and JVD.' :
                                                                                                                                                                                                                                                                                            item.id === 'left_heart_failure_assessment_highlight_v1' ? '70yo male with pulmonary congestion and pink sputum.' :
                                                                                                                                                                                                                                                                                                item.id === 'nephrotic_syndrome_recognition_highlight_v1' ? '4yo child with orbital edema and hypoalbuminemia.' :
                                                                                                                                                                                                                                                                                                    item.id === 'pyloric_stenosis_recognition_highlight_v1' ? '6-week-old with projectile vomiting and olive mass.' :
                                                                                                                                                                                                                                                                                                        item.id === 'hip_fracture_recognition_highlight_v1' ? '82yo female with shortened, externally rotated leg.' :
                                                                                                                                                                                                                                                                                                            item.id === 'lupus_recognition_highlight_v1' ? '24yo female with malar rash and arthritis.' :
                                                                                                                                                                                                                                                                                                                item.id === 'anorexia_physical_signs_highlight_v1' ? '16yo female with severe malnutrition and bradycardia.' :
                                                                                                                                                                                                                                                                                                                    item.id === 'delirium_recognition_highlight_v1' ? '88yo hospitalized male with acute confusion and inattention.' :
                                                                                                                                                                                                                                                                                                                        item.id === 'autonomic_dysreflexia_highlight_v1' ? '24yo with SCI reporting severe headache and hypertension.' :
                                                                                                                                                                                                                                                                                                                            'Clinical evaluation in progress.',
                background:
                    item.id === 'unbiased_care_multipleChoice_v1' ? 'Affirmed name: Robin (they/them). Legal name: Robert. Noted history of anxiety related to clinical settings.' :
                        item.id === 'language_access_multipleChoice_v1' ? 'Limited English Proficiency (LEP). Primary language stated as Mandarin. Patient is accompanied by her adult child.' :
                            item.id === 'acute_pancreatitis_multipleChoice_v1' ? 'History of gallstones and recent binge drinking. Admitted 2 hours ago for severe epigastric pain.' :
                                item.id === 'digoxin_toxicity_multipleChoice_v1' ? 'Chronic heart failure (CHF) and atrial fibrillation. Home medications include digoxin and furosemide.' :
                                    item.id === 'nephrotic_syndrome_multipleChoice_v1' ? 'Child with no prior renal history. Parents noticed "swollen eyes" for 3 days.' :
                                        item.id === 'hhs_management_multipleChoice_v1' ? 'Type 2 DM for 15 years. Found by neighbor confused and unable to stand. History of recent UTI.' :
                                            item.id === 'dka_management_multipleChoice_v1' ? 'T1DM diagnosed at age 12. Admitted today for severe hyperglycemia and anion gap acidosis.' :
                                                item.id === 'addisonian_crisis_multipleChoice_v1' ? 'History of autoimmune adrenalitis. Recently missed several doses of prednisone due to GI illness.' :
                                                    item.id === 'myasthenic_crisis_multipleChoice_v1' ? 'Chronic MG managed with pyridostigmine. Recent pneumonia exacerbating weakness.' :
                                                        item.id === 'guillain_barre_multipleChoice_v1' ? 'Reports having a "stomach flu" two weeks ago. Now has symmetrical weakness starting in feet.' :
                                                            item.id === 'eclampsia_seizure_multipleChoice_v1' ? 'Preeclampsia diagnosed at 32wks. Admitted for induction; vitals were 182/110 before seizure.' :
                                                                item.id === 'kawasaki_aspirin_multipleChoice_v1' ? 'Child with 6 days of persistent fever >102. Irritability and refusing to walk.' :
                                                                    item.id === 'serotonin_syndrome_recognition_multipleChoice_v1' ? 'Current SSRI user. Recently started taking herbal supplements for depression.' :
                                                                        item.id === 'aortic_dissection_bp_multipleChoice_v1' ? 'Long-term history of uncontrolled hypertension and tobacco use.' :
                                                                            item.id === 'placenta_previa_painless_multipleChoice_v1' ? 'Multiparous patient; previous C-section. Episode of bleeding started while resting.' :
                                                                                item.id === 'hepatic_encephalopathy_lactulose_multipleChoice_v1' ? 'End-stage liver disease secondary to chronic Hepatitis C. Noted increased confusion over 2 days.' :
                                                                                    item.id === 'post_op_hemorrhage_multipleChoice_v1' ? 'S/P exploratory laparotomy for bowel obstruction. Heart rate trending upward from 84 to 118.' :
                                                                                        item.id === 'alcohol_withdrawal_multipleChoice_v1' ? 'Admitted for appendectomy. History of daily heavy alcohol use (12+ beers/day).' :
                                                                                            'Hx of priority clinical concerns relevant to current admission.',
                assessment: 'Initial assessment confirms findings described in question stem.',
                recommendation: 'Monitor vitals and response to interventions.',
                author: 'Nurse Ratched',
                authorRole: 'RN',
                timestamp: '07:00',
                content: 'Patient evaluated for acute status changes.'
            }
        ],
        medications,
        orders
    };

    return {
        id: `standalone-${item.id}`,
        title: `NGN Standalone Drill — ${item.id.toUpperCase()}`,
        patient,
        clinicalData,
        items: [item],
        timeLimit: 600
    };
}

// --- Library Export ---
export function getCaseStudyLibrary(): CaseStudy[] {
    // Only includes core cases, standalones are loaded asynchronously
    return [
        createCHFCase(),
        createRespiratoryCase(),
        createMaternityCase()
    ];
}
