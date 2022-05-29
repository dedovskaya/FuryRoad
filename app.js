// Application set ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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


// Keys ///////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    if (event.key == "p") {
        if (!paused) {
            app.ticker.stop();
            paused = true;
        }
        else {
            app.ticker.start();
            paused = false;
        }
    }
       
    if(event.key === "ArrowUp"){
        forward = 0;
    } ;
        
    if(event.key === "ArrowDown")  {
        forward = 0;
    } ;
 });

//  Car class //////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        this.inertia_moment = this.mass * 100000.0
    }
    
    // List of all Car type elements
    static allCars = []
    static max_rotation_speed = 0.1;

    spawn(x, y) {
        console.log(this.sprite.position);
        app.stage.addChild(this.sprite);
        this.sprite.x = x;
        this.sprite.y = y;
        (Car.allCars).push(this)
        console.log(Car.allCars)
    }

    update(delta) {
        this.sprite.x += this.vel_x * delta;
        this.sprite.y += this.vel_y * delta;
        if  (this.ang_vel < -Car.max_rotation_speed){
            this.ang_vel = -Car.max_rotation_speed;
        } else if (this.ang_vel > Car.max_rotation_speed){
            this.ang_vel = +Car.max_rotation_speed;
        }
        this.sprite.rotation += this.ang_vel * delta; 

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
player.spawn(1100,700);

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

    player.vel_x += delta * acceleration * forward *  Math.cos(player.sprite.rotation);
    player.vel_y += delta * acceleration * forward *  Math.sin(player.sprite.rotation);

    let sign = Math.sign(Math.sin(player.sprite.rotation) * player.vel_y + Math.cos(player.sprite.rotation) * player.vel_x);

    player.ang_vel += sign * delta * rightDown * 0.0002 * player.getAbsoluteVelocity();
    
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
// let circle = new PIXI.Graphics().beginFill(0x000000).drawCircle(0, 0, 5);
// app.stage.addChild(circle);

let interpolation = new PathInterpol(points, enemy2.sprite, 0.1);
interpolation.showLine(true);
interpolation.showInterpolatedPoints(true);
interpolation.showPoints(true);
interpolation.startAnimation(0.5);

let motionBlur = new MotionBlur(enemy2.sprite, 4);

// example inbuilt
// car1Sprite.filters = [new PIXI.filters.BlurFilter()]

// Handling points in 3D space
// let vShader = vertShader.innerHTML; 
// let vShader = vertShader; 
// Drawing pixels
// let fShader = fragShader.innerHTML;
// let fShader = fragShader;
// let uniforms = {};

// const myFilter = new PIXI.Filter(vShader, fShader, uniforms);
// car1Sprite.filters = [myFilter];
