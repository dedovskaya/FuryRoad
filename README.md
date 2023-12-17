# Fury Road


## About the game

Fury Road is a JavaScript/PixiJS-based racing game where players navigate an aged racing circuit, complete with various-sized obstacles and intersecting circular railway lines featuring trains. Your objective is to skillfully maneuver the track, overcoming challenges, and complete the lap swiftly and in one intact piece.

<img src="https://github.com/dedovskaya/FuryRoad/assets/71874540/7e72458f-a9a2-4220-a469-57e0a4a4cf0e" width="800">

## Game over

The game concludes once your car successfully crosses the finish line to complete a lap. Upon finishing the lap, your total lap time is revealed. However, the game can also end prematurely if your car is destroyed due to a collision with a train or sustained damage from multiple collisions with obstacles on the racing track.

## Controls

| Action                | Command          |
|-----------------------|------------------|
| Accelerate            | ↑                |
| Brake                 | ↓                |
| Steer left            | ←                |
| Steer right           | →                |
| Pause/Resume game     | P                |
| Settings              | ESC              |

• Lap time is located in the upper right corner. It displays the elapsed time from the start of the lap.

• Chequered flag denotes the end of the lap.

## Launching the game

The game is designed for play in a web browser, preferably Mozilla Firefox, and necessitates the installation of Node.js. Testing has been conducted with Node.js version 16.14.0, available for download at https://nodejs.org/en/download/. Compatibility with other Node.js versions has not been verified and may be uncertain.

To install the essential packages, navigate to the root directory housing the game source code (where server.js is located) and execute npm install. Once the packages are installed, initiate a local server by running node server.js in the same directory. The game can then be accessed at http://localhost:8080.




# Technical Details

## General Settings

**Maximum Frame Rate**: Limits the maximum frames rendered per second, adjustable to 30 or 60.

**Animation Update Rate**: Defines the time factor between two frame updates.

**Link Animation Update Rate and Animation Speed**: Enables or disables the reflection of animation update rate in animation speed.
Path Interpolation
The game employs a circular **Catmull-Rom spline** for the train's movement. Path interpolation is handled in the PathInterpol.js script, utilizing control points and an arc length table. The traversal speed and animation update rate can be adjusted in settings.

## Rigid Body Dynamics
Objects on the racing track, such as stones and buildings, react to collisions. Rigid Body is implemented in RigidBody.js, featuring collision detection, vector calculations, and conservation laws. Visualization of momentum vectors and collision points is available in settings.

## Motion Blur
Implemented in MotionBlur.js, the game features post-processing and supersampling motion blur to simulate fast-moving objects. Motion blur is always visible, and settings allow switching between post-processing and supersampling.

## Voronoi Fracture
The game introduces solid objects, and collisions trigger Voronoi fracture. Multiple stages of fracture represent shattering, with a "game over" condition at the fourth stage. Settings enable the visualization of seed points and cell fields.

By toggling settings in the menu, you can customize the visualization of various elements in the game.
