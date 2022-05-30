// Application set
const Application = PIXI.Application;

const app = new Application({
    width: 500,
    height: 500,
    transparent: false,
    antialias: true
});
app.renderer.backgroundColor = 0x23395D;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = "absolute";
document.body.appendChild(app.view);

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


// Keys

let forward = 0.0;
let forwardDown = 0.0;
let rightDown = 0.0;
let Ctrl = 0.0

document.addEventListener('keydown', (event) => {
   if (event.key == "ArrowUp") {
    forwardDown = 1;
   }

   if (event.key == "ArrowRight") {
    rightDown = 1;
   }

   if (event.key == "ArrowDown") {
    forwardDown = -1;
   }

   if (event.key == "ArrowLeft") {
    rightDown = -1;
   }
   if(event.key === "ArrowUp" && player.vel_x <= player.max_velocity){
    forward = 1;
    } ;
    
    if(event.key === "ArrowDown" && player.vel_x >= -player.max_velocity)  {
    forward = -1;
    } ;


});


let paused = false;

document.addEventListener('keyup', (event) => {
    if (event.key == "ArrowUp") {
        forwardDown = 0;
    }

    if (event.key == "ArrowRight") {
        rightDown = 0;
    }

    if (event.key == "ArrowDown") {
        forwardDown = 0;
    }
    
    if (event.key == "ArrowLeft") {
        rightDown = 0;
    }
       
    
    if(event.key === "ArrowUp"){
        forward = 0;
    } ;
        
    if(event.key === "ArrowDown")  {
        forward = 0;
    } ;


    // Show settings
    if (event.key === "Escape") {
        const settingsOverlay = document.querySelector('#settingsOverlay');
        if (settingsOverlay.classList.contains('collapse')) {
            settingsOverlay.classList.remove('collapse');
        }
        else {
            settingsOverlay.classList.add('collapse');
        }
    }

    // Pause/resume animation
    if (event.key === "p") {
        if (!paused) {
            app.ticker.stop();
            paused = true;
        }
        else {
            app.ticker.start();
            paused = false;
        }
    }
 });

//  Car class //////////////////////////////////////////////////////////////////////////////////////////////////////////////

var max_rotation_speed = 0.1;

 class Car {
    constructor (url, mass, max_torque, max_force, max_velocity) {
        this.sprite = new PIXI.Sprite.from(url);
        this.sprite.scale.set(0.5, 0.5);
        this.sprite.anchor.set(0.5, 0.5);
        this.mass = mass;
        this.vel_x = 0;
        this.vel_y = 0;
        this.ang_vel = 0;
        this.max_torque = max_torque;
        this.max_force = max_force;
        this.max_velocity = max_velocity;
        this.line_v = new Graphics();
    }

    spawn(x, y) {
        console.log(this.sprite.position);
        app.stage.addChild(this.sprite);
        this.sprite.x = x;
        this.sprite.y = y;
    }

    readInput(right, up) {
        
    }

    update(delta) {
        this.sprite.x += this.vel_x * delta;
        this.sprite.y += this.vel_y * delta;
        if  (this.ang_vel < -max_rotation_speed){
            this.ang_vel = -max_rotation_speed;
        } else if (this.ang_vel > max_rotation_speed){
            this.ang_vel = +max_rotation_speed;
        }
        this.sprite.rotation += this.ang_vel * delta; 
        // console.log(this.sprite.rotation)
        this.vel_x = friction * this.vel_x;
        this.vel_y = friction * this.vel_y;
        this.ang_vel = friction * this.ang_vel;
    
        app.stage.removeChild(this.line_v)
        this.line_v = new Graphics;
        this.line_v.lineStyle(5, 0xFFEA00, 1).moveTo(this.sprite.x, this.sprite.y)
            .lineTo(this.sprite.x + 50*this.vel_x, this.sprite.y + 50*this.vel_y);
        app.stage.addChild(this.line_v)
        
       
    }

    getAbsoluteVelocity() {
        return Math.sqrt(this.vel_x * this.vel_x + this.vel_y * this.vel_y)
    }
}

let player = new Car("./images/car1.png", 1.0, 1.0, 1.0, 10);
player.spawn(100,100);

let enemy = new Car("./images/car2.png", 1.0, 1.0, 1.0, 10);
enemy.spawn(600,600);

let enemy2 = new Car("./images/train.png", 1000.0, 1.0, 1.0, 10);
enemy2.spawn(0,0);

let enemy3 = new Car("./images/bus-stop.png", 1000.0, .01, 1.0, 10);
enemy3.spawn(1500,200);

//  Animation loop
const acceleration = 0.2;
var rotation_speed = 2;
const friction = 0.99;

