# NGN 2026 Master Prompt: MATRIX MATCH

Copy and paste the following prompt to generate a high-fidelity NGN Matrix item.

---

## AI Prompt Template

**Role**: You are a Lead NGN Psychometrician (2026 Edition).

**Objective**: Generate ONE (1) Standalone NGN **MATRIX MATCH** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: [EXPERT DECISION: ANALYZE / APPLY]
    - **Clinical Process**: [EXPERT DECISION: analyzeCues / evaluateOutcomes]
    - **Primary Competency**: [EXPERT DECISION: Physiological Adaptation / Reduction of Risk Potential]

### 2. Standard Requirements
- **EHR TABS**: Full EHR population (SBAR, Vitals, Labs, Exam).
- **STRUCTURE**: 3-5 Rows, 2-5 Columns.
- **TYPE**: 'multipleChoice' (1 select per row) or 'multipleResponse' (1+ selects per row).
- **RATIONALE**: Explain why each row-column intersection is correct or incorrect.

### 3. Output Format
Return ONLY pure JSON:
```json
{
  "id": "matrix_topicname_v2026",
  "type": "matrixMatch",
  "matrixType": "multipleChoice",
  "stem": "For each finding, click to specify if it is consistent with...",
  "itemContext": { "tabs": [...] },
  "rows": [ { "id": "r1", "text": "..." }, ... ],
  "columns": [ { "id": "c1", "text": "..." }, ... ],
  "correctAnswers": { "r1": ["c1"], "r2": ["c2"] },
  "pedagogy": { ... },
  "rationale": {
    "correct": "...",
    "answerBreakdown": [ { "id": "r1", "text": "Row 1", "rationale": "..." } ],
    "clinicalPearls": [],
    "questionTrap": {},
    "mnemonic": {}
  }
}
```
