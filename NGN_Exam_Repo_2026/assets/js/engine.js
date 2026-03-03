/**
 * NGN Interactivity Engine v2026.1
 * (c) 2024 Advanced Agentic Coding Team
 */

(function () {
    const STATE = {
        isSubmitted: false,
        score: 0,
        startTime: Date.now(),
        userAnswers: {}
    };

    // --- Tab Logic ---
    function initTabs() {
        const tabs = document.querySelectorAll('.ehr-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab-id');

                // Toggle tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Toggle content
                contents.forEach(c => {
                    c.style.display = c.id === `tab-${tabId}` ? 'block' : 'none';
                });
            });
        });

        // Set initial tab
        if (tabs[0]) tabs[0].click();
    }

    // --- MCQ / SATA Selection Logic ---
    function initSelection() {
        const options = document.querySelectorAll('.option-item');
        const type = document.body.getAttribute('data-item-type');

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                if (STATE.isSubmitted) return;

                const id = opt.getAttribute('data-id');

                if (type === 'multipleChoice' || type === 'mcq') {
                    options.forEach(o => {
                        o.classList.remove('selected');
                        delete STATE.userAnswers[o.getAttribute('data-id')];
                    });
                    opt.classList.add('selected');
                    STATE.userAnswers[id] = true;
                } else if (type === 'selectAll' || type === 'multipleResponse' || type === 'sata' || type === 'matrix' || type === 'matrixMatch') {
                    opt.classList.toggle('selected');
                    if (opt.classList.contains('selected')) {
                        STATE.userAnswers[id] = true;
                    } else {
                        delete STATE.userAnswers[id];
                    }
                }
            });
        });
    }

    // --- Drag and Drop Logic (Simple Implementation) ---
    function initDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable-item');
        const containers = document.querySelectorAll('.drop-zone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });

        containers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                if (!draggable) return;

                // Apply max capacity logic
                const max = parseInt(container.getAttribute('data-max') || "99");
                if (container.querySelectorAll('.draggable-item').length >= max && draggable.parentElement !== container) {
                    return;
                }

                container.appendChild(draggable);
            });
        });
    }

    // --- Highlight Logic ---
    function initHighlight() {
        const highlights = document.querySelectorAll('.highlight-item');
        highlights.forEach(el => {
            el.addEventListener('click', () => {
                if (STATE.isSubmitted) return;
                el.classList.toggle('selected');
                const idx = el.getAttribute('data-index');
                if (el.classList.contains('selected')) {
                    STATE.userAnswers[idx] = true;
                } else {
                    delete STATE.userAnswers[idx];
                }
            });
        });
    }

    // --- Matrix Logic ---
    function initMatrix() {
        const inputs = document.querySelectorAll('.matrix-input');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (STATE.isSubmitted) return;
                const row = input.getAttribute('data-row');
                const col = input.getAttribute('data-col');
                const isCheck = input.getAttribute('type') === 'checkbox';

                if (!STATE.userAnswers.matrix) STATE.userAnswers.matrix = {};

                if (isCheck) {
                    if (!STATE.userAnswers.matrix[row]) STATE.userAnswers.matrix[row] = [];
                    if (input.checked) {
                        STATE.userAnswers.matrix[row].push(parseInt(col));
                    } else {
                        STATE.userAnswers.matrix[row] = STATE.userAnswers.matrix[row].filter(c => c !== parseInt(col));
                    }
                } else {
                    STATE.userAnswers.matrix[row] = parseInt(col);
                }
            });
        });
    }

    // --- Dropdown / Select Logic ---
    function initDropdowns() {
        const selects = document.querySelectorAll('.cloze-select');
        selects.forEach(sel => {
            sel.addEventListener('change', () => {
                if (STATE.isSubmitted) return;
                const id = sel.getAttribute('data-id');
                STATE.userAnswers[id] = sel.value;
            });
        });
    }

    // --- Ranking Logic ---
    function initRanking() {
        const containers = document.querySelectorAll('.ranking-zone');
        containers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (!dragging) return;
                const afterElement = getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(dragging);
                } else {
                    container.insertBefore(dragging, afterElement);
                }
            });
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- Scoring Logic ---
    function calculateScore() {
        const itemType = document.body.getAttribute('data-item-type');
        let points = 0;

        if (itemType === 'multipleChoice' || itemType === 'mcq') {
            const correctId = document.body.getAttribute('data-correct-id');
            if (STATE.userAnswers[correctId]) points = 1;
        } else if (itemType === 'selectAll' || itemType === 'multipleResponse' || itemType === 'sata') {
            const correctIds = (document.body.getAttribute('data-correct-options') || "").split(',');
            const selectedIds = Object.keys(STATE.userAnswers);
            selectedIds.forEach(id => {
                if (correctIds.includes(id)) points += 1;
                else points -= 1;
            });
            if (points < 0) points = 0;
        } else if (itemType === 'clozeDropdown' || itemType === 'dragAndDropCloze') {
            const correctBlanks = JSON.parse(document.body.getAttribute('data-correct-blanks') || "{}");
            if (itemType === 'dragAndDropCloze') {
                document.querySelectorAll('.inline-drop').forEach(drop => {
                    const id = drop.getAttribute('data-id');
                    const val = drop.querySelector('.draggable-item')?.getAttribute('data-id');
                    if (val === correctBlanks[id]) points += 1;
                });
            } else {
                Object.keys(correctBlanks).forEach(id => {
                    if (STATE.userAnswers[id] === correctBlanks[id]) points += 1;
                });
            }
        } else if (itemType === 'highlight') {
            const correctSpans = (document.body.getAttribute('data-correct-spans') || "").split(',');
            Object.keys(STATE.userAnswers).forEach(idx => {
                if (correctSpans.includes(idx)) points += 1;
                else points -= 1;
            });
            if (points < 0) points = 0;
        } else if (itemType === 'matrixMatch' || itemType === 'matrix') {
            const correctMatrix = JSON.parse(document.body.getAttribute('data-correct-matrix') || "[]");
            const userMatrix = STATE.userAnswers.matrix || {};
            correctMatrix.forEach((correct, rowIdx) => {
                const userVal = userMatrix[rowIdx];
                if (Array.isArray(correct)) {
                    (userVal || []).forEach(v => {
                        if (correct.includes(v)) points += 1;
                        else points -= 1;
                    });
                } else {
                    if (userVal === correct) points += 1;
                }
            });
            if (points < 0) points = 0;
        } else if (itemType === 'orderedResponse') {
            const correctOrder = (document.body.getAttribute('data-correct-order') || "").split(',');
            const userOrder = [...document.querySelectorAll('.ranking-item')].map(el => el.getAttribute('data-id'));
            userOrder.forEach((id, idx) => {
                if (id === correctOrder[idx]) points += 1;
            });
        } else if (itemType === 'bowtie') {
            const centerId = document.body.getAttribute('data-correct-condition');
            const actionIds = (document.body.getAttribute('data-correct-actions') || "").split(',');
            const paramIds = (document.body.getAttribute('data-correct-params') || "").split(',');

            const selectedCenter = document.getElementById('drop-condition')?.querySelector('.draggable-item')?.getAttribute('data-id');
            if (selectedCenter === centerId) points += 2;

            const selectedActions = Array.from(document.getElementById('drop-actions')?.querySelectorAll('.draggable-item') || []).map(el => el.getAttribute('data-id'));
            selectedActions.forEach(id => { if (actionIds.includes(id)) points += 1; });

            const selectedParams = Array.from(document.getElementById('drop-params')?.querySelectorAll('.draggable-item') || []).map(el => el.getAttribute('data-id'));
            selectedParams.forEach(id => { if (paramIds.includes(id)) points += 1; });
        }

        return points;
    }

    // --- Submission ---
    function submit() {
        if (STATE.isSubmitted) return;

        STATE.isSubmitted = true;
        STATE.score = calculateScore();

        // Save to localStorage
        const itemId = document.body.getAttribute('data-item-id');
        const record = {
            id: itemId,
            score: STATE.score,
            submittedAt: new Date().toISOString(),
            timeSpent: Math.round((Date.now() - STATE.startTime) / 1000)
        };
        localStorage.setItem(`ngn_result_${itemId}`, JSON.stringify(record));

        // UI Feedback
        document.querySelector('.rationale-panel').classList.add('visible');
        document.querySelector('.btn-submit').style.display = 'none';

        // Highlighting logic
        document.querySelectorAll('.option-item, .highlight-item, .matrix-input, .cloze-select').forEach(el => {
            el.disabled = true;
            // Add visual feedback classes here...
        });

        console.log(`Submitted Case ${itemId}. Score: ${STATE.score}`);
    }

    // --- Init App ---
    window.addEventListener('DOMContentLoaded', () => {
        initTabs();
        initSelection();
        initDragAndDrop();
        initHighlight();
        initMatrix();
        initDropdowns();
        initRanking();

        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', submit);
        }
    });

})();
