# 🔬 NCLEX-RN NGN 2026 — AI Quality Assurance Rotator Service

> **Codename: SENTINEL**
> *14-Key Multi-Role Deep Audit Engine for World-Class Item Bank Integrity*

---

## 🎯 Mission Statement

This service deploys **14 AI agents** — each with a distinct **clinical psychometrician role** — in a rotating pipeline against the **live Supabase-hosted item vault**. Every item is subjected to a **7-pass deep audit** that catches what no single-pass check can: logic inconsistencies, scoring model violations, generic rationale filler, missing Study Companion data, and clinical inaccuracies that would disqualify an item from a real NCLEX exam.

---

## ⚡ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SENTINEL ENGINE                       │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │  KEY  1  │   │  KEY  2  │   │  KEY  3  │  ...×14    │
│  │ ROLE: A  │   │ ROLE: B  │   │ ROLE: C  │            │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘            │
│       │              │              │                   │
│       ▼              ▼              ▼                   │
│  ┌──────────────────────────────────────────┐           │
│  │         ITEM QUEUE (from Supabase)       │           │
│  │  fetch → audit → verdict → heal → push  │           │
│  └──────────────────────────────────────────┘           │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────────────────────────────────┐           │
│  │       SENTINEL REPORT (JSON + Console)   │           │
│  │   per-item verdicts, auto-healed count,  │           │
│  │   quarantined items, compliance score    │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

**Execution Mode**: Sequential items, parallel passes per item.
**Speed Target**: ~500 items audited in < 90 minutes using 14 keys at 4s pacing.

---

## 🧬 The 14 Specialist Roles (Key → Role Mapping)

Each of the 14 API keys is assigned a **permanent clinical psychometrician persona**. When an item enters the audit pipeline, the relevant roles are invoked based on the item type. This prevents "generic AI" answers and forces domain-expert depth.

| Key # | Role Codename | Specialist Title | Primary Audit Domain |
|:---:|:---|:---|:---|
| 1 | **STRUCT-VALIDATOR** | Schema & Structure Analyst | JSON schema, required fields, TypeScript interface compliance |
| 2 | **STEM-SURGEON** | Question Stem Psychometrician | Stem clarity, word count (≤50), single-construct focus, no window dressing |
| 3 | **OPTION-ARCHITECT** | Answer Option Strategist | Option count, word count (≤25/opt), distractor plausibility, no "All of the above" |
| 4 | **SCORE-AUDITOR** | Scoring Model Compliance Officer | Correct scoring method per type, maxPoints validation, penalty model accuracy |
| 5 | **RATIONALE-PATHOLOGIST** | Deep Rationale & Pathophysiology Reviewer | No generic filler, pathophysiology depth, incorrect rationale specificity |
| 6 | **PEARL-TRAP-MNEMONIC** | Study Companion Completeness Inspector | clinicalPearls presence & depth, questionTrap actionability, mnemonic accuracy |
| 7 | **SBAR-COMPLIANCE** | Clinical Documentation Specialist | SBAR format, 120–160 word count, military time, terminology synchronization |
| 8 | **EHR-SYNC** | Clinical Data Synchronization Auditor | Tab exhaustion, lab/vital/med sync with stem, no orphaned references |
| 9 | **PEDAGOGY-MAPPER** | Educational Taxonomy Validator | Bloom level accuracy, CJMM step alignment, NCLEX category correctness, difficulty calibration |
| 10 | **ITEM-TYPE-LOGIC** | NGN Type-Specific Logic Enforcer | Type-specific rule enforcement (highlight spans, matrix rows, bowtie wings, trend dataPoints) |
| 11 | **CLINICAL-ACCURACY** | Board-Certified Clinical Content Expert | Medical/nursing accuracy, drug dosages, lab reference ranges, pathophysiology correctness |
| 12 | **EQUITY-ETHICS** | Health Equity & Unbiased Care Reviewer | SDOH integration, inclusive language, cultural competency, digital privacy compliance |
| 13 | **ANSWER-BREAKDOWN** | Evidence Table & Breakdown Auditor | answerBreakdown completeness, per-option rationale, correct/incorrect labeling accuracy |
| 14 | **HEALER** | Auto-Repair & Remediation Agent | Takes all flagged defects and generates a corrected version of the item |

