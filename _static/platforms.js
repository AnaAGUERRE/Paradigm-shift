class Platform extends PIXI.Container {
    constructor(x,y, innerCircleRadius=1) {
        super();

        let xstart = -5*innerCircleRadius;
        let ystart = xstart * Math.tan(slopeAngleRad) + js_vars.engine_params.r0 * 170; // lots of eyeballing here
        let xend = -xstart + slopeLength * Math.cos(slopeAngleRad);
        let yend = xend * Math.tan(slopeAngleRad) + js_vars.engine_params.r0 * 170; // lots of eyeballing here

        // Create the platform background sprite with your loaded image texture
        // load image from https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3B4ODI1MjIwLWltYWdlLWt3dnhld2c5LmpwZw.jpg
        



        // const platformBackground = new PIXI.Sprite(loader_common.resources.metal_texture.texture);
        // // Adjust the size and position of the background sprite to match the platform
        // platformBackground.width = xend - xstart;
        // platformBackground.height = 100; // Set the desired height
        // platformBackground.x = xstart;
        // platformBackground.y = ystart;

        // Create the platform graphics
        const platform = new PIXI.Graphics();
        platform.beginFill(0x555555);
        platform.lineStyle(0, 0xffd900, 1);
        platform.moveTo(xstart, ystart);
        platform.lineTo(xend, yend);
        platform.lineTo(xend, yend + 3);
        platform.lineTo(xstart, ystart + 3);
        platform.closePath();
        platform.endFill();

        // Create the right leg graphics
        const rightLeg = new PIXI.Graphics();
        rightLeg.beginFill(0x555555);
        // Add right leg graphics, adjust coordinates as needed
        //rightLeg.drawRect(xend - 7, yend - 10, 10, 60); // Example values, adjust as needed
        rightLeg.endFill();

        // Add platform background, platform, and right leg as children to the container
        this.addChild(platform, rightLeg);

        // Set the container's position
        this.x = x;
        this.y = y;
    }
}


class FinishLine extends PIXI.Graphics {
    constructor(x,y) {
        super();

        let xFinishline = Math.cos(slopeAngleRad) * targetDistance;
        // dashed red line

        this.beginFill(0x000000, 0);
        this.lineStyle(1, 0x555555, 1);
        this.drawRect(xFinishline, -25, 0.0, 73);  // Position the weight at the center of the Arm
        
        this.endFill();
        this.x = x;
        this.y = y;
    }
}

class StartLine extends PIXI.Graphics {
    constructor(x,y, locked=true) {
        super();

        // draw a / shape
        this.lineStyle(1, 0x555555, 1);
        this.beginFill(0x555555);
        this.moveTo(1, 6);
        this.lineTo(2.6, -3 );
        this.closePath();
       
        this.endFill();
        this.xInit = x + 5 * js_vars.engine_params.r0 * 170;
        this.yInit = y + 2.5 ;
        this.x = x + js_vars.engine_params.r0 * 35;
        this.y = y + 2.5;
        this.visible = false; // I made it invisible because it was too much work to make it look good
        
    }
    open() {
        this.x = this.xInit + 4;
        this.y = this.yInit + 2;
        this.rotation = Math.PI/2;
        this.visible = false; // I made it invisible because it was too much work to make it look good
    }
    close() {
        this.x = this.xInit;
        this.y = this.yInit;
        this.rotation = 0;
    }
}



// container holding the textbox background and text "Start here"
class BgText extends PIXI.Container {
    constructor(x, y, text, width=36, height=8) {
        super();
        this.x = x;
        this.y = y;
        
        // this.background = new PIXI.Graphics();
        // this.background.beginFill(0xFFFFFF);
        // this.background.drawRect(0, 0, width, height);
        // this.background.endFill();
        // this.addChild(this.background);

        this.text = new PIXI.Text(text, {fontFamily : 'Arial', fontSize: 5, fill : 0x000000, align : 'center'});
        this.text.anchor.set(0, 0);
        this.text.x = 0;
        this.text.y = 0;
        this.addChild(this.text);

    }

    disappear() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.alpha -= 0.1;
            }, 100*i);
        }
    }
}
