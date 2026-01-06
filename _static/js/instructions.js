window.qcmClickSequence = [];

window.qcmClickSequence = [];

document.addEventListener('click', function (e) {
    const btn = e.target;
    // Capture clics sur les boutons de QCM
    if (btn && btn.classList.contains('answer-btn')) {
        const slide = btn.closest('.slide');
        let slideNum = null;
        if (slide) {
            const counter = slide.querySelector('.slide-counter');
            if (counter) {
                slideNum = counter.textContent.trim();
            }
        }
        window.qcmClickSequence.push({
            slide: slideNum,
            text: btn.textContent.trim(),
            correct: btn.dataset.correct === 'true',
            timestamp: Date.now()
        });
        // Met à jour le champ caché
        const input = document.getElementById('id_qcm_click_sequence');
        if (input) {
            input.value = JSON.stringify(window.qcmClickSequence);
        }
    }
    // Soumission finale
    if (btn && btn.id === 'start-experiment-btn') {
        e.preventDefault();
        // Met à jour le champ caché du vrai formulaire oTree avant soumission
        const input = document.getElementById('id_qcm_click_sequence');
        if (input) {
            input.value = JSON.stringify(window.qcmClickSequence);
        }
        var form = document.querySelector('form');
        var doFinalSubmit = function() {
            if (form) {
                form.submit();
            } else {
                alert('Error: Could not find the form to submit.');
            }
        };
        var msg = 'Do you confirm that you have read and understood the instructions and that you want to start the game?';
        if (window.bootbox) {
            // Patch Bootbox pour rendre le focus à la page principale après fermeture du modal
            var origHide = bootbox.dialog.prototype.hide;
            bootbox.dialog.prototype.hide = function() {
                var modal = this.$modal && this.$modal[0];
                var active = document.activeElement;
                var result = origHide.apply(this, arguments);
                // Rendre le focus à l'élément principal après fermeture
                setTimeout(function() {
                    if (modal && modal.parentNode) {
                        var main = document.getElementById('instructions-root') || document.body;
                        main.focus && main.focus();
                    }
                }, 10);
                return result;
            };
            bootbox.confirm({
                title: 'Ready to start?',
                message: msg,
                buttons: {
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-secondary'
                    },
                    confirm: {
                        label: 'Yes',
                        className: 'btn-success'
                    }
                },
                callback: function (result) {
                    if (result) doFinalSubmit();
                }
            });
        } else {
            if (confirm(msg)) {
                doFinalSubmit();
            }
        }
    }
});
// instructions.js
// This script renders the full instruction sequence as described, with all navigation, interactivity, and popups.
// It assumes Bootbox is available for modals.

