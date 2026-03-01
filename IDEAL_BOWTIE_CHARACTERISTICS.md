# 🎀 Characteristics of an Ideal NGN Bowtie Item (2026 Standards)

Based on the **NCLEX-RN NGN 2026 Master Content & Logic Specification** and **SentinelQA v2.0** validation engine, an ideal Bowtie item must meet the following high-fidelity criteria.

---

## 1. Structural Architecture (The "Bowtie" Logic)
The Bowtie item is designed to test a nurse's ability to address a clinical crisis by linking causes, conditions, and actions. 

| Section | Option Count | Selection Req. | JSON Mapping |
| :--- | :--- | :--- | :--- |
| **Actions to Take** | Exactly 4 | **Select 2** | `actions` -> `correctActionIds` |
| **Potential Condition** | 3–5 | **Select 1** | `potentialConditions` -> `condition` |
| **Parameters to Monitor** | Exactly 4 | **Select 2** | `parameters` -> `correctParameterIds` |

### Logical Flow:
*   **Left Side (Actions)**: Immediate nursing interventions required to stabilize the patient or address the underlying pathophysiology.
*   **Center (Condition)**: The single most likely clinical diagnosis or complication based on the cues provided.
*   **Right Side (Parameters)**: Specific physiological findings or lab results used to evaluate the patient's progress or response to the selected actions.

---

## 2. High-Fidelity Clinical EHR (Tab Standards)
A "Thin" Bowtie is a failure. An ideal item MUST include a fully populated EHR context (`itemContext.tabs`):

*   **SBAR (Clinical Feed)**:
    *   **Target Word Count**: Exactly 60–90 words for high-precision 2026 standards.
    *   **Tolerance**: Items with 120–160 words are accepted for improvement but will be remediated to the 60–90 word range.
    *   **Format**: Situation, Background, Assessment, Recommendation.
    *   **Time**: All timestamps in **Military Time (HH:mm)**.
*   **Vitals Flowsheet**:
    *   **Trending**: Minimum 3 distinct time-points showing clinical progression or equilibrium.
*   **Lab Diagnostics**:
    *   Must include values relevant to the condition (e.g., if DKA, must show Glucose, Ketones, pH, and Anion Gap).
    *   Must follow the 2026 format: `Value | Unit | Reference Range | Status (High/Low)`.
*   **Physical Exam**: Objective, system-based findings.

---

## 3. Scoring & Logic Synchronization
*   **Scoring Model**: Polytomous / Rationale-Linked (Max 5 points).
*   **Synchronization**: 
    *   Any lab/med mentioned in the stem **MUST** exist in the corresponding EHR tabs. 
    *   **Logic Integrity**: The clinical condition in the stem, the patient header (Age/ISO/Allergies), and the tab data must form a unified, non-contradictory medical scenario.

---

## 4. Pedagogy & Hover Rationale Excellence
*   **Hide Old Rationales**: The legacy `answerBreakdown` or `Clinical Evidence Analysis` is replaced by high-fidelity **Hover Rationales** within the `actions` and `parameters` arrays.
*   **Hover-Over Rationales**: 
    *   **Length**: 1 to 3 sentences (15 to 45 words).
    *   **Correct**: Must tie directly to pathophysiology or patient safety.
    *   **Incorrect**: Must explain the clinical flaw or priority mismatch.
*   **Study Companion Bundle**:
    *   `clinicalPearls`: Short, actionable facts.
    *   `questionTrap`: Identification of common strategic errors.
    *   `mnemonic`: Acronyms with interactive front/back text mapping.

---

## 5. Metadata & Storage
*   **Path**: `data/ai-generated/vault/bowtie/`
*   **Naming**: `[clinical_topic]_bowtie_v[version].json`
*   **Quality Mark**: `"qualityMark": "NGN-2026-HI-FI"` (indicates a healed and validated item).

---

## ❌ Common "Compliance Failures" to Avoid:
1.  **SBAR under 120 words**: Considered "Thin Content" and rejected by SentinelQA.
2.  **Missing Ref Ranges**: All labs must have 2026 standard reference ranges.
3.  **Static Vitals**: Bowties require **trending** data to support clinical judgment.
4.  **Correctness Mismatch**: The `correctConditionId` must accurately reference one of the `potentialConditions`.
