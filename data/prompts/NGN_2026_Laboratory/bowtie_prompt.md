# NGN 2026 Master Prompt: BOWTIE

Copy and paste the following prompt into an Elite AI to generate a high-fidelity NGN item.

---

## AI Prompt Template

**Role**: You are a Lead NGN Psychometrician at NCSBN specializing in the 2026 NCLEX-RN standards.

**Objective**: Generate ONE (1) Standalone NGN **BOWTIE** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: [EXPERT DECISION: ANALYZE / APPLY]
    - **Clinical Process**: [EXPERT DECISION: prioritizeHypotheses / generateSolutions]
    - **Primary Competency**: [EXPERT DECISION: Physiological Adaptation / Management of Care]

### 2. Standard Requirements (NGN 2026)
- **EHR TABS**: Full EHR population (SBAR, Vitals, Labs, Exam, Radiology, Orders, MAR).
- **STRUCTURE**:
    - **Potential Conditions**: 4 options.
    - **Actions to Take**: 5 options.
    - **Parameters to Monitor**: 5 options.
- **SCORING**: Triad Scoring.
    - 2 Actions correct = 1 pt.
    - 1 Condition correct = 1 pt.
    - 2 Parameters correct = 1 pt.
- **RATIONALE**: Deep clinical/pathophysiological explanations.
- **EXTRAS**: Include `clinicalPearls`, `questionTrap`, and `mnemonic`.

### 3. Output Format
Return ONLY pure JSON matching this interface:
```json
{
  "id": "bowtie_topicname_v2026",
  "type": "bowtie",
  "stem": "The nurse reviews clinical data... Complete the diagram...",
  "itemContext": { "tabs": [...] },
  "actions": [ { "id": "a1", "text": "..." }, ... ],
  "potentialConditions": [ "C1", "C2", "C3", "C4" ],
  "condition": "C1",
  "parameters": [ { "id": "p1", "text": "..." }, ... ],
  "correctActionIds": ["a1", "a3"],
  "correctParameterIds": ["p2", "p5"],
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "generateSolutions",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["Topic"]
  },
  "rationale": {
    "correct": "...",
    "answerBreakdown": [ ... ],
    "clinicalPearls": [],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  }
}
```
