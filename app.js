// Application set ///////////////////////////////////////////////////////////////////////////////////////////////////////////
const Application = PIXI.Application;

const app = new Application({
    width: 500,
    height: 500,
    transparent: false,
    antialias: true
});
app.renderer.backgroundColor = 0x23395D;
app.renderer.resize(1280, 720);
app.renderer.view.style.position = "absolute";
app.renderer.view.style.top = 0;
document.querySelector("#game").appendChild(app.view);

const Graphics = PIXI.Graphics;

// Loader
let loader = PIXI.Loader.shared;

loader.add("road", "./images/background-main.png")
.add("car1", "./images/car1.png")
.add("car2", "./images/car2.png")
// .on("progress", handleLoadProgress)
// .on("load", handleLoadAsset)
// .load(handleLoadComplete);

let img;

function handleLoadProgress(loader, resourse) {
    console.log(loader.progress + "% loaded");
}

function handleLoadAsset(loader, resourse) {
    console.log("asset loaded" + resourse.name);
}

function handlerLoadError() {
    console.error("load error")
}

function handleLoadComplete(){
    let texture = loader.resourses.car2.texture;
    img = new PIXI.Sprite(texture);
    img.anchor.x = 0.5;
    img.anchor.y = 0.5;
    // app.stage.addChild(img);
}
// Background road
const url2 = "./images/background-main.png"
const BackgroundSprite = new PIXI.Sprite.from(url2);
app.stage.addChild(BackgroundSprite);
BackgroundSprite.width = app.renderer.width;
BackgroundSprite.height = app.renderer.height;

document.addEventListener('click', (e => {
    console.log(e);
}))

// let player = new Car("./images/car1.png", 1.0, 1.0, 1.0, 10);
// player.spawn(1100,700);

let player = new RigidBody("./images/car1.png", 1.0, 1.0, 1.0, 10);
player.sprite.scale.set(0.125, 0.125);
player.sprite.rotation = Math.PI / 2;
player.spawn(1052, 351);

//  Input reader for player
input = new InputReader(player);

let enemy = new Car("./images/car2.png", 1.0, 1.0, 1.0, 10);
// enemy.spawn(500,600);

let enemy2 = new Car("./images/train.png", 1000.0, 1.0, 1.0, 10);
// enemy2.spawn(0,0);

let enemy3 = new Car("./images/bus-stop.png", 1000.0, .01, 1.0, 10);
// enemy3.spawn(1500,200);

let enemy4 = new Car("./images/car2.png", 1.0, 1.0, 1.0, 10);
// enemy4.spawn(1500,400);


let passedPoints = [false, false, false, false, false];

//  Animation loop
const acceleration = 0.2;
const friction = 0.95;

let time = 0;

app.ticker.add(delta => loop(delta));
function loop(delta) {
    time += app.ticker.elapsedMS;

    for (var i = 0; i < RigidBody.allRigidBodies.length; i++) {
        RigidBody.allRigidBodies[i].update(delta);
    }

    player.vel_x += delta * acceleration * input.forward *  Math.cos(player.sprite.rotation);
    player.vel_y += delta * acceleration * input.forward *  Math.sin(player.sprite.rotation);

    let sign = Math.sign(Math.sin(player.sprite.rotation) * player.vel_y + Math.cos(player.sprite.rotation) * player.vel_x);

    player.ang_vel += sign * delta * input.rightDown * 0.0005 * player.getAbsoluteVelocity();
    
    for (var i = 0; i < RigidBody.allRigidBodies.length-1; i++) {
        for (var j = i+1; j < RigidBody.allRigidBodies.length; j++) {
            if (rectsIntersect(RigidBody.allRigidBodies[i].sprite, RigidBody.allRigidBodies[j].sprite)) {
                collisionVector(RigidBody.allRigidBodies[i], RigidBody.allRigidBodies[j]);
            }
        }
    }

    let minutes = parseInt(time / 60000);
    let seconds = parseInt((time - (minutes * 60000)) / 1000);
    let centiseconds = parseInt((time - (seconds * 1000)) / 10);
    let displayTime = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds) + ":" + (centiseconds < 10 ? "0" + centiseconds : centiseconds);
    document.querySelector('#elapsedTime').innerText = displayTime;

    if (player.sprite.x < 842 && player.sprite.y > 578) {
        passedPoints[0] = true;
    }
    if (passedPoints[0] && player.sprite.x < 202 && player.sprite.y > 570) {
        passedPoints[1] = true;
    }
    if (passedPoints[0] && passedPoints[1] && player.sprite.x < 219 && player.sprite.y < 127) {
        passedPoints[2] = true;
    }
    if (passedPoints[0] && passedPoints[1] && passedPoints[2] && player.sprite.x > 956 && player.sprite.y > 162) {
        passedPoints[3] = true;
    }
    if (passedPoints[0] && passedPoints[1] && passedPoints[2] && passedPoints[3] && player.sprite.x > 1023 && player.sprite.y > 306) {
        passedPoints[4] = true;
    }
    if (passedPoints.every(x => x)) {
        console.log("VICTORY");
        app.ticker.stop();
    }
};

// Simple intersection check
function rectsIntersect(a, b) {
    let ab = a.getBounds(); // Returns the framing rectangle of the circle as a Rectangle object
    let bb = b.getBounds();

    return ab.x + ab.width > bb.x &&
           ab.x < bb.x + bb.width &&
           ab.y + ab.height > bb.y &&
           ab.y < bb.y + bb.height;
}

