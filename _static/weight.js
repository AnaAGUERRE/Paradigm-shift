class Weight extends PIXI.Graphics {
    constructor(arm, configuration, modifiable) {
        super();

        this.weightWidth = arm.thickness;
        this.weightHeight = arm.thickness * 2;

        const weightWidth = this.weightWidth;
        const weightHeight = this.weightHeight;

        this.configuration = configuration; 
        
        this.arm = arm;

        this.actualPosition = this.configToPosition(configuration);

        this.beginFill(0x000000); // Chnage color of weights
        this.rect = null;

        if (arm.place === 'bottom') {
            this.rect = this.drawRect(0, 0, this.weightHeight, this.weightWidth);
            this.pivot.x = this.weightHeight / 2;
            this.pivot.y = this.weightWidth / 2;
        }

        if (arm.place === 'left') {
            this.rect = this.drawRect(0, 0, this.weightWidth, this.weightHeight);  // 
            this.pivot.x = this.weightWidth / 2;
            this.pivot.y = this.weightHeight / 2;
        }

        if (arm.place === 'top') {
            this.rect = this.drawRect(0, 0, this.weightHeight, this.weightWidth);  // 
            this.pivot.y = this.weightWidth / 2;
            this.pivot. x = this.weightHeight / 2;
        }

        if (arm.place === 'right') {
            this.rect = this.drawRect(0, 0, this.weightWidth, this.weightHeight);  
            this.pivot.x = this.weightWidth / 2;
            this.pivot.y = this.weightHeight / 2;
        }


        this.endFill();

        

        //Position the weight at the center of the Arm container
        this.x = 0;
        this.y = 0;

        this.arm.addChild(this);

        // Initialize dragging variables
        this.dragging = false;
        this.data = null;

        // Make the weight interactive and draggable
        if (modifiable) {
            this.hitArea = new PIXI.Rectangle(-this.weightWidth + 2, -this.weightHeight + 1.5, this.weightWidth * 3, this.weightHeight * 2.5);
            this.interactive = true;
            this.buttonMode = true;

            // //to make hit area visible, uncomment the following lines
            // const hitAreaGraphics = new PIXI.Graphics();
            // hitAreaGraphics.beginFill(0xFF0000, 0.3);  // red color, 30% opacity
            // hitAreaGraphics.drawRect(this.hitArea.x, this.hitArea.y, this.hitArea.width, this.hitArea.height);
            // hitAreaGraphics.endFill();
            // this.addChild(hitAreaGraphics);
        

        this.on('pointerdown', this.onDragStart)
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('pointermove', this.onDragMove);

            // Note: Adjust these coordinates based on your object's origin and dimensions
        }

        

    }

    makeUnmodifiable() {
        this.interactive = false;
        this.buttonMode = false;
    }

    onDragStart(event) {
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
        
     }


    onDragMove() {
        if (this.dragging) {
            const newPosition = this.data.getLocalPosition(this.parent);

            if (this.arm.place === 'bottom') {
                this.actualPosition = newPosition.y;
            } else if (this.arm.place === 'top') {
                this.actualPosition = -newPosition.y;
            } else if (this.arm.place === 'left') {
                this.actualPosition = -newPosition.x;
            } else if (this.arm.place === 'right') {
                this.actualPosition = newPosition.x;
            }
    
            // Recalculate configuration and snap actualPosition to it
            this.configuration = this.positionToConfig(this.actualPosition);
            this.actualPosition = this.configToPosition(this.configuration);

            
            this.setPosition(this.configuration);
            this.arm.parent.setWeightPositionFromWeightLocation();
        }
    }

    updateTextWheel() {
        if (this.arm.place === 'bottom') {
            this.arm.parent.textBottom.text = this.configuration;
        } else if (this.arm.place === 'top') {
            this.arm.parent.textTop.text = this.configuration;
        } else if (this.arm.place === 'left') {
            this.arm.parent.textLeft.text = this.configuration;
        } else if (this.arm.place === 'right') {
            this.arm.parent.textRight.text = this.configuration;
        }
    }
    
    onDragEnd() {
        this.alpha = 1;
        this.dragging = false;
        this.data = null;
    }
    

    setPosition(configuration) {
        this.configuration = configuration;
//        this.actualPosition = (this.configuration -1) * this.arm.singleStripeWidth + this.arm.stripeWidthWhite;
        this.actualPosition = this.configToPosition(configuration);


        if (this.arm.place === 'bottom') {
            this.x = 0;
            this.y = this.actualPosition;
        }

        if (this.arm.place === 'left') {
            this.x = -this.actualPosition;
            this.y = 0;
        }

        if (this.arm.place === 'top') {
            this.x = 0;
            this.y = -this.actualPosition;
        }

        if (this.arm.place === 'right') {
            this.x = this.actualPosition;
            this.y = 0;
        }
    }

    configToPosition(configuration) {
     return (configuration - 1) * this.arm.singleStripeWidth + this.arm.stripeWidthWhite + this.arm.parent.radius + 1;
    }

    positionToConfig(position) {
        let cf =  Math.round((position - this.arm.stripeWidthWhite - this.arm.parent.radius - 1) / this.arm.singleStripeWidth + 1);
        cf = Math.max(1, Math.min(12, cf));
        return cf;
    }
}
