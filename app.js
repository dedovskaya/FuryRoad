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

//Rectangle
const rectangle = new Graphics();
rectangle.beginFill(0xAA33BB)
.lineStyle(4, 0xFFEA00, 1)
.drawRect(200, 200, 100, 120) //coord, coord, wid, hei
    .endFill();

app.stage.addChild(rectangle); // like layer in PS

//Polygon
const poly = new Graphics();
poly.beginFill(0xFF66FF)
    .lineStyle(5, 0xFFEA00, 1)
    .drawPolygon([
        800, 50,
        850, 100,
        820, 120,
        820, 350,
        750, 350,
        750, 120,
        720, 100,
        770, 50
    ])
    .endFill();

app.stage.addChild(poly);

//Circle1
const circle = new Graphics();
circle.beginFill(0x22AACC)
    .lineStyle(5, 0xFFEA00, 1)
    .drawCircle(850, 350, 70)
    .endFill();
app.stage.addChild(circle);
// circle2
const circle1 = new Graphics();
circle1.beginFill(0x22AACC)
    .lineStyle(5, 0xFFEA00, 1)
    .drawCircle(720, 350, 70)
    .endFill();
app.stage.addChild(circle1);

// Line
const line = new Graphics();
line.lineStyle(5, 0xFFEA00, 1)
    .moveTo(790, 50)
    .lineTo(790, 100);
app.stage.addChild(line);

// Torus
const torus = new Graphics();
torus.beginFill(0xFFFDDD)
    .drawTorus(100, 700, 80, 100, 0, Math.PI*0.75)
    .endFill();
app.stage.addChild(torus);

// Star
const star = new Graphics();
star.beginFill(0xFFFDDD)
    .drawStar(900, 700, 5, 80)
    .endFill();
app.stage.addChild(star);

// ############### Text #################
const style = new PIXI.TextStyle({
    fontFamily: "Montserrat",
    fontSize: 480,
    fill: "deepskyblue",
    stroke: "#ffffff",
    strokeThickness: 4,
    dropShadow: true,
    dropShadowDistance: 10,
    dropShadowBlur: 4,
    dropShadowColor: "#000000"
    

});
const myText = new PIXI.Text("Sosat", style);

app.stage.addChild(myText);


/*app.UseCors(builder => builder)
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader();*/


/*const car1Texture = PIXI.Texture.from("./images/car1.png");
const car1Sprite = new PIXI.Sprite(car1Texture);*/


// const car1Sprite = new PIXI.Sprite.from(url1);
// app.stage.addChild(car1Sprite);
// const url3 = "http://localhost:8000/road.png"
// const url2 = "http://localhost:8000/car1.png"
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

let buttonUp = 1;
let buttonRight = 1;

// app.ticker.add(delta => loop(delta));

// function loop(delta) {
//     car1Sprite.x += 1 * delta;
//     // car1Sprite.x += 1;
//     // car1Sprite.rotation += 0.01;
// }

// Interactive
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

// document.addEventListener("keyup", function(e) {
//     const distance = 10;
//     if(e.key === "ArrowRight") {
//         car1Sprite.rotation += 0.05;  
//     };
//     if(e.key === "ArrowLeft")  { 
//         car1Sprite.x = car1Sprite.x - distance * Math.cos(car1Sprite.rotation);
//         car1Sprite.y = car1Sprite.y - distance * Math.sin(car1Sprite.rotation);
//     } ;
//     if(e.key === "ArrowDown"){
//         car1Sprite.rotation -= 0.05;
//     } ;
        
//     if(e.key === "ArrowUp")  {
//         buttonUp === 0;
//         // car1Sprite.rotation += 0.05;  
//         // car1Sprite.x = car1Sprite.x + distance * Math.cos(car1Sprite.rotation);
//         // car1Sprite.y = car1Sprite.y + distance * Math.sin(car1Sprite.rotation);
//     } ;

// });

// document.addEventListener("keydown", function(e) {
//     const distance = 10;
//     if(e.key === "ArrowRight") {
//         car1Sprite.rotation += 0.05;  
//     };
//     if(e.key === "ArrowLeft")  { 
//         car1Sprite.rotation -= 0.05;
//     } ;
//     if(e.key === "ArrowDown"){

