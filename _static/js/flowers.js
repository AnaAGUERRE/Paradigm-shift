/**
 * flowers.js
 * 
 * Main JavaScript logic for the interactive Flower Field task in the oTree experiment.
 * Handles:
 *  - Drag-and-drop nutrient assignment
 *  - Flower field rendering and UI updates
 *  - Feedback animation and flower growth
 *  - Game logic for all participant task pages
 *  - Special popups and overlays
 */


// --- Utility functions for overlays ---
function createOverlay(id = 'firstchain-blocking-overlay') {
    // Create a blocking overlay to prevent interaction
    var overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(255,255,255,0.7)';
    overlay.style.zIndex = '9998';
    document.body.appendChild(overlay);
    // Add z-index for Bootbox/modal dialogs
    var style = document.createElement('style');
    style.innerHTML = '.bootbox.modal { z-index: 10000 !important; } .modal-backdrop { z-index: 9999 !important; }';
    document.head.appendChild(style);
}

function removeOverlay(id = 'firstchain-blocking-overlay') {
    // Remove overlay if present
    var overlays = document.querySelectorAll('#' + id);
    overlays.forEach(function(overlayElem) {
        if (overlayElem && overlayElem.parentNode) {
            overlayElem.parentNode.removeChild(overlayElem);
        }
    });
}

// --- Popup logic: show on first round for all treatments ---
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Only show popup on the first round and only once
        if (window.js_vars && window.js_vars.current_round == 1 && !window._firstChainPopupShown) {
            window._firstChainPopupShown = true;
            createOverlay();

            // Always show the second chain popup for all treatments
            var treatment = (window.js_vars && window.js_vars.treatment) ? window.js_vars.treatment : '';
            var imgSrc = window.static ? window.static('img/Transm.png') : '/static/img/Transm.png';
            var extraImg = '';
            if (treatment === 'Transmission correct') {
                extraImg = `<img src='${window.static ? window.static('img/TransCorr.png') : '/static/img/TransCorr.png'}' style='height:240px; margin-top:1.0em;'>`;
            } else if ([
                'Transmission M&M',
                'Anomaly CT',
                'Anomaly No CT',
                'No Anomaly CT'
            ].includes(treatment)) {
                extraImg = `<img src='${window.static ? window.static('img/TransMM.png') : '/static/img/TransMM.png'}' style='height:240px; margin-top:1.0em;'>`;
            }
            // Construct the popup text content
            var popupText = `
                <br>
                <img src='${imgSrc}' style='height:60px; margin-bottom:1em;'>
                <br>
                <span style='font-size:0.85em;'>Below is how a previous participant fed the flowers. You will be able to see this information throughout the whole experiment.</span><br>
                ${extraImg ? extraImg + '<br>' : ''}
                <br>
                <label for='strategy-desc' style='font-size:0.85em; display:block; margin-bottom:0.3em;'>Please describe in a few words the strategy you think this previous participant used to feed the flowers:</label>
                <textarea id='strategy-desc' style='width:98%; min-width:180px; min-height:48px; max-width:340px; font-size:1em; border-radius:6px; border:1px solid #bbb; padding:6px; resize:vertical;'></textarea>
                <div id='strategy-warning' style='color:#a80000; font-size:0.92em; margin-top:0.2em; display:none;'>Please write something before continuing.</div>`;

            // Show the popup using Bootbox if available. The dialog:
            //   - Displays the constructed popupText
            //   - Has a single "I understand" button
            //   - Disables the button until the textarea is filled
            //   - On submit, validates input and sends it to the backend via window.liveSend
            //   - Always removes the overlay when closed
            if (typeof bootbox !== 'undefined') {
                var dialog = bootbox.dialog({
                    message: `<div style='font-size:1.15em; text-align:center;'>${popupText}<div style='margin-bottom:1em;'></div></div>`,
                    buttons: [
                        {
                            label: 'I understand',
                            className: 'btn-primary',
                            callback: function() {
                                var val = document.getElementById('strategy-desc')?.value.trim();
                                if (!val) {
                                    var warn = document.getElementById('strategy-warning');
                                    if (warn) warn.style.display = '';
                                    return false; // Prevent closing if empty
                                }
                                // Send the participant's answer to the backend for export
                                if (window.liveSend) {
                                    window.liveSend({type: 'popupStrategy', answer: val});
                                }
                                removeOverlay();
                                return true;
                            },
                            id: 'btn-understand',
                            disabled: true
                        }
                    ],
                    closeButton: false
                });
                // Disable the button until the textarea is filled
                setTimeout(function() {
                    var btn = document.querySelector('.bootbox .btn-primary#btn-understand');
                    var textarea = document.getElementById('strategy-desc');
                    var warn = document.getElementById('strategy-warning');
                    if (btn && textarea) {
                        btn.disabled = true;
                        textarea.addEventListener('input', function() {
                            if (textarea.value.trim().length > 0) {
                                btn.disabled = false;
                                if (warn) warn.style.display = 'none';
                            } else {
                                btn.disabled = true;
                            }
                        });
                    }
                }, 200);
            } else {
                // Fallback: if Bootbox is not available, show a plain alert and remove overlay
                alert(popupText.replace(/<[^>]+>/g, ''));
                removeOverlay();
            }
        }
    }, 0);
});
// Disables all nutrient interaction after the user submits their choices.
// This function is called after submission to:
//   - Hide the nutrient panel (so no more nutrients can be dragged)
//   - Remove all drag-and-drop event handlers from nutrient slots, preventing further changes
// Ensures the user cannot modify their answers after submission.
function disableNutrientPanelAndSlots() {
    // Hide nutrient panel
    const panel = document.getElementById('nutrient-panel');
    if (panel) {
        panel.style.display = 'none';
    }
    // Disable all nutrient slots
    const slots = document.querySelectorAll('.nutrient-slot');
    slots.forEach(slot => {
        slot.ondrop = null;
        slot.ondragover = null;
        slot.ondragleave = null;
    });
}

