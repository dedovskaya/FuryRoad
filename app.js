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

// Car
const url1 = "./images/car1.png"
const car1Sprite = new PIXI.Sprite.from(url1);
app.stage.addChild(car1Sprite);
car1Sprite.anchor.set(1,0.5)

// car1Sprite.width = 500;
// car1Sprite.height = 200;
car1Sprite.scale.set(0.5);
car1Sprite.position.set(100, window.innerHeight/2);
// car1Sprite.rotation = Math.PI/2;

// Interactive
let buttonUp = 1;
let buttonRight = 1;

car1Sprite.interactive = true;
car1Sprite.buttonMode = true;
car1Sprite.on("pointerdown", function() {
    car1Sprite.scale.x += 0.1;
    car1Sprite.scale.y += 0.1;
    if (buttonUp === 1) {
        car1Sprite.x = car1Sprite.x + distance * Math.cos(car1Sprite.rotation);
        car1Sprite.y = car1Sprite.y + distance * Math.sin(car1Sprite.rotation);
    }
});

var speed = 0;  
const acceleration = 0.2;
const maxspeed = 6;
const maneuverability = 0.009;
var rotation = 0;
var max_rotation_speed = 0.009;
const friction = 0.95;

// Single keys

document.addEventListener("keydown", function(e) {

    if(e.key === "ArrowUp" && speed <= maxspeed){
        speed += acceleration;
    } ;
        
    if(e.key === "ArrowDown" && speed >= -maxspeed)  {
        speed -= acceleration;
    } ;

});


// Multiple keys

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


});

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
 });


//  Animation loop

app.ticker.add(delta => loop(delta));

function loop(delta) {

    speed += delta*acceleration*forwardDown;
    rotation += maneuverability*delta*rightDown*speed;      

    car1Sprite.x = car1Sprite.x + delta*speed * Math.cos(car1Sprite.rotation);
    car1Sprite.y = car1Sprite.y + delta*speed * Math.sin(car1Sprite.rotation);
    speed = friction * speed;
    rotation = friction * rotation;
    if(rotation <= max_rotation_speed && rotation >= -max_rotation_speed){
        car1Sprite.rotation += delta*rotation;
    } else if  (rotation < -max_rotation_speed){
        car1Sprite.rotation -= delta*max_rotation_speed;
    } else if (rotation > max_rotation_speed){
        car1Sprite.rotation += delta*max_rotation_speed;
    }
};

// Filters
let vShader;
let fShader;
let uniforms;
const filter = new PIXI.Filter(vShader, fShader, uniforms);
