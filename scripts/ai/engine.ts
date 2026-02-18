/**
 * NCLEX-RN NGN Generation Engine
 * Hand-tuned for the Provided Keys & CJMM Compliance
 */

const KEYS = [
    'AIzaSyCGBsatIVorw0mlj-c2mNl7n4iUarLQbLU',
    'AIzaSyDxfULa7oK-3dxmHMcKmQL3rNjFhyBOMF0',
    'AIzaSyBbN5d9Cpz3O__l9H5lQydqGtrAZlATut0',
    'AIzaSyBeVY1qKlAljfGPkESHabNxtXDk24YK5X8',
    'AIzaSyAdHhHYugOXZT55hDvFWxODaMujBcQ96Ts',
    'AIzaSyB-2ZrAXzeLJgqvs52vImSkNzCTJNUeZ4A',
    'AIzaSyBCkx-5OPtyKYw9tJNi_BgIMfUE_-IO3rw',
    'AIzaSyDN6hn3iRdbvmuDaQ8PAh6tpVpLTvarHzc',
    'AIzaSyBZsMEpJnohvU_TYFUFHq4v3wKMRQS5yS4',
    'AIzaSyBm7tNmXPD8z4YqZm9VZE0fCdAM935OH8A'
];

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
