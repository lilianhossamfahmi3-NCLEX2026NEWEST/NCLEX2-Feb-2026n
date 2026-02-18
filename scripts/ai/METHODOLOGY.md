# NGN Item Generation & Key Management Methodology

## 1. Goal
To utilize the provided AI API keys to generate high-fidelity, psychometrically sound NCLEX-RN NGN (Next Generation NCLEX) items while ensuring system stability, avoiding rate limits, and maintaining 100% schema compliance.

## 2. Key Management Strategy: "Tactical Rotation"
To prevent "exhausting the system," we implement a **Weighted Key Rotator**:
- **Multiplexing**: Calls are distributed across the 4 keys in a round-robin fashion.
- **Failover Logic**: If a key returns a `429 (Rate Limit)` or `500 (Server Error)`, it is temporarily sidelined for 60 seconds, and the request is retried with the next available key.
- **Load Balancing**: Each key is treated as an independent worker thread, allowing for parallel generation of case study components.

## 3. High-Quality Content Methodology
AI-generated content will follow a **Two-Pass Refinement Pipeline**:

### Phase 1: Contextual Scaffolding (The Simulation)
- Generate a robust `Patient` profile and `ClinicalData` (SBAR, Vitals, Labs).
- Ensure clinical consistency (e.g., if the diagnosis is CHF, the BNP must be elevated, and the physical exam must mention crackles/edema).

### Phase 2: NGN Item Forge
- Generate 6 specific items following the NCSBN Clinical Judgment Measurement Model (CJMM):
    1. **Recognize Cues** (Highlight/Multiple Choice)
    2. **Analyze Cues** (Cloze/Matrix)
    3. **Prioritize Hypotheses** (Multiple Choice)
    4. **Generate Solutions** (Select All That Apply)
    5. **Take Action** (Priority Action/Drag & Drop)
    6. **Evaluate Outcomes** (Trend/Matrix)

### Phase 3: Ethical & Clinical Guardrails
- **Rationale Richness**: Every item MUST include a detailed "Correct" and "Incorrect" rationale.
- **Pedagogy Alignment**: Difficulty levels and NCLEX categories are assigned based on the complexity of the clinical scenario.

## 4. Stability: The Validation Gate
Generated JSON is never injected into the app directly. 
- **Zod Validation**: Every generation is validated against `CaseStudySchema`.
- **Deduplication**: Use a hashing algorithm on the patient name/diagnosis to ensure we don't store redundant content.
- **Local Caching**: Items are saved as `.json` files in `data/ai-generated/` for developer review and audit.

## 5. Deployment
Generation scripts are located in `scripts/ai/` and can be triggered via terminal to batch-populate the library.