//Flower Field Task - Drag and Drop Implementation with PNG Images
if (!window.static) {
    window.static = function(path) {
        return `/static/${path}`;
    };
}


// FlowerGame class encapsulates all logic for the interactive flower field task.
// Handles UI setup, drag-and-drop, nutrient assignment, score calculation, and state restoration.
class FlowerGame {
    constructor() {
        // List of available nutrient types (used for drag-and-drop and validation)
        this.nutrients = ['Red', 'Blue', 'Yellow'];

        // List of flower types (6 different flowers) and their associated image files
        this.flowerTypes = [
            { name: 'Red', image: 'FlwRed.png' },
            { name: 'Blue', image: 'FlwBlue.png' },
            { name: 'Yellow', image: 'FlwYellow.png' },
            { name: 'Green', image: 'FlwGreen.png' },
            { name: 'Orange', image: 'FlwOrange.png' },
            { name: 'Purple', image: 'FlwPurple.png' }
        ];

        // Mapping of nutrient names to their image files
        this.nutrientImages = {
            'Red': 'NutrRed.png',
            'Blue': 'NutrBlue.png',
            'Yellow': 'NutrYellow.png'
        };

        // Array to hold flower objects for the current round
        this.flowers = [];
        // Reference to the currently dragged nutrient DOM element (for drag-and-drop)
        this.draggedElement = null;
    }

    /**
     * Initializes the game UI by creating the flower field and nutrient panel.
     * If the round has already been submitted and backend data is available, restores nutrients in slots.
     */
    init() {
        this.createFlowerField();
        this.createNutrientPanel();
        // Restore nutrients in slots if round_submitted and backend data is available
        if (window.js_vars && window.js_vars.round_submitted && window.js_vars.flower_nutrients) {
            this.restoreNutrients(window.js_vars.flower_nutrients);
        }
    }

    /**
     * Restores nutrients in slots after refresh using backend data.
     * @param {Array} nutrientsData - Array of arrays, each subarray is nutrients for a flower (e.g. [["Red","Blue"], ["Yellow",null], ...])
     */
    restoreNutrients(nutrientsData) {
        for (let i = 0; i < this.flowers.length; i++) {
            const slot = document.getElementById(`flower-${i}-slot`);
            if (!slot) continue;
            // Clear any existing nutrients in slot
            slot.innerHTML = '';
            const nutrients = nutrientsData[i] || [];
            for (let j = 0; j < nutrients.length; j++) {
                const nutrient = nutrients[j];
                if (nutrient && this.nutrientImages[nutrient]) {
                    const nutrientDisplay = document.createElement('div');
                    nutrientDisplay.className = 'dropped-nutrient';
                    const nutrientImg = document.createElement('img');
                    nutrientImg.src = window.static(`img/${this.nutrientImages[nutrient]}`);
                    nutrientImg.alt = `${nutrient} Nutrient`;
                    nutrientImg.className = 'dropped-nutrient-image';
                    nutrientDisplay.appendChild(nutrientImg);
                    slot.appendChild(nutrientDisplay);
                    // Also update internal data
                    this.flowers[i].nutrients[j] = nutrient;
                } else {
                    this.flowers[i].nutrients[j] = null;
                }
            }
        }
    }

