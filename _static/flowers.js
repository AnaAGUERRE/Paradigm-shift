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
            var showNoisePopup = function() {
                // Only show for Anomaly noisy and No Anomaly noisy
                var treatment = (window.js_vars && window.js_vars.treatment) ? window.js_vars.treatment : '';
                if (treatment === 'Anomaly noisy' || treatment === 'No Anomaly noisy') {
                    if (typeof bootbox !== 'undefined') {
                        bootbox.dialog({
                            message: `<div style='font-size:1.15em; text-align:center;'>
                                <div style='margin-bottom:1em;'><b>Note about random variation</b></div>
                                <div style='margin-bottom:1em;'>In this experiment, the data may be <b>noisy</b>. This means that for some flowers, there will be a small random variation in the score, even if you use the same nutrient combination for a given flower. This is normal and part of the experiment design.</div>                           </div>`,
                            buttons: [
                                {
                                    label: 'I understand',
                                    className: 'btn-primary',
                                    callback: function() {
                                        // Remove overlay by ID
                                        var overlays = document.querySelectorAll('#firstchain-blocking-overlay');
                                        overlays.forEach(function(overlayElem) {
                                            if (overlayElem && overlayElem.parentNode) {
                                                overlayElem.parentNode.removeChild(overlayElem);
                                            }
                                        });
                                        // Remove Bootbox modal and backdrop
                                        var modals = document.querySelectorAll('.bootbox');
                                        modals.forEach(function(modal) {
                                            if (modal && modal.parentNode) {
                                                modal.parentNode.removeChild(modal);
                                            }
                                        });
                                        var backdrops = document.querySelectorAll('.modal-backdrop');
                                        backdrops.forEach(function(backdrop) {
                                            if (backdrop && backdrop.parentNode) {
                                                backdrop.parentNode.removeChild(backdrop);
                                            }
                                        });
                                        document.body.style.overflow = '';
                                        document.documentElement.style.overflow = '';
                                        return true;
                                    }
                                }
                            ],
                            closeButton: false
                        });
                    } else {
                        alert('Note about random variation: In this version of the experiment, the data may be noisy. This means that for some flowers, there will be a small random variation in the score, even if you use the same nutrient combination. This is normal and part of the experiment design. Try to focus on the general patterns, and don\'t worry if you see small differences in the results for the same combination.');
                        var overlays = document.querySelectorAll('#firstchain-blocking-overlay');
                        overlays.forEach(function(overlayElem) {
                            if (overlayElem && overlayElem.parentNode) {
                                overlayElem.parentNode.removeChild(overlayElem);
                            }
                        });
                    }
                } else {
                    // Remove overlay if not noisy treatment
                    var overlays = document.querySelectorAll('#firstchain-blocking-overlay');
                    overlays.forEach(function(overlayElem) {
                        if (overlayElem && overlayElem.parentNode) {
                            overlayElem.parentNode.removeChild(overlayElem);
                        }
                    });
                }
            };
            var treatment = (window.js_vars && window.js_vars.treatment) ? window.js_vars.treatment : '';
            var isSecondChain = (treatment === 'Transmission correct' || treatment === 'Transmission M&M');
            var imgSrc = isSecondChain
                ? (window.static ? window.static('img/SecondChain.png') : '/static/img/SecondChain.png')
                : (window.static ? window.static('img/FirstChain.png') : '/static/img/FirstChain.png');
            var treatmentLower = treatment.toLowerCase();
            var extraImg = '';
            if (treatment === 'Transmission correct') {
                extraImg = `<img src='${window.static ? window.static('img/TransCorr.png') : '/static/img/TransCorr.png'}' style='height:220px; margin-top:1.5em;'>`;
            } else if (treatment === 'Transmission M&M') {
                extraImg = `<img src='${window.static ? window.static('img/TransMM.png') : '/static/img/TransMM.png'}' style='height:220px; margin-top:1.5em;'>`;
            }
            var popupText = isSecondChain
                ? "<span style='font-size:0.95em;'>You are assigned to be second in the chain. Here is the previous participant's transmitted nutrient combination. You will be able to see it throughout the whole experiment.</span>"
                : "<span style='font-size:0.95em;'>You are assigned to be the first in the chain.</span>";
            if (typeof bootbox !== 'undefined') {
                bootbox.dialog({
                    message: `<div style='font-size:1.15em; text-align:center;'>
                        <img src='${imgSrc}' style='height:60px; margin-bottom:1em;'>
                        <div style='margin-bottom:1em;'>${popupText}</div>
                        ${extraImg}
                    </div>`,
                    buttons: [
                        {
                            label: 'I understand',
                            className: 'btn-primary',
                            callback: function() {
                                // After first popup, show noise popup if needed
                                showNoisePopup();
                                return true;
                            }
                        }
                    ],
                    closeButton: false
                });
            } else {
                // Fallback: native alert and remove overlay on OK
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
/**
 * Flower Field Task - Drag and Drop Implementation with PNG Images
 */

// Define static function first (before FlowerGame class)
// Use window.static if it exists (from oTree), otherwise define our own
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
        this.draggedElement = null;
        
                // Flower sets for each round
                this.roundFlowerTypes = [
                    // Training phase rounds
                    ['Purple', 'Orange', 'Orange', 'Orange', 'Green', 'Purple'],
                    ['Green', 'Green', 'Purple', 'Orange', 'Purple', 'Purple'],
                    ['Orange', 'Green', 'Purple', 'Orange', 'Orange', 'Green'],
                    ['Orange', 'Purple', 'Orange', 'Purple', 'Green', 'Green'],
                    ['Purple', 'Orange', 'Green', 'Green', 'Orange', 'Purple'],
                    // Test 1 round
                    ['Green', 'Yellow', 'Purple', 'Red', 'Orange', 'Blue']
                ];
        
        // Comment: Initialization is deferred until the DOM is ready.
    }

