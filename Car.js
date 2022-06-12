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
        app.stage.addChild(this.sprite);
        this.sprite.x = x;
        this.sprite.y = y;
        (Car.allCars).push(this)
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