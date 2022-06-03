// Application set ///////////////////////////////////////////////////////////////////////////////////////////////////////////
const Application = PIXI.Application;

const app = new Application({
    width: 500,
    height: 500,
    transparent: false,
    antialias: true
});
app.renderer.backgroundColor = 0x23395D;
app.renderer.resize(1680, 1024);
app.renderer.view.style.position = "absolute";
app.renderer.view.style.top = 0;
document.querySelector("#game").appendChild(app.view);

const Graphics = PIXI.Graphics;

// Loader
let loader = PIXI.Loader.shared;

loader.add("road", "./images/road.png")
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
const url2 = "./images/road.png"
const BackgroundSprite = new PIXI.Sprite.from(url2);
app.stage.addChild(BackgroundSprite);
BackgroundSprite.width = window.innerWidth;
BackgroundSprite.height = window.innerHeight;

let player = new Car("./images/car1.png", 1.0, 1.0, 1.0, 10);
player.spawn(1100,700);

//  Input reader for player
input = new InputReader(player);

let enemy = new Car("./images/car2.png", 1.0, 1.0, 1.0, 10);
enemy.spawn(500,600);

let enemy2 = new Car("./images/train.png", 1000.0, 1.0, 1.0, 10);
enemy2.spawn(0,0);

let enemy3 = new Car("./images/bus-stop.png", 1000.0, .01, 1.0, 10);
enemy3.spawn(1500,200);

let enemy4 = new Car("./images/car2.png", 1.0, 1.0, 1.0, 10);
enemy4.spawn(1500,400);


//  Animation loop
const acceleration = 0.2;
const friction = 0.99;

app.ticker.add(delta => loop(delta));
function loop(delta) {

    for (var i = 0; i < Car.allCars.length; i++) {
        Car.allCars[i].update(delta);
    }

    player.vel_x += delta * acceleration * input.forward *  Math.cos(player.sprite.rotation);
    player.vel_y += delta * acceleration * input.forward *  Math.sin(player.sprite.rotation);

    let sign = Math.sign(Math.sin(player.sprite.rotation) * player.vel_y + Math.cos(player.sprite.rotation) * player.vel_x);

    player.ang_vel += sign * delta * input.rightDown * 0.0002 * player.getAbsoluteVelocity();
    
    for (var i = 0; i < Car.allCars.length-1; i++) {
        for (var j = i+1; j < Car.allCars.length; j++) {
                if (rectsIntersect(Car.allCars[i].sprite, Car.allCars[j].sprite)){
                    collisionVector(Car.allCars[i], Car.allCars[j]);
                }
        }
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

// Filters
// let vShader;
// let fShader;
// let uniforms;
// const filter = new PIXI.Filter(vShader, fShader, uniforms);


// Path interpolation
const points = [new PIXI.Point(200, 200), new PIXI.Point(500, 50), new PIXI.Point(700, 300), new PIXI.Point(600, 450), new PIXI.Point(350, 300)];
let interpolation = new PathInterpol(points, enemy2.sprite, 0.1);
interpolation.startAnimation(0.25);
// setTimeout(() => {
//     app.ticker.stop();
// }, 150);


// Motion blur
// let motionBlur = new MotionBlur(enemy2.sprite, 20, "POST_PROCESS");


// Settings
document.querySelectorAll('input[name="updateRate"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        app.ticker.speed = parseFloat(e.currentTarget.value);
    }));
});

// Line interpolation
document.querySelector('#lineInterpolationSplineCurve').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        interpolation.showLine(true);
    }
    else {
        interpolation.showLine(false);
    }
}));

document.querySelector('#lineInterpolationControlPoints').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        interpolation.showPoints(true);
    }
    else {
        interpolation.showPoints(false);
    }
}));

document.querySelector('#lineInterpolationSamplePoints').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        interpolation.showInterpolatedPoints(true);
    }
    else {
        interpolation.showInterpolatedPoints(false);
    }
}));

document.querySelectorAll('input[name="lineInterpolationTraversalSpeed"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        interpolation.speed = parseFloat(e.currentTarget.value);
    }));
});

// Motion blur
document.querySelectorAll('input[name="motionBlurTechnique"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        motionBlur.technique = e.currentTarget.value;
    }));
});


console.log(enemy2.sprite);






// var extract = app.renderer.plugins.extract;
// var canvas = extract.canvas();
// const context = canvas.getContext("2d");
// var rgba = context.getImageData(20, 20, 1, 1).data;

// console.log(enemy2.sprite.texture);
// setTimeout(() => {
    
// // console.log(rgba);
// let pixels = app.renderer.extract.pixels(app.stage);

// }, 150);