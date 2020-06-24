// Generic object that will take a ghost shape
// from my matter.js wrapper, but will crucially
// have its own renderer.

// Perhaps a member constant should be type of
// matter.js body to take on -- held as a string
// for transparency of code.

// But the key thing will be the renderer method.
// Looking forward, perhaps also a means of connecting
// kinematic 'satellite' bodies. Ai brain too?


// _shape: "GhostCircle", "GhostRectangle", "GhostBox".
class GhostO {
    constructor(_x, _y, _width, _height, _shape){
        // Now, get a matter.js body.
        RedHen_2DPhysics.newObj
        (_shape, _x, _y, _width/4, _height/4);
        // Grab a handle on the matter.js body.
        this.myBod = 
        RedHen_2DPhysics.lastObjectCreated();
        
        // Label him 'boo' and switch off OSR.
        RedHen_2DPhysics.lastObjectCreated().OSR = false;
        RedHen_2DPhysics.lastObjectCreated().bod.label = 'boo';
        
        this.width = _width;
        this.height = _height;
        
        // These for tracking movement relative to
        // the infinite terrain. oX = origin, which
        // is reset each time this movement
        // tracked to set measure (which then asks
        // for more terrain to be generated).
        this.trackX = 0; // Movement relative to oX.
        this.oX = this.myBod.bod.position.x;
    }
    
    render(){
    }
    
    think(){   
    }
    
}

class SpaceBuddha extends GhostO{
    constructor(_x, _y, _radius){
        super(_x, _y, _radius*2, _radius*2, "GhostCircle");
        
        // Maximum velocity.
        this.maxV = 14;
        
        // Array of high airFriction 'bubbles'.
        this.bubbles = [];
        this.bubblesON = false;
        this.minB = 4;      // Min bubble size.
        this.maxB = 12;     // Max bubble size.
        this.oldestBubble = 0;
        this.setupBubblePool(111);
    }
    
    render(){
        push();
        fill(255,72);
        stroke(0,255);
        strokeWeight(2);
        translate(  this.myBod.bod.position.x,
                    this.myBod.bod.position.y);
        
        rotate(this.myBod.bod.angle);
        
        ellipse(0,0,this.width);
        
        //Light spot.
        fill(255,100);
        strokeWeight(1);
        stroke(255,255);
        ellipse(-this.width/5, -this.width/4, this.width/8);
        pop();
    }
    
    // Sets frictionAir according to altitude (i.e.)
    // whether underwater.
    hitWaterCheck(){
        if (this.getAltitude() < 0) { 
            if (this.myBod.bod.frictionAir !== 0.5)
            //robot.speak("PLOP");
            this.myBod.bod.frictionAir = 0.5;}
        
    else this.myBod.bod.frictionAir = 0.01;
    }
    
    // Relative to seaLevel.
    getAltitude(){
        return -(Math.round(this.myBod.bod.position.y)-height*2);
    }
    
    spawnBubbles(){
        if (this.bubblesON===false) return;
        // Where do we want bubbles to spawn?
        let _x = this.myBod.bod.position.x + 
        Math.random()*this.width*2 - this.width +
            this.myBod.bod.velocity.x * 20;
        let _y = this.myBod.bod.position.y + 
        this.height*2 + Math.random()*this.width*2 -
            this.width -
            Math.abs(this.myBod.bod.velocity.x);
        
        // First, grab an available droplet.
        // If none available, then just grab...which one?
        if (this.findSleeping()!=null){
            let i = this.findSleeping();
            this.bubbles[i].makePosition(_x,_y);
            this.bubbles[i].makeSleep(false);
            return;
        }
        else {
            // Find 'oldest' droplet and grab him :)
            let i = this.oldestBubble;
            this.oldestBubble++;
            if (this.oldestBubble > this.bubbles.length-1){
                this.oldestBubble = 0;
            }
        // Move into position and wake up.    
        this.bubbles[i].makePosition(_x,_y);
        this.bubbles[i].makeSleep(false);
        }
    }
    
