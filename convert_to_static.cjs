const fs = require('fs');
const path = require('path');

const VAULT_DIRS = [
    path.join(__dirname, 'data', 'ai-generated', 'vault'),
    path.join(__dirname, 'data', 'ai-generated', 'vault', 'quarantine')
];

const OUTPUT_ROOT = path.join(__dirname, 'NGN_Exam_Repo_2026');

// --- Load Assets for Embedding ---
const engineCSS = fs.readFileSync(path.join(OUTPUT_ROOT, 'assets', 'css', 'engine.css'), 'utf8');
const engineJS = fs.readFileSync(path.join(OUTPUT_ROOT, 'assets', 'js', 'engine.js'), 'utf8');

// --- HTML Template Builder ---
function generateHTMLTemplate(item) {
    const type = item.type || "unknown";
    const patient = item.itemContext?.patient || { name: "Patient X", age: "Unknown", gender: "Unknown" };
    const tabs = item.itemContext?.tabs || [];
    const stem = item.stem || "Evaluate the clinical evidence.";
    const hoverRationales = item.hoverRationales || {};
    const hoverRationaleValues = Object.values(hoverRationales).join('<br><br>');

    // Build Tab Sidebar
    const tabNavHTML = tabs.map((t, idx) => `
        <button class="ehr-tab ${idx === 0 ? 'active' : ''}" data-tab-id="${t.id}">
            ${t.title}
        </button>`).join('');

    // Build Tab Content
    const tabContentHTML = tabs.map((t, idx) => `
        <div id="tab-${t.id}" class="tab-content" style="display: ${idx === 0 ? 'block' : 'none'}">
            <div class="ehr-content">
                <p style="white-space: pre-wrap;">${t.content}</p>
            </div>
        </div>`).join('');

    // Question Body (Type-Specific)
    let questionBody = '';

    if (type === 'bowtie') {
        const potentialConditions = (item.potentialConditions || []).map(p => `
            <div class="draggable-item" draggable="true" data-id="${p.id}">${p.text}</div>`).join('');
        const actionsToTake = (item.actions || []).map(a => `
            <div class="draggable-item" draggable="true" data-id="${a.id}">${a.text}</div>`).join('');
        const parametersToMonitor = (item.parameters || []).map(p => `
            <div class="draggable-item" draggable="true" data-id="${p.id}">${p.text}</div>`).join('');

        questionBody = `
            <div class="bowtie-container">
                <div class="column">
                    <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 12px; color: var(--muted-text);">Potential Actions</h4>
                    <div id="drop-actions" class="drop-zone" data-type="actions" data-max="2"></div>
                    <div class="items-source" style="margin-top: 20px;">${actionsToTake}</div>
                </div>
                <div class="column">
                    <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 12px; color: var(--muted-text);">Potential Condition</h4>
                    <div id="drop-condition" class="drop-zone" data-type="condition" data-max="1"></div>
                    <div class="items-source" style="margin-top: 20px;">${potentialConditions}</div>
                </div>
                <div class="column">
                    <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 12px; color: var(--muted-text);">Parameters to Monitor</h4>
                    <div id="drop-params" class="drop-zone" data-type="params" data-max="2"></div>
                    <div class="items-source" style="margin-top: 20px;">${parametersToMonitor}</div>
                </div>
            </div>
        `;
    } else if (type === 'multipleChoice' || type === 'selectAll' || type === 'multipleResponse' || type === 'sata' || type === 'mcq') {
        const options = (item.options || []).map(o => `
            <div class="option-item" data-id="${o.id}">
                <div class="bullet">${(type === 'multipleChoice' || type === 'mcq') ? '○' : '□'}</div>
                <div class="text">${o.text || o.content}</div>
                <span class="rationale-trigger">?</span>
            </div>`).join('');
        questionBody = `<div class="options-list">${options}</div>`;
    } else if (type === 'clozeDropdown') {
        let template = item.template || "";
        (item.blanks || []).forEach(blank => {
            const dropdownHTML = `
                <select class="cloze-select" data-id="${blank.id}">
                    <option value="">-- select --</option>
                    ${(blank.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>`;
            template = template.replace(`{{${blank.id}}}`, dropdownHTML);
        });
        questionBody = `<div class="cloze-template">${template}</div>`;
    } else if (type === 'highlight') {
        let passage = item.passage || "";
        if (passage.includes('[')) {
            let index = 0;
            passage = passage.replace(/\[([^\]]+)\]/g, (match, text) => {
                return `<span class="highlight-item" data-index="${index++}">${text}</span>`;
            });
        } else {
            // Split by sentence (lookback for sentence-ending punctuation, optional quote, followed by space/newline)
            const sentences = passage.split(/(?<=[.!?]['"”]?)\s+/);
            passage = sentences.map((s, idx) => `<span class="highlight-item" data-index="${idx}">${s.trim()}</span>`).join(' ');
        }
        questionBody = `<div class="highlight-passage">${passage}</div>`;
    } else if (type === 'matrixMatch' || type === 'matrix') {
        const rows = item.rows || [];
        const cols = item.columns || item.cols || [];
        const isMultipleResponse = item.scoring?.method === 'polytomous' || item.type === 'matrixMultipleChoice';

        if (rows.length > 0 && cols.length > 0) {
            questionBody = `
                <div class="matrix-container">
                    <table class="matrix-table">
                        <thead>
                            <tr>
                                <th></th>
                                ${cols.map(c => `<th>${c.text || c}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map((r, rIdx) => `
                                <tr>
                                    <td class="row-label">${r.text || r}</td>
                                    ${cols.map((c, cIdx) => `
                                        <td>
                                            <input 
                                                type="${isMultipleResponse ? 'checkbox' : 'radio'}" 
                                                name="row-${rIdx}" 
                                                data-row="${rIdx}" 
                                                data-col="${cIdx}"
                                                class="matrix-input"
                                            >
                                        </td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (Array.isArray(item.matrix)) {
            const options = item.matrix.map(o => `
                <div class="option-item" data-id="${o.id}">
                    <div class="bullet">□</div>
                    <div class="text">${o.content || o.text}</div>
                </div>`).join('');
            questionBody = `<div class="options-list">${options}</div>`;
        }

    } else if (type === 'orderedResponse') {
        const options = (item.options || []).map((o, idx) => `
            <div class="draggable-item ranking-item" draggable="true" data-id="${o.id || idx}">
                ${o.text || o.content}
            </div>`).join('');
        questionBody = `
            <div class="ranking-container">
                <div class="items-source drop-zone ranking-zone" data-type="ranking" data-max="99">${options}</div>
            </div>
        `;
    } else if (type === 'dragAndDropCloze') {
        let template = item.template || "";
        (item.blanks || []).forEach(blank => {
            const dropZoneHTML = `
                <span class="drop-zone inline-drop" data-id="${blank.id}" data-max="1"></span>`;
            template = template.replace(`{{${blank.id}}}`, dropZoneHTML);
        });
        const options = (item.options || []).map(o => `
            <div class="draggable-item" draggable="true" data-id="${o.id}">${o.text}</div>`).join('');
        questionBody = `
            <div class="drag-cloze-container">
                <div class="cloze-template" style="margin-bottom: 24px;">${template}</div>
                <div class="items-source" style="display: flex; flex-wrap: wrap; gap: 12px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px;">
                    ${options}
                </div>
            </div>
        `;
    } else {
        questionBody = `<p>Item type [${type}] rendering in simplified mode.</p>`;
    }

    // Final HTML Assembly
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NGN Item - ${item.id}</title>
    <style>${engineCSS}</style>
</head>
<body 
    data-item-id="${item.id}" 
    data-item-type="${type}"
    data-correct-id="${item.correctOptionId || (Array.isArray(item.options) ? item.options.find(o => o.isCorrect)?.id : '') || ''}"
    data-correct-options="${(Array.isArray(item.options) ? item.options.filter(o => o.isCorrect).map(o => o.id).join(',') : '')}"
    data-correct-condition="${item.correctConditionId || item.condition || ''}"
    data-correct-actions="${(item.correctActionIds || []).join(',')}"
    data-correct-params="${(item.correctParameterIds || []).join(',')}"
    data-correct-blanks='${JSON.stringify((item.blanks || []).reduce((acc, b) => { acc[b.id] = b.correctOption; return acc; }, {}))}'
    data-correct-spans="${(item.correctSpanIndices || []).join(',')}"
    data-correct-matrix='${JSON.stringify(item.rows?.map((r, i) => r.correctColIndex !== undefined ? r.correctColIndex : (r.correctColumns || [])) || (Array.isArray(item.matrix) ? item.matrix.filter(o => o.match).map(o => o.id) : []))}'
    data-correct-order="${(Array.isArray(item.options) ? (item.correctOrder || item.options.map(o => o.id)).join(',') : '')}"
>
    <div class="NGN-app">
        <header class="exam-header">
            <div class="brand">
                <div class="logo">NGN</div>
                <div class="info">
                    <div style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--muted-text);">Clinical Simulator v26.1</div>
                    <div style="font-size: 0.9rem; font-weight: 700;">Patient: ${patient.name} (${patient.gender}, ${patient.age})</div>
                </div>
            </div>
            <div class="status-bar">
                <div class="timer">Time Remaining: 59:42</div>
                <div class="id">ID: ${item.id}</div>
            </div>
        </header>

        <main class="exam-matrix">
            <aside class="panel ehr-panel">
                <nav class="ehr-tabs">${tabNavHTML}</nav>
                <div class="scroll-area">${tabContentHTML}</div>
            </aside>

            <section class="panel question-panel">
                <div class="scroll-area">
                    <div class="question-card">
                        <div class="stem">${stem}</div>
                        <div class="interactive-area">${questionBody}</div>
                        
                        <div class="rationale-panel" id="rationale-main">
                            <h3 style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                                <span style="background: var(--success); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">✓</span>
                                Clinical Rationales
                            </h3>
                            <p style="font-size: 0.95rem; color: var(--text); padding: 16px; background: rgba(0,0,0,0.2); border-left: 4px solid var(--success); border-radius: 4px;">
                                ${item.rationale?.correct || "Clinical evidence confirms the prioritization of interventions based on the identified condition."}
                            </p>
                            <div style="margin-top: 20px; font-size: 0.85rem; color: var(--muted-text);">
                                <strong>Topic Coverage:</strong> ${item.pedagogy?.topicTags?.join(', ') || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="exam-footer">
                    <div style="color: var(--muted-text); font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Analyze cues before proceeding</div>
                    <button class="btn-submit">Submit Answer →</button>
                    <button class="btn-submit" style="display:none; background: #4b5563;" onclick="window.history.back()">Back to Library</button>
                </footer>
            </section>

            <aside class="panel hud-panel" style="backdrop-filter: var(--glass-blur); border-left: 1px solid var(--border);">
                <div class="scroll-area">
                    <h4 style="font-size: 0.75rem; color: var(--muted-text); text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Clinical HUD</h4>
                    <div style="background: rgba(0,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(0,255,255,0.1); margin-bottom: 20px;">
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--secondary);">CJMM COGNITIVE STEP</div>
                        <div style="font-size: 1rem; font-weight: 900; color: white;">${item.pedagogy?.cjmmStep || "N/A"}</div>
                    </div>
                    <div style="background: rgba(99,102,241,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.1);">
                        <div style="font-size: 0.65rem; font-weight: 800; color: var(--primary);">DIFFICULTY SCALE</div>
                        <div style="font-size: 1rem; font-weight: 900; color: white;">Level ${item.pedagogy?.difficulty || 3}/5</div>
                    </div>
                </div>
            </aside>
        </main>
    </div>
    <script>${engineJS}</script>
</body>
</html>`;
}

// --- Mass Converter Script ---
function walk(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) walk(fullPath, results);
        else if (file.endsWith('.json')) results.push(fullPath);
    }
    return results;
}

async function massConvert() {
    console.log('🚀 Mass NGN Conversion Protocol 2026 Init...');

    const manifest = [];
    const allJsonFiles = [];
    VAULT_DIRS.forEach(d => walk(d, allJsonFiles));

    console.log(`Analyzing ${allJsonFiles.length} source items...`);

    let count = 0;
    for (const jsonPath of allJsonFiles) {
        try {
            const raw = fs.readFileSync(jsonPath, 'utf8');
            const item = JSON.parse(raw);
            if (!item.id || !item.type) continue;

            // Determine folder
            const folderName = item.type.toLowerCase();
            const targetDir = path.join(OUTPUT_ROOT, folderName);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            // Generate Filename
            const sanitizedId = item.id.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${sanitizedId}.html`;
            const filePath = path.join(targetDir, fileName);

            // Build and Write content
            const html = generateHTMLTemplate(item);
            fs.writeFileSync(filePath, html, 'utf8');

            manifest.push({
                id: item.id,
                type: item.type,
                title: (item.itemContext?.patient?.diagnosis || item.pedagogy?.topicTags?.[0] || 'Unknown Clinical Case'),
                path: `${folderName}/${fileName}`
            });

            count++;
            if (count % 100 === 0) console.log(`   [Progress] ${count} items processed...`);

        } catch (e) {
            console.error(`X Failed item ${jsonPath}:`, e.message);
        }
    }

    // Write Manifest
    fs.writeFileSync(path.join(OUTPUT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    console.log(`-------------------------------------------`);
    console.log(`🏆 CONVERSION COMPLETE: ${count} Items Migrated.`);
    console.log(`Static Repository: ${OUTPUT_ROOT}`);
    console.log(`Manifest Saved: ${path.join(OUTPUT_ROOT, 'manifest.json')}`);
    console.log(`-------------------------------------------`);
}

massConvert();