    /**
     * Prepares the flower field container and resets the flowers array.
     * Determines the current round, flower types, and creates DOM elements for each flower.
     * Handles both 6-flower (2 rows) and 2-flower (1 row) layouts.
     */
    createFlowerField() {
        const container = document.getElementById('flower-field');
        if (!container) return;

        container.innerHTML = '';
        this.flowers = [];

        // Get current round (1-based)
        let currentRound = 1;
        if (window.js_vars && window.js_vars.current_round) {
            currentRound = parseInt(window.js_vars.current_round);
        }
        // Clamp to valid range
        if (currentRound < 1) currentRound = 1;
        if (currentRound > this.roundFlowerTypes.length) currentRound = this.roundFlowerTypes.length;

        // Get flower types for this round
        const roundTypes = this.roundFlowerTypes[currentRound - 1];
        // If window.js_vars.flower_colors is set, use it for the number and type of flowers
        let flowerColors = roundTypes;
        if (window.js_vars && window.js_vars.flower_colors) {
            flowerColors = window.js_vars.flower_colors;
        }

        // For each flower, create a container and assign its type and ID.
        for (let i = 0; i < flowerColors.length; i++) {
            // Find flowerType object by name
            const flowerName = flowerColors[i];
            const flowerType = this.flowerTypes.find(ft => ft.name === flowerName);
            const flower = document.createElement('div');
            flower.className = 'flower-container';
            flower.id = `flower-${i}`;

            // Flower image
            const flowerImg = document.createElement('img');
            flowerImg.src = window.static(`img/${flowerType.image}`);
            flowerImg.alt = `${flowerType.name} Flower`;
            flowerImg.className = 'flower-image';
            // Set initial size, will be updated after score is calculated
            flowerImg.style.width = '28px';
            flowerImg.style.height = '28px';
            // Store reference for later size update
            flower.flowerImg = flowerImg;
            // Also store on the flower object in this.flowers array after push (see below)

            // Create a single nutrient slot (rectangle) under each flower
            const nutrientSlot = document.createElement('div');
            nutrientSlot.className = 'nutrient-slot single-slot';
            nutrientSlot.id = `flower-${i}-slot`;
            nutrientSlot.ondrop = (e) => this.onDrop(e);
            nutrientSlot.ondragover = (e) => this.onDragOver(e);
            nutrientSlot.ondragleave = (e) => this.onDragLeave(e);

            flower.appendChild(flowerImg);
            flower.appendChild(nutrientSlot);

            // Score display (hidden by default).
            // Adds a score display for each flower,
            // appends the flower to the container,
            // and stores its data in the flowers array.
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'flower-score';
            scoreDiv.id = `flower-score-${i}`;
            scoreDiv.textContent = '';
            scoreDiv.style.display = 'none';
            flower.appendChild(scoreDiv);

            this.flowers.push({
                id: i,
                type: flowerType.name,
                element: flower,
                nutrients: [null, null], // still keep two slots in data
                scoreDiv: scoreDiv,
                flowerImg: flowerImg
            });
        }
        // Clear container and add flowers in correct layout
        container.innerHTML = '';
        if (flowerColors.length === 6) {
            // 2 rows of 3 flowers
            const row1 = document.createElement('div');
            row1.style.display = 'flex';
            row1.style.justifyContent = 'center';
            row1.style.width = '100%';
            for (let i = 0; i < 3; i++) {
                row1.appendChild(this.flowers[i].element);
            }
            const row2 = document.createElement('div');
            row2.style.display = 'flex';
            row2.style.justifyContent = 'center';
            row2.style.width = '100%';
            for (let i = 3; i < 6; i++) {
                row2.appendChild(this.flowers[i].element);
            }
            container.appendChild(row1);
            container.appendChild(row2);
        } else {
            // 1 row of 2 flowers
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'center';
            row.style.width = '100%';
            for (let i = 0; i < flowerColors.length; i++) {
                row.appendChild(this.flowers[i].element);
            }
            container.appendChild(row);
        }
        console.log('createFlowerField: created', this.flowers.length, 'flowers for round', currentRound, flowerColors);
    }


