const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');

function walk(dir, results = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            walk(fullPath, results);
        } else if (file.endsWith('.json')) {
            results.push(fullPath);
        }
    }
    return results;
}

console.log('Finding unmigrated vault items...');
const files = walk(VAULT_DIR);
let changesCount = 0;
let fileChangesCount = 0;

for (const file of files) {
    try {
        const rawContent = fs.readFileSync(file, 'utf8');
        let content = JSON.parse(rawContent);

        const isArray = Array.isArray(content);
        let items = isArray ? content : [content];
        let fileChanged = false;

        const fixedItems = items.map(item => {
            let changed = false;
            const repaired = { ...item };

            // 0. AI Schema Migration (Fixing "Flat" generated items)
            if (repaired.itemType && !repaired.type) {
                repaired.type = repaired.itemType;
                changed = true;
            }

            if (!repaired.pedagogy && (repaired.cognitiveLevel || repaired.clientNeed || repaired.contentArea)) {
                repaired.pedagogy = {
                    bloomLevel: (repaired.cognitiveLevel || 'apply').toLowerCase(),
                    cjmmStep: repaired.clinicalProcess || 'analyzeCues',
                    nclexCategory: repaired.clientNeed || 'Physiological Adaptation',
                    topicTags: repaired.contentArea ? [repaired.contentArea] : ['Uncategorized'],
                    difficulty: parseInt(repaired.difficulty) || 3
                };
                changed = true;
            }

            if (typeof repaired.rationale === 'string') {
                const strRationale = repaired.rationale;
                repaired.rationale = {
                    correct: strRationale,
                    incorrect: '',
                    clinicalPearls: repaired.clinicalPearls ? [repaired.clinicalPearls] : [],
                    questionTrap: repaired.questionTrap ? { trap: 'Focus Area', howToOvercome: repaired.questionTrap } : undefined,
                    mnemonic: repaired.mnemonic ? { title: 'HINT', expansion: repaired.mnemonic } : undefined,
                    answerBreakdown: [],
                    reviewUnits: []
                };
                changed = true;
            }

            if (repaired.options && Array.isArray(repaired.options)) {
                const correctOpts = repaired.options.filter(o => o.isCorrect === true);
                if (correctOpts.length > 0) {
                    if (repaired.type === 'multipleChoice' && !repaired.correctOptionId) {
                        repaired.correctOptionId = correctOpts[0].id;
                        changed = true;
                    }
                    if (repaired.type === 'selectAll' && !repaired.correctOptionIds) {
                        repaired.correctOptionIds = correctOpts.map(o => o.id);
                        changed = true;
                    }
                    if (repaired.type === 'highlight' && !repaired.correctSpanIndices) {
                        repaired.correctSpanIndices = correctOpts.map((o, idx) => idx);
                        repaired.passage = repaired.passage || repaired.options.map((o) => o.text).join(' ');
                        changed = true;
                    }
                }
            }

            // 1. Fix Missing/Wrong Scoring Defaults
            if (!repaired.scoring) {
                repaired.scoring = { method: 'polytomous', maxPoints: 1 };
                changed = true;
            }

            // 2. Fix maxPoints for selectAll (Dichotomous vs Polytomous common error)
            if (repaired.type === 'selectAll' && repaired.correctOptionIds) {
                const expected = repaired.correctOptionIds.length;
                if (repaired.scoring.maxPoints !== expected) {
                    repaired.scoring.maxPoints = expected;
                    repaired.scoring.method = 'polytomous';
                    changed = true;
                }
            }

            // 3. Fix maxPoints for Multiple Choice (Must be 1)
            const dichotomousTypes = ['multipleChoice', 'priorityAction', 'trend', 'graphic', 'audioVideo', 'chartExhibit'];
            if (dichotomousTypes.includes(repaired.type) && (repaired.scoring.maxPoints !== 1 || repaired.scoring.method !== 'dichotomous')) {
                repaired.scoring.maxPoints = 1;
                repaired.scoring.method = 'dichotomous';
                changed = true;
            }

            if (changed) {
                fileChanged = true;
                changesCount++;
            }
            return repaired;
        });

        if (fileChanged) {
            fs.writeFileSync(file, JSON.stringify(isArray ? fixedItems : fixedItems[0], null, 2), 'utf8');
            fileChangesCount++;
        }

    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
}

console.log(`Successfully migrated ${changesCount} items across ${fileChangesCount} files.`);