---

## 🔍 The 7-Pass Deep Audit Pipeline

Every item goes through **7 sequential audit passes**. Each pass uses a **different key/role combination** to prevent blind spots.

### Pass 1: Structural Integrity (Keys 1 + 4)
> **STRUCT-VALIDATOR** + **SCORE-AUDITOR**

**Checks (deterministic — no AI needed):**
```
□ item.id exists and follows naming convention
□ item.type is one of the 14 valid NGN types
□ item.stem exists and is non-empty
□ item.pedagogy exists with all 5 required fields:
    □ bloomLevel ∈ {remember, understand, apply, analyze, evaluate, create}
    □ cjmmStep ∈ {recognizeCues, analyzeCues, prioritizeHypotheses, generateSolutions, takeAction, evaluateOutcomes}
    □ nclexCategory ∈ {8 valid categories}
    □ difficulty ∈ {1, 2, 3, 4, 5}
    □ topicTags is array with length ≥ 1
□ item.rationale exists with:
    □ rationale.correct is string, length ≥ 80 chars
    □ rationale.incorrect is string or array, length ≥ 80 chars
    □ rationale.reviewUnits is array with length ≥ 1
    □ rationale.clinicalPearls is array with length ≥ 1
    □ rationale.questionTrap exists with {trap, howToOvercome}
    □ rationale.mnemonic exists with {title, expansion}
    □ rationale.answerBreakdown is array with length ≥ 1
□ item.scoring exists with:
    □ scoring.method ∈ {dichotomous, polytomous, linkage}
    □ scoring.maxPoints is number ≥ 1
□ SCORING MODEL matches item type:
    □ multipleChoice/trend/priorityAction/graphic/audioVideo/chartExhibit → dichotomous, maxPoints: 1
    □ highlight/selectAll → polytomous, +/- 1.0 penalty
    □ selectN → polytomous, 0/1 no penalty
    □ matrixMatch → polytomous, 0/1 per row
    □ clozeDropdown/dragAndDropCloze → polytomous, 0/1 per blank
    □ bowtie → linkage
    □ orderedResponse → dichotomous
```

**Verdict**: `PASS` | `FAIL` with list of missing/invalid fields.

---

### Pass 2: Stem & Option Quality (Keys 2 + 3)
> **STEM-SURGEON** + **OPTION-ARCHITECT**

**AI Prompt (Key 2):**
```
You are an NCLEX-RN 2026 Question Stem Psychometrician.

Analyze this item stem for compliance with NCSBN 2026 standards:
- Is the stem ≤ 50 words? (Count exactly)
- Does it focus on ONE clinical judgment construct?
- Is there any "window dressing" (irrelevant information)?
- Does it use clear, direct language appropriate for a licensing exam?
- Is the clinical scenario clinically accurate?

ITEM: {item JSON}

Return JSON: {
  "wordCount": number,
  "singleConstruct": boolean,
  "windowDressing": string[] | null,
  "clarity": "excellent" | "acceptable" | "poor",
  "issues": string[]
}
```

**AI Prompt (Key 3):**
```
You are an NCLEX-RN 2026 Answer Option Strategist.

Audit the answer options of this NGN item:
- Correct option count per type? (MC=4, SATA=5-10, SelectN=5-8, etc.)
- Each option ≤ 25 words?
- Are distractors clinically plausible (not obviously wrong)?
- Any "All of the above" / "None of the above" violations?
- Is the correct answer defensible with evidence-based nursing practice?
- Are options mutually exclusive where required?
- Is option ordering randomized (no pattern like "longest is correct")?

ITEM: {item JSON}

Return JSON: {
  "optionCount": number,
  "expectedCount": number,
  "maxOptionWordCount": number,
  "plausibilityScore": 1-10,
  "issues": string[]
}
```

---

