
// Generate random number in range (min, max)
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

// Generate seed points
function SeedPoints(num_points){
    let points = [];
    for (let i = 0; i < num_points; i++){
        x = getRandomArbitrary(0, player_width);
        y = getRandomArbitrary(0, player_height);
        points.push([x,y]);}
    return points;
    };

/* calculate distance between (x1, y1) and (x2, y2) */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/*
* Find two closest seed points to pixel x.
*/
function findClosest(x, y, seed_points){
    
    let distances = [];
    let distances2 = [];

    for (let p = 0; p < seed_points.length; p++){
        let d = distance(x, y, seed_points[p][0], seed_points[p][1]);
        distances.push(d);
        distances2.push(d);
    }

    distances.sort(function(a, b){return a - b}); 
    let closest_idx = [distances2.indexOf(distances[0]), distances2.indexOf(distances[1])];
    let p1 = [seed_points[closest_idx[0]][0], seed_points[closest_idx[0]][1]];
    let p2 = [seed_points[closest_idx[1]][0], seed_points[closest_idx[1]][1]];
    let closest_coords = [p1, p2];
    return closest_coords
}

/*
* Compute distance of pixel to the voronoi edge of two closest seed points. 
*/
function computeD(closest_points_coords, x, y){
    let p1 = closest_points_coords[0];
    let p2 = closest_points_coords[1];
    let m = [(p2[0]+p1[0])/2, (p2[1]+p1[1])/2];
    let result = [x-m[0],y-m[1]];
    let l_x = (p1[0]-p2[0])/Math.abs(p1[0]-p2[0]);
    let l_y = (p1[1]-p2[1])/Math.abs(p1[1]-p2[1]);
    let l = [l_x, l_y];
    let D = Math.abs(result[0]*l[0] + result[1]*l[1]);
    return D;
}

// Get dims of an array
function getDimensions(array){
    const dimensions = [
        array.length,
        array.reduce((x, y) => Math.max(x, y.length), 0)
    ];
    return dimensions;
}

// Create a mask of sectors
function drawVoronoiCell(seed_point, seed_points, color){
    for (let i = 0; i < player_width; i++) {
        for (let j = 0; j < player_height; j++){
            var closest_coords = findClosest(i, j, seed_points);
            if (seed_point[0]==closest_coords[0][0] && seed_point[1]==closest_coords[0][1]){

                // Get index of a point and add it to mask array
                let point_indx = seed_points.indexOf(seed_point);
                mask_sectors[i][j] = point_indx;

                // Compute D
                var D = -1 * computeD(closest_coords, i, j);
                // Draw cell

            //     let point_vor = new PIXI.Graphics();
            //     point_vor.beginFill(color).drawCircle(i, j, 2).endFill();
            //     app.stage.addChild(point_vor);


            } else if (seed_point[0]==closest_coords[1][0] && seed_point[1]==closest_coords[1][1]){
                // Compute D
                var D = computeD(closest_coords, i, j); 
                

            } else {
                // Return background pixel
                var D = 0;

            }
        }
    }
}

// Create an array-mask representing sectors
function createMaskSectors(seed_points){
    for (let i = 0; i < seed_points.length; i++){
            drawVoronoiCell(seed_points[i], seed_points, Math.abs(getRandomArbitrary(100000, 999999)));
            };
        return mask_sectors;
        }

// Create Edge Array
function createEdgeArray(mask_sectors){
    const dimensions = [
        mask_sectors.length,
        mask_sectors.reduce((x, y) => Math.max(x, y.length), 0)
    ];
    var edges = [...Array(dimensions[0])].map(e => Array(dimensions[1]).fill(0));
    for (let i = 0; i < dimensions[0]-1; i++){
        for(let j = 0; j < dimensions[1]-1; j++){
            if ((mask_sectors[i][j]-mask_sectors[i+1][j] != 0) || (mask_sectors[i][j]-mask_sectors[i][j+1] != 0)){
                edges[i][j] = 1;
            }
        }
    }
    return edges
}

// Display points
function drawSeedPoints(seed_points, container){
    for (let i = 0; i < seed_points.length; i++){
    
        p = new PIXI.Graphics();
        p.beginFill(0x00FF00).drawCircle(seed_points[i][0], seed_points[i][1], 1).endFill();
        // app.stage.addChild(p);
        container.addChild(p);
        };
    }

// Display edges
function displayEdges(edges, container){
    for (let i = 0; i < getDimensions(edges)[0]; i++){
        for (let j = 0; j < getDimensions(edges)[1]; j++){
            if (edges[i][j] == 1){
                    let point_edge = new PIXI.Graphics();
                    point_edge.beginFill(0x261300).drawCircle(i, j, 1).endFill();
                    // app.stage.addChild(point_edge);
                    container.addChild(point_edge);
                    
            }
        }
    }
}

function drawAllVoronoiCells(mask_sectors, current_container){
    for (let i = 0; i < getDimensions(mask_sectors)[0]; i++){
        for (let j = 0; j < getDimensions(mask_sectors)[1]; j++){
            for (let p = 0; p<seed_points.length; p++){
                if (mask_sectors[i][j] == p) {
                let sector_point = new PIXI.Graphics();
                sector_point.beginFill(p*100000).drawCircle(i, j, 2).endFill();
                current_container.addChild(sector_point);
                }   
            }
        }
    }
}

