# 🔬 NCLEX-RN NGN 2026 — SENTINEL QA Rotator Service v2.0

> **Codename: SENTINEL v2.0**
> *14-Key Multi-Role Deep Audit, Screening, Repair & Enrichment Engine*
> *This system REPLACES all previous QA systems and is the SOLE source of truth for item quality.*

---

## 🎯 Mission Statement

SENTINEL v2.0 is a **one-button** deep audit system accessible from the Vercel-deployed Item Bank.
It uses **14 Gemini API keys** — each assigned a permanent clinical psychometrician role — to:

1. **SCREEN** every item across 12+ quality dimensions
2. **FIX** all structural, clinical, and content defects automatically
3. **REFILL** missing data with clinically specific, non-generic content
4. **ENRICH** items with isolation logic, allergy cross-referencing, and EHR synchronization
5. **REPORT** a comprehensive quality dashboard with per-item diagnostics and recommendations

**Zero tolerance for generic filler. Zero tolerance for orphaned clinical references.**

---

## ⚡ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  VERCEL LIVE DEPLOYMENT                                       │
│  ┌──────────────────────────────────────┐                     │
│  │  Item Bank Page → [🛡️ Run SENTINEL] │  ← One-Button       │
│  └────────────┬─────────────────────────┘                     │
│               ▼                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              SENTINEL v2.0 ENGINE                        │ │
│  │                                                          │ │
│  │  PHASE 1: STRUCTURAL PASS (No AI — instant)              │ │
│  │    → Schema, fields, scoring model, type rules            │ │
│  │                                                          │ │
│  │  PHASE 2: DEEP AI AUDIT (14 Keys × Specialist Roles)     │ │
│  │    → Stem clarity, rationale depth, clinical accuracy     │ │
│  │    → EHR sync, isolation/allergy, Study Companion         │ │
│  │    → SBAR format, option plausibility, pedagogy           │ │
│  │                                                          │ │
│  │  PHASE 3: AUTO-HEAL & REFILL                             │ │
│  │    → Replace generic → specific clinical content          │ │
│  │    → Add missing pearls/traps/mnemonics/breakdowns        │ │
│  │    → Sync EHR tabs with question stem                     │ │
│  │    → Set isolation/allergy per clinical context            │ │
│  │                                                          │ │
│  │  PHASE 4: PUSH & REPORT                                  │ │
│  │    → Upsert healed items to Supabase                      │ │
│  │    → Generate SENTINEL Report with recommendations        │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧬 The 14 Specialist Roles

| Key | Role | Audit Domain | Specific Focus |
|:---:|:---|:---|:---|
| 1 | **STRUCT-VALIDATOR** | Schema & Structure | JSON fields, TypeScript interface compliance, id naming |
| 2 | **STEM-SURGEON** | Question Stem Quality | ≤50 words, single-construct, no window dressing, clarity improvement |
| 3 | **OPTION-ARCHITECT** | Answer Options | Count per type, ≤25 words/opt, distractor plausibility, no "All of the above" |
| 4 | **SCORE-AUDITOR** | Scoring Model | Method matches type, maxPoints, penalty model per 2026 spec |
| 5 | **RATIONALE-PATHOLOGIST** | Rationale Depth | No generic filler, pathophysiology basis, per-option explanations |
| 6 | **PEARL-TRAP-MNEMONIC** | Study Companion | clinicalPearls actionability, questionTrap specificity, mnemonic accuracy |
| 7 | **SBAR-COMPLIANCE** | Clinical Documentation | SBAR format, 120–160 words, military time, terminology sync with stem |
| 8 | **EHR-SYNC** | Clinical Data Sync | Labs/Vitals/Meds/Imaging in EHR must match stem references |
| 9 | **PEDAGOGY-MAPPER** | Educational Taxonomy | Bloom level, CJMM step, NCLEX category, difficulty calibration |
| 10 | **ITEM-TYPE-LOGIC** | Type-Specific Rules | Highlight spans, matrix rows, bowtie wings, trend dataPoints, etc. |
| 11 | **CLINICAL-ACCURACY** | Medical Correctness | Drug dosages, lab ranges, pathophysiology, intervention scope |
| 12 | **ISOLATION-ALLERGY** | Safety Protocols | Isolation type per diagnosis, allergy cross-ref with MAR meds |
| 13 | **REFILLER** | Data Enrichment | Replace ALL generic content with clinically specific data |
| 14 | **HEALER** | Auto-Repair | Takes all defects and produces a fully corrected item |

