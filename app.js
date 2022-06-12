// Application set ///////////////////////////////////////////////////////////////////////////////////////////////////////////
const Application = PIXI.Application;

const app = new Application({
    width: 1280,
    height: 720,
    transparent: false,
    antialias: true
});

app.renderer.backgroundColor = 0x23395D;
app.renderer.resize(1280, 720);
app.renderer.view.style.position = "absolute";
app.renderer.view.style.top = 0;
document.querySelector("#game").appendChild(app.view);

const Graphics = PIXI.Graphics;

// Background
const url2 = "./images/background-main.png"
const BackgroundSprite = new PIXI.Sprite.from(url2);
app.stage.addChild(BackgroundSprite);
BackgroundSprite.width = app.renderer.width;
BackgroundSprite.height = app.renderer.height;

document.addEventListener('click', (e => {
    console.log(e);
}))


// Player
let player = new RigidBody("./images/car1.png", 1.0, 1.0, 1.0, 10);
player.sprite.scale.set(0.125, 0.125);
player.sprite.rotation = Math.PI / 2;
player.spawn(1052, 351);

input = new InputReader(player);

// Obstacles
let gasStation = new RigidBody("./images/gas-station.png", 1000000, 1, 1, 1);
gasStation.sprite.scale.set(0.15, 0.15);
gasStation.spawn(234, 563);

let building = new RigidBody("./images/structure-1.png", 500000, 1, 1, 1);
building.sprite.scale.set(0.15, 0.15);
building.spawn(949, 179);

let barrel = new RigidBody("./images/barrel.png", 0.5, 10, 10, 100);
barrel.sprite.scale.set(0.0625, 0.0625);
barrel.sprite.rotation = -Math.PI / 4;
barrel.spawn(436, 703);

let tire = new RigidBody("./images/tire.png", 10, 1, 1, 1);
tire.sprite.scale.set(0.0625, 0.0625);
tire.spawn(81, 231);

let stone = new RigidBody("./images/structure-2.png", 500, 1, 1, 1);
stone.sprite.scale.set(0.125, 0.125);
stone.spawn(840, 590);


// ########################################################################################################################
//  Voronoi
let player_width = 67; //539 initial size
let player_height = 24; // 192 initial size


// Add voronoi container 
var voronoiContainer = new PIXI.Container();
voronoiContainer.pivot.x = player_width/2;
voronoiContainer.pivot.y = player_height/2;

var current_container = voronoiContainer;
// Generate initial seed points
var seed_points = SeedPoints(4, voronoiContainer);


// Count collisions for voronoi
var collision_count = 0;
var mask_sectors;
var edges;

let showSeedPoints = false;
let showCellDistanceFields = false;

function voronoiFracture(container, seed_points){
    // Mask array with all sectors
    mask_sectors = [...Array(player_width)].map(e => Array(player_height).fill(0));

    // Create an array-mask representing sectors
    mask_sectors = createMaskSectors(seed_points);

    // Create Edge Array
    edges = createEdgeArray(mask_sectors);

    // Display edges
    displayEdges(edges, container);
}

let seed_points_1 = [...seed_points];
voronoiFracture(voronoiContainer, seed_points);
var mask_sectors_1 = mask_sectors;

// 2d stage of voronoi
var new_seed_points_2 = SeedPoints(3, voronoiContainer);

seed_points.push(new_seed_points_2[0]);
seed_points.push(new_seed_points_2[1]);
seed_points.push(new_seed_points_2[2]);

var voronoiContainer2 = new PIXI.Container();
voronoiContainer2.pivot.x = player_width/2;
voronoiContainer2.pivot.y = player_height/2;

let seed_points_2 = [...seed_points];
voronoiFracture(voronoiContainer2, seed_points);
var mask_sectors_2 = mask_sectors;

// 3d stage of voronoi
var new_seed_points_3 = SeedPoints(3, voronoiContainer);

seed_points.push(new_seed_points_3[0]);
seed_points.push(new_seed_points_3[1]);
seed_points.push(new_seed_points_3[2]);