### Pass 3: Rationale Depth & Anti-Filler (Key 5)
> **RATIONALE-PATHOLOGIST**

**AI Prompt:**
```
You are a Board-Certified Critical Care Nurse Educator reviewing rationale quality.

ZERO TOLERANCE for generic rationale. Analyze this item's rationale:

1. CORRECT RATIONALE: Does it explain the pathophysiology or safety/legal basis? 
   Or does it just restate the answer? (e.g., "This is correct because it is the right answer" = FAIL)
2. INCORRECT RATIONALE: Does each distractor get a SPECIFIC explanation of why it's wrong 
   in THIS clinical context? Or is it generic? (e.g., "This is not the priority" without explaining WHY = FAIL)
3. CLINICAL PEARLS: Are they actionable nursing insights? Or generic textbook summaries?
   (e.g., "Monitor vitals" = FAIL. "In DKA, potassium shifts intracellularly as pH normalizes — 
   monitor K+ q2h even if initially hyperkalemic" = PASS)
4. QUESTION TRAP: Does it identify a specific, realistic test-taking error? 
   Does "howToOvercome" give a concrete strategy?
5. MNEMONIC: Is it relevant to the topic? Is the expansion accurate?
6. ANSWER BREAKDOWN: Does every option have a labeled breakdown entry?

ITEM: {item JSON}

Return JSON: {
  "correctRationaleDepth": "pathophysiological" | "surface" | "generic",
  "incorrectRationaleDepth": "specific" | "semi-specific" | "generic",
  "pearlQuality": "actionable" | "textbook" | "missing",
  "trapQuality": "specific" | "vague" | "missing",
  "mnemonicAccuracy": "accurate" | "inaccurate" | "missing",
  "breakdownComplete": boolean,
  "overallGrade": "A" | "B" | "C" | "D" | "F",
  "issues": string[],
  "suggestedFixes": string[]
}
```

---

### Pass 4: Study Companion & Instructional Completeness (Key 6)
> **PEARL-TRAP-MNEMONIC**

**AI Prompt:**
```
You are the Study Companion QA Lead for the NCLEX-RN 2026 Simulator.

The Study Companion sidebar aggregates clinicalPearls, questionTraps, and mnemonics 
from answered items. If ANY of these are missing or low-quality, the student gets 
an empty or useless study notebook.

Audit this item for Study Companion readiness:

1. clinicalPearls: Array of ≥1 entries. Each entry must be:
   - Specific to this clinical scenario (not generic nursing advice)
   - Actionable (tells the nurse WHAT to do or WHY)
   - ≥ 30 characters each
   
2. questionTrap: Object with {trap, howToOvercome}. Must be:
   - trap: Names the specific cognitive error students make (≥ 20 chars)
   - howToOvercome: Provides concrete strategy (≥ 30 chars)
   
3. mnemonic: Object with {title, expansion}. Must be:
   - title: A real, recognized mnemonic (e.g., "MONA", "SBAR", "FAST")
   - expansion: Accurate letter-by-letter expansion
   
4. reviewUnits: Array of ≥1 entries. Each entry must have:
   - heading: Topic title
   - body: Educational content (≥ 50 chars)
   - source: Citation or textbook reference
   
5. answerBreakdown: Array matching option count. Each entry must have:
   - label: Option identifier (A, B, C, etc.)
   - content: Explanation (≥ 30 chars)
   - isCorrect: boolean

ITEM: {item JSON}

Return JSON: {
  "pearlsPresent": boolean,
  "pearlsCount": number,
  "pearlsActionable": boolean,
  "trapPresent": boolean,
  "trapSpecific": boolean,
  "mnemonicPresent": boolean,
  "mnemonicAccurate": boolean,
  "reviewUnitsPresent": boolean,
  "breakdownComplete": boolean,
  "companionReadiness": "ready" | "partial" | "empty",
  "issues": string[]
}
```

---

### Pass 5: Clinical Accuracy & EHR Synchronization (Keys 8 + 11)
> **EHR-SYNC** + **CLINICAL-ACCURACY**

