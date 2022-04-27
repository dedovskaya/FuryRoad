// //Rectangle
// const rectangle = new Graphics();
// rectangle.beginFill(0xAA33BB)
// .lineStyle(4, 0xFFEA00, 1)
// .drawRect(200, 200, 100, 120) //coord, coord, wid, hei
//     .endFill();

// app.stage.addChild(rectangle); // like layer in PS 

// //Polygon
// const poly = new Graphics();
// poly.beginFill(0xFF66FF)
//     .lineStyle(5, 0xFFEA00, 1)
//     .drawPolygon([
//         800, 50,
//         850, 100,
//         820, 120,
//         820, 350,
//         750, 350,
//         750, 120,
//         720, 100,
//         770, 50
//     ])
//     .endFill();

// app.stage.addChild(poly);

// //Circle1
// const circle = new Graphics();
// circle.beginFill(0x22AACC)
//     .lineStyle(5, 0xFFEA00, 1)
//     .drawCircle(850, 350, 70)
//     .endFill();
// app.stage.addChild(circle);
// // circle2
// const circle1 = new Graphics();
// circle1.beginFill(0x22AACC)
//     .lineStyle(5, 0xFFEA00, 1)
//     .drawCircle(720, 350, 70)
//     .endFill();
// app.stage.addChild(circle1);

// // Line
// const line = new Graphics();
// line.lineStyle(5, 0xFFEA00, 1)
//     .moveTo(790, 50)
//     .lineTo(790, 100);
// app.stage.addChild(line);

// // Torus
// const torus = new Graphics();
// torus.beginFill(0xFFFDDD)
//     .drawTorus(100, 700, 80, 100, 0, Math.PI*0.75)
//     .endFill();
// app.stage.addChild(torus);

// // Star
// const star = new Graphics();
// star.beginFill(0xFFFDDD)
//     .drawStar(900, 700, 5, 80)
//     .endFill();
// app.stage.addChild(star);

// // ############### Text #################
// const style = new PIXI.TextStyle({
//     fontFamily: "Montserrat",
//     fontSize: 480,
//     fill: "deepskyblue",
//     stroke: "#ffffff",
//     strokeThickness: 4,
//     dropShadow: true,
//     dropShadowDistance: 10,
//     dropShadowBlur: 4,
//     dropShadowColor: "#000000"
    

// });
// const myText = new PIXI.Text("Sosat", style);

// app.stage.addChild(myText);