class PathInterpol {
    #interpolatedPoints = [];
    #arcLengths = [];
    #visualizations = {
        points: [],
        interpolatedPoints: [],
        lines: [],
    };

    #previousPoint = new PIXI.Point(0, 0);
    #currentDistance = 0;

    constructor(points, gameObject, precision, k1, k2) {
        if (points.length < 4) {
            throw new Error("The points array must contain at least 4 points");
        }

        this.points = points;
        this.gameObject = gameObject;
        this.k1 = k1;
        this.k2 = k2;

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

            let interpolatedPoints = [];
            let totalArcLength = 0;
            for (var j = 0; j < 1; j += precision) {
                let p = this.#catmullRom(j, p0, p1, p2, p3);
                this.#interpolatedPoints.push(p);
                
                let arcLength = 0;
                if (interpolatedPoints.length > 0) {
                    arcLength = this.#distance(p, interpolatedPoints[interpolatedPoints.length - 1].point);
                }

                interpolatedPoints.push({
                    controlPoints: [p0, p1, p2, p3],
                    parametricValue: j,
                    point: p,
                    arcLength: totalArcLength + arcLength,
                });
                totalArcLength += arcLength;

                // Draw interpolated point
                let point = new PIXI.Graphics().beginFill(0xFFA000).drawCircle(p.x, p.y, 2);

                point.visible = false;
                this.#visualizations.interpolatedPoints.push(point);
                app.stage.addChild(point);
            }

            for (var j = 0; j < interpolatedPoints.length; j++) {
                this.#arcLengths.push({
                    controlPoints: interpolatedPoints[j].controlPoints,
                    parametricValue: interpolatedPoints[j].parametricValue,
                    point: interpolatedPoints[j].point,
                    arcLength: (interpolatedPoints[j].arcLength / totalArcLength) + i,
                });
            }

            // Draw point
            let point = new PIXI.Graphics().beginFill(0xD32F2F).drawCircle(p2.x, p2.y, 5);

            point.visible = false;
            this.#visualizations.points.push(point);
            app.stage.addChild(point);
        }

        // Draw lines
        for (var i = 0; i < this.#arcLengths.length; i++) {
            let line = new PIXI.Graphics().lineStyle(1, 0xffffff);

            if (i == this.#arcLengths.length - 1) {
                line.moveTo(this.#arcLengths[i].point.x, this.#arcLengths[i].point.y)
                    .lineTo(this.#arcLengths[0].point.x, this.#arcLengths[0].point.y);
            }
            else {
                line.moveTo(this.#arcLengths[i].point.x, this.#arcLengths[i].point.y)
                    .lineTo(this.#arcLengths[i + 1].point.x, this.#arcLengths[i + 1].point.y);
            }

            line.visible = false;
            this.#visualizations.lines.push(line);
            app.stage.addChild(line);
        }

        const parent = this.gameObject.parent;
        parent.removeChild(this.gameObject);
        parent.addChild(this.gameObject);
    });

    #animate = ((delta) => {
        this.#currentDistance += (this.speed * (delta / app.ticker.speed)) / this.points.length;
        while (this.#currentDistance > this.points.length) {
            this.#currentDistance -= this.points.length;
        }

        let maximumDistance = this.#ease(1, this.k1, this.k2);
        let actualDistance = (this.#ease(this.#currentDistance / this.points.length, this.k1, this.k2) / maximumDistance) * this.points.length;

        let fromIndex = 0;
        for (var i = 0; i < this.#arcLengths.length; i++) {
            if (this.#arcLengths[i].arcLength > actualDistance) {
                fromIndex = i - 1;
                if (fromIndex < 0) {
                    fromIndex = this.#arcLengths.length - 1;
                }
                break;
            }
        }

        let nextIndex = fromIndex + 1;
        if (fromIndex == this.#arcLengths.length - 1) {
            nextIndex = 0;
        }

        let parametricValue = 0;
        if (this.#arcLengths[nextIndex].arcLength != 0) {
            let currentArcLength = actualDistance - this.#arcLengths[fromIndex].arcLength;
            let arcLength = this.#arcLengths[nextIndex].arcLength - this.#arcLengths[fromIndex].arcLength;

            let parametricValueDifference = this.#arcLengths[nextIndex].parametricValue - this.#arcLengths[fromIndex].parametricValue;

            let ratio = currentArcLength / arcLength;
            parametricValue = parametricValueDifference * ratio + this.#arcLengths[fromIndex].parametricValue;
        }

        let p0 = this.#arcLengths[i].controlPoints[0];
        let p1 = this.#arcLengths[i].controlPoints[1];
        let p2 = this.#arcLengths[i].controlPoints[2];
        let p3 = this.#arcLengths[i].controlPoints[3];

        let p = this.#catmullRom(parametricValue, p0, p1, p2, p3);

        this.gameObject.x = p.x;
        this.gameObject.y = p.y;

        // Rotate the gameObject
        if (p.x != this.#previousPoint.x && p.y != this.#previousPoint.y) {
            let rotation = Math.atan2(p.y - this.#previousPoint.y, p.x - this.#previousPoint.x);
            if (rotation < 0) {
                rotation += 2 * Math.PI;
            }
            this.gameObject.rotation = rotation;
        }

        this.#previousPoint = p;
    });

    startAnimation = ((speed) => {
        if (!speed) {
            speed = 1;
        }

        this.speed = speed;
        app.ticker.add(this.#animate);
    });

    stopAnimation = (() => {
        app.ticker.remove(this.#animate);
    });

    #ease = ((t, k1, k2) => {
        let f = k1 * ((2 / Math.PI) + k2 - k1 + (1 - k2) * (2 / Math.PI));
        let s = 0;
        if (t <= k1) {
            s = (k1 * (2 / Math.PI) * (Math.sin((t / k1) * (Math.PI / 2) - (Math.PI / 2)) + 1)) / f;
        }
        else if (t <= k2) {
            s = (k1 / (Math.PI / 2) + t - k1) / f;
        }
        else {
            s = (k1 / (Math.PI / 2) + k2 - k1 + ((1 - k2) * (2 / Math.PI)) * Math.sin(((t - k2) / (1 - k2)) * (Math.PI / 2))) / f;
        }
        return s;
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