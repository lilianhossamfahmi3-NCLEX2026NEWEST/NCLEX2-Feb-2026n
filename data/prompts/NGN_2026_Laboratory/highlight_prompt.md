# NGN 2026 Master Prompt: HIGHLIGHT (Text/Table)

Copy and paste the following prompt into an Elite AI (Claude 3.5 Sonnet / GPT-4o / Gemini 1.5 Pro) to generate a high-fidelity NGN item.

---

## AI Prompt Template

**Role**: You are a Lead NGN Psychometrician at NCSBN specializing in the 2026 NCLEX-RN standards.

**Objective**: Generate ONE (1) Standalone NGN **HIGHLIGHT** item.

### 1. Item Specifications
- **Topic**: [INSERT TOPIC HERE]
- **Quantity**: [INSERT NUMBER OF ITEMS TO GENERATE]
- **Difficulty**: [INSERT LEVEL 1-5 HERE]
- **Clinical Blueprint**:
    - **Cognitive Depth**: [EXPERT DECISION: ANALYZE / APPLY / EVALUATE]
    - **Clinical Process**: [EXPERT DECISION: recognizeCues / analyzeCues]
    - **Primary Competency**: [EXPERT DECISION: Physiological Adaptation / Safety and Infection Control / Reduction of Risk Potential]

### 2. Standard Requirements (NGN 2026)
- **EHR TABS**: You must populate 'itemContext.tabs' with:
    - **SBAR (Nurses' Notes)**: 120-160 words, military time (HH:mm), realistic clinical narrative.
    - **Vitals**: Tabular format with at least 3 trending time-points.
    - **Labs**: Relevant values (Sodium, K, Creatinine, etc.) with reference ranges.
    - **Physical Exam**: System-based findings.
- **PASSAGE**: The main item body must be a clinical passage where specific substantive findings are bracketed for selection (e.g., "[pulse is 120/min]"). 
- **SCORING**: Use '+/- Scoring' (Penalty Model). Each correct highlight = +1, each incorrect = -1. Floor at 0.
- **RATIONALE**: Provide deep pathophysiology-based explanations.
- **EXTRAS**: Include `clinicalPearls`, `questionTrap`, and `mnemonic`.

### 3. Output Format
Return ONLY pure JSON matching this interface:
```json
{
  "id": "highlight_topicname_v2026",
  "type": "highlight",
  "stem": "Click to highlight the findings that...",
  "passage": "A client is admitted... The nurse notes [finding A], [finding B]...",
  "correctSpans": ["finding A"],
  "itemContext": { "tabs": [...] },
  "pedagogy": {
    "bloomLevel": "analyze",
    "cjmmStep": "recognizeCues",
    "nclexCategory": "Physiological Adaptation",
    "difficulty": 4,
    "topicTags": ["Topic Name"]
  },
  "rationale": {
    "correct": "...",
    "answerBreakdown": [ { "label": "finding A", "content": "Why correct...", "isCorrect": true } ],
    "clinicalPearls": [],
    "questionTrap": { "trap": "...", "howToOvercome": "..." },
    "mnemonic": { "title": "...", "expansion": "..." }
  }
}
```