//         car1Sprite.x = car1Sprite.x - distance * Math.cos(car1Sprite.rotation);
//         car1Sprite.y = car1Sprite.y - distance * Math.sin(car1Sprite.rotation);
//     } ;
        
//     if(e.key === "ArrowUp")  {
//         // buttonUp === 1;
//         // car1Sprite.rotation += 0.05;  
//         car1Sprite.x = car1Sprite.x + distance * Math.cos(car1Sprite.rotation);
//         car1Sprite.y = car1Sprite.y + distance * Math.sin(car1Sprite.rotation);
//     } ;

// });
var speed = 0;  
const acceleration = 0.2;
const maxspeed = 6;
const maneuverability = 0.09;
var rotation = 0;
var max_rotation_speed = 0.009;
const friction = 0.99;

// Single keys

document.addEventListener("keydown", function(e) {

    // if(e.key === "ArrowRight" ) {
    //     rotation += maneuverability;  
    // };

    // if(e.key === "ArrowLeft" )  { 
    //     rotation -= maneuverability;
    // } ;

    if(e.key === "ArrowUp" && speed <= maxspeed){
        speed += acceleration;
    } ;
        
    if(e.key === "ArrowDown" && speed >= -maxspeed)  {
        speed -= acceleration;
    } ;

});


// Multiple keys

// let keysPressed = {};

let forwardDown = 0.0;
let rightDown = 0.0;

document.addEventListener('keydown', (event) => {
//    keysPressed[event.key] = true;
   if (event.key == "ArrowUp") {
    forwardDown = 1;
    // console.log("keydown");
   }

   if (event.key == "ArrowRight") {
    rightDown = 1;
    // console.log("keydown");
   }

   if (event.key == "ArrowDown") {
    forwardDown = -1;
    // console.log("keydown");
   }

   if (event.key == "ArrowLeft") {
    rightDown = -1;
    // console.log("keydown");
   }


});

document.addEventListener('keyup', (event) => {
    // delete this.keysPressed[event.key];
    if (event.key == "ArrowUp") {
        // console.log("keyup");
        forwardDown = 0;
    }

    if (event.key == "ArrowRight") {
        // console.log("keyup");
        rightDown = 0;
    }

    if (event.key == "ArrowDown") {
        forwardDown = 0;
        // console.log("keydown");
       }
    
       if (event.key == "ArrowLeft") {
        rightDown = 0;
        // console.log("keydown");
       }
 });

// document.addEventListener('keydown', (event) => {
//     keysPressed[event.key] = true;
 
//     // if (keysPressed['ArrowUp'] && event.key == 'ArrowLeft') {
//     //     speed += acceleration;
//     //     rotation -= maneuverability;
//     // }

//     // if (keysPressed['ArrowUp'] && event.key == 'ArrowRight') {
//     //     speed += acceleration;
//     //     rotation += maneuverability;
//     // }
//     // if (keysPressed['ArrowDown'] && event.key == 'ArrowLeft') {
//     //     speed -= acceleration;
//     //     rotation += maneuverability;
//     // }
//     // if (keysPressed['ArrowDown'] && event.key == 'ArrowRight') {
//     //     speed -= acceleration;
//     //     rotation -= maneuverability;
//     // }

//  });
 
//  document.addEventListener('keyup', (event) => {
//     delete keysPressed[event.key];
//  });


//  Animation loop

app.ticker.add(delta => loop(delta));

function loop(delta) {

    speed+=delta*acceleration*forwardDown;
    rotation += maneuverability*delta*rightDown*speed;      

    car1Sprite.x = car1Sprite.x + delta*speed * Math.cos(car1Sprite.rotation);
    car1Sprite.y = car1Sprite.y + delta*speed * Math.sin(car1Sprite.rotation);
    speed=friction*speed;
    rotation=friction*rotation;
    if(rotation <= max_rotation_speed && rotation >= -max_rotation_speed){
        car1Sprite.rotation += delta*rotation;
    } else if  (rotation < -max_rotation_speed){
        car1Sprite.rotation -= delta*max_rotation_speed;
    } else if (rotation > max_rotation_speed){
        car1Sprite.rotation += delta*max_rotation_speed;
    }
};