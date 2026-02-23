# NGN 2026 Master Prompt: SELECT N

---

## AI Prompt Template

**Role**: Lead NGN Psychometrician (2026 Edition).

**Objective**: Generate ONE (1) Standalone NGN **SELECT N** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: ANALYZE
    - **Clinical Process**: recognizeCues / takeAction
    - **Primary Competency**: [Physiological Adaptation / Safety]

### 2. Standard Requirements
- **N Value**: Specify exactly how many correct options (e.g., N=3).
- **STRUCTURE**: Stem must state "Select the N most appropriate...".
- **OPTIONS**: 5-8 total.
- **SCORING**: 0/1 (No partial, no penalty?). Actually NGN Select N usually scores 0 or 1 for the whole item or 0/1 per correct choice with no penalty. We follow 0/1 for the whole item (Dichotomous) for Select N.

### 3. Output Format
Return ONLY pure JSON:
```json
{
  "id": "selectN_topicname_v2026",
  "type": "selectN",
  "n": 3,
  "stem": "Select the 3 findings that...",
  "options": [ ... ],
  "correctOptionIds": [ ... ],
  "itemContext": { "tabs": [...] },
  "pedagogy": { ... },
  "rationale": { ... }
}
```
