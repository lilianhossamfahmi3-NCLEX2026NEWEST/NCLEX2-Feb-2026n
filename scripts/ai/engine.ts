/**
 * NCLEX-RN NGN Generation Engine
 * Hand-tuned for the Provided Keys & CJMM Compliance
 */

import 'dotenv/config';

const KEYS: string[] = [];
for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) KEYS.push(key);
}

if (KEYS.length === 0) {
    console.error('⚠️  No GEMINI_API_KEY_* environment variables found. Set GEMINI_API_KEY_1 through GEMINI_API_KEY_10 in .env');
}

class KeyRotator {
    private current = 0;

    getNextKey() {
        const key = KEYS[this.current];
        this.current = (this.current + 1) % KEYS.length;
        return key;
    }
}

const rotator = new KeyRotator();

export async function promptAI(prompt: string, model: string = 'gemini-1.5-pro') {
    const key = rotator.getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        }
    };

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`AI Engine Failure: ${resp.status} - ${err}`);
        }

        const data = await resp.json();
        const text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text);
    } catch (e) {
        console.error('Generation Error:', e);
        throw e;
    }
}

export const GENERATION_PROMPT_TEMPLATE = `
You are a Board-Certified Nurse Educator and NCLEX-RN Expert.
Generate a complete NGN Case Study following the NCSBN Clinical Judgment Measurement Model.

OUTPUT FORMAT: Strict JSON matching the 'CaseStudy' interface.
REQUIREMENTS:
1. Patient Profile: Realistic demographics and medical-grade data.
2. Clinical Data: SBAR, Vitals, Labs (color-coded), physical exam, and imaging.
3. 6 Items: One for each CJMM step (Recognize Cues, Analyze Cues, etc.).
4. Question Types: Mix 'highlight', 'multipleChoice', 'selectAll', 'matrixMatch', 'bowtie', 'clozeDropdown'.
5. Rationale: Comprehensive rationales for every item.

CLINICAL TOPIC: {{TOPIC}}
DIFFICULTY: {{DIFFICULTY}}

Return ONLY the JSON object.
`;