    // Creates the nutrient panel on the right.
    // Adds three draggable nutrient items (Red, Blue, Yellow) with images.
    // Each nutrient is set up for drag-and-drop.
    createNutrientPanel() {
        const panel = document.getElementById('nutrient-panel');
        console.log('createNutrientPanel: panel element:', panel);
        if (!panel) {
            console.warn('createNutrientPanel: #nutrient-panel not found in DOM');
            return;
        }

        panel.innerHTML = '<h5>Nutrients</h5>';
        panel.style.minHeight = '90px';

        const nutrientContainer = document.createElement('div');
        nutrientContainer.className = 'nutrient-container';

        // Only 3 draggable nutrient items (one per type, infinite supply)
        this.nutrients.forEach(nutrient => {
            const nutrientItem = document.createElement('div');
            nutrientItem.className = 'nutrient-item';
            nutrientItem.draggable = true;
            nutrientItem.dataset.nutrient = nutrient;
            nutrientItem.dataset.id = `${nutrient}-infinite`;

            // Create image element for nutrient
            const nutrientImg = document.createElement('img');
            nutrientImg.src = window.static(`img/${this.nutrientImages[nutrient]}`);
            nutrientImg.alt = `${nutrient} Nutrient`;
            nutrientImg.className = 'nutrient-image';

            // Make the image itself draggable and set the same data
            nutrientImg.draggable = true;
            nutrientImg.dataset.nutrient = nutrient;
            nutrientImg.addEventListener('dragstart', (e) => this.onDragStart(e));
            nutrientImg.addEventListener('dragend', (e) => this.onDragEnd(e));

            nutrientItem.appendChild(nutrientImg);

            nutrientItem.ondragstart = (e) => this.onDragStart(e);
            nutrientItem.ondragend = (e) => this.onDragEnd(e);

            nutrientContainer.appendChild(nutrientItem);
        });

        panel.appendChild(nutrientContainer);

    }



    /**
     * Handles the start of a drag event for a nutrient.
     * Stores the dragged element and nutrient type, and sets up drag data for compatibility.
     * @param {DragEvent} e
     */
    onDragStart(e) {
        // Always get the .nutrient-item element, even if drag starts from child (like the image)
        let item = e.target;
        if (!item.classList.contains('nutrient-item')) {
            item = item.closest('.nutrient-item');
        }
        this.draggedElement = item;
        this.currentDraggedNutrient = item?.dataset.nutrient;
        e.dataTransfer.effectAllowed = 'move';
        // Set dataTransfer for robust fallback
        if (this.currentDraggedNutrient) {
            e.dataTransfer.setData('text/plain', this.currentDraggedNutrient);
            e.dataTransfer.setData('nutrient', this.currentDraggedNutrient);
        }
        console.log('onDragStart: currentDraggedNutrient =', this.currentDraggedNutrient, 'event target:', e.target, 'item:', item);
    }

    /**
     * Resets drag state when dragging ends.
     * @param {DragEvent} e
     */
    onDragEnd(e) {
        // Do not change opacity
        this.draggedElement = null;
        this.currentDraggedNutrient = null;
        console.log('onDragEnd: currentDraggedNutrient reset');
    }

