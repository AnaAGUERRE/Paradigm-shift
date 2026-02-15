// This is the main JavaScript file for the interactive Flower Field task. 
// It manages the drag-and-drop nutrient assignment, flower field rendering, 
// feedback animation, and all game logic for the participant’s main task page.


// --- First-in-chain popup logic: show on first round for all treatments ---
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (window.js_vars && window.js_vars.current_round == 1 && !window._firstChainPopupShown) {
            window._firstChainPopupShown = true;
            // Create overlay (same as Test 1/Test 2)
            var overlay = document.createElement('div');
            overlay.id = 'firstchain-blocking-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(255,255,255,0.7)';
            overlay.style.zIndex = '9998';
            document.body.appendChild(overlay);
            // Add z-index for Bootbox/modal
            var style = document.createElement('style');
            style.innerHTML = '.bootbox.modal { z-index: 10000 !important; } .modal-backdrop { z-index: 9999 !important; }';
            document.head.appendChild(style);
            // Removed noisy data popup completely
            var showNoisePopup = function() {
                // Always just remove the overlay if present
                var overlays = document.querySelectorAll('#firstchain-blocking-overlay');
                overlays.forEach(function(overlayElem) {
                    if (overlayElem && overlayElem.parentNode) {
                        overlayElem.parentNode.removeChild(overlayElem);
                    }
                });
            };
            var treatment = (window.js_vars && window.js_vars.treatment) ? window.js_vars.treatment : '';
            // For the transmission popup, treat Anomaly CT, Anomaly no CT, and No anomaly CT as second chain
            var transmTreatments = [
                'Transmission correct',
                'Transmission M&M',
                'Anomaly CT',
                'Anomaly no CT',
                'No anomaly CT'
            ];
            var isSecondChain = transmTreatments.includes(treatment);
            // Force isSecondChain true for Anomaly CT, Anomaly no CT, No anomaly CT
            if (['Anomaly CT', 'Anomaly No CT', 'No Anomaly CT'].includes(treatment)) {
                isSecondChain = true;
            }
            var imgSrc = isSecondChain
                ? (window.static ? window.static('img/Transm.png') : '/static/img/Transm.png')
                : (window.static ? window.static('img/NoTransm.png') : '/static/img/NoTransm.png');
            var extraImg = '';
            if (treatment === 'Transmission correct') {
                extraImg = `<img src='${window.static ? window.static('img/TransCorr.png') : '/static/img/TransCorr.png'}' style='height:240px; margin-top:1.0em;'>`;
            } else if (['Transmission M&M', 'Anomaly CT', 'Anomaly No CT', 'No Anomaly CT'].includes(treatment)) {
                extraImg = `<img src='${window.static ? window.static('img/TransMM.png') : '/static/img/TransMM.png'}' style='height:240px; margin-top:1.0em;'>`;
            }
            var popupText = isSecondChain
                ? `
                <br>
                <img src='${imgSrc}' style='height:60px; margin-bottom:1em;'>
                <br>
                <span style='font-size:0.85em;'>Below is how a previous participant fed the flowers. You will be able to see this information throughout the whole experiment.</span><br>
                ${extraImg ? extraImg + '<br>' : ''}
                <br>
                <label for='strategy-desc' style='font-size:0.85em; display:block; margin-bottom:0.3em;'>Please describe in a few words the strategy you think this previous participant used to feed the flowers:</label>
                <textarea id='strategy-desc' style='width:98%; min-width:180px; min-height:48px; max-width:340px; font-size:1em; border-radius:6px; border:1px solid #bbb; padding:6px; resize:vertical;'></textarea>
                <div id='strategy-warning' style='color:#a80000; font-size:0.92em; margin-top:0.2em; display:none;'>Please write something before continuing.</div>`
                : "";
            if (typeof bootbox !== 'undefined') {
                var dialog = bootbox.dialog({
                    message: `<div style='font-size:1.15em; text-align:center;'>
                        ${isSecondChain ? popupText : `<img src='${imgSrc}' style='height:60px; margin-bottom:1em;'><br><span style='font-size:0.95em;'>You will not receive information about how a previous participant fed the flowers.</span>`}
                        <div style='margin-bottom:1em;'></div>
                    </div>`,
                    buttons: [
                        {
                            label: 'I understand',
                            className: 'btn-primary',
                            callback: function() {
                                if (isSecondChain) {
                                    var val = document.getElementById('strategy-desc')?.value.trim();
                                    if (!val) {
                                        var warn = document.getElementById('strategy-warning');
                                        if (warn) warn.style.display = '';
                                        return false;
                                    }
                                    // Send popup answer to backend for export
                                    if (window.liveSend) {
                                        window.liveSend({type: 'popupStrategy', answer: val});
                                    }
                                }
                                showNoisePopup();
                                return true;
                            },
                            id: 'btn-understand',
                            disabled: isSecondChain 
                        }
                    ],
                    closeButton: false
                });
                if (isSecondChain) {
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
                }
            } else {
                alert(popupText.replace(/<[^>]+>/g, ''));
                showNoisePopup();
            }
        }
    }, 0);
});
// Disables nutrient panel and prevents further drag-and-drop after submission
function disableNutrientPanelAndSlots() {
    // Hide nutrient panel
    const panel = document.getElementById('nutrient-panel');
    if (panel) {
        panel.style.display = 'none';
    }
    // Hide transmitted panel
    const transmittedPanel = document.getElementById('transmitted-panel');
    if (transmittedPanel) {
        transmittedPanel.style.display = 'none';
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

class FlowerGame {
    constructor() {
        // Nutrient types
        this.nutrients = ['Red', 'Blue', 'Yellow'];
        
        // Flower types (6 different flowers) and their associated image files
        this.flowerTypes = [
            { name: 'Red', image: 'FlwRed.png' },
            { name: 'Blue', image: 'FlwBlue.png' },
            { name: 'Yellow', image: 'FlwYellow.png' },
            { name: 'Green', image: 'FlwGreen.png' },
            { name: 'Orange', image: 'FlwOrange.png' },
            { name: 'Purple', image: 'FlwPurple.png' }
        ];
        
        // Nutrient images
        this.nutrientImages = {
            'Red': 'NutrRed.png',
            'Blue': 'NutrBlue.png',
            'Yellow': 'NutrYellow.png'
        };
        // Initializes the array to hold flower objects 
        // and a variable for the currently dragged nutrient.
        this.flowers = [];
        this.draggedElement = null;    }

// Initializes the game UI by creating the flower field and nutrient panel.
    init() {
       this.createFlowerField();
       this.createNutrientPanel();
       // Restore nutrients in slots if round_submitted and backend data is available
       if (window.js_vars && window.js_vars.round_submitted && window.js_vars.flower_nutrients) {
          this.restoreNutrients(window.js_vars.flower_nutrients);
       }
    }
    // Restores nutrients in slots after refresh using backend data
    restoreNutrients(nutrientsData) {
        // nutrientsData: array of arrays, each subarray is nutrients for a flower (e.g. [["Red","Blue"], ["Yellow",null], ...])
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
// Prepares the flower field container and resets the flowers array.
    createFlowerField() {
        const container = document.getElementById('flower-field');
        if (!container) return;

        container.innerHTML = '';
        this.flowers = [];

// Determines the current round number, ensuring it’s within valid bounds.
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
            // 1 row of 3 flowers
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


    //Handles the start of a drag event for a nutrient.
    // Stores the dragged element and nutrient type.
    // Sets up the drag data for compatibility.
    onDragStart(e) {
        // Always get the .nutrient-item element, even if drag starts from child (like the image)
        let item = e.target;
        if (!item.classList.contains('nutrient-item')) {
            item = item.closest('.nutrient-item');
        }
        this.draggedElement = item;
        this.currentDraggedNutrient = item?.dataset.nutrient;
        // Do NOT change opacity
        e.dataTransfer.effectAllowed = 'move';
        // Set dataTransfer for robust fallback
        if (this.currentDraggedNutrient) {
            e.dataTransfer.setData('text/plain', this.currentDraggedNutrient);
            e.dataTransfer.setData('nutrient', this.currentDraggedNutrient);
        }
        console.log('onDragStart: currentDraggedNutrient =', this.currentDraggedNutrient, 'event target:', e.target, 'item:', item);
    }

// Resets drag state when dragging ends.
    onDragEnd(e) {
        // Do not change opacity
        this.draggedElement = null;
        this.currentDraggedNutrient = null;
        console.log('onDragEnd: currentDraggedNutrient reset');
    }

// Allows dropping by preventing default.
// Adds a visual highlight to the slot being hovered.
    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.target.closest('.nutrient-slot')?.classList.add('drag-over');
    }

// Removes the visual highlight when the dragged item leaves the slot.
    onDragLeave(e) {
        e.target.closest('.nutrient-slot')?.classList.remove('drag-over');
    }

// Handles dropping a nutrient into a slot.
// Only allows up to two nutrients per slot.
// Updates the UI and internal data structure.
// Triggers score update for the flower.
    onDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.nutrient-slot');
        slot?.classList.remove('drag-over');

        if (!slot) {
            console.log('onDrop: no slot found');
            this.currentDraggedNutrient = null;
            return;
        }
        // Ensures that when dropping a nutrient onto a flower slot, 
        // the code robustly determines which nutrient was dragged,
        // If it can’t figure out the nutrient, it alerts the user to try again.
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

        // Handle nutrient replacement if slot is full
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

    // Updates the score display for a specific flower based on its nutrients or backend-provided display-modified score.
    updateFlowerScore(flowerIdx, earningsPenny) {
        // If backend provides both raw and modified scores, use them
        if (window.js_vars && window.js_vars.round_submitted && window.js_vars.flower_scores && window.js_vars.flower_scores.raw && window.js_vars.flower_scores.modified) {
            let displayScore = window.js_vars.flower_scores.modified[flowerIdx];
            let rawScore = window.js_vars.flower_scores.raw[flowerIdx];
            let envFactor = window.js_vars.flower_scores.env_factor || 100;
            if (displayScore !== null && displayScore !== undefined && rawScore !== null && rawScore !== undefined) {
                // Show the modified score as label (rounded ×10)
                let shownScore = Math.round(displayScore * 10);
                this.flowers[flowerIdx].scoreDiv.textContent = `${shownScore} points`;
                // Flower size: proportional to raw score × env_factor / 10
                const scaleFactor = 5;
                const minSize = 18;
                const maxSize = 130;
                let size = rawScore * (envFactor / 10) * scaleFactor;
                if (size < minSize) size = minSize;
                if (size > maxSize) size = maxSize;
                let imgRef = this.flowers[flowerIdx].flowerImg || this.flowers[flowerIdx].element.querySelector('.flower-image');
                if (imgRef) {
                    imgRef.style.width = size + 'px';
                    imgRef.style.height = size + 'px';
                }
                return;
            }
        }
        // Otherwise, fallback to the previous logic
        let phase = (window.js_vars && window.js_vars.phase) ? window.js_vars.phase : '';
        if (typeof earningsPenny === 'string') {
            this.flowers[flowerIdx].scoreDiv.textContent = `${earningsPenny} points`;
        } else if (typeof earningsPenny === 'number') {
            this.flowers[flowerIdx].scoreDiv.textContent = `${earningsPenny} points`;
        } else {
            // fallback: calculate as before
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
        const scaleFactor = 1; // 1p = 1px, 2p = 2px, etc.
        const minSize = 18; // minimum visible size
        const maxSize = 130; // cap maximum size
        let size;
        if (sizeScore < minSize) {
            size = minSize;
        } else {
            size = sizeScore * scaleFactor;
            if (size > maxSize) size = maxSize;
        }
        // Try to get the flower image reference
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

    // Shows the score for all flowers by updating and displaying each scoreDiv.
    // If scores argument is provided, use those values directly (already scaled)
    showAllScores(scores, earnings) {
        // After showing scores, mask nutrients and disable slots
        disableNutrientPanelAndSlots();
        // If backend provides both raw and modified scores, use them
        let rawScores = (window.js_vars && window.js_vars.flower_scores && window.js_vars.flower_scores.raw) ? window.js_vars.flower_scores.raw : null;
        let modifiedScores = (window.js_vars && window.js_vars.flower_scores && window.js_vars.flower_scores.modified) ? window.js_vars.flower_scores.modified : null;
        let envFactor = (window.js_vars && window.js_vars.flower_scores && window.js_vars.flower_scores.env_factor) ? window.js_vars.flower_scores.env_factor : 100;
        for (let i = 0; i < this.flowers.length; i++) {
            let displayScore = (modifiedScores && modifiedScores[i] !== undefined) ? modifiedScores[i] : (scores && scores[i] !== undefined ? scores[i] : undefined);
            let rawScore = (rawScores && rawScores[i] !== undefined) ? rawScores[i] : undefined;
            // Show the modified score as label (rounded ×10)
            if (displayScore !== undefined && !isNaN(displayScore)) {
                let shownScore = Math.round(displayScore * 10);
                this.flowers[i].scoreDiv.textContent = `${shownScore} points`;
            } else {
                this.updateFlowerScore(i);
            }
            this.flowers[i].scoreDiv.style.display = '';
            // Flower size: use raw score × env_factor / 10, then scale
            let sizeScore = (rawScore !== undefined && !isNaN(rawScore)) ? (rawScore * envFactor / 10) : 0;
            const scaleFactor = 1;
            const minSize = 18;
            const maxSize = 130;
            let size = sizeScore * scaleFactor;
            if (size < minSize) size = minSize;
            if (size > maxSize) size = maxSize;
            let imgRef = null;
            if (this.flowers[i].flowerImg) {
                imgRef = this.flowers[i].flowerImg;
            } else if (this.flowers[i].element) {
                imgRef = this.flowers[i].element.querySelector('.flower-image');
            }
            if (imgRef) {
                imgRef.style.width = size + 'px';
                imgRef.style.height = size + 'px';
            }
        }
    }

    // Animates the size of each flower image based on its score.
    // Higher scores result in larger flower images.
    animateFlowerSizes(scores) {
        // scores: array of display-modified values (not multiplied by 10)
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
        // Force reflow for animation
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

    // Hides the score display for all flowers when reseting.
    hideAllScores() {
        for (let i = 0; i < this.flowers.length; i++) {
            this.flowers[i].scoreDiv.style.display = 'none';
        }
    }

    // Calculates the growth score for a flower based on its nutrients.
    calculateGrowth(n1, n2) {
        // Nouvelle logique : Jaune = optimal
        // Deux nutriments
        if (n1 && n2 && n1 !== '' && n2 !== '') {
            if (n1 === 'Yellow' && n2 === 'Yellow') return 1.0;
            if ((n1 === 'Yellow' && n2 === 'Blue') || (n1 === 'Blue' && n2 === 'Yellow')) return 0.8;
            if ((n1 === 'Yellow' && n2 === 'Red') || (n1 === 'Red' && n2 === 'Yellow')) return 0.8;
            if (n1 === 'Blue' && n2 === 'Blue') return 0.6;
            if ((n1 === 'Blue' && n2 === 'Red') || (n1 === 'Red' && n2 === 'Blue')) return 0.6;
            if (n1 === 'Red' && n2 === 'Red') return 0.6;
        }
        // Un seul nutriment
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
        // Aucun nutriment valide
        return 0.0;
    }

    getFlowerChoices() {
        // Always return a list of lists of strings (Red/Blue/Yellow), capitalized and validated
        const valid = ['Red', 'Blue', 'Yellow'];
        const choices = this.flowers.map(f => [
            valid.includes(f.nutrients[0]) ? f.nutrients[0] : '',
            valid.includes(f.nutrients[1]) ? f.nutrients[1] : ''
        ]);
        console.log('Submitting flower choices:', choices);
        return choices;
    }

    isComplete() {
        // Check if all flowers have at least 1 nutrient
        return this.flowers.every(f => (f.nutrients[0] !== null && f.nutrients[0] !== '') || (f.nutrients[1] !== null && f.nutrients[1] !== ''));
    }

    resetFlowerField() {
        this.createFlowerField();
        this.hideAllScores();
        // Reset flower sizes
        const minSize = 28;
        const flowerImages = document.querySelectorAll('#flower-field .flower-image');
        flowerImages.forEach(img => {
            img.style.transition = 'none';
            img.style.width = minSize + 'px';
            img.style.height = minSize + 'px';
        });
    }
}

function getCurrentRoundFlowerTypes(currentRound) {
  return roundFlowerTypes[currentRound - 1];
}