// Collision interaction with impulse ///////////////////////////////////////////////////////////////////////////////////////////////////////////
function collisionVector(obj1, obj2) {
    let vCollision = {x: obj2.sprite.x - obj1.sprite.x, y: obj2.sprite.y - obj1.sprite.y};
    
    let distance = Math.sqrt((obj2.sprite.x-obj1.sprite.x)*(obj2.sprite.x-obj1.sprite.x) + (obj2.sprite.y-obj1.sprite.y)*(obj2.sprite.y-obj1.sprite.y));

    let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};

    let vRelativeVelocity = {x: obj1.vel_x - obj2.vel_x, y: obj1.vel_y - obj2.vel_y};
    
    // Impulse moment
    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
    
    if (speed < 0){
        return;
    }

    let impulse = 2 * speed / (obj1.mass + obj2.mass);
    obj1.vel_x -= (impulse * obj2.mass * vCollisionNorm.x);
    obj1.vel_y -= (impulse * obj2.mass * vCollisionNorm.y);
    obj2.vel_x += (impulse * obj1.mass * vCollisionNorm.x);
    obj2.vel_y += (impulse * obj1.mass * vCollisionNorm.y);
    
    
    // Inertia, angular momentum, angular velocity
    let perpendicularSpeed = vRelativeVelocity.x * vCollisionNorm.y - vRelativeVelocity.y * vCollisionNorm.x;
    let perpendicularDeltaP = 2*perpendicularSpeed*(1/obj1.mass + 1/obj2.mass)

    let deltaJ = 2*(obj2.ang_vel-obj1.ang_vel)/(1/obj1.inertia_moment + 1/obj2.inertia_moment);
    deltaJ += perpendicularDeltaP*distance;
    obj1.ang_vel -= deltaJ/obj1.inertia_moment;
    obj2.ang_vel += deltaJ/obj2.inertia_moment;
}

// Path interpolation
// Railway line 1
let train1 = new PIXI.Sprite.from("./images/train.png");
train1.scale.set(0.25, 0.25);
train1.anchor.set(0.5, 0.5);
app.stage.addChild(train1);

const points1 = [new PIXI.Point(574, 474), new PIXI.Point(459, 486), new PIXI.Point(370, 462), new PIXI.Point(250, 376), new PIXI.Point(189, 289), new PIXI.Point(178, 223), new PIXI.Point(206, 161), new PIXI.Point(263, 110), new PIXI.Point(369, 69), new PIXI.Point(508, 54), new PIXI.Point(593, 114), new PIXI.Point(631, 229), new PIXI.Point(608, 390)];
let interpolation1 = new PathInterpol(points1, train1, 0.05, 0.15, 0.5);
interpolation1.startAnimation(0.5);

// Railway line 2
let train2 = new PIXI.Sprite.from("./images/train.png");
train2.scale.set(0.25, 0.25);
train2.anchor.set(0.5, 0.5);
app.stage.addChild(train2);

const points2 = [new PIXI.Point(1009, 514), new PIXI.Point(1105, 573), new PIXI.Point(1079, 688), new PIXI.Point(969, 855), new PIXI.Point(840, 842), new PIXI.Point(730, 750), new PIXI.Point(674, 708), new PIXI.Point(664, 651), new PIXI.Point(678, 570), new PIXI.Point(721, 522), new PIXI.Point(856, 484)];
let interpolation2 = new PathInterpol(points2, train2, 0.05, 0.15, 0.5);
interpolation2.startAnimation(0.5);


// Motion blur
let motionBlur1 = new MotionBlur(train1, 32, "POST_PROCESS");
let motionBlur2 = new MotionBlur(train2, 32, "POST_PROCESS");


// Settings
app.ticker.minFPS = 30;

document.querySelectorAll('input[name="frameRate"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        app.ticker.maxFPS = parseInt(e.currentTarget.value);
    }));
});

document.querySelectorAll('input[name="updateRate"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        app.ticker.speed = parseFloat(e.currentTarget.value);
    }));
});

// Line interpolation
document.querySelector('#lineInterpolationSplineCurve').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        interpolation1.showLine(true);
        interpolation2.showLine(true);
    }
    else {
        interpolation1.showLine(false);
        interpolation2.showLine(false);
    }
}));

document.querySelector('#lineInterpolationControlPoints').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        interpolation1.showPoints(true);
        interpolation2.showPoints(true);
    }
    else {
        interpolation1.showPoints(false);
        interpolation2.showPoints(false);
    }
}));

document.querySelector('#lineInterpolationSamplePoints').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        interpolation1.showInterpolatedPoints(true);
        interpolation2.showInterpolatedPoints(true);
    }
    else {
        interpolation1.showInterpolatedPoints(false);
        interpolation2.showInterpolatedPoints(false);
    }
}));

document.querySelectorAll('input[name="lineInterpolationTraversalSpeed"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        interpolation1.speed = parseFloat(e.currentTarget.value);
        interpolation2.speed = parseFloat(e.currentTarget.value);
    }));
});

// Motion blur
document.querySelectorAll('input[name="motionBlurTechnique"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        motionBlur1.technique = e.currentTarget.value;
        motionBlur2.technique = e.currentTarget.value;
    }));
});