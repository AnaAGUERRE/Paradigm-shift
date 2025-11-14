class Wheel extends PIXI.Container {
    constructor(x, y, modifiable, top, right, bottom, left, radius=7, armlength=40, arrows=false, abstract=false) {
        super();
        this.xInit = x;
        this.yInit = y;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.innerRadius = (radius/7) * js_vars.engine_params.r0/0.0065;
        this.armlength = armlength;
        this.fontsize = this.radius;
        this.modifiable = modifiable;
        
        this.configuration = [top, right, bottom, left];

        this.textTop = new PIXI.Text(top, {fontFamily : 'Arial', fontSize: this.fontsize, fill : 0x000000, align : 'center'});
        this.textTop.anchor.set(0.5);
        this.textTop.x = 0;
        this.textTop.y = -1.6* this.radius - this.armlength ;
        this.addChild(this.textTop);

        // if (modifiable) { # we disable editable text for now
        if (false) {

        this.textTop.visible = false;
        } else {
            this.textTop.visible = true;
        }


        this.textRight = new PIXI.Text(right, {fontFamily : 'Arial', fontSize: this.fontsize, fill : 0x000000, align : 'center'});
        this.textRight.anchor.set(0.5);
        this.textRight.x = 1.6*this.radius + this.armlength;
        this.textRight.y = 0;
        this.addChild(this.textRight);

        this.textBottom = new PIXI.Text(bottom, {fontFamily : 'Arial', fontSize: this.fontsize, fill : 0x000000, align : 'center'});
        this.textBottom.anchor.set(0.5);
        this.textBottom.x = 0;
        this.textBottom.y = 1.6 * this.radius + this.armlength;
        this.addChild(this.textBottom);
        
        this.textLeft = new PIXI.Text(left, {fontFamily : 'Arial', fontSize: this.fontsize, fill : 0x000000, align : 'center'});
        this.textLeft.anchor.set(0.5);
        this.textLeft.x = -1.6*this.radius - this.armlength;
        this.textLeft.y = 0;
        this.addChild(this.textLeft);

        this.inputTop = new PIXI.TextInput({
            input: {
                fontSize: '6px',
                padding: '1.3px',
                width: '9px',
                color: '#26272E',
                textAlign: 'center',
            },
            box: {
                default: {rounded: 8, stroke: {color: 0xCBCEE0, width: 1}},
                focused: { rounded: 8, stroke: {color: 0xFD7D01, width: 1}},
                disabled: {fill: 0xDBDBDB, rounded: 12}
            }
        })

        this.inputTop.x = 0
        this.inputTop.y = 0
        this.inputTop.pivot.x = this.inputTop.width/2
        this.inputTop.pivot.y = this.inputTop.height/2
        this.inputTop.text = '12'
        this.inputTop.x = 0;
        this.inputTop.y =  - 1.7*this.radius - this.armlength;
        this.addChild(this.inputTop)

        // if (modifiable) {
        if (false) {
            this.inputTop.visible = true;
            } else {
                this.inputTop.visible = false;
            }



        this.circleGraphics = new PIXI.Graphics();
        this.innerCircleGraphics = new PIXI.Graphics();

        // Draw the circle
        this.circleGraphics.beginFill(0x66A7DC);
        this.circleGraphics.drawCircle(0, 0, radius);
        this.circleGraphics.endFill();
        
        // if not abstract, draw the circle
        if (!abstract) {
            this.addChild(this.circleGraphics);
        }

        // Draw the inner circle
        this.innerCircleGraphics.beginFill(0xF8EFB2);
        this.innerCircleGraphics.drawCircle(0, 0,this.innerRadius);
        this.innerCircleGraphics.endFill();

        // if not abstract, draw the inner circle
        if (!abstract) {
        this.addChild(this.innerCircleGraphics);
        }

        // add four dots on the inner circle
        this.dotTop = new PIXI.Graphics();
        this.dotTop.beginFill(0x000000);
        this.dotTop.drawCircle(0, 0, this.innerRadius/5);
        this.dotTop.endFill();
        this.dotTop.x = 0;
        this.dotTop.y = -this.innerRadius/2;

        if (!abstract) {
        this.addChild(this.dotTop);
        }

        this.dotRight = new PIXI.Graphics();
        this.dotRight.beginFill(0x000000);
        this.dotRight.drawCircle(0, 0, this.innerRadius/5);
        this.dotRight.endFill();
        this.dotRight.x = this.innerRadius/2;
        this.dotRight.y = 0;

        if (!abstract) {
            this.addChild(this.dotRight);
        }
        this.dotBottom = new PIXI.Graphics();
        this.dotBottom.beginFill(0x000000);
        this.dotBottom.drawCircle(0, 0, this.innerRadius/5);
        this.dotBottom.endFill();
        this.dotBottom.x = 0;
        this.dotBottom.y = this.innerRadius/2;

        if (!abstract) {
            this.addChild(this.dotBottom);
        }

        this.dotLeft = new PIXI.Graphics();
        this.dotLeft.beginFill(0x000000);
        this.dotLeft.drawCircle(0, 0, this.innerRadius/5);
        this.dotLeft.endFill();
        this.dotLeft.x = -this.innerRadius/2;
        this.dotLeft.y = 0;

        if (!abstract) {
            this.addChild(this.dotLeft);
        }



        if (arrows) {

        // image of arrow.png
        this.arrowtopright = PIXI.Sprite.from('/static/img/arrowtopright.png');
        this.arrowtopright.anchor.set(0.5);
        this.arrowtopright.x = 30;
        this.arrowtopright.y = -30;
        this.arrowtopright.width = 3*this.radius;
        this.arrowtopright.height = 3*this.radius;
        this.addChild(this.arrowtopright);
        
        // image of arrow.png
        this.arrowbottomleft = PIXI.Sprite.from('/static/img/arrowbottomleft.png');
        this.arrowbottomleft.anchor.set(0.5);
        this.arrowbottomleft.x = -30;
        this.arrowbottomleft.y = 30;
        this.arrowbottomleft.width = 3*this.radius;
        this.arrowbottomleft.height = 3*this.radius;
        this.addChild(this.arrowbottomleft);
        }




        this.armTop = new Arm(this, 'top');
        this.addChild(this.armTop);
        
        

        this.armLeft = new Arm(this, 'left');
        this.addChild(this.armLeft);



        this.armRight = new Arm(this, 'right');
        this.addChild(this.armRight);

        this.armBottom = new Arm(this, 'bottom');
        this.addChild(this.armBottom);

        this.weightTop = new Weight(this.armTop, top, this.modifiable);
        this.weightLeft = new Weight(this.armLeft, left, this.modifiable);
        this.weightRight = new Weight(this.armRight, right, this.modifiable);
        this.weightBottom = new Weight(this.armBottom, bottom, this.modifiable);

        this.setWeightPosition(top, right, bottom, left);


        
        //this.input.placeholder = 'Enter your Text...'


        this.inputTop.on('input', () => {
            //on input

        });
    
    
    }

    makeUnmodifiable() {
        this.modifiable = false;
        this.weightBottom.makeUnmodifiable();
        this.weightLeft.makeUnmodifiable();
        this.weightRight.makeUnmodifiable();
        this.weightTop.makeUnmodifiable();
        
    }


    rotate(delta) {
        this.rotation += delta; // Rotate the entire container
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    resetPosition() {
        this.x = this.xInit;
        this.y = this.yInit;
    }

    resetRotation() {
        this.rotation = 0;
    }

    resetWheel () {
        this.resetPosition();
        this.resetRotation();
        this.setWeightPosition(1, 1, 1, 1);
    }

    setWeightPosition(top, right, bottom, left) {
        this.weightTop.setPosition(top);
        this.weightRight.setPosition(right);
        this.weightBottom.setPosition(bottom);
        this.weightLeft.setPosition(left);
        this.configuration = [top, right, bottom, left];     

        // // update the text
        this.updateText();
    }

    getWeightConfigurations() {
        return [this.weightTop.configuration, this.weightRight.configuration, this.weightBottom.configuration, this.weightLeft.configuration];
    }

    setWeightPositionFromWeightLocation() {
        let wc =  this.getWeightConfigurations();
        this.setWeightPosition(wc[0], wc[1], wc[2], wc[3]);
    }

    updateText() {
        this.textTop.text = this.configuration[0];
        this.textRight.text = this.configuration[1];
        this.textBottom.text = this.configuration[2];
        this.textLeft.text = this.configuration[3];

        this.inputTop.text = String(this.configuration[0]); 
    }


    // setWeightPositionFromWeightLocation() {
    //     this.setWeightPosition(this.weightTop.weightLocation, this.weightRight.weightLocation, this.weightBottom.weightLocation, this.weightLeft.weightLocation);
    //     updateInputs(this.weightTop.weightLocation, this.weightRight.weightLocation, this.weightBottom.weightLocation, this.weightLeft.weightLocation);
    // }

    // getWeightPosition() {
    //     return {
    //         top: this.weightTop.weightLocation,
    //         right: this.weightRight.weightLocation,
    //         bottom: this.weightBottom.weightLocation,
    //         left: this.weightLeft.weightLocation
    //     };
    // }

    hideText() {
        this.textTop.visible = false;
        this.textRight.visible = false;
        this.textBottom.visible = false;
        this.textLeft.visible = false;
        this.inputTop.visible = false;
    }

    showText() {
        this.textTop.visible = true;
        this.textRight.visible = true;
        this.textBottom.visible = true;
        this.textLeft.visible = true;
    }

    updateTextExp(top, right, bottom, left) {
        this.textTop.text = top;
        this.textRight.text = right;
        this.textBottom.text = bottom;
        this.textLeft.text = left;
    }

    hideWeights() {
        this.weightTop.visible = false;
        this.weightRight.visible = false;
        this.weightBottom.visible = false;
        this.weightLeft.visible = false;
    }

    hideText() {
        this.textTop.visible = false;
        this.textRight.visible = false;
        this.textBottom.visible = false;
        this.textLeft.visible = false;
    }

    hideStuff() {
        this.hideWeights();
        this.hideText();
    }

    

}