document.addEventListener('DOMContentLoaded', function () {
            // Persist dropped nutrients state for slide 3
            let slide3Nutrients = [];
        // Prevent Enter key from triggering Next or submitting the page
        document.addEventListener('keydown', function(e) {
            // Block Enter key if not in a textarea or input
            if (e.key === 'Enter' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                return false;
            }
        });
    // Build slides array (9 slides)
    let slides = [
        // 1. Welcome (1/9)
        {
            render: () => `
                <div class="slide slide-1">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 700px;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">1/9</span>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 1em;">Welcome to the experiment !</div>
                        <div class="slide-intro-text" style="text-align: left; margin-top: 0;">
                            <p style="margin-top: 0;">In the upcoming slides, we will outline the experiment's rules and guide you on how to maximize your bonus reward.</p>
                            <p style="margin-top: 0;">Please read the instructions carefully. <b>Do not switch tabs, do not refresh the page and do not use the back button on your browser during the experiment as these might cause data losses.</b></p>
                        </div>
                    </div>
                </div>
            `,
            nextEnabled: true,
        },
        // 2. The task (static images) (2/9)
        {
            render: () => `
                <div class="slide slide-2">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 90vw;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">2/9</span>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 1em;">The Task</div>
                        <div style="max-width: 80vw;">
                            <p>In this task, you will take part in a virtual flower-growing experiment (see below).<br>
                                Your goal is to make each flower grow as much as possible by selecting the right combination of nutrients.</p>
                            <p>After you choose the combinations for the entire flower field, the software will show you the growth results of the flowers represented by their size and the corresponding earnings (in pennies, ex: 5p).</p>
                            <b>There is a relationship between the nutrient combinations, the growth outcomes of the flowers, and your earnings.</b>
                        </div>
                        <div class="slide-visual center" style="margin-top: 1em; text-align: center; width: 100%;">
                            <img src="/static/img/indicationFlowerfield.png" class="slide-img-centered" style="width: 320px; max-width: 98vw; display: inline-block;">
                        </div>
                    </div>
                </div>
            `,
            nextEnabled: true,
        },
        // 3. Dragging the nutrients (interactive) (3/9)
        {
            render: () => `
                <div class="slide slide-3">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 90vw;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">3/9</span>
                        <div style="display: flex; align-items: flex-start; gap: 60px;">
                            <div style="max-width: 80vw;">
                                <p>Each flower can receive <b>one or two nutrients</b>. There are three types of nutrients: blue, red, and yellow. You will drag and drop the nutrients below each flower before confirming your choice. If you use two nutrients, <b>order does not matter</b>, for example, <i>BLUE–YELLOW</i> is the same as <i>YELLOW–BLUE</i>.</p>
                                <p><b>Each flower is independent:</b> there is no interaction between the flowers, and the placement of a flower in the field does not affect its growth. The outcome for each flower depends only on the nutrients you give to that specific flower.</p>
                                <p>An interactive example is displayed on the right.</p>
                                <p>To continue, please drag and drop one blue nutrient and one red nutrient under the flower and click on [Next].</p>
                            </div>
                            <div style="flex: none; min-width: 0; max-width: 40vw;">
                                <div class="flower-demo-box" id="interactive-demo"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            nextEnabled: false, // Will be enabled by JS when task is complete
            interactive: true,
        },
        // 4. Earnings (4/9)
        {
            render: () => `
                <div class="slide slide-4">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 90vw;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">4/9</span>
                        <div style="max-width: 80vw;">
                            <p>During each of the two phases of the experiment, you will complete several rounds of the task. In every round, you may adjust the nutrient configuration. After each phase, you will complete a test round.</p>
                            <br>
                            <b>The growth of each flower will determine your monetary earnings for that round.</b>
                            <br><br>
                            <p>Your earnings from all rounds will be added to your total payoff for the entire experiment. The earnings from the test rounds will be revealed and added only at the end.</p>
                        </div>
                    </div>
                </div>
            `,
            nextEnabled: true,
        },
        // 5. Comprehension check 1 (5/9)
        {
            render: () => `
                <div class="slide slide-5">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 90vw;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">5/9</span>
                        <div class="slide-question" style="text-align: left; margin-bottom: 0.5em;">Please answer the question below to continue.</div>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.7em; text-align: center; width: 100%;">What factors determine your earnings in each round?</div>
                        <div class="answer-buttons" style="display: flex; flex-direction: column; align-items: center; gap: 1em; width: 100%; max-width: 900px; margin: 0 auto;">
                            <button type="button" class="answer-btn wide-square" style="width: 700px; max-width: 99vw; min-width: 400px;" data-correct="false">Earnings are determined randomly</button>
                            <button type="button" class="answer-btn wide-square" style="width: 700px; max-width: 99vw; min-width: 400px;" data-correct="false">How fast I choose the configurations</button>
                            <button type="button" class="answer-btn wide-square" style="width: 700px; max-width: 99vw; min-width: 400px;" data-correct="true">Flower growth based on my nutrient choices</button>
                        </div>
                        <div class="answer-feedback"></div>
                    </div>
                </div>
            `,
            nextEnabled: false,
            comprehension: true,
        },
        // 6. Collective task (6/9)
        {
            render: () => `
                <div class="slide slide-6">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 90vw;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">6/9</span>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 1em;">Learning from previous participants</div>
                        <p><b>You may be able to learn from another player who participated in the task before you by seeing a configuration they produced.</b></p>
                        <p><b>The player you may receive the configuration from is also part of a group of players, called a chain.</b> Each player had the same number of trials. If you are the first player in a chain, you will not receive a configuration produced by another participant.</p>
                        <div class="slide-visual center" style="margin-top: 1em; text-align: center; width: 100%; display: flex; justify-content: center; align-items: center; gap: 32px;">
                            <img src="/static/img/indicationChain.png" class="slide-img-centered" style="width: 220px; max-width: 40vw; display: inline-block;">
                            <img src="/static/img/indicationPreviousParticipant.png" class="slide-img-centered" style="width: 220px; max-width: 40vw; display: inline-block;">
                        </div>
                    </div>
                </div>
            `,
            nextEnabled: true,
        },

        // 7. Monetary rewards summary (7/9)
        {
            render: () => `
                <div class="slide slide-8">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 700px; text-align: left; margin-left: 0;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em; text-align: left;">7/9</span>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 1em; text-align: left;">Monetary reward summary</div>
                        <p style="margin-bottom: 1.2em;">Your final payoff will be calculated as a sum of the following scores:</p>
                        <ul style="font-size: 1.1em; margin-bottom: 1em; padding-left: 1.5em;">
                            <li style="margin-bottom: 0.7em;">The earnings from each round.</li>
                            <li>The earnings from the two tests, added at the end.</li>
                        </ul>
                    </div>
                </div>
            `,
            nextEnabled: true,
        },
        // 8. Comprehension check 2 (8/9)
        {
            render: () => `
                <div class="slide slide-9">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 90vw;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em;">8/9</span>
                        <div class="slide-question" style="text-align: left; margin-bottom: 0.5em;">Please answer the question below to continue.</div>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.7em; text-align: center; width: 100%;">How is your final payoff calculated?</div>
                        <div class="answer-buttons" style="display: flex; flex-direction: column; align-items: center; gap: 1em; width: 100%; max-width: 900px; margin: 0 auto;">
                            <button type="button" class="answer-btn wide-square" style="width: 700px; max-width: 99vw; min-width: 400px;" data-correct="false">Your final payoff is calculated by adding the earnings from each round.</button>
                            <button type="button" class="answer-btn wide-square" style="width: 700px; max-width: 99vw; min-width: 400px;" data-correct="true">Your final payoff is calculated by adding the earnings from each round, plus the earnings of the  two tests added to the total at the end.</button>
                            <button type="button" class="answer-btn wide-square" style="width: 700px; max-width: 99vw; min-width: 400px;" data-correct="false">Your final payoff is calculated by adding the earnings from each round, plus some random amount of pounds between 1 and 2.</button>
                        </div>
                        <div class="answer-feedback"></div>
                    </div>
                </div>
            `,
            nextEnabled: false,
            comprehension: true,
        },
        // 9. Final slide (9/9)
        {
            render: () => {
                return `
                <div class="slide slide-10">
                    <div class="slide-content-block" style="margin-top: 0; max-width: 700px; text-align: left; margin-left: 0;">
                        <span class="slide-counter" style="font-size: 1.5rem; font-weight: bold; display: block; margin-bottom: 0.7em; text-align: left;">9/9</span>
                        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 1em; text-align: left;">You are ready to start!</div>
                        <p style="margin-bottom: 1.2em;">You have completed the instructions. When you are ready, click the button below to start the experiment.</p>
                        <form method="post" id="otree-instructions-form" style="display:none;">
                            <input type="hidden" name="csrfmiddlewaretoken" value="${window.getCSRFToken ? window.getCSRFToken() : ''}">
                        </form>
                    </div>
                </div>
                `;
            },
            nextEnabled: false,
            isFinal: true
        }
    ];

// Helper to get CSRF token from cookie (for Django forms)
window.getCSRFToken = function() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return '';
};

    // If noise warning slide is present, start at 0 (it will be first), else as before
    let currentSlide = 0;

    function renderSlide(idx) {
        const root = document.getElementById('instructions-root');
        currentSlide = idx;
        let slideHtml = slides[idx].render();
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = slideHtml;
        let counter = tempDiv.querySelector('.slide-counter');
        let h1 = tempDiv.querySelector('h1');
        let rest = tempDiv.innerHTML;
        if (counter && h1) {
            counter.remove();
            h1.remove();
            rest = tempDiv.innerHTML;
            root.innerHTML = `
                <div class="slide-header-row">
                    <div class="slide-title">${h1.textContent}</div>
                    <div class="slide-counter">${counter.textContent}</div>
                </div>
                <div class="slide-content-block">
                    ${rest}
                </div>
            `;
        } else {
            root.innerHTML = `<div class="slide">${slideHtml}</div>`;
        }
        // Reset slide3Nutrients if not on slide 3
        if (idx !== 2) {
            slide3Nutrients = [];
        }
        renderNav(idx);
        if (slides[idx].interactive) setupInteractiveDemo();
        if (slides[idx].comprehension) setupComprehensionCheck(idx);
        // No setupFinalSlide; not needed and not defined
    }

    function renderNav(idx) {
        const root = document.getElementById('instructions-root');
        let nav = document.createElement('div');
        nav.className = 'slide-nav';
        // Previous button
        let prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.textContent = 'Previous';
        prevBtn.className = 'nav-btn prev-btn';
        if (idx === 0) prevBtn.classList.add('hide');
        prevBtn.onclick = () => {
            if (currentSlide > 0) {
                currentSlide--;
                renderSlide(currentSlide);
            }
        };
        // Only add Next button if not final slide
        if (!slides[idx].isFinal) {
            let nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.textContent = 'Next';
            nextBtn.className = 'nav-btn next-btn';
            nextBtn.onclick = () => {
                // ...
                if (slides[idx].nextEnabled !== false) {
                    if (currentSlide < slides.length - 1) {
                        currentSlide = currentSlide + 1;
                        renderSlide(currentSlide);
                    }
                }
            };
            if (slides[idx].nextEnabled === false) {
                if (slides[idx].comprehension) {
                    nextBtn.disabled = true;
                    nextBtn.style.display = 'none';
                } else {
                    nextBtn.disabled = true;
                    nextBtn.style.display = 'none';
                    let msg = document.createElement('div');
                    msg.className = 'nav-msg';
                    msg.textContent = 'You need to complete the task before continuing.';
                    nav.appendChild(msg);
                }
            }
            nav.style.justifyContent = 'flex-end';
            nav.appendChild(prevBtn);
            nav.appendChild(nextBtn);
        } else {
            // Final slide: add Start Experiment button next to Previous
            let startBtn = document.createElement('button');
            startBtn.type = 'button';
            startBtn.id = 'start-experiment-btn';
            startBtn.className = 'nav-btn start-btn';
            startBtn.textContent = 'Start Experiment';
            startBtn.style.minWidth = '120px';
            startBtn.style.fontSize = '1.2em';
            startBtn.style.marginLeft = '16px';
            nav.style.justifyContent = 'flex-end';
            nav.appendChild(prevBtn);
            nav.appendChild(startBtn);
        }
        root.appendChild(nav);
    }

    function setupInteractiveDemo() {
        // Render a single flower, a slot directly underneath, and three draggable nutrients below (like in the game)
        const demo = document.getElementById('interactive-demo');
        if (!demo) return;
        demo.innerHTML = `
            <div class="flower-container" style="margin-bottom: 0; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
                <img src="/static/img/indicationGrey.png" class="flower-image" style="width: 60px; display: block; margin-bottom: 10px;">
                <div style="height: 36px; display: flex; align-items: center; justify-content: center; width: 100%;">
                    <div class="nutrient-slot single-slot" id="demo-slot" style="width:70px;height:36px;border:2px dashed #333;border-radius:10px;margin:8px auto;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;box-sizing:border-box;"></div>
                </div>
            </div>
            <div class="demo-nutrients-row" style="display: flex; flex-direction: row; justify-content: center; align-items: flex-end; margin-top: 8px;">
                <img src="/static/img/NutrBlue.png" class="demo-nutrient" draggable="true" data-nutrient="Blue" style="width: 28px; margin: 0 8px;">
                <img src="/static/img/NutrYellow.png" class="demo-nutrient" draggable="true" data-nutrient="Yellow" style="width: 28px; margin: 0 8px;">
                <img src="/static/img/NutrRed.png" class="demo-nutrient" draggable="true" data-nutrient="Red" style="width: 28px; margin: 0 8px;">
            </div>
        `;
        let slot = document.getElementById('demo-slot');
        // Use persistent state for nutrients
        let nutrients = slide3Nutrients;
        // If re-rendered, restore dropped nutrients
        slot.innerHTML = '';
        nutrients.forEach(nutrient => {
            let img = document.createElement('img');
            img.src = `/static/img/Nutr${nutrient}.png`;
            img.className = 'dropped-nutrient-image';
            img.style.width = '24px';
            img.style.height = '24px';
            slot.appendChild(img);
        });
        slot.ondragover = (e) => { e.preventDefault(); slot.classList.add('drag-over'); };
        slot.ondragleave = (e) => { slot.classList.remove('drag-over'); };
        slot.ondrop = (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            let nutrient = e.dataTransfer.getData('nutrient');
            if (!nutrient) return;
            if (nutrients.length >= 2) {
                nutrients.shift();
                slot.removeChild(slot.firstChild);
            }
            nutrients.push(nutrient);
            // Persist state
            slide3Nutrients = [...nutrients];
            let img = document.createElement('img');
            img.src = `/static/img/Nutr${nutrient}.png`;
            img.className = 'dropped-nutrient-image';
            img.style.width = '24px';
            img.style.height = '24px';
            slot.appendChild(img);
            // Check if both Blue and Red are present
            if (nutrients.includes('Blue') && nutrients.includes('Red')) {
                slides[2].nextEnabled = true;
                const nextBtn = document.querySelector('.next-btn');
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.style.display = '';
                    // ...
                }
                let msg = document.querySelector('.nav-msg');
                if (msg) msg.style.display = 'none';
            }
        };
        document.querySelectorAll('.demo-nutrient[draggable="true"]').forEach(img => {
            img.ondragstart = (e) => {
                e.dataTransfer.setData('nutrient', img.dataset.nutrient);
            };
        });
        // Enable Next if state is already correct
        const nextBtn = document.querySelector('.next-btn');
        if (nextBtn) {
            if (nutrients.includes('Blue') && nutrients.includes('Red')) {
                nextBtn.disabled = false;
                nextBtn.style.display = '';
            } else {
                nextBtn.disabled = true;
                nextBtn.style.display = '';
            }
        }
        let msg = document.querySelector('.nav-msg');
        if (msg) msg.style.display = '';
    }

    function setupComprehensionCheck(idx) {
        const root = document.getElementById('instructions-root');
        const buttons = root.querySelectorAll('.answer-btn');
        const feedback = root.querySelector('.answer-feedback');
        const nextBtn = document.querySelector('.next-btn');
        // Always disable Next initially
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.style.display = 'none';
        }
        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
                btn.classList.add('selected');
                if (btn.dataset.correct === 'true') {
                    btn.classList.add('correct');
                    feedback.textContent = 'Your answer is correct! Press [Next] to continue.';
                    feedback.style.color = '#218739';
                    if (nextBtn) {
                        nextBtn.disabled = false;
                        nextBtn.style.display = '';
                    }
                    // Enable Next for this slide in slides array
                    if (typeof idx === 'number' && slides[idx]) {
                        slides[idx].nextEnabled = true;
                    }
                } else {
                    btn.classList.add('incorrect');
                    feedback.textContent = 'That’s not correct. Please try again.';
                    feedback.style.color = '#c0392b';
                    if (nextBtn) {
                        nextBtn.disabled = true;
                        nextBtn.style.display = 'none';
                    }
                    if (typeof idx === 'number' && slides[idx]) {
                        slides[idx].nextEnabled = false;
                    }
                }
            };
        });
    }



    // Initial render
    renderSlide(currentSlide);
});
