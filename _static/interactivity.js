
// const weightPositionInputTop = document.getElementById('weightPositionTop');
// const weightPositionInputRight = document.getElementById('weightPositionRight');
// const weightPositionInputBottom = document.getElementById('weightPositionBottom');
// const weightPositionInputLeft = document.getElementById('weightPositionLeft');
// const setWeightPositionButton = document.getElementById('setWeightPosition');

const distanceSpan = document.getElementById('distance');
const frameSpan = document.getElementById('frame');
const speedSpan = document.getElementById('speed');
const timeSpan = document.getElementById('time');
const rotationSpan = document.getElementById('rotation');

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');

// weightPositionTop.onchange = setWeightPosition;
// weightPositionRight.onchange = setWeightPosition;
// weightPositionBottom.onchange = setWeightPosition;
// weightPositionLeft.onchange = setWeightPosition;

// weightPositionTop.oninput = setWeightPosition;
// weightPositionRight.oninput = setWeightPosition;
// weightPositionBottom.oninput = setWeightPosition;
// weightPositionLeft.oninput = setWeightPosition;

// startButton.onclick = startWheel;
// stopButton.onclick = stopWheel;

let wheel2;

// Function to set the position of the weights
// function setWeightPosition() {
//     running = false;

//     wpt = parseFloat(weightPositionInputTop.value);
//     wpr = parseFloat(weightPositionInputRight.value);
//     wpb = parseFloat(weightPositionInputBottom.value);
//     wpl = parseFloat(weightPositionInputLeft.value);

//     wheel.setWeightPosition(wpt, wpr, wpb, wpl);
// }

function updateInputs(top, right, bottom, left) {
    weightPositionInputTop.value = top;
    weightPositionInputRight.value = right;
    weightPositionInputBottom.value = bottom;
    weightPositionInputLeft.value = left;
}

// //setWeightPositionButton.addEventListener('click', setWeightPosition);
// startButton.addEventListener('click', startWheel);
// resetButton.addEventListener('click', resetWheel);
// stopButton.addEventListener('click', stopWheel);

function kickPlayer() {
    liveSend({type: "timeout"});
    form.submit();
}

function startWheel() {

    liveSend({type: "wheelSubmit", data: wheel.configuration});
    
    //liveSend(wheel.configuration);
    starttext.disappear();
    arrivaltext.disappear();
    
    // disable the input fields
    // weightPositionInputTop.disabled = true;
    // weightPositionInputRight.disabled = true;
    // weightPositionInputBottom.disabled = true;
    // weightPositionInputLeft.disabled = true;
    wheel.hideText();
    
    // disable the button
    document.getElementById("releaseButton").disabled = true;
    // change the text of button
    if (js_vars.abstract_task == false) {
        document.getElementById("releaseButton").innerHTML = "Wheel is rolling...";
    } else {
        document.getElementById("releaseButton").innerHTML = "Please wait...";
    }
    wheel.makeUnmodifiable();
    updateNumcheckTracker();
    $('#interface-instructions').animate({ opacity: 0 }, 1000);

    
}



let speed;
let ds;
let points;
let new_total_points;

// otree live 
function liveRecv(data) {
    if (data.ds == 1) {
        form.submit();
    }
    output_history = data.output_history;
    speed = data.speed;
    ds = data.ds;
    points = data.points;
    new_total_points = data.new_total_points;
    startLine.open();
    running = true;
    ticker.start();
    // start time
    start_time = Date.now();
    // your code goes here
    if (js_vars.abstract_task) {
        loadingAnimation.setVisibility(true);
    }
}

function stopWheel() {
    running = false;
    ticker.stop();

}

function resetWheel() {
    running = false;
    startLine.close();
    wheel.resetWheel();
    setWeightPosition();
    frame=0;

    // enable the input fields
    weightPositionInputTop.disabled = false;
    weightPositionInputRight.disabled = false;
    weightPositionInputBottom.disabled = false;
    weightPositionInputLeft.disabled = false;
    wheel.showText();
    
}


