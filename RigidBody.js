class RigidBody {
    showLine = false;
    showCollisionPoint = true;
    friction = 0.95;

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
        this.collision_p = new Graphics();

        app.ticker.add(this.animate);
    }
    
    // List of all RigidBody type elements
    static allRigidBodies = []
    static max_rotation_speed = 0.1;

    spawn(x, y) {
        app.stage.addChild(this.sprite);
        this.sprite.x = x;
        this.sprite.y = y;
        (RigidBody.allRigidBodies).push(this);
    }

    update(delta) {
        this.sprite.x += this.vel_x * delta;
        this.sprite.y += this.vel_y * delta;
        if  (this.ang_vel < -RigidBody.max_rotation_speed){
            this.ang_vel = -RigidBody.max_rotation_speed;
        } else if (this.ang_vel > RigidBody.max_rotation_speed){
            this.ang_vel = +RigidBody.max_rotation_speed;
        }
        this.sprite.rotation += this.ang_vel * delta; 

        this.vel_x = this.friction * this.vel_x;
        this.vel_y = this.friction * this.vel_y;
        this.ang_vel = this.friction * this.ang_vel;
    
        app.stage.removeChild(this.line_v)
        if (this.showLine) {
            this.line_v = new Graphics;
            this.line_v.lineStyle(5, 0xFFEA00, 1).moveTo(this.sprite.x, this.sprite.y)
                .lineTo(this.sprite.x + 100*this.vel_x, this.sprite.y + 100*this.vel_y);
            app.stage.addChild(this.line_v)
        }
    }

    getAbsoluteVelocity() {
        return Math.sqrt(this.vel_x * this.vel_x + this.vel_y * this.vel_y)
    }

    animate(delta) {
        for (var i = 0; i < RigidBody.allRigidBodies.length; i++) {
            RigidBody.allRigidBodies[i].update(delta);
        }
        // Collision point
        app.stage.removeChild(this.collision_p);
        for (var i = 0; i < RigidBody.allRigidBodies.length-1; i++) {
            for (var j = i+1; j < RigidBody.allRigidBodies.length; j++) {
                if (RigidBody.allRigidBodies[i].rectsIntersect(RigidBody.allRigidBodies[i].sprite, RigidBody.allRigidBodies[j].sprite)) {
                    RigidBody.allRigidBodies[i].collisionVector(RigidBody.allRigidBodies[i], RigidBody.allRigidBodies[j]);
                    
                    // Count when the player collides for voronoi
                    if (RigidBody.allRigidBodies[i] == RigidBody.allRigidBodies[0]){
                        collision_count += 1;
                    }
                    console.log(this.showCollisionPoint);
                    if (this.showCollisionPoint){
                        this.collision_p = new Graphics;
                        this.collision_p.beginFill(0x000000).drawCircle((RigidBody.allRigidBodies[i].sprite.x + RigidBody.allRigidBodies[j].sprite.x)/2, (RigidBody.allRigidBodies[i].sprite.y + RigidBody.allRigidBodies[j].sprite.y)/2, 20).endFill();
                        console.log((RigidBody.allRigidBodies[i].sprite.x + RigidBody.allRigidBodies[j].sprite.x)/2, RigidBody.allRigidBodies[i].sprite.y + RigidBody.allRigidBodies[j].sprite.y )
                        app.stage.addChild(this.collision_p);
                    }
                }
            }
        }
    }

    // Simple intersection check
    rectsIntersect(a, b) {
        let ab = a.getBounds(); // Returns the framing rectangle of the circle as a Rectangle object
        let bb = b.getBounds();

        return ab.x + ab.width > bb.x &&
            ab.x < bb.x + bb.width &&
            ab.y + ab.height > bb.y &&
            ab.y < bb.y + bb.height;
    }

    // Collision interaction with impulse ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    collisionVector(obj1, obj2) {
        let vCollision = {x: obj2.sprite.x - obj1.sprite.x, y: obj2.sprite.y - obj1.sprite.y};
        let collision_point = [vCollision[0]/2, vCollision[1]/2];
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
}