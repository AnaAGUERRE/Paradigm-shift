class Arm extends PIXI.Graphics {
        constructor(parent, place) {
            super();
            this.beginFill(0x000000);
            this.place = place;
            
            // Draw the striped arm
            this.stripeWidthWhite = parent.armlength / 30;
            this.stripeWidthRed = this.stripeWidthWhite * 1.4;
            
            
            this.thickness = this.stripeWidthRed * 1.5;  
            this.singleStripeWidth = this.stripeWidthRed + this.stripeWidthWhite;    

            let isRedStripe = false;
            let currentLength = 0;

            for (let i = 0; i < 25; i++) {
                const color = isRedStripe ? 0xFD0201 : 0xD1B38B;  
                const stripeWidth = isRedStripe ? this.stripeWidthRed : this.stripeWidthWhite;
                this.beginFill(color);

                if (place === 'top') {
                    this.drawRect(-this.thickness/2, -parent.radius - stripeWidth - currentLength, this.thickness, stripeWidth);
                } 

                if (place === 'left') {
                    this.drawRect(-parent.radius - stripeWidth - currentLength, -this.thickness/2, stripeWidth, this.thickness);
                }

                if (place === 'right') {
                    this.drawRect(parent.radius + currentLength, -this.thickness/2, stripeWidth, this.thickness);
                }

                if (place === 'bottom') {
                    this.drawRect(-this.thickness/2, parent.radius + currentLength, this.thickness, stripeWidth); 
                }

                currentLength += stripeWidth;

                this.endFill();
                isRedStripe = !isRedStripe;
            }

            this.length = currentLength;

            this.endFill();
            // this.x = 0;
            // this.y = 0;
        }

        
    }