function showResult(notmoving=false) {
    wheel2 = new Wheel(
        wheelStartPosX,
        wheelStartPosY,
        false,  // modifiable
        wheel.configuration[0],  // top
        wheel.configuration[1],  // right
        wheel.configuration[2],  // bottom
        wheel.configuration[3],  // left
        undefined,  // radius (takes the default value of 7)
        undefined,  // armlength (takes the default value of 40)
        undefined,  // arrows (takes the default value, assumed to be false)
        js_vars.abstract_task  // abstract
    );
    
    
    
    resultApp.stage.addChild(wheel2);

    // click on the link CurrentRoundLink
    
    // higlight div with id="currentRound" for 2 seconds
    // document.getElementById("currentRound").style.backgroundColor = "#f2f2f2";
    // setTimeout(function() {
        //     document.getElementById("currentRound").style.backgroundColor = "white";
        // }
        // , 2000);
        
        // update speedResult span with the variable speed
        document.getElementById("speedResult").innerHTML = speed.toFixed(2);
        document.getElementById("pointsResult").innerHTML = points.toFixed(2);
        // convert new_total_points to string
        new_total_points_string = "£" + new_total_points.toFixed(2).toString();
        // animate it so the change will be visible
        $('#totalpointsResult').animate({opacity: 0}, 800, function(){
            $(this).text(new_total_points_string).animate({opacity: 1}, 800);
        });
        
        
        document.getElementById("totalpointsResult").innerHTML = new_total_points_string;
        
        resultDiv = document.getElementById('resultWheel')
        resultDiv.appendChild(resultApp.view);
        
        resultApp.stage.pivot.x = -50;
        resultApp.stage.pivot.y = -45;


        
        $('#currentRound').delay(500).show(600);

        //$('#app').delay(1050).hide(600);


    $('#releaseButton').hide();
    $("#nextRoundButton").show();

}


// button confirmation
// When the document is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the button by its id
    const releaseButton = document.getElementById('releaseButton');

    let messageText = js_vars.abstract_task ? "Are you sure you've set the configuration and want to submit it?" : "Are you sure you've put the weights in the desired places and want to release the wheel?";
    let yesText = js_vars.abstract_task ? "Yes, submit the configuration" : "Yes, release the wheel";
    let titleText = js_vars.abstract_task ? "Submit the configuration?" : "Release the wheel?";


    // Add a click event listener to the button
    releaseButton.addEventListener('click', function() {
        // Show the Bootbox confirmation dialog
        bootbox.confirm({
            title: titleText,
            message: messageText,
            buttons: {
                confirm: {
                    label: yesText,
                    className: 'btn-primary'
                },
                cancel: {
                    label: 'No, continue editing',
                    className: 'btn-dark'
                }
            },
            callback: function (result) {
                // Handle the user's choice here
                if (result) {
                    // User clicked 'Yes'
                    // Perform actions to release the wheel
                    startWheel();
                } else {
                    // User clicked 'No'
                    // Do nothing or provide further instructions
                }
            },
            // Assign an ID to the modal
            id: "release-wheel-confirmation" // You can change this ID to your desired one
        });
    });
});


// JavaScript for non-closable Bootbox with "Next trial" button
function beforeNextTrial() {
    bootbox.dialog({
        message: "Prepare for the next trial.",
        closeButton: false,
        backdrop: true,
        buttons: {
            next: {
                label: 'Next trial',
                className: 'btn-primary',
                callback: function() {
                    // Insert your specific code for the next trial here
                    // ...
                }
            }
        }
    });
}

// after the document is loaded
$(document).ready(function() {
    //$("#currentRound-tab").hide();
    $("#nextRoundButton").hide();
    $("#currentRound").hide();
});    

class LoadingAnimation extends PIXI.Container {
    constructor() {
        super();

        this.dots = [];

        for (let i = 0; i < 3; i++) {
            this.createDot(10 + i * 100, 100);
        }

        PIXI.Ticker.shared.add(() => {
            this.animateDots();
        });
    }

    createDot(x, y) {
        const dot = new PIXI.Graphics();
        dot.beginFill(0x000000); // Set fill color to black
        dot.drawCircle(0, 0, 3);
        dot.endFill();
        dot.position.set(x+10, y+10);
        this.addChild(dot);
        this.dots.push(dot);
    }

    animateDots() {
        this.dots.forEach((dot, index) => {
            const offset = index * 0.5;
            const scale = Math.abs(Math.sin(PIXI.Ticker.shared.lastTime / 200 + offset));
            dot.alpha = scale;
        });
    }

    setVisibility(visible) {
        this.visible = visible;
    }
}

class LoadingAnimation2 extends PIXI.Container {
    constructor() {
        super();

        // Create a semi-transparent background
        this.createBackground();

        this.text = this.createText("Calculating your score...");
        this.addChild(this.text);

        PIXI.Ticker.shared.add(() => {
            this.animateText();
        });
    }

    createText(text) {
        const textStyle = new PIXI.TextStyle({
            fill: 0x000000, // Set text color to black
            fontSize: 8,
        });

        const textObj = new PIXI.Text(text, textStyle);
        textObj.anchor.set(0, 0);
        textObj.position.set(-32, -3); // Adjust position as needed
        return textObj;
    }

    createBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x555555, 0.1); // Set fill color to white with 50% transparency
        background.drawRect(-37, -8, 94, 20); // Adjust the size as needed
        background.endFill();
        this.addChild(background);
    }

    animateText() {
        const scale = Math.abs(Math.sin(PIXI.Ticker.shared.lastTime / 200));
        this.text.alpha = scale;
    }

    setVisibility(visible) {
        this.visible = visible;
    }
}
