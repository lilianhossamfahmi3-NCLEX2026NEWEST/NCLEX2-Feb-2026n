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

                if (type === 'multipleChoice') {
                    options.forEach(o => {
                        o.classList.remove('selected');
                        delete STATE.userAnswers[o.getAttribute('data-id')];
                    });
                    opt.classList.add('selected');
                    STATE.userAnswers[id] = true;
                } else if (type === 'selectAll' || type === 'multipleResponse') {
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

    // --- Scoring Logic ---
    function calculateScore() {
        // This is a simplified version; real-world NGN uses complex polytomous scoring (+/-1)
        // Here we'll implement a basic match check for the demonstration.
        const itemType = document.body.getAttribute('data-item-type');
        let points = 0;

        if (itemType === 'multipleChoice') {
            const correctId = document.body.getAttribute('data-correct-id');
            if (STATE.userAnswers[correctId]) points = 1;
        } else if (itemType === 'bowtie') {
            const centerId = document.body.getAttribute('data-correct-condition');
            const actionIds = (document.body.getAttribute('data-correct-actions') || "").split(',');
            const paramIds = (document.body.getAttribute('data-correct-params') || "").split(',');

            // Check center
            const centerDrop = document.getElementById('drop-condition');
            const selectedCenter = centerDrop.querySelector('.draggable-item')?.getAttribute('data-id');
            if (selectedCenter === centerId) points += 2; // Weighting condition higher

            // Check actions
            const actionsDrop = document.getElementById('drop-actions');
            const selectedActions = Array.from(actionsDrop.querySelectorAll('.draggable-item')).map(el => el.getAttribute('data-id'));
            selectedActions.forEach(id => { if (actionIds.includes(id)) points += 1; });

            // Check params
            const paramsDrop = document.getElementById('drop-params');
            const selectedParams = Array.from(paramsDrop.querySelectorAll('.draggable-item')).map(el => el.getAttribute('data-id'));
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

        // Mark correct/incorrect options
        // ... implementation for highlighting ...

        console.log(`Submitted Case ${itemId}. Score: ${STATE.score}`);
    }

    // --- Init App ---
    window.addEventListener('DOMContentLoaded', () => {
        initTabs();
        initSelection();
        initDragAndDrop();

        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', submit);
        }
    });

})();
