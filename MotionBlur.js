class MotionBlur {
    #x0 = 0;
    #y0 = 0;
    #rotation = 0;
    #blurObjects = [];
    #numberOfSamples = 4;

    #motionBlurFilter = null;
    #motionBlurUniforms = {
        uVelocity: new PIXI.Point(5, 5),
        uLimit: 1,
    };

    technique = "POST_PROCESS";

    constructor(gameObject, numberOfSamples, technique) {
        this.gameObject = gameObject;
        
        // Create fullscreen sized gameObject container for post-process motion blur to work properly
        this.gameObject.parent.removeChild(this.gameObject);
        let gameObjectContainer = new PIXI.Container();
        gameObjectContainer.x = 0;
        gameObjectContainer.y = 0;
        gameObjectContainer.addChild(this.gameObject);
        gameObjectContainer.addChild(new PIXI.Graphics().drawRect(0, 0, app.renderer.width, app.renderer.height));
        app.stage.addChild(gameObjectContainer);
        this.gameObjectContainer = gameObjectContainer;

        if (numberOfSamples) {
            this.#numberOfSamples = numberOfSamples;
        }

        if (technique == "POST_PROCESS" || technique == "SUPERSAMPLING") {    
            this.technique = technique;
        }

        let motionBlurFragment = `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec4 filterArea;

        uniform vec2 uVelocity;
        uniform float uLimit;

        const int MAX_NUM_SAMPLES = 2048;

        void main(void)
        {
            vec4 color = texture2D(uSampler, vTextureCoord);
            vec2 velocity = uVelocity / filterArea.xy;

            int numSamples = 0;
            vec4 temporaryColor = color;
            for (int i = 0; i < MAX_NUM_SAMPLES - 1; i++) {
                if (float(i) > uLimit) {
                    break;
                }

                numSamples++;
                
                vec2 distance = float(i) * velocity / uLimit;
                temporaryColor += texture2D(uSampler, vTextureCoord + distance);
            }

            temporaryColor /= float(numSamples);
            gl_FragColor = temporaryColor;
        }
        `;
        this.#motionBlurFilter = new PIXI.Filter(null, motionBlurFragment, this.#motionBlurUniforms);
        this.#motionBlurFilter.filterArea = app.renderer.screen;

        this.#x0 = this.gameObject.x;
        this.#y0 = this.gameObject.y;
        this.#rotation = this.gameObject.rotation;

        app.ticker.add(this.#animate);
    }

    #animate = (() => {
        if (this.technique == "POST_PROCESS") {
            // Motion blur filter ("post-process")
            this.#blurObjects.forEach((blurObject) => {
                app.stage.removeChild(blurObject);
            });

            this.gameObject.alpha = 1;
            this.gameObjectContainer.filters = [this.#motionBlurFilter];

            var dx = this.gameObject.x - this.#x0;
            var dy = this.gameObject.y - this.#y0;

            this.#motionBlurUniforms.uVelocity = new PIXI.Point(dx, dy);
            this.#motionBlurUniforms.uLimit = Math.max(Math.abs(dx), Math.abs(dy));
        }
        else if (this.technique == "SUPERSAMPLING") {
            // Supersampling
            this.gameObject.filters = null;

            this.#blurObjects.forEach((blurObject) => {
                app.stage.removeChild(blurObject);
            });

            this.#blurObjects = [];

            var dx = this.gameObject.x - this.#x0;
            var dy = this.gameObject.y - this.#y0;
            var dr = this.gameObject.rotation - this.#rotation;
            if (Math.abs(dr) > Math.PI) {
                this.#rotation -= 2 * Math.PI;
                dr = this.gameObject.rotation - this.#rotation;
            }

            var x = this.#x0;
            var y = this.#y0;
            var rotation = this.#rotation;

            for (var i = 0; i < this.#numberOfSamples; i++) {
                let blurObject = new PIXI.Sprite.from(this.gameObject.texture);
                blurObject.x = x;
                blurObject.y = y;
                blurObject.scale = this.gameObject.scale;
                blurObject.anchor = this.gameObject.anchor;
                blurObject.rotation = rotation;
                blurObject.alpha = 2 / this.#numberOfSamples;

                this.#blurObjects.push(blurObject);
                app.stage.addChild(blurObject);

                x += dx / this.#numberOfSamples;
                y += dy / this.#numberOfSamples;
                rotation += dr / this.#numberOfSamples;
            }

            this.gameObject.alpha = 2 / this.#numberOfSamples;
        }
        
        this.#x0 = this.gameObject.x;
        this.#y0 = this.gameObject.y;
        this.#rotation = this.gameObject.rotation;
    });
}