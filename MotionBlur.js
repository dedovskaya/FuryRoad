class MotionBlur {
    #x0 = 0;
    #y0 = 0;
    #blurObjects = [];

    #numberOfSamples = 4;
    #motionBlurFilter = null;

    technique = "POST_PROCESS";

    constructor(gameObject, numberOfSamples, technique) {
        this.gameObject = gameObject;
        if (numberOfSamples) {
            this.#numberOfSamples = numberOfSamples;
        }

        if (technique == "POST_PROCESS" || technique == "SUPERSAMPLING") {    
            this.technique = technique;
        }

        this.#motionBlurFilter = new PIXI.filters.MotionBlurFilter();

        this.#x0 = gameObject.x;
        this.#y0 = gameObject.y;

        app.ticker.add(this.#animate);
    }

    #animate = (() => {
        if (this.technique == "POST_PROCESS") {
            // Motion blur filter ("post-process")
            this.#blurObjects.forEach((blurObject) => {
                app.stage.removeChild(blurObject);
            });

            this.gameObject.filters = [this.#motionBlurFilter];

            var dx = this.gameObject.x - this.#x0;
            var dy = this.gameObject.y - this.#y0;

            this.#motionBlurFilter.velocity = new PIXI.Point(dx, dy);
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

            var x = this.#x0;
            var y = this.#y0;

            while (x < this.gameObject.x && y < this.gameObject.y) {
                let blurObject = new PIXI.Sprite.from(this.gameObject.texture);
                blurObject.x = x;
                blurObject.y = y;
                blurObject.scale = this.gameObject.scale;
                blurObject.anchor = this.gameObject.anchor;
                blurObject.rotation = this.gameObject.rotation;
                blurObject.alpha = (1 / this.#numberOfSamples);

                this.#blurObjects.push(blurObject);
                app.stage.addChild(blurObject);

                x += (dx / (this.#numberOfSamples - 1));
                y += (dy / (this.#numberOfSamples - 1));
            }
        }
        
        this.#x0 = this.gameObject.x;
        this.#y0 = this.gameObject.y;
    });
}