// Initializes the game UI by creating the flower field and nutrient panel.
    init() {
        this.createFlowerField();
        this.createNutrientPanel();
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
            flowerImg.style.width = '28px';
            flowerImg.style.height = '28px';

            // Create a single nutrient slot (rectangle) under each flower
            const nutrientSlot = document.createElement('div');
            nutrientSlot.className = 'nutrient-slot single-slot';
            nutrientSlot.id = `flower-${i}-slot`;
            nutrientSlot.ondrop = (e) => this.onDrop(e);
            nutrientSlot.ondragover = (e) => this.onDragOver(e);
            nutrientSlot.ondragleave = (e) => this.onDragLeave(e);

            // Add a label if empty
            const label = document.createElement('span');
            label.className = 'slot-label';
            label.textContent = `+`;
            nutrientSlot.appendChild(label);

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
                scoreDiv: scoreDiv
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
        // Make the nutrients panel vertically smaller for all treatments
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

        // ...existing code...
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
        // Do NOT change opacity
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
            alert('Error: undetermined nutrient! Please try again.');
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

    // Updates the score display for a specific flower based on its nutrients.
    updateFlowerScore(flowerIdx, earningsPenny) {
        // If earningsPenny is a string, always show as pennies with 'p' (e.g., 8p, 10p)
        if (typeof earningsPenny === 'string') {
            this.flowers[flowerIdx].scoreDiv.textContent = `${earningsPenny}p`;
            return;
        }
        // Otherwise, calculate as before
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
        let earnings = (typeof earningsPenny === 'number') ? earningsPenny : Math.round(score * 100);
        let earningsPounds = (earnings / 100).toFixed(2);
        this.flowers[flowerIdx].scoreDiv.textContent = `£${earningsPounds}`;
    }

    // Shows the score for all flowers by updating and displaying each scoreDiv.
    // If scores argument is provided, use those values directly (already scaled)
    showAllScores(scores, earnings) {
        // After showing scores, mask nutrients and disable slots
        disableNutrientPanelAndSlots();
        for (let i = 0; i < this.flowers.length; i++) {
            if (earnings && earnings[i] !== undefined) {
                this.updateFlowerScore(i, earnings[i]);
            } else {
                this.updateFlowerScore(i);
            }
            this.flowers[i].scoreDiv.style.display = '';
        }
    }

    // Animates the size of each flower image based on its score.
    // Higher scores result in larger flower images.
    animateFlowerSizes(scores) {
        // scores: array of 6 values between 0 and 1
        const baseSize = 28; // px, initial size
        const flowerImages = document.querySelectorAll('#flower-field .flower-image');
        // Reset all flower sizes to baseSize for smooth animation
        flowerImages.forEach(img => {
            img.style.transition = 'none';
            img.style.setProperty('width', baseSize + 'px', 'important');
            img.style.setProperty('height', baseSize + 'px', 'important');
        });
        // Force reflow for animation
        void document.body.offsetWidth;
        scores.forEach((score, i) => {
            const img = flowerImages[i];
            if (img) {
                // Calculate new size: 0% score = baseSize, 100% = 2x baseSize
                const factor = 1 + Math.max(0, Math.min(1, score));
                const size = baseSize * factor;
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
    // The rules match the backend logic for consistency.
    calculateGrowth(n1, n2) {
        // Two nutrients provided
        if (n1 && n2 && n1 !== '' && n2 !== '') {
            if (n1 === 'Blue' && n2 === 'Blue') return 1.0;
            if ((n1 === 'Blue' && n2 === 'Yellow') || (n1 === 'Yellow' && n2 === 'Blue')) return 0.8;
            if ((n1 === 'Blue' && n2 === 'Red') || (n1 === 'Red' && n2 === 'Blue')) return 0.75;
            if (n1 === 'Yellow' && n2 === 'Yellow') return 0.6;
            if ((n1 === 'Yellow' && n2 === 'Red') || (n1 === 'Red' && n2 === 'Yellow')) return 0.55;
            if (n1 === 'Red' && n2 === 'Red') return 0.5;
        }
        // Only one nutrient provided
        if (n1 && (!n2 || n2 === '')) {
            if (n1 === 'Blue') return 0.5;
            if (n1 === 'Yellow') return 0.3;
            if (n1 === 'Red') return 0.25;
        }
        if (n2 && (!n1 || n1 === '')) {
            if (n2 === 'Blue') return 0.5;
            if (n2 === 'Yellow') return 0.3;
            if (n2 === 'Red') return 0.25;
        }
        // No valid nutrients, score is zero
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

// Example: currentRound is 1-based (1,2,3,4,5)
function getCurrentRoundFlowerTypes(currentRound) {
  return roundFlowerTypes[currentRound - 1];
}


