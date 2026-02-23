# NGN 2026 Master Prompt: DRAG AND DROP CLOZE

---

## AI Prompt Template

**Role**: Lead NGN Psychometrician (2026 Edition).

**Objective**: Generate ONE (1) Standalone NGN **DRAG AND DROP CLOZE** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: ANALYZE / APPLY
    - **Clinical Process**: takeAction
    - **Primary Competency**: Physiological Adaptation

### 2. Standard Requirements
- **EHR TABS**: Full sync.
- **STRUCTURE**: Sentence template with blanks. A bank of options is provided to drag into blanks.
- **SCORING**: 0/1 per blank.

### 3. Output Format
Return ONLY pure JSON:
```json
{
  "id": "dndcloze_topicname_v2026",
  "type": "dragAndDropCloze",
  "stem": "Drag findings from the bank to complete the statement...",
  "template": "The nurse should first {{action}} and then {{eval}}.",
  "options": ["Action A", "Action B", "Eval C", "Eval D"],
  "blanks": [
    { "id": "action", "correctOption": "Action A" },
    { "id": "eval", "correctOption": "Eval C" }
  ],
  "itemContext": { "tabs": [...] },
  "pedagogy": { ... },
  "rationale": { ... }
}
```