**AI Prompt (Key 11):**
```
You are a Board-Certified Advanced Practice Nurse reviewing clinical accuracy.

Verify this NCLEX item for medical/nursing accuracy:
1. Are drug dosages within safe therapeutic ranges?
2. Are lab reference ranges correct per standard US adult values?
3. Is the pathophysiology description accurate?
4. Are nursing interventions evidence-based and within RN scope?
5. Are vital sign values physiologically consistent with the diagnosis?
6. Is the correct answer truly the BEST answer per current evidence-based practice?

ITEM: {item JSON}

Return JSON: {
  "clinicallyAccurate": boolean,
  "drugSafety": "safe" | "borderline" | "unsafe" | "n/a",
  "labAccuracy": "accurate" | "inaccurate" | "n/a",
  "pathophysiology": "accurate" | "partially" | "inaccurate",
  "interventionScope": "within_RN" | "outside_RN" | "n/a",
  "bestAnswer": "defensible" | "arguable" | "incorrect",
  "issues": string[]
}
```

**AI Prompt (Key 8):**
```
You are an EHR Clinical Data Synchronization Auditor.

Check if the item's clinical context (itemContext/tabs) is synchronized with the stem:
1. If stem mentions a lab value → is it in the Labs tab with correct value?
2. If stem mentions a medication → is it in the MAR tab?
3. If stem mentions vitals → are they in the Vitals tab?
4. If stem references imaging → is it in the Radiology tab?
5. Are there ≥ 3 time-points for trending data?
6. Is the SBAR note 120–160 words in SBAR format with military time?

ITEM: {item JSON}

Return JSON: {
  "labSync": "synced" | "missing" | "n/a",
  "medSync": "synced" | "missing" | "n/a",
  "vitalSync": "synced" | "missing" | "n/a",
  "imagingSync": "synced" | "missing" | "n/a",
  "trendingPoints": number,
  "sbarWordCount": number,
  "sbarFormat": boolean,
  "militaryTime": boolean,
  "issues": string[]
}
```

---

### Pass 6: Item-Type-Specific Logic (Key 10)
> **ITEM-TYPE-LOGIC**

**Rules Engine (deterministic + AI):**

| Item Type | Specific Checks |
|:---|:---|
| `highlight` | ≥6 spans, ≥2 distractors, `correctSpanIndices` array valid, `passage` exists |
| `multipleChoice` | Exactly 4 options, `correctOptionId` matches an option id |
| `selectAll` | 5–10 options, `correctOptionIds` array with ≥2 entries |
| `selectN` | 5–8 options, stem contains "Select [N]", `requiredCount` matches N |
| `orderedResponse` | `correctOrder` array matches `options` ids, all options used once |
| `matrixMatch` | 3–5 rows, `columns` array, `correctMatches` object covers all rows |
| `clozeDropdown` | 1–3 `blanks`, each blank has `options` array and `correctOption` |
| `dragAndDropCloze` | `template` with blanks, `options` array, `blanks` with `correctOption` |
| `bowtie` | `actions` (≥4 options), `conditions` (≥3), `parameters` (≥4), `correctActionIds` (2), `correctParameterIds` (2), `condition` string |
| `trend` | `dataPoints` array with ≥3 entries OR `itemContext.tabs` fallback, `options` array |
| `priorityAction` | Exactly 4 options, `correctOptionId`, focus on "first action" |
| `hotspot` | `imageUrl` exists, `hotspots` array with coordinates |
| `graphic` | `imageUrl` or graphical context, standard MC structure |
| `audioVideo` | `mediaUrl` exists, standard MC structure |
| `chartExhibit` | `exhibits` or `itemContext.tabs` with ≥2 data sources |

---

### Pass 7: Auto-Heal & Remediation (Key 14)
> **HEALER**

Items that fail **any** of Passes 1–6 are sent to the HEALER for automatic repair.