---

## 🔍 The 12 Quality Dimensions

### Dimension 1: Structural Integrity (Key 1 — No AI)
```
□ item.id exists and follows naming convention [topic]_[type]_v[version]
□ item.type ∈ 14 valid NGN types
□ item.stem exists, non-empty
□ item.pedagogy present with all 5 fields (bloomLevel, cjmmStep, nclexCategory, difficulty, topicTags)
□ item.rationale present with correct/incorrect/reviewUnits/clinicalPearls/questionTrap/mnemonic/answerBreakdown
□ item.scoring present with method + maxPoints
□ Scoring method matches item type per 2026 spec
```

### Dimension 2: Question Stem Quality (Key 2)
```
□ Word count ≤ 50
□ Single clinical judgment construct
□ No "window dressing" (irrelevant info)
□ Clear, direct, actionable language
□ If unclear → AI rewrites to be more precise while preserving clinical intent
```

### Dimension 3: Answer Option Logic (Key 3)
```
□ Correct option count: MC=4, SATA=5-10, SelectN=5-8, Matrix=3-5 rows
□ Each option ≤ 25 words
□ Distractors are clinically plausible (not obviously wrong)
□ No "All of the above" / "None of the above"
□ Correct answer is defensible with evidence-based practice
□ Options are mutually exclusive where required
```

### Dimension 4: Scoring Model Accuracy (Key 4)
```
□ multipleChoice/trend/priorityAction/graphic/audioVideo/chartExhibit → dichotomous, maxPoints: 1
□ highlight/selectAll → polytomous, +/- 1.0 penalty
□ selectN → polytomous, 0/1 no penalty
□ matrixMatch → polytomous, 0/1 per row
□ clozeDropdown/dragAndDropCloze → polytomous, 0/1 per blank
□ bowtie → linkage scoring
□ orderedResponse → dichotomous
□ maxPoints calculated correctly based on item structure
```

### Dimension 5: Rationale Depth — ZERO GENERIC TOLERANCE (Key 5)
```
FAIL CONDITIONS (automatic):
  ✗ "This is correct because it is the right answer"
  ✗ "Option X is not the priority"
  ✗ "This is incorrect" (without WHY)
  ✗ "Monitor the patient" (without WHAT to monitor and WHY)
  ✗ Any rationale < 80 characters

PASS CONDITIONS (required):
  ✓ Correct rationale explains pathophysiology or legal/safety basis
  ✓ Each incorrect option gets a SPECIFIC explanation in THIS clinical context
  ✓ Mentions the mechanism of action, not just the outcome
  ✓ References specific lab values, vital signs, or assessment findings
```

### Dimension 6: Study Companion Completeness (Key 6)
```
□ clinicalPearls: Array ≥ 1 entry. Each must be:
  - Specific to THIS clinical scenario (not generic textbook advice)
  - Actionable: tells the nurse WHAT to do or WHAT to monitor
  - ≥ 30 characters each
□ questionTrap: {trap, howToOvercome} both present and specific
  - trap: Names the exact cognitive error (≥ 20 chars)
  - howToOvercome: Concrete strategy with clinical reasoning (≥ 30 chars)
□ mnemonic: {title, expansion} present
  - Must be a real, recognized mnemonic relevant to the topic
  - Expansion must be accurate
□ answerBreakdown: Array matching option count
  - Each entry: {label, content, isCorrect}
  - label: Option identifier
  - content: Specific explanation (≥ 30 chars)
  - isCorrect: boolean
□ reviewUnits: Array ≥ 1 entry
  - {heading, body, source} all present
  - body ≥ 50 characters of educational content
```

