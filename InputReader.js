// Keys ///////////////////////////////////////////////////////////////////////////////////////////////////////////

class InputReader {   
    constructor(player){
        this.player = player;

        this.forward = 0.0;
        this.forwardDown = 0.0;
        this.rightDown = 0.0;
        this.Ctrl = 0.0

        document.addEventListener('keydown', (event) => {
            

            if (event.key == "ArrowUp") {
                this.forwardDown = 1;
            }
         
            if (event.key == "ArrowRight") {
                this.rightDown = 1;
            }
         
            if (event.key == "ArrowDown") {
                this.forwardDown = -1;
            }
         
            if (event.key == "ArrowLeft") {
                this.rightDown = -1;
            }
            if(event.key === "ArrowUp" && this.player.vel_x <= this.player.max_velocity){
                this.forward = 1;
             } ;
             
             if(event.key === "ArrowDown" && this.player.vel_x >= -this.player.max_velocity)  {
                this.forward = -1;
             } ;
         });

         this.paused = false;

         document.addEventListener('keyup', (event) => {
            if (event.key == "ArrowUp") {
                this.forwardDown = 0;
            }
        
            if (event.key == "ArrowRight") {
                this.rightDown = 0;
            }
        
            if (event.key == "ArrowDown") {
                this.forwardDown = 0;
            }
            
            if (event.key == "ArrowLeft") {
                this.rightDown = 0;
            }
        
            if (event.key == "p") {
                if (!this.paused) {
                    app.ticker.stop();
                    this.paused = true;
                }
                else {
                    app.ticker.start();
                    this.paused = false;
                }
            }
               
            if(event.key === "ArrowUp"){
                this.forward = 0;
            } ;
                
            if(event.key === "ArrowDown")  {
                this.forward = 0;
            } ;
         });
    }
}