    // Create a pool of bubbles with matter.js.
    setupBubblePool(_numBubbles){
        let numObjs = _numBubbles;
    
        for (let i = 0; i < numObjs; i++){
            this.createBubble
            (-99,-99, Math.random()*
             (this.maxB-this.minB)+this.minB);
            // Grab this object.
            this.bubbles[i] = RedHen_2DPhysics.
            lastObjectCreated();
            // Time to sleep.
            RedHen_2DPhysics.lastObjectCreated().
            makeSleep(true);
        }
        
    }
    
    findSleeping(){
        let morpheus = null;
    
        for (let i = 0; i < this.bubbles.length; i++){
            if(this.bubbles[i].bod.isSleeping){
                morpheus = i;
                break;
            } else morpheus = null;
        }
    
        return morpheus;
    }
    
    createBubble(_x,_y,_sz){
        RedHen_2DPhysics.newObj("circle", _x, _y, _sz);

        RedHen_2DPhysics.lastObjectCreated().OSR = false;
        RedHen_2DPhysics.lastObjectCreated().fill = 
        color(100,100,255,Math.random()*100+69);
        RedHen_2DPhysics.lastObjectCreated().
        stroke = color(0);
        RedHen_2DPhysics.lastObjectCreated().
        strokeWeight = 3;
        //RedHen_2DPhysics.lastObjectCreated().
        //makeMass(10);
        RedHen_2DPhysics.
        lastObjectCreated().bod.restitution = 0.9;
        RedHen_2DPhysics.
        lastObjectCreated().bod.frictionAir = 0.9;
    }
    
    speedLimit(_xORy){
        if (_xORy==='x'){
        if (Math.abs(this.myBod.bod.velocity.x)
            >= this.maxV)
            {
                return true;
            }
            else return false;
        }
        else if (_xORy==='y'){
            if (Math.abs(this.myBod.bod.velocity.y)
            >= this.maxV)
            {
                return true;
            }
            else return false;
        }
    }
    
    // _WD is 'which direction'.
    // To touch swipe can pass into this too from
    // main .js file.
    control(_WD){
        let xF = 0.01;
        let yF = 0.004;
        
        if (this.speedLimit('x')){
            xF = 0;
        }
        if (this.speedLimit('y')){
            yF = 0;
        }
       
        if (_WD === 'UP' || keyIsDown(UP_ARROW)){
            let force = createVector(0,-yF);
            this.myBod.addForce(force);
        }
         if (_WD === 'DOWN' || keyIsDown(DOWN_ARROW)){
            let force = createVector(0,yF);
            this.myBod.addForce(force);
        }
         if (_WD === 'LEFT' || keyIsDown(LEFT_ARROW)){
            let force = createVector(-xF,0);
            this.myBod.addForce(force);
        }
         if (_WD === 'RIGHT' || keyIsDown(RIGHT_ARROW)){
            let force = createVector(xF,0);
            this.myBod.addForce(force);
        }
    }
}

class Pac extends SpaceBuddha{
    constructor(_x, _y, _rad){
        super(_x, _y, _rad);
        
        // Pac gape.
        // render function changes.
        this.gape = 12;
        this.rotation = false;
    }
    
    render(){
        push();
        fill(255,255,0);
        stroke(0,255);
        strokeWeight(4);
        translate(  this.myBod.bod.position.x,
                    this.myBod.bod.position.y);
       
      if (this.rotation)
       rotate(this.myBod.bod.angle);
      else rotate(0);
        
        //ellipse(0,0,this.width);
//        arc(0,0,this.width,this.width*1.01, 
//           radians(15),
//           radians(-15),
//           PIE);
        
        this.gape +=
        Math.sin(frameCount/6)*3
      if (this.gape < 0)
        this.gape = 0;
      if (this.gape > 64)
        this.gape = 64;
 
        // Only change orientation if
        // rotation off.
        let orientation = 0;
        if (!this.rotation && this.myBod.bod.velocity.x < -0.01
           && Math.abs(this.myBod.bod.velocity.x) > 0.3){
            orientation = PI;
        }
        
        
      // Pac-mouth.
      arc(0,0,this.width, this.width, radians(this.gape)-orientation, radians(-this.gape)-orientation,PIE);
        
        // Eye.
        fill(0);
        strokeWeight(2);
        stroke(255);
        ellipse(0, -this.width/4, this.width/4);
        pop();
    }
    
}