### Dimension 7: SBAR & Nurses' Notes Specificity (Key 7)
```
□ SBAR format: Situation, Background, Assessment, Recommendation all present
□ Word count: 120–160 words total
□ Military time (HH:mm format) in all timestamps
□ Terminology EXACTLY matches the item stem
  (e.g., if stem says "adult child" → notes say "adult child", NOT "daughter")
□ Notes must reflect SPECIFIC clinical findings, NOT generic templates
  ✗ "Patient evaluated for acute status changes" = FAIL (generic)
  ✓ "Patient evaluated for acute respiratory distress. SpO2 dropped from 96% to 88% over 2 hours" = PASS
□ Background must include relevant PMH, medications, and reason for admission
□ Assessment must include specific objective findings (vitals, labs, physical exam)
□ Recommendation must include specific interventions (not "Monitor vitals")
```

### Dimension 8: EHR Clinical Data Synchronization (Key 8)
```
RULE: Any clinical value referenced in the stem, options, or rationale MUST appear 
in the corresponding EHR tab. Orphaned references = CRITICAL failure.

□ If stem mentions a lab value → Lab tab must contain it with correct value
□ If stem mentions a medication → MAR tab must contain it with dose/route/frequency
□ If stem mentions vital signs → Vitals tab must have matching values
□ If stem mentions imaging → Radiology tab must have impression
□ If stem mentions a physical finding → Physical Exam tab must reflect it
□ If question involves intervention → Orders tab must have corresponding order
□ Vitals must have ≥ 3 time-points for acute scenarios (trending)
□ All EHR subsections that are relevant to the question MUST be populated
  ✗ Empty Labs tab when the question is about potassium levels = CRITICAL FAIL
```

### Dimension 9: Pedagogy & Taxonomy (Key 9)
```
□ bloomLevel ∈ {remember, understand, apply, analyze, evaluate, create}
  - Must match the cognitive demand of the question
  - "Which is the FIRST action?" = analyze or evaluate, NOT remember
□ cjmmStep alignment:
  - recognizeCues = identifying abnormal findings
  - analyzeCues = explaining WHY findings are abnormal
  - prioritizeHypotheses = ranking most likely/urgent conditions
  - generateSolutions = identifying appropriate interventions
  - takeAction = selecting the BEST/FIRST action
  - evaluateOutcomes = determining if interventions worked
□ nclexCategory ∈ 8 valid NCLEX categories
□ difficulty 1-5 calibrated to clinical complexity
□ topicTags: at least 1, relevant to the clinical scenario
```

### Dimension 10: Item-Type-Specific Logic (Key 10)
```
highlight: ≥6 spans, ≥2 distractors, correctSpanIndices valid, passage exists
multipleChoice: exactly 4 options, correctOptionId matches one option
selectAll: 5-10 options, correctOptionIds ≥ 2 entries
orderedResponse: correctOrder matches all option IDs, used exactly once
matrixMatch: 3-5 rows, columns array, correctMatches covers all rows
clozeDropdown: 1-3 blanks, each with options and correctOption
dragAndDropCloze: template with blanks, options, correctOption per blank
bowtie: actions(≥4), conditions(≥3), parameters(≥4), correct selections
trend: dataPoints ≥3 entries OR itemContext.tabs fallback, options array
priorityAction: exactly 4 options, correctOptionId, "first action" focus
hotspot: imageUrl, hotspots with coordinates
graphic: imageUrl or graphical context
audioVideo: mediaUrl, standard MC structure
chartExhibit: exhibits/itemContext.tabs with ≥2 data sources
```

### Dimension 11: Clinical Accuracy (Key 11)
```
□ Drug dosages within safe therapeutic ranges
□ Lab reference ranges correct per standard US adult values
□ Pathophysiology descriptions medically accurate
□ Nursing interventions within RN scope of practice
□ Vital signs physiologically consistent with diagnosis
□ Correct answer truly the BEST answer per evidence-based practice
□ No outdated or debunked clinical practices
```