var voronoiContainer3 = new PIXI.Container();
voronoiContainer3.pivot.x = player_width/2;
voronoiContainer3.pivot.y = player_height/2;

let seed_points_3 = [...seed_points];
voronoiFracture(voronoiContainer3, seed_points);
var mask_sectors_3 = mask_sectors;




// ########################################################################################################################
// Main animation loop
const acceleration = 0.2;
let time = 0;
let passedPoints = [false, false, false, false, false, false];


function loop(delta) {
    if (divideDelta) {
        delta = delta / app.ticker.speed;
    }

    // Player control
    player.vel_x += delta * acceleration * input.forward *  Math.cos(player.sprite.rotation);
    player.vel_y += delta * acceleration * input.forward *  Math.sin(player.sprite.rotation);

    let sign = Math.sign(Math.sin(player.sprite.rotation) * player.vel_y + Math.cos(player.sprite.rotation) * player.vel_x);

    player.ang_vel += sign * delta * input.rightDown * 0.002 * player.getAbsoluteVelocity();

    // Display time
    time += app.ticker.elapsedMS;

    let minutes = parseInt(time / 60000);
    let seconds = parseInt((time - (minutes * 60000)) / 1000);
    let centiseconds = parseInt((time - (minutes * 60000) - (seconds * 1000)) / 10);
    let displayTime = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds) + ":" + (centiseconds < 10 ? "0" + centiseconds : centiseconds);
    document.querySelector('#elapsedTime').innerText = displayTime;

    // Voronoi container
    voronoiContainer.position.set(player.sprite.x,player.sprite.y);
    voronoiContainer.rotation = player.sprite.rotation;

    voronoiContainer2.position.set(player.sprite.x,player.sprite.y);
    voronoiContainer2.rotation = player.sprite.rotation;

    voronoiContainer3.position.set(player.sprite.x,player.sprite.y);
    voronoiContainer3.rotation = player.sprite.rotation;

    //  Display voronoi container if collided N times
    if (collision_count > 250 && collision_count < 500) {
        app.stage.addChild(voronoiContainer);
        current_container = voronoiContainer;
        mask_sectors = mask_sectors_1;

        // Display points
        if (showSeedPoints) {
            drawSeedPoints(seed_points_1, current_container);
        }

        if (showCellDistanceFields) {
            drawAllVoronoiCells(mask_sectors, current_container);
        }
    }
    if (collision_count > 500 && collision_count < 750) {
        app.stage.removeChild(voronoiContainer);
        app.stage.addChild(voronoiContainer2);
        current_container = voronoiContainer2;
        mask_sectors = mask_sectors_2;

        // Display points
        if (showSeedPoints) {
            drawSeedPoints(seed_points_2, current_container);
        }

        if (showCellDistanceFields) {
            drawAllVoronoiCells(mask_sectors, current_container);
        }
    }
    if (collision_count > 750) {
        app.stage.removeChild(voronoiContainer2);
        app.stage.addChild(voronoiContainer3);
        current_container = voronoiContainer3;
        mask_sectors = mask_sectors_3;
        
        // Display points
        if (showSeedPoints) {
            drawSeedPoints(seed_points_3, current_container);
        }

        if (showCellDistanceFields) {
            drawAllVoronoiCells(mask_sectors, current_container);
        }
    }
    if (collision_count > 1000) {
        // Game over
        document.querySelector('#endOverlay').addEventListener('transitionend', ((e) => {
            document.querySelector('#endTime').classList.add('show');
        }));

        document.querySelector('#endOverlay').classList.add('show');
        document.querySelector('#endTitle').innerText = 'FAILURE';
        document.querySelector('#endTime').innerText = 'Your car is destroyed.';
        
        app.ticker.stop();
    }

    // Lap logic
    if (player.sprite.x < 842 && player.sprite.y > 578) {
        passedPoints[0] = true;
    }
    if (passedPoints[0] && player.sprite.x < 202 && player.sprite.y > 570) {
        passedPoints[1] = true;
    }
    if (passedPoints[0] && passedPoints[1] && player.sprite.x > 267 && player.sprite.y < 338) {
        passedPoints[2] = true;
    }
    if (passedPoints[0] && passedPoints[1] && passedPoints[2] && player.sprite.x < 219 && player.sprite.y < 127) {
        passedPoints[3] = true;
    }
    if (passedPoints[0] && passedPoints[1] && passedPoints[2] && passedPoints[3] && player.sprite.x > 956 && player.sprite.y > 162) {
        passedPoints[4] = true;
    }
    if (passedPoints[0] && passedPoints[1] && passedPoints[2] && passedPoints[3] && passedPoints[4] && player.sprite.x > 1023 && player.sprite.y > 306 && player.sprite.x < 1085 && player.sprite.y < 350) {
        passedPoints[5] = true;
    }
    if (passedPoints.every(x => x)) {
        document.querySelector('#endOverlay').addEventListener('transitionend', ((e) => {
            document.querySelector('#endTime').classList.add('show');
        }));

        document.querySelector('#endOverlay').classList.add('show');
        document.querySelector('#endTitle').innerText = 'VICTORY';
        document.querySelector('#endTime').innerText = displayTime;
        
        app.ticker.stop();
    }

    // Train intersection logic
    if (rectsIntersect(player.sprite, train1) || rectsIntersect(player.sprite, train2)) {
        document.querySelector('#endOverlay').addEventListener('transitionend', ((e) => {
            document.querySelector('#endTime').classList.add('show');
        }));

        document.querySelector('#endOverlay').classList.add('show');
        document.querySelector('#endTitle').innerText = 'FAILURE';
        document.querySelector('#endTime').innerText = 'You have crashed.';
        
        app.ticker.stop();
    }
}
app.ticker.add(delta => loop(delta));