    /**
     * Allows dropping by preventing default and adds a visual highlight to the slot being hovered.
     * @param {DragEvent} e
     */
    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.target.closest('.nutrient-slot')?.classList.add('drag-over');
    }

    /**
     * Removes the visual highlight when the dragged item leaves the slot.
     * @param {DragEvent} e
     */
    onDragLeave(e) {
        e.target.closest('.nutrient-slot')?.classList.remove('drag-over');
    }

    /**
     * Handles dropping a nutrient into a slot.
     * Only allows up to two nutrients per slot. Updates the UI and internal data structure.
     * Triggers score update for the flower.
     * @param {DragEvent} e
     */
    onDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.nutrient-slot');
        slot?.classList.remove('drag-over');

        if (!slot) {
            console.log('onDrop: no slot found');
            this.currentDraggedNutrient = null;
            return;
        }
        // Robustly determine which nutrient was dragged
        let nutrient = this.currentDraggedNutrient;
        if (!nutrient && e.dataTransfer) {
            nutrient = e.dataTransfer.getData('nutrient') || e.dataTransfer.getData('text/plain');
        }
        if (!nutrient && this.draggedElement && this.draggedElement.dataset) {
            nutrient = this.draggedElement.dataset.nutrient;
        }
        this.currentDraggedNutrient = null;
        console.log('onDrop: nutrient =', nutrient, 'event:', e, 'draggedElement:', this.draggedElement);
        if (!nutrient || !this.nutrientImages[nutrient]) {
            return;
        }
        // Get flower index from slot id
        const slotId = slot.id;
        const [flowerPrefix, flowerId] = slotId.split('-');
        const flowerIdx = parseInt(flowerId);

        // Remove label if now filled
        const label = slot.querySelector('.slot-label');

        // Handle nutrient replacement if slot is full (max 2 nutrients)
        let existingNutrients = slot.querySelectorAll('.dropped-nutrient');
        if (existingNutrients.length >= 2) {
            // Remove the first nutrient visually
            if (existingNutrients[0]) existingNutrients[0].remove();
            // Shift the second nutrient to the first position in data
            const nutrientsArr = this.flowers[flowerIdx].nutrients;
            nutrientsArr[0] = nutrientsArr[1];
            nutrientsArr[1] = null;
            // Update the NodeList after removal
            existingNutrients = slot.querySelectorAll('.dropped-nutrient');
        }

        // Add nutrient display to slot
        const nutrientDisplay = document.createElement('div');
        nutrientDisplay.className = 'dropped-nutrient';
        const nutrientImg = document.createElement('img');
        nutrientImg.src = window.static(`img/${this.nutrientImages[nutrient]}`);
        nutrientImg.alt = `${nutrient} Nutrient`;
        nutrientImg.className = 'dropped-nutrient-image';
        nutrientDisplay.appendChild(nutrientImg);

        if (label && existingNutrients.length === 0) label.remove();
        slot.appendChild(nutrientDisplay);

        // Update flower data: fill first empty slot
        const nutrientsArr = this.flowers[flowerIdx].nutrients;
        const emptyIdx = nutrientsArr.findIndex(n => n === null);
        if (emptyIdx !== -1) {
            nutrientsArr[emptyIdx] = nutrient;
        }

        // Update score display for this flower
        this.updateFlowerScore(flowerIdx);
    }

    /**
     * Updates the score display and flower image size for a specific flower.
     * - If backend provides both raw and modified scores (after submission), use those for display and sizing.
     * - Otherwise, calculate the score based on the assigned nutrients using calculateGrowth.
     * - Flower size is proportional to the score, with min/max bounds.
     * @param {number} flowerIdx - Index of the flower to update
     * @param {number|string} [earningsPenny] - Optional override for score display
     */
    updateFlowerScore(flowerIdx, earningsPenny) {
        // Use backend-provided scores if available (after submission)
        if (window.js_vars && window.js_vars.round_submitted && window.js_vars.flower_scores && window.js_vars.flower_scores.raw && window.js_vars.flower_scores.modified) {
            let displayScore = window.js_vars.flower_scores.modified[flowerIdx];
            let rawScore = window.js_vars.flower_scores.raw[flowerIdx];
            if (displayScore !== null && displayScore !== undefined && rawScore !== null && rawScore !== undefined) {
                // Show the modified score as label (rounded ×10 for display)
                let shownScore = Math.round(displayScore * 10);
                this.flowers[flowerIdx].scoreDiv.textContent = `${shownScore} points`;
                // Flower size is handled elsewhere (animation or test phase logic)
                return;
            }
        }
        // Otherwise, fallback to local calculation
        let phase = (window.js_vars && window.js_vars.phase) ? window.js_vars.phase : '';
        if (typeof earningsPenny === 'string' || typeof earningsPenny === 'number') {
            // If a score override is provided, use it
            this.flowers[flowerIdx].scoreDiv.textContent = `${earningsPenny} points`;
        } else {
            // Otherwise, calculate score from nutrients
            const nutrients = this.flowers[flowerIdx].nutrients;
            let score = 0;
            if (nutrients[0] && nutrients[1]) {
                score = this.calculateGrowth(nutrients[0], nutrients[1]);
            } else if (nutrients[0] || nutrients[1]) {
                const n = nutrients[0] || nutrients[1];
                score = this.calculateGrowth(n, '');
            } else {
                score = 0;
            }
            let earnings = Math.round(score * 100);
            this.flowers[flowerIdx].scoreDiv.textContent = `${earnings} points`;
        }
        // Use the displayed value for size, but in test phases, use undoubled score for size
        let scoreText = this.flowers[flowerIdx].scoreDiv.textContent;
        let scoreVal = 0;
        if (typeof scoreText === 'string' && scoreText.endsWith('points')) {
            scoreVal = parseFloat(scoreText.replace(' points', '')) || 0;
        }
        // In test phases, if score is doubled for display, use half for size
        let sizeScore = scoreVal;
        if (phase === 'Test 1' || phase === 'Test 2') {
            sizeScore = scoreVal / 2;
        }
        // Only apply size in test phases
        if (phase === 'Test 1' || phase === 'Test 2') {
            const scaleFactor = 1;
            const minSize = 18;
            const maxSize = 130;
            let size;
            if (sizeScore < minSize) {
                size = minSize;
            } else {
                size = sizeScore * scaleFactor;
                if (size > maxSize) size = maxSize;
            }
            let imgRef = null;
            if (this.flowers[flowerIdx].flowerImg) {
                imgRef = this.flowers[flowerIdx].flowerImg;
            } else if (this.flowers[flowerIdx].element) {
                imgRef = this.flowers[flowerIdx].element.querySelector('.flower-image');
            }
            if (imgRef) {
                imgRef.style.width = size + 'px';
                imgRef.style.height = size + 'px';
            }
        }
    }

    /**
     * Shows the score for all flowers by updating and displaying each scoreDiv.
     * - If backend-provided scores are available, use them for display and sizing.
     * - Otherwise, falls back to local calculation.
     * - Disables further interaction after showing scores.
     * @param {Array} [scores] - Optional array of scores to display (already scaled)
     * @param {Array} [earnings] - Optional array of earnings (unused)
     */
    showAllScores(scores, earnings) {
        // After showing scores, mask nutrients and disable slots
        disableNutrientPanelAndSlots();
        let rawScores = (window.js_vars && window.js_vars.flower_scores && window.js_vars.flower_scores.raw) ? window.js_vars.flower_scores.raw : null;
        let modifiedScores = (window.js_vars && window.js_vars.flower_scores && window.js_vars.flower_scores.modified) ? window.js_vars.flower_scores.modified : null;
        for (let i = 0; i < this.flowers.length; i++) {
            let displayScore = (modifiedScores && modifiedScores[i] !== undefined) ? modifiedScores[i] : (scores && scores[i] !== undefined ? scores[i] : undefined);
            if (displayScore !== undefined && !isNaN(displayScore)) {
                let shownScore = Math.round(displayScore * 10);
                this.flowers[i].scoreDiv.textContent = `${shownScore} points`;
            } else {
                this.updateFlowerScore(i);
            }
            this.flowers[i].scoreDiv.style.display = '';
        }
    }

    /**
     * Animates the size of each flower image based on its score.
     * - Used for feedback animation after score reveal.
     * - Higher scores result in larger flower images.
     * @param {Array} scores - Array of display-modified values (not multiplied by 10)
     */
    animateFlowerSizes(scores) {
        const baseSize = 18;
        const scaleFactor = 6;
        const minSize = 18;
        const maxSize = 130;
        const flowerImages = document.querySelectorAll('#flower-field .flower-image');
        // Reset all flower sizes to minSize for smooth animation
        flowerImages.forEach(img => {
            img.style.transition = 'none';
            img.style.setProperty('width', minSize + 'px', 'important');
            img.style.setProperty('height', minSize + 'px', 'important');
        });
        // Force reflow for animation (ensures transition is applied)
        void document.body.offsetWidth;
        scores.forEach((score, i) => {
            const img = flowerImages[i];
            if (img) {
                let size = baseSize + score * scaleFactor;
                if (size < minSize) size = minSize;
                if (size > maxSize) size = maxSize;
                console.log(`Animating flower #${i}: score=${score}, size=${size}`);
                img.style.transition = 'width 0.7s, height 0.7s';
                requestAnimationFrame(() => {
                    img.style.setProperty('width', size + 'px', 'important');
                    img.style.setProperty('height', size + 'px', 'important');
                });
            } else {
                console.log(`No image found for flower #${i}`);
            }
        });
    }

    /**
     * Hides the score display for all flowers (used when resetting the field).
     */
    hideAllScores() {
        for (let i = 0; i < this.flowers.length; i++) {
            this.flowers[i].scoreDiv.style.display = 'none';
        }
    }

    /**
     * Calculates the growth score for a flower based on its two nutrients.
     * - Yellow is optimal; combinations with Yellow are better than Blue/Red only.
     * - Returns a value between 0.0 and 1.0.
     * @param {string} n1 - First nutrient
     * @param {string} n2 - Second nutrient
     * @returns {number} Growth score (0.0 to 1.0)
     */
    calculateGrowth(n1, n2) {
        // Two nutrients assigned
        if (n1 && n2 && n1 !== '' && n2 !== '') {
            if (n1 === 'Yellow' && n2 === 'Yellow') return 1.0;
            if ((n1 === 'Yellow' && n2 === 'Blue') || (n1 === 'Blue' && n2 === 'Yellow')) return 0.8;
            if ((n1 === 'Yellow' && n2 === 'Red') || (n1 === 'Red' && n2 === 'Yellow')) return 0.8;
            if (n1 === 'Blue' && n2 === 'Blue') return 0.6;
            if ((n1 === 'Blue' && n2 === 'Red') || (n1 === 'Red' && n2 === 'Blue')) return 0.6;
            if (n1 === 'Red' && n2 === 'Red') return 0.6;
        }
        // Only one nutrient assigned
        if (n1 && (!n2 || n2 === '')) {
            if (n1 === 'Yellow') return 0.5;
            if (n1 === 'Blue') return 0.3;
            if (n1 === 'Red') return 0.3;
        }
        if (n2 && (!n1 || n1 === '')) {
            if (n2 === 'Yellow') return 0.5;
            if (n2 === 'Blue') return 0.3;
            if (n2 === 'Red') return 0.3;
        }
        // No valid nutrients assigned (not possible but here for completeness)
        return 0.0;
    }

    /**
     * Returns the current nutrient choices for all flowers.
     * - Always returns a list of lists of strings (Red/Blue/Yellow), capitalized and validated.
     * - Used for submission to backend.
     * @returns {Array<Array<string>>} Array of nutrient choices for each flower
     */
    getFlowerChoices() {
        const valid = ['Red', 'Blue', 'Yellow'];
        const choices = this.flowers.map(f => [
            valid.includes(f.nutrients[0]) ? f.nutrients[0] : '',
            valid.includes(f.nutrients[1]) ? f.nutrients[1] : ''
        ]);
        console.log('Submitting flower choices:', choices);
        return choices;
    }

    /**
     * Checks if all flowers have at least one nutrient assigned.
     * - Used to validate before allowing submission.
     * @returns {boolean} True if all flowers have at least one nutrient
     */
    isComplete() {
        return this.flowers.every(f => (f.nutrients[0] !== null && f.nutrients[0] !== '') || (f.nutrients[1] !== null && f.nutrients[1] !== ''));
    }

    /**
     * Resets the flower field UI and internal state.
     * - Recreates the flower field and hides all scores.
     * - Resets all flower image sizes to minimum.
     */
    resetFlowerField() {
        this.createFlowerField();
        this.hideAllScores();
        // Reset flower sizes to minimum
        const minSize = 28;
        const flowerImages = document.querySelectorAll('#flower-field .flower-image');
        flowerImages.forEach(img => {
            img.style.transition = 'none';
            img.style.width = minSize + 'px';
            img.style.height = minSize + 'px';
        });
    }
}

/**
 * Returns the flower types for the given round number.
 * - Used to map the current round to the correct set of flower types.
 * - Assumes roundFlowerTypes is a global array defined elsewhere.
 * @param {number} currentRound - 1-based round number
 * @returns {Array<string>} Array of flower type names for the round
 */
function getCurrentRoundFlowerTypes(currentRound) {
    return roundFlowerTypes[currentRound - 1];
}
