const slopeAngle = 14;
const slopeAngleRad = d2Rad(slopeAngle);
const targetDistance = js_vars.distance * 100; // in cm
const slopeLength = targetDistance;
const ticker = PIXI.Ticker.shared;
let fps = js_vars.fps;
let loadingAnimation = null;


ticker.autoStart = false;
if (js_vars.abstract_task == true) {
    fps = fps * 10;
} 

const frameCorrection = fps/60;
// set null
let output_history = null;

const wheelStartPosX = 10;
const wheelStartPosY = 10;

let running = false;
let wpt, wpl, wpr, wpb;
let frame = 0;
let resultVisible = false;

let startLine;
let starttext;
let arrivaltext;
let antialias = js_vars.antialias;


let app = new PIXI.Application({
    width: 195,
    height: 130,
    // light sky blue
    //backgroundColor: 0x87cefa,
    // even lighter
    backgroundColor: 0xffffff,
    // lighter and closer to white
    //backgroundColor: 0xffffff,
    antialias: antialias,
    resolution: 3.5,
});





appdiv = document.getElementById('app');
appdiv.appendChild(app.view);

// Add resize event listener and initially call resize
// window.addEventListener('resize', resizeApp);
// resizeApp(); // Initial call to set the
if (js_vars.abstract_task == false) {
    app.stage.pivot.x = -50;
    app.stage.pivot.y = -50;
} else {
    app.stage.pivot.x = -90;
    app.stage.pivot.y = -50;
}

let initial_config;


if (js_vars.current_round == 1) {
    if (configurations.length > 0) {
    initial_config = configurations[configurations.length-1].config;
    }
    else {
        initial_config = js_vars.initial_configuration;
    }
}
else {
    initial_config = js_vars.previous_configuration;
}




let wheel = new Wheel(
    wheelStartPosX, 
    wheelStartPosY, 
    true,  // modifiable
    initial_config[0], // top
    initial_config[1], // right
    initial_config[2], // bottom
    initial_config[3], // left
    undefined, // radius will take the default value (7 in this case)
    undefined, // armlength will take the default value (40 in this case)
    undefined,  // arrows
    js_vars.abstract_task, // abstract
    js_vars.engine_params.r0 // inner radius
);


app.stage.addChild(wheel);

let platform = new Platform(wheelStartPosX, wheelStartPosY);
let finishLine = new FinishLine(wheelStartPosX, wheelStartPosY);
let startline2 = new FinishLine(wheelStartPosX-targetDistance - 1.5, wheelStartPosY);
startLine = new StartLine(wheelStartPosX + js_vars.engine_params.r0 * 50, wheelStartPosY);
starttext = new BgText(wheelStartPosX -40, wheelStartPosY+ 3, 'Starting point ↗');
starttext.zIndex = -100;



if (js_vars.abstract_task == false) {
app.stage.addChild(platform);
app.stage.addChild(finishLine);

app.stage.addChild(startline2);


app.stage.addChild(startLine);

}

if (js_vars.abstract_task == true) {

    loadingAnimation = new LoadingAnimation2();
    //loadingAnimation.createDot(0,0);
    //loadingAnimation.createDot(-10,0);
    //loadingAnimation.createDot(10,0);
    //loadingAnimation.setVisibility(false);

    // Add the custom container to the stage
    app.stage.addChild(loadingAnimation);
    loadingAnimation.visible = false;
}



if (js_vars.current_round == 1 && js_vars.abstract_task == false) {
    app.stage.addChild(starttext);

}


arrivaltext = new BgText(wheelStartPosX + 67 * js_vars.distance, wheelStartPosY + 26, '           ↗ \n Finishing \n point', width=30, height=15);

if (js_vars.current_round == 1 && js_vars.abstract_task == false) {
    app.stage.addChild(arrivaltext);
}



ticker.add((deltaMS) => {
    adjusted_frame = Math.round(frame * frameCorrection);
    
    if (running) {
        current_output = output_history[adjusted_frame];
        if (adjusted_frame < output_history.length && current_output.CoveredDistance < 1.2) {

            if (js_vars.abstract_task == false) {
                wheel.x = wheelStartPosX + current_output.xC * 1;
                wheel.y = wheelStartPosY -current_output.yC * 1;
                wheel.rotation = current_output.rotation;
            } else {
                
                // mod_adjusted_frame = ((adjusted_frame % 3) - 1);
                // console.log(mod_adjusted_frame);   
                // wheel.x = wheel.x + mod_adjusted_frame;
            }
            //console.log(wheel.rotation / (2 * Math.PI));
            end_time = Date.now();
            // time elapsed in seconds
            time_elapsed = (end_time - start_time) / 1000;

            if (current_output.CoveredDistance >= js_vars.distance) {
                if (js_vars.abstract_task == true) {
                loadingAnimation.visible = false;
                }
                ticker.stop();
                running = false;
                if (
                    resultVisible == false) {
                    showResult();
                    resultVisible = true;
                }
            //    end_time = Date.now();
                // time elapsed in seconds
            //    time_elapsed = (end_time - start_time) / 1000;
            }
            if (adjusted_frame > 650 && current_output.CoveredDistance < 0.01) {
                if (js_vars.abstract_task == true) {
                    loadingAnimation.visible = false;
                }
                ticker.stop();
                running = false;
                showResult(notmoving=true);
            }

            rotationByTour = current_output.rotation / (2 * Math.PI);
            // updateBoard(current_output.CoveredDistance, current_output.CurrentSpeed, adjusted_frame, rotationByTour, time_elapsed);
            frame++;
        }
        else {
            //running = false;
            //ticker.stop();
            
        }
        
    }    
});


// Resize function
function resizeApp() {
    // Get the dimensions of the div container (or window)
    let width = appdiv.offsetWidth; // or window.innerWidth;
    let height = appdiv.offsetHeight; // or window.innerHeight;

    // Resize the app
    app.renderer.resize(width, height);

    // Here you can also position/scale your elements based on the new size
    // E.g., you may set new positions for wheel, platform, etc.
    // wheel.x = width / 2;
    // wheel.y = height / 2;
}
