# NCLEX-RN NGN 2026 Master Content & Logic Specification

This document is the **Absolute Source of Truth** for the Senior NCLEX Clinical Simulator. All item generation, validation, and rendering must strictly adhere to these 2026 NCSBN standards.

---

## 1. Clinical Tab Standards (The Exhibit System)

As per the 2026 simulator interface, the following 7 subsections represent the mandatory High-Fidelity Clinical Record.

### A. Clinical Feed (Nurses' Notes)
*   **Format**: SBAR (Situation, Background, Assessment, Recommendation).
*   **Word Count**: 120–160 words per note.
*   **Logic**: Must include Admission Notes + Progress Notes. Timestamps must be in military time (HH:mm). Notes must reflect changes in patient status or response to interventions.
*   **Prompt Alignment**: Terminology in notes MUST exactly match the item stem (e.g., if stem says "adult child," the note must say "adult child," not "daughter").

### B. Vitals & Telemetry
*   **Format**: Tabular flowsheet.
*   **Logic**: Mandatory **Trending**. Minimum 3 time-points for acute scenarios.
*   **Precision**: Temp in `°F (°C)`, SpO₂ with source (e.g., `94% on 2L NC`), BP with MAP status.

### C. Lab Diagnostics
*   **Format**: Result | Unit | Reference Range | Status (High/Low).
*   **Logic**: Must include critical values where appropriate. Abbreviations must follow NCSBN standard list.

### D. Physical Exam
*   **Format**: System-based (e.g., Cardiovascular, Respiratory, Neurological).
*   **Logic**: Head-to-toe for admission; Focused Assessment for progress notes. Findings must be objective (e.g., "3+ pitting edema" vs. "swollen legs").

### E. Radiology (Imaging & Diagnostics)
*   **Format**: Official reporting style (e.g., Chest X-ray, CT, MRI, ECG).
*   **Logic**: Includes "Impression" or "Conclusion" section. Word count: 50–100 words per report.

### F. Care Plan (Orders & Interventions)
*   **Format**: Order Date/Time | Action | Frequency/Status.
*   **Logic**: Distinguishes between Standing, PRN, and Stat orders.

### G. MAR Console (Medications)
*   **Format**: Medication | Dose | Route | Frequency | Last Administered.
*   **Logic**: Includes scheduled meds and PRNs with appropriate "Last Given" timestamps to test timing logic.

### H. Item-Specific Clinical Synchronization (Dynamic Injection)
*   **Definition**: For **Standalone NGN Drills**, the system MUST dynamically inject item-specific clinical data.
*   **Standards**:
    *   **Header Synchronization**: The Patient Header (Age, Sex, Pronouns) MUST be dynamically updated to match the clinical prompt.
    *   **Labs**: If a lab value is referenced in the correct answer or a distractor (e.g., Potassium, D-dimer), it MUST appear in the Labs tab with contextually accurate values.
    *   **Radiology**: Diagnostic imaging impressions (e.g., CTPA results, X-ray findings) MUST be populated in the Radiology tab if they are central to the item's logic.
    *   **Physical Exam**: Findings mentioned in the prompt must be present and objective (e.g., "waveform dampening" for arterial lines).
    *   **Total Tab Exhaustion**: Standalone items MUST populate the **Care Plan (Orders)** and **MAR Console (Medications)** if the question involves taking action or evaluating pharmacological interventions. Leaving these tabs empty when relevant to the topic is a compliance failure.

---

## 2. Question Architecture (Stem & Options)

### A. The Question Stem
*   **Max Word Count**: 50 words.
*   **Style**: Direct, concise, and focused on one NCJMM step.
*   **Constraint**: No "window dressing" or irrelevant fluff. Every sentence must provide a necessary cue or context.

### B. Answer Options
*   **Number of Options**: 
    *   **Multiple Choice**: Exactly 4.
    *   **SATA**: 5–10.
    *   **Select N**: 5–8 (Must specify N in the stem).
*   **Max Word Count (per option)**: 25 words.
*   **Distractor Logic**: Distractors must be clinically plausible, often representing "Common Nursing Errors" or "Early-Stage Findings" that are no longer the priority.

### C. Rationale & Feedback Standards (High-Fidelity)
*   **Correct Rationale**: Must explain the *pathophysiology* or *legal/safety* basis for the correct choice.
*   **Incorrect Rationale**: Must explain why distractors are unsafe, lower priority, or clinically irrelevant in the specific context. Avoid generic "Distractor X is incorrect" statements.
*   **Highlight-Specific Rationale**: Must provide a breakdown of which bracketed cues are correct and why, and specifically why the distractors (incorrect options) do not meet the criteria specified in the stem.
*   **Clinical Data Synchronization**: Mandatory for all items. Any vital sign, physical finding, or medication mentioned in the stem/passage MUST be reflected in the simulated EHR (Tabs). Discrepancies between the text and the tabs are considered a high-severity compliance failure.
*   **Instructional Elements**: Must include `clinicalPearls`, `questionTraps` (to address test-taking strategy), and `mnemonics`.

