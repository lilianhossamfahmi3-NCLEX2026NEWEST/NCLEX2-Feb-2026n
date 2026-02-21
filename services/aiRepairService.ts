/**
 * NCLEX-RN NGN 2026 AI Clinical Healing Service
 * Uses Gemini Pro to repair items according to the Master Specification.
 */

export interface RepairResult {
    repairedItem: any;
    changes: string[];
}

const NGN_2026_SPEC_SUMMARY = `
1. CLINICAL SYNC: EHR Tabs (SBAR, Vitals, Labs, Radiology) MUST precisely match the item stem.
2. SBAR: 120-160 words, military time (HH:mm), objective findings.
3. SCORING: 
   - SATA/Highlight: Polytomous (+/- model with 1.0 penalty factor).
   - Matrix/Cloze: 0/1 model.
   - Bowtie: Triad/Dyad linked scoring.
4. RATIONALE: Deep pathophysiology explanations for ALL options. No "Distractor X is incorrect" generic text.
5. ELEMENTS: Mandatory clinicalPearls, questionTraps, and mnemonics.
6. NO WINDOW DRESSING: Remove irrelevant fluff from stem.
`;

export async function deepRepairItemWithAI(item: any, apiKey: string): Promise<RepairResult> {
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `
You are the "SentinelQA Deep-Health" Engine for an NCLEX-RN NGN Simulator.
Your task is to REPAIR the following JSON item to strictly follow the NCLEX-RN NGN 2026 Master Specification.

MASTER SPECIFICATION SUMMARY:
${NGN_2026_SPEC_SUMMARY}

CURRENT ITEM JSON:
${JSON.stringify(item, null, 2)}

DIRECTIONS:
1. Fix any structural errors.
2. Ensure the SBAR note in itemContext or tabs is 120-160 words and uses military time.
3. Ensure the scoring.method and scoring.maxPoints match the item type rules.
4. Upgrade all rationales to be "Deep Pathophysiology" explanations.
5. Add missing clinicalPearls, questionTraps, and mnemonics if they are weak or missing.
6. Ensure total clinical synchronization between the stem and the provided clinical data.

Return ONLY a JSON object with two fields:
{
  "repairedItem": { ... },
  "changes": ["list of specific clinical changes made"]
}
`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2, // Low temperature for high precision
            responseMimeType: "application/json"
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        throw new Error(`AI Repair Failed: ${resp.status} ${await resp.text()}`);
    }

    const data = await resp.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);
    return result as RepairResult;
}
