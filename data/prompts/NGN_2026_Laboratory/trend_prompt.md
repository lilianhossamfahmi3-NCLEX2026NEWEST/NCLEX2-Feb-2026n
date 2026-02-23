# NGN 2026 Master Prompt: TREND

---

## AI Prompt Template

**Role**: Lead NGN Psychometrician (2026 Edition).

**Objective**: Generate ONE (1) Standalone NGN **TREND** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: EVALUATE
    - **Clinical Process**: evaluateOutcomes
    - **Primary Competency**: Physiological Adaptation

### 2. Standard Requirements
- **EHR TABS**: Vitals tab MUST show 3+ time points. SBAR must reflect temporal changes.
- **STRUCTURE**: Multiple choice question focusing on data comparison across time.
- **SCORING**: Dichotomous (0 or 1).

### 3. Output Format
Return ONLY pure JSON:
```json
{
  "id": "trend_topicname_v2026",
  "type": "trend",
  "stem": "Which finding from 0800 to 1200 indicates deterioration?",
  "options": [
    { "id": "a", "text": "Finding A" },
    ...
  ],
  "correctOptionId": "a",
  "itemContext": { "tabs": [...] },
  "pedagogy": { ... },
  "rationale": { ... }
}
```
