# NGN 2026 Master Prompt: CLOZE DROPDOWN

---

## AI Prompt Template

**Role**: Lead NGN Psychometrician (2026 Edition).

**Objective**: Generate ONE (1) Standalone NGN **CLOZE DROPDOWN** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: ANALYZE
    - **Clinical Process**: analyzeCues / prioritizeHypotheses
    - **Primary Competency**: Physiological Adaptation

### 2. Standard Requirements
- **EHR TABS**: Full sync with stem.
- **STRUCTURE**: 1 sentence with 1-3 dropdown blanks (cloze).
- **SCORING**: 0/1 (No penalty).

### 3. Output Format
Return ONLY pure JSON:
```json
{
  "id": "cloze_topicname_v2026",
  "type": "clozeDropdown",
  "stem": "Complete the following sentence based on the EHR data...",
  "template": "The client is at highest risk for {{risk}} as evidenced by {{finding}}.",
  "dropdowns": [
    { "id": "risk", "options": ["MI", "Stroke", "Sepsis"], "correctOption": "Sepsis" },
    { "id": "finding", "options": ["Fever", "Hypotension", "High WBC"], "correctOption": "Hypotension" }
  ],
  "itemContext": { "tabs": [...] },
  "pedagogy": { ... },
  "rationale": { ... }
}
```