// Same as in RigidBody
// Used for detecting collisions with trains, as trains are not rigid bodies
function rectsIntersect(a, b) {
    let ab = a.getBounds();
    let bb = b.getBounds();

    return ab.x + ab.width > bb.x &&
        ab.x < bb.x + bb.width &&
        ab.y + ab.height > bb.y &&
        ab.y < bb.y + bb.height;
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
app.ticker.minFPS = 10;
let divideDelta = true;

document.querySelectorAll('input[name="updateRate"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        app.ticker.speed = parseFloat(e.currentTarget.value);
    }));
});

document.querySelectorAll('input[name="frameRate"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        app.ticker.maxFPS = parseInt(e.currentTarget.value);
    }));
});

document.querySelector('#updateRateSpeed').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        divideDelta = false;
    }
    else {
        divideDelta = true;
    }
}));

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

// Rigid body dynamics
document.querySelector('#rigidBodyMomentumVectors').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        RigidBody.allRigidBodies.forEach(element => {
            element.showLine = true;
        });
    }
    else {
        RigidBody.allRigidBodies.forEach(element => {
            element.showLine = false;
        });
    }
}));

document.querySelector('#rigidBodyCollisionPoints').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        RigidBody.allRigidBodies.forEach(element => {
            element.showCollisionPoint = true;
        });
    }
    else {
        RigidBody.allRigidBodies.forEach(element => {
            element.showCollisionPoint = false;
        });
    }
}));

// Motion blur
document.querySelectorAll('input[name="motionBlurTechnique"]').forEach(element => {
    element.addEventListener('change', ((e) => {
        motionBlur1.technique = e.currentTarget.value;
        motionBlur2.technique = e.currentTarget.value;
    }));
});

// Voronoi fracture
document.querySelector('#voronoiFractureSeedPoints').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        showSeedPoints = true;
    }
    else {
        showSeedPoints = false;
    }
}));

document.querySelector('#voronoiFractureCellDistanceFields').addEventListener('change', ((e) => {
    if (e.currentTarget.checked) {
        showCellDistanceFields = true;
    }
    else {
        showCellDistanceFields = false;
    }
}));