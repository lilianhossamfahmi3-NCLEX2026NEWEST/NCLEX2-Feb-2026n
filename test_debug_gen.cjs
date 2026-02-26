require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testOne() {
    const key = process.env.VITE_GEMINI_API_KEY_1;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`;
    const prompt = `Generate ONE NGN multipleChoice item for "Heart Failure" as PURE JSON. 
    Must have: id, type, stem, scoring, itemContext { patient, sbar, tabs: [{id, title, content}] }, pedagogy, rationale. 
    Tabs MUST be an array of objects. SBAR must be a string.`;

    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } })
    });
    const data = await resp.json();
    console.log("AI RESPONSE RAW:", data.candidates[0].content.parts[0].text);
    const item = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim());

    const { validateItem } = require('./validation/sentinel_validator.cjs');
    const report = validateItem(item);
    console.log("QA REPORT:", JSON.stringify(report, null, 2));
}
testOne();