app.ticker.add(delta => loop(delta));
function loop(delta) {

    enemy.update(delta)
    enemy2.update(delta)
    enemy3.update(delta)
    player.update(delta)
    player.vel_x += delta * acceleration * forward *  Math.cos(player.sprite.rotation);
    player.vel_y += delta * acceleration * forward *  Math.sin(player.sprite.rotation);

    let sign = Math.sign(Math.sin(player.sprite.rotation) * player.vel_y + Math.cos(player.sprite.rotation) * player.vel_x);
    // console.log(sign);
    player.ang_vel += sign * delta * rightDown * 0.0001 * player.getAbsoluteVelocity();
    
    
    if (rectsIntersect(player.sprite, enemy.sprite)){
        collisionVector(player, enemy);

    }

    if (rectsIntersect(player.sprite, enemy2.sprite)){
        collisionVector(player, enemy2);

    }

    if (rectsIntersect(player.sprite, enemy3.sprite)){
        collisionVector(player, enemy3);

    }

    if (rectsIntersect(enemy.sprite, enemy2.sprite)){
        collisionVector(enemy, enemy2);

    }

    if (rectsIntersect(enemy2.sprite, enemy3.sprite)){
        collisionVector(enemy2, enemy3);

    }
    if (rectsIntersect(enemy3.sprite, enemy.sprite)){
        collisionVector(enemy3, enemy);

    }
    
};

function drawMovement(obj){

}


// Detect collision
let hitBottom = 0.0;
let hitTop = 0.0;
let hitRight = 0.0;
let hitLeft = 0.0;

// Simple intersection check
function rectsIntersect(a, b) {
    let ab = a.getBounds(); // Returns the framing rectangle of the circle as a Rectangle object
    // console.log(ab);
    let bb = b.getBounds();
    return ab.x + ab.width > bb.x &&
           ab.x < bb.x + bb.width &&
           ab.y + ab.height > bb.y &&
           ab.y < bb.y + bb.height;
}

// Side collision check
function collide(r1,r2){
    var dx=(r1.x+r1.w/2)-(r2.x+r2.w/2);
    var dy=(r1.y+r1.h/2)-(r2.y+r2.h/2);
    var width=(r1.w+r2.w)/2;
    var height=(r1.h+r2.h)/2;
    var crossWidth=width*dy;
    var crossHeight=height*dx;
    var collision='none';
    //
    if(Math.abs(dx)<=width && Math.abs(dy)<=height){
        if(crossWidth>crossHeight){
            collision=(crossWidth>(-crossHeight))?'bottom':'left';
        }else{
            collision=(crossWidth>-(crossHeight))?'right':'top';
        }
    }
    return(collision);
}

// Collision interaction with impulse ///////////////////////////////////////////////////////////////////////////////////////////////////////////
function collisionVector(obj1, obj2) {
    let vCollision = {x: obj2.sprite.x - obj1.sprite.x, y: obj2.sprite.y - obj1.sprite.y};
    
    let distance = Math.sqrt((obj2.sprite.x-obj1.sprite.x)*(obj2.sprite.x-obj1.sprite.x) + (obj2.sprite.y-obj1.sprite.y)*(obj2.sprite.y-obj1.sprite.y));
    // console.log(distance);
    let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
    // console.log(vCollisionNorm);
    let vRelativeVelocity = {x: obj1.vel_x - obj2.vel_x, y: obj1.vel_y - obj2.vel_y};

    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
    
    if (speed < 0){
        return;
    }

    let impulse = 2 * speed / (obj1.mass + obj2.mass);
    obj1.vel_x -= (impulse * obj2.mass * vCollisionNorm.x);
    obj1.vel_y -= (impulse * obj2.mass * vCollisionNorm.y);
    obj2.vel_x += (impulse * obj1.mass * vCollisionNorm.x);
    obj2.vel_y += (impulse * obj1.mass * vCollisionNorm.y);

    function update(secondsPassed){
        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        // Calculate the angle (vy before vx)
        let radians = Math.atan2(this.vy, this.vx);

        // Convert to degrees
        let degrees = 180 * radians / Math.PI;
    };

    function draw() {
        // Draw heading vector
        this.context.beginPath();
        this.context.moveTo(this.x, this.y);
        this.context.lineTo(this.x + this.vx, this.y + this.vy);
        this.context.stroke();
    }


}

// Filters
// let vShader;
// let fShader;
// let uniforms;
// const filter = new PIXI.Filter(vShader, fShader, uniforms);


// Path interpolation
const points = [new PIXI.Point(200, 200), new PIXI.Point(500, 50), new PIXI.Point(700, 300), new PIXI.Point(600, 450), new PIXI.Point(350, 300)];
let interpolation = new PathInterpol(points, enemy2.sprite, 0.5);
interpolation.startAnimation(0.5);


// Motion blur
let motionBlur = new MotionBlur(enemy2.sprite, 4);


// Settings
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

document.querySelector('#lineInterpolationTraversalSpeed').addEventListener('change', ((e) => {
    interpolation.speed = parseFloat(e.currentTarget.value);
}));

document.querySelector('#lineInterpolationAnimationUpdateRate').addEventListener('change', ((e) => {
    app.ticker.speed = parseFloat(e.currentTarget.value);
}));
