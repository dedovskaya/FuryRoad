class PathInterpol {
    #interpolatedPoints = [];
    #visualizations = {
        points: [],
        interpolatedPoints: [],
        lines: [],
    };
    #currentPointIndex = 0;
    #currentDistance = 0;

    constructor(points, gameObject, precision) {
        this.points = points;
        this.gameObject = gameObject;

        this.#interpolate(precision);
    }

    #distance = ((p1, p2) => {
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    });

    #catmullRom = ((t, p0, p1, p2, p3) => {
        let x = 0.5 * (
            (2 * p1.x) +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t * t +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t * t * t);
        let y = 0.5 * (
            (2 * p1.y) +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t * t +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t * t * t);
        return new PIXI.Point(x, y);
    });

    #interpolate = ((precision) => {
        for (var i = 0; i < this.points.length; i++) {
            let p0 = i - 2 < 0 ? this.points[this.points.length - 2] : this.points[i - 2];
            let p1 = i - 1 < 0 ? this.points[this.points.length - 1] : this.points[i - 1];
            let p2 = this.points[i];
            let p3 = i + 1 == this.points.length ? this.points[0] : this.points[i + 1];

            for (var j = 0; j < 1; j += 0.1) {
                let p = this.#catmullRom(j, p0, p1, p2, p3);
                this.#interpolatedPoints.push(p);

                // Draw interpolated point
                let point = new PIXI.Graphics().beginFill(0xFFA000).drawCircle(p.x, p.y, 2);

                point.visible = false;
                this.#visualizations.interpolatedPoints.push(point);
                app.stage.addChild(point);
            }

            // Draw point
            let point = new PIXI.Graphics().beginFill(0xD32F2F).drawCircle(p2.x, p2.y, 5);

            point.visible = false;
            this.#visualizations.points.push(point);
            app.stage.addChild(point);
        }

        // Draw lines
        for (var i = 0; i < this.#interpolatedPoints.length; i++) {
            let line = new PIXI.Graphics().lineStyle(1, 0xffffff);

            if (i == this.#interpolatedPoints.length - 1) {
                line.moveTo(this.#interpolatedPoints[i].x, this.#interpolatedPoints[i].y)
                    .lineTo(this.#interpolatedPoints[0].x, this.#interpolatedPoints[0].y);
            }
            else {
                line.moveTo(this.#interpolatedPoints[i].x, this.#interpolatedPoints[i].y)
                    .lineTo(this.#interpolatedPoints[i + 1].x, this.#interpolatedPoints[i + 1].y);
            }

            line.visible = false;
            this.#visualizations.lines.push(line);
            app.stage.addChild(line);
        }

        const parent = this.gameObject.parent;
        parent.removeChild(this.gameObject);
        parent.addChild(this.gameObject);
    });

    #animate = (() => {
        if (!paused) {
            let p1 = this.#interpolatedPoints[this.#currentPointIndex];
            let p2 = this.#interpolatedPoints[0];

            if (this.#currentPointIndex + 1 < this.#interpolatedPoints.length) {
                p2 = this.#interpolatedPoints[this.#currentPointIndex + 1];
            }

            var x = (1 - this.#currentDistance) * p1.x + this.#currentDistance * p2.x;
            var y = (1 - this.#currentDistance) * p1.y + this.#currentDistance * p2.y;

            this.gameObject.x = x;
            this.gameObject.y = y;

            this.#currentDistance += this.speed;
            if (this.#currentDistance >= 1 - this.speed) {
                for (var i = 0; i < this.#currentDistance; i++) {
                    this.#currentPointIndex++;

                    if (this.#currentPointIndex == this.#interpolatedPoints.length) {
                        this.#currentPointIndex = 0;
                    }
                }

                this.#currentDistance = 0;
            }
        }

        setTimeout(() => {
            requestAnimationFrame(this.#animate);
        }, 1);
    });

    startAnimation = ((speed) => {
        if (!speed) {
            speed = 1;
        }

        this.speed = speed;
        requestAnimationFrame(this.#animate);
    });

    showPoints = ((show) => {
        if (show) {
            this.#visualizations.points.forEach((point) => {
                point.visible = true;
            });
        }
        else {
            this.#visualizations.points.forEach((point) => {
                point.visible = false;
            });
        }
    });

    showInterpolatedPoints = ((show) => {
        if (show) {
            this.#visualizations.interpolatedPoints.forEach((point) => {
                point.visible = true;
            });
        }
        else {
            this.#visualizations.interpolatedPoints.forEach((point) => {
                point.visible = false;
            });
        }
    });

    showLine = ((show) => {
        if (show) {
            this.#visualizations.lines.forEach((line) => {
                line.visible = true;
            });
        }
        else {
            this.#visualizations.lines.forEach((line) => {
                line.visible = false;
            });
        }
    });
}