**AI Prompt:**
```
You are the NCLEX-RN 2026 Item Remediation Specialist.

This item FAILED quality assurance with the following defects:
{defect_list}

Your mission: Fix ALL defects while preserving the clinical intent.

RULES:
1. Do NOT change the correct answer or core clinical scenario
2. ADD missing fields (clinicalPearls, questionTrap, mnemonic, answerBreakdown, reviewUnits)
3. REWRITE generic rationale with pathophysiology-based explanations
4. FIX scoring model if incorrect
5. ENSURE answerBreakdown has one entry per option with {label, content, isCorrect}
6. ENSURE clinicalPearls are actionable, not textbook summaries
7. ENSURE questionTrap names a specific cognitive error
8. ENSURE mnemonic is real and accurately expanded

ORIGINAL ITEM: {item JSON}
DEFECTS: {defect_list}

Return the COMPLETE corrected item as pure JSON.
```

---

## 🚀 Execution Workflow

### Quick-Start Command
```bash
node sentinel_qa_rotator.cjs
```

### Step-by-Step Pipeline

```
STEP 1: FETCH
  └── Pull all items from Supabase cloud vault (paginated, 1000/page)
  └── Also scan local data/vaultItems.json for any items not yet in cloud
  └── Deduplicate by item.id → create master audit queue

STEP 2: TRIAGE (No AI — Pure Code)
  └── Run Pass 1 (Structural Integrity) on ALL items
  └── Classify: PASS → continue | FAIL → flag for healing
  └── Generate structural compliance report

STEP 3: DEEP AUDIT (AI Passes 2–6)
  └── For each item in queue:
      ├── Pass 2: Stem & Options (Keys 2, 3) — parallel
      ├── Pass 3: Rationale Depth (Key 5)
      ├── Pass 4: Study Companion (Key 6)
      ├── Pass 5: Clinical + EHR Sync (Keys 8, 11) — parallel
      └── Pass 6: Type-Specific Logic (Key 10)
  └── Compile per-item verdicts into AuditResult[]

STEP 4: HEAL
  └── Filter items with severity ≥ MEDIUM
  └── Send to HEALER (Key 14) with defect list
  └── Validate healed item passes Pass 1 again
  └── If still failing → QUARANTINE (do not push)

STEP 5: PUSH
  └── Upsert healed items back to Supabase
  └── Add "sentinelStatus": "healed_v2026_v{run}" to each item
  └── Regenerate local vaultItems.json
  └── Print final SENTINEL REPORT
```

---

## 📊 SENTINEL Report Format

```
═══════════════════════════════════════════════════════════
  SENTINEL QA REPORT — Run #8 — 2026-02-24T19:00:00Z
═══════════════════════════════════════════════════════════

  Total Items Audited:     1,480
  Passed All 7 Checks:    1,203  (81.3%)
  Auto-Healed:              241  (16.3%)
  Quarantined (unfixable):   36  (2.4%)

  ── Defect Breakdown ──────────────────────────────────
  Missing clinicalPearls:           89
  Missing questionTrap:            112
  Missing mnemonic:                 74
  Missing answerBreakdown:         198
  Generic rationale (filler):      143
  Scoring model mismatch:           23
  Stem > 50 words:                  41
  Option count violation:           18
  EHR/Stem desynchronization:       67
  Missing pedagogy fields:          31

  ── Type Distribution ─────────────────────────────────
  highlight:       120  |  multipleChoice: 280
  selectAll:       150  |  orderedResponse:  60
  matrixMatch:      80  |  clozeDropdown:   110
  dragAndDropCloze:  70  |  bowtie:          90
  trend:            60  |  priorityAction:   80
  hotspot:          40  |  graphic:          50
  audioVideo:       30  |  chartExhibit:     60

═══════════════════════════════════════════════════════════
```

---

## ⚙️ Key Rotation Strategy