### Dimension 12: Isolation & Allergy Cross-Reference (Key 12) — NEW
```
ISOLATION LOGIC:
  If stem/diagnosis involves:
  ✓ TB, Measles, Varicella, Disseminated Zoster → iso: "Airborne"
  ✓ MRSA, C. diff, VRE, Scabies, RSV → iso: "Contact"
  ✓ Influenza, Meningococcal, Pertussis, Mumps → iso: "Droplet"
  ✓ Chicken Pox → iso: "Airborne + Contact"
  ✓ No infectious component → iso: "Standard"
  
  The patient.iso field in the CaseStudy wrapper MUST match.
  If the item has an infectious disease topic but iso is "Standard" → FAIL

ALLERGY LOGIC:
  If MAR medications are present, cross-reference with patient.allergies:
  ✓ Penicillin allergy + Amoxicillin in MAR → CRITICAL FAIL (contraindicated)
  ✓ Sulfa allergy + Sulfamethoxazole → CRITICAL FAIL
  ✓ NSAID allergy + Ibuprofen/Ketorolac → CRITICAL FAIL
  ✓ Latex allergy should be noted when relevant
  
  Allergy cross-families to check:
  - Penicillin: amoxicillin, ampicillin, piperacillin, nafcillin
  - Sulfa: sulfamethoxazole, sulfasalazine, furosemide (weak), thiazides
  - Cephalosporin: cephalexin, ceftriaxone, cefazolin (cross with penicillin ~1-2%)
  - NSAID: ibuprofen, naproxen, ketorolac, aspirin
  
  If allergies array is empty or ["None"] when medications are involved:
  → Flag as WARNING (realistic patients often have allergies)
  → HEALER should add a clinically appropriate allergy that does NOT conflict with ordered meds
```

---

## 🔧 The REFILLER Role (Key 13) — Comprehensive Data Enrichment

The REFILLER's job is to transform ALL generic/placeholder content into clinically specific data.

### What Gets Refilled:

| Generic Content (FAIL) | Specific Replacement (PASS) |
|:---|:---|
| "Hx of priority clinical concerns relevant to current admission" | "Hx of Type 2 DM × 15 years, HTN, and Stage 3 CKD. Admitted for acute exacerbation of heart failure" |
| "Initial assessment confirms findings described in question stem" | "Initial assessment reveals bibasilar crackles, JVD, 3+ pitting edema bilateral LE, SpO2 88% on RA" |
| "Monitor vitals and response to interventions" | "Recommend continuous telemetry, strict I&O, daily weights, BMP q6h, furosemide 40mg IV now" |
| "Patient evaluated for acute status changes" | "Patient evaluated for acute hypoxia secondary to pulmonary edema. ABG shows pH 7.31, PaCO2 48, PaO2 62" |
| Empty Labs tab when question involves potassium | Add: K+ 5.8 mEq/L (H), Na 138, BUN 42 (H), Cr 2.1 (H) |
| Empty MAR when question involves medication safety | Add: Full medication list with dose, route, frequency, last admin time |
| Empty Radiology when question involves chest findings | Add: "CXR: Bilateral pleural effusions, cardiomegaly, pulmonary vascular congestion" |
| Empty Physical Exam when question involves assessment | Add: System-specific findings matching the clinical scenario |
| iso: "Standard" when patient has TB | Change to: iso: "Airborne" |
| allergies: [] when medications are ordered | Add: Clinically appropriate allergy (e.g., "Codeine" if no opioids ordered) |

### REFILLER AI Prompt Template:
```
You are a 20-year NCLEX Psychometrician and Clinical Content Specialist.

This item has GENERIC or MISSING clinical data. Your mission is to REPLACE all generic 
content with clinically SPECIFIC, patient-appropriate data.

RULES:
1. Every SBAR field must contain specific clinical details (vitals, labs, timing, findings)
2. If the question mentions labs/meds/vitals, the EHR tabs MUST contain matching data
3. Background must include specific PMH with durations ("Type 2 DM × 15 years")
4. Assessment must include objective findings with numerical values
5. Recommendation must include specific medications with doses and monitoring parameters
6. Isolation type must match the infectious disease (if any)
7. Allergies must be realistic and NOT conflict with ordered medications
8. All nurses' notes must read like a real clinical chart, NOT a template
9. Physical exam findings must be objective ("3+ pitting edema") not subjective ("swollen")

CURRENT ITEM: {{ITEM_JSON}}

Return the COMPLETE item with ALL generic content replaced by specific clinical data.
Return ONLY pure JSON.
```