---

## 3. NGN Item Type Specifications & Logic

| Item Type | Min Spans/Options | Logic | Scoring |
| :--- | :--- | :--- | :--- |
| **Highlight** | 6–10 Options | Min 2 distractors (incorrect options). Spans must be clinically substantive (no filler). | +/- 1.0 Penalty |
| **Matrix Match** | 3–5 Rows | Can be Multiple Choice (1 per row) or **Multiple Response** (1+ per row). | 0/1 per row |
| **Cloze Dropdown** | 1–3 Blanks | Contextual sentence or **Tabular** completion (Drop-Down Table). | 0/1 per blank |
| **Select N** | 5–8 Items | Stem: "Select the **3** most appropriate..." | 0/1 (No Penalty) |
| **Grouping** | 2–3 Groups | Multiple response items sorted into specific logical groups. | 0/1 per item |
| **Bowtie** | 5 Options | Causes (2) → Condition (1) → Actions/Parameters (2). | Rationale (Linked) |
| **Trend** | 3+ Points | Data comparison across tabs/timepoints. | Dichotomous |
| **Drag & Drop** | 4–6 Items | Sequence of priority or procedural steps. Also includes **Rationale Matching**. | Dichotomous |

---

## 4. 2026 Scoring Models (Polytomous)

*   **+/- Scoring (The Penalty Model)**: Used for SATA and Highlight. Points = `Correct - Incorrect`. Floor at 0. **Penalty factor is exactly 1.0**.
*   **0/1 Scoring (The Exact Model)**: Used for Matrix CC and Cloze. Each correct choice = 1 pt. No penalty for wrong choices.
*   **Rationale/Triad Scoring**: Used for Bowtie.
    *   **Dyad**: Action A + Outcome B must BOTH be correct to earn 1 pt.
    *   **Triad**: Cause + Condition + Action must be correctly linked for full credit.

---

## 5. 2026 Core Content Domains

All content must integrate the following NEW 2026 competencies:
1.  **Health Equity & SDOH**: Recognition of barriers to care (e.g., transportation, language, economic). *Standard: SBAR background must explicitly state the environmental barrier (e.g., "Lives in a food desert").*
2.  **Digital Privacy**: Ethics of social media and electronic health disclosure.
3.  **Advanced Monitoring**: Specialized monitoring (e.g., Arterial lines, ICP, LVADs). *Standard: Dynamic EHR findings must support the monitoring logic (e.g., transducer leveling errors).*
4.  **Unbiased Care**: Nursing judgment regardless of culture, gender identity, or expression.

---

## 6. Case Study NCJMM Sequencing (The Unfolding)

Exactly 6 items per case, ordered 1 through 6:
1.  **Recognize Cues** (What is abnormal?)
2.  **Analyze Cues** (Why is it happening?)
3.  **Prioritize Hypotheses** (What is the most likely/urgent outcome?)
4.  **Generate Solutions** (What can be done?)
5.  **Take Action** (What is the first/best thing to do?)
6.  **Evaluate Outcomes** (Did it work?)
---

## 7. AI Laboratory Data Organization (The Vault)

All AI-generated clinical items must be categorized into the **Vault** structure located at `data/ai-generated/vault/`. This ensures structural integrity and allows for automated validation of type-specific logic.

### A. The 14 Mandatory Categories
1.  `/highlight`: Text and Table highlighting items.
2.  `/multipleChoice`: Single-select traditional items.
3.  `/selectAll`: Traditional SATA (polytomous +/-).
4.  `/orderedResponse`: Drag-to-order procedural/priority items.
5.  `/matrixMatch`: Matrix Multiple Choice/Response.
6.  `/clozeDropdown`: Drop-down sentence/table completion.
7.  `/dragAndDropCloze`: Extended drag-and-drop statements.
8.  `/bowtie`: Clinical condition linkages (Rationale scoring).
9.  `/trend`: Multi-tab longitudinal data analysis.
10. `/priorityAction`: First-step/High-priority interventions.
11. `/hotspot`: Region-based image selection.
12. `/graphic`: Image-based option selection.
13. `/audioVideo`: Media-integrated clinical scenarios.
14. `/chartExhibit`: Multi-exhibit data synthesis items.

### B. Naming Convention
Files must follow the standard: `[topic]_[itemType]_[version].json` (e.g., `sepsis_highlight_v1.json`).