```javascript
// 14-Key Rotation with Role Assignment
const KEY_ROLES = {
    1:  'STRUCT-VALIDATOR',
    2:  'STEM-SURGEON',
    3:  'OPTION-ARCHITECT',
    4:  'SCORE-AUDITOR',
    5:  'RATIONALE-PATHOLOGIST',
    6:  'PEARL-TRAP-MNEMONIC',
    7:  'SBAR-COMPLIANCE',
    8:  'EHR-SYNC',
    9:  'PEDAGOGY-MAPPER',
    10: 'ITEM-TYPE-LOGIC',
    11: 'CLINICAL-ACCURACY',
    12: 'EQUITY-ETHICS',
    13: 'ANSWER-BREAKDOWN',
    14: 'HEALER'
};

// Pacing: 4 seconds between API calls to respect rate limits
// Parallelism: 2 concurrent calls max (different keys)
// Retry: 3 attempts with exponential backoff (4s → 8s → 16s)
// Cooldown: 60s pause after 429 (rate limit) errors
```

---

## 🏆 World-Class Quality Targets

| Metric | Target | Description |
|:---|:---:|:---|
| **Structural Pass Rate** | ≥ 99% | All items have required JSON fields |
| **Rationale Depth Score** | ≥ A-grade (90%) | No generic filler in any rationale |
| **Study Companion Readiness** | 100% | Every item has Pearls + Trap + Mnemonic |
| **Answer Breakdown Coverage** | 100% | Every option has a labeled breakdown entry |
| **Scoring Model Accuracy** | 100% | Scoring method matches item type per spec |
| **EHR Synchronization** | ≥ 95% | Stem references match EHR tab data |
| **Clinical Accuracy** | 100% | Zero medically inaccurate items in production |
| **Equity & Inclusion** | ≥ 90% | SDOH/Equity items properly integrated |

---

## 🛡️ Severity Classification

| Severity | Description | Action |
|:---|:---|:---|
| 🔴 **CRITICAL** | Clinically inaccurate, wrong correct answer, scoring model incorrect | **QUARANTINE** — remove from vault |
| 🟠 **HIGH** | Missing rationale, generic filler, no answerBreakdown | **AUTO-HEAL** — mandatory repair |
| 🟡 **MEDIUM** | Missing pearls/trap/mnemonic, stem > 50 words, option count off | **AUTO-HEAL** — best-effort repair |
| 🟢 **LOW** | Minor style issues, suboptimal wording, could be improved | **LOG** — report only, no action |

---

## 📁 File Structure

```
Senior NCLEX/
├── sentinel_qa_rotator.cjs          ← Main execution script
├── QA_ROTATOR_SERVICE.md            ← This specification (you are here)
├── data/
│   ├── sentinel-reports/            ← Historical audit reports
│   │   ├── sentinel_run_001.json
│   │   ├── sentinel_run_002.json
│   │   └── ...
│   └── quarantine/                  ← Items too broken to auto-heal
│       └── quarantined_items.json
└── .env                             ← GEMINI_API_KEY_1 through _14
```

---

## 🔄 Recommended Run Schedule

| Frequency | Trigger | Scope |
|:---|:---|:---|
| **After every bulk generation** | Manual | Audit only new items (delta) |
| **Weekly (Sunday 02:00)** | Scheduled | Full vault re-audit |
| **Before any Vercel deploy** | CI/CD hook | Quick structural pass only |
| **On-demand** | `node sentinel_qa_rotator.cjs --item-id=<id>` | Single item deep audit |

---

## 💡 Pro Tips for Maximum Speed & Accuracy

1. **Run structural pass first** — it's instant (no AI) and catches 40% of defects
2. **Batch AI calls** — send 2 items per prompt when doing shallow checks (Pass 2)
3. **Cache verdicts** — skip items with `sentinelStatus: healed_v2026_v{latest}` 
4. **Use `responseMimeType: "application/json"`** — forces clean JSON output, no markdown pollution
5. **Temperature 0.1** for audit, **0.7** for healing — low temp = strict judgment, higher temp = more creative fixes
6. **Log everything** — every API call, every verdict, every heal. Forensic trail is non-negotiable
7. **Quarantine > Bad Data** — never push a broken item to production. An empty vault slot is better than a wrong one

---

*SENTINEL v1.0 — Built for the 2026 NCLEX-RN NGN Standard*
*"No item graduates without a 7-pass audit."*