---

## 🚀 Execution Workflow

### One-Button Trigger (Vercel UI)

The **SentinelQA** page in the Item Bank has a `[🛡️ Run SENTINEL]` button that triggers:

```
PHASE 1: STRUCTURAL SCAN (Instant — No AI)
├── Check all 14 type-specific schemas
├── Validate scoring models
├── Flag missing required fields
├── Flag generic SBAR content patterns
├── Cross-reference isolation/allergy vs. stem topics
└── Output: Structural Report

PHASE 2: DEEP AI AUDIT (14 Keys in rotation, 4s pacing)
├── For each item:
│   ├── Key 2: Stem quality check → improve if unclear
│   ├── Key 3: Option logic check
│   ├── Key 5: Rationale depth (anti-filler enforcement)
│   ├── Key 6: Study Companion completeness
│   ├── Key 7: SBAR specificity check
│   ├── Key 8: EHR synchronization audit
│   ├── Key 9: Pedagogy/taxonomy validation
│   ├── Key 11: Clinical accuracy review
│   └── Key 12: Isolation & allergy cross-reference
└── Output: Per-item AI Audit Results

PHASE 3: AUTO-HEAL & REFILL
├── Items with severity ≥ MEDIUM → sent to REFILLER (Key 13) + HEALER (Key 14)
├── REFILLER: Replaces generic → specific clinical data
├── HEALER: Fixes structural/scoring/option defects
├── Re-validate healed items through Phase 1
│   └── If still failing → QUARANTINE (do not push)
└── Output: Healed Items + Change Log

PHASE 4: PUSH & REPORT
├── Upsert healed items to Supabase
├── Add sentinelStatus: "sentinel_v2_{timestamp}" to each processed item
├── Generate SENTINEL Report:
│   ├── Global health score
│   ├── Per-dimension pass rates
│   ├── Per-type distribution
│   ├── Per-item diagnostics (expandable)
│   ├── Top recommendations
│   └── Quarantined items list
└── Display report in the SentinelQA dashboard
```

---

## 📊 SENTINEL Report & Recommendations

The report displayed in the Vercel UI includes:

### 1. Global Health Score (0-100)
A single ring chart showing overall vault quality.

### 2. Dimension Heatmap
8 dimension cards with pass/warn/fail counts and clickable filters.

### 3. Per-Item Table
Sortable, filterable table with:
- Status badge (PASS/WARN/FAIL)
- Item ID
- Item Type
- QA Score
- Issue count by severity
- Expandable detail panel

### 4. Recommendations Section
```
🔴 CRITICAL: [count] items have clinically inaccurate content → must review manually
🟠 HIGH: [count] items had generic rationale → auto-healed with pathophysiology
🟡 MEDIUM: [count] items missing Study Companion data → auto-filled
🟢 LOW: [count] items had minor style issues → auto-corrected
📋 NEXT STEPS: 
  1. Review quarantined items manually
  2. Run SENTINEL again after manual fixes
  3. Focus item generation on under-represented types: [list]
```

---

## 🛡️ Severity Classification

| Severity | Description | Action |
|:---|:---|:---|
| 🔴 **CRITICAL** | Clinically inaccurate, wrong correct answer, medication-allergy conflict, wrong scoring | **QUARANTINE** |
| 🟠 **HIGH** | Generic rationale, missing answerBreakdown, empty SBAR fields, EHR desync | **AUTO-HEAL** |
| 🟡 **MEDIUM** | Missing pearls/trap/mnemonic, stem > 50 words, option count off, isolation mismatch | **AUTO-HEAL** |
| 🟢 **LOW** | Suboptimal wording, minor style issues, weak distractor | **LOG** |

---

## ⚙️ Key Rotation & Rate Limiting

```javascript
const KEY_ROLES = {
    1:  'STRUCT-VALIDATOR',     // No AI needed
    2:  'STEM-SURGEON',
    3:  'OPTION-ARCHITECT',
    4:  'SCORE-AUDITOR',        // No AI needed
    5:  'RATIONALE-PATHOLOGIST',
    6:  'PEARL-TRAP-MNEMONIC',
    7:  'SBAR-COMPLIANCE',
    8:  'EHR-SYNC',
    9:  'PEDAGOGY-MAPPER',
    10: 'ITEM-TYPE-LOGIC',      // Mostly deterministic
    11: 'CLINICAL-ACCURACY',
    12: 'ISOLATION-ALLERGY',
    13: 'REFILLER',
    14: 'HEALER'
};

// Pacing: 4 seconds between API calls
// Parallelism: 2 concurrent calls max (different keys)
// Temperature: 0.1 for audit (strict), 0.7 for healing (creative fixes)
// responseMimeType: "application/json" (always)
// Retry: 3 attempts, exponential backoff (4s → 8s → 16s)
// Cooldown: 60s after 429 errors
```

---

## 🏆 World-Class Quality Targets

| Metric | Target | Description |
|:---|:---:|:---|
| Structural Pass Rate | ≥ 99% | All items have required JSON fields |
| Rationale Depth | ≥ 90% A-grade | No generic filler in any rationale |
| Study Companion Readiness | 100% | Every item has Pearls + Trap + Mnemonic + Breakdown |
| Answer Breakdown Coverage | 100% | Every option has a labeled breakdown entry |
| Scoring Model Accuracy | 100% | Scoring method matches item type |
| EHR Synchronization | ≥ 95% | Stem references match EHR tab data |
| Clinical Accuracy | 100% | Zero medically inaccurate items |
| SBAR Specificity | ≥ 95% | No generic nurses' notes |
| Isolation Compliance | 100% | Isolation type matches diagnosis |
| Allergy Safety | 100% | No medication-allergy conflicts |

---

## 📁 File Structure

```
Senior NCLEX/
├── sentinel_qa_rotator.cjs          ← Main execution script
├── QA_ROTATOR_SERVICE.md            ← This specification
├── validation/
│   └── itemBankQA.ts                ← Deterministic QA engine (Phase 1)
├── components/navigation/
│   └── SentinelQAPage.tsx           ← Vercel UI dashboard
├── data/
│   ├── sentinel-reports/            ← Historical audit reports
│   └── quarantine/                  ← Items too broken to auto-heal
└── .env                             ← GEMINI_API_KEY_1 through _14
```

---

## 💡 Expert-Level Design Principles (20+ Years Experience)

1. **Deterministic first, AI second** — Run structural checks instantly. Only call AI for semantic analysis. This saves 40% of API calls.

2. **Never trust AI blindly** — After the HEALER fixes an item, re-run it through Phase 1 structural validation. If it still fails → quarantine, never push.

3. **Context is everything** — The REFILLER doesn't just "add data." It reads the item stem, understands the clinical scenario, and generates data that would logically appear in a real patient chart for that specific diagnosis.

4. **Isolation is not optional** — A student practicing for NCLEX who sees "Standard" isolation on a TB patient will develop wrong clinical habits. Every infectious disease question MUST have the correct isolation type.

5. **Allergies tell a story** — An empty allergy list is unrealistic. Real patients have allergies. Adding a non-conflicting allergy (like "Codeine" when no opioids are ordered) adds realism without creating a drug interaction trap question.

6. **The Study Companion is not a sidebar feature — it's a learning engine** — If clinical pearls say "Monitor vitals," the student learns nothing. If they say "In DKA, potassium shifts intracellularly as pH normalizes — monitor K+ q2h even if initially hyperkalemic," the student gains a clinical edge.

7. **Log everything** — Every API call, every verdict, every heal operation. This forensic trail validates your item bank for accreditation reviews.

8. **Quarantine > Bad Data** — An empty slot in the vault is infinitely better than a wrong item. Never push a broken item to production.

---

*SENTINEL v2.0 — Built for the 2026 NCLEX-RN NGN Standard*
*"No item graduates without a 12-dimension audit."*
*This system replaces ALL previous QA systems.*
