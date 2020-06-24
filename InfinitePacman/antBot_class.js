// Example object designed to work in
// conjunction with the RedHen_2DPhysics
// matter.js wrapper class.

// Presently, I'm tempted to keep the
// option to be able to instantiate an
// antBot that has no matter.js body,
// but has a simple Euler physics system.

// Question is, then, whether to extend
// one of these from the other?
// Or: just have the Euler-antBot as an
// additional feature; it might be a 
// handy 'ghost mode' or something.
// One design issue, here, though, is that
// if we instantiate without a matter-bod,
// then we can't (at time of writing)
// simply turn it on; also, turning off
// the matter-bod and calculating pos
// according to Euler not possible without
// carefully co-ordinating static/sleeping
// mode of matter-bod.

// Blinkie object.
// antBot object.
// Do you want to give it a matter.js body?

// Utility class: input and other...things.
// Input methods will work by passing in an
// index to the antBot you want to control.

// Array of antBot objects, so as to be
// handled by the class itself.
var RH_ants = [];
// Index of antBot under user control.
var controlAnt_index = 0;

class RedHen_antBot {
    
    // Designed to work with p5's keyTyped().
    static scaleAntInput(_key){
        if (_key==='='){
            RH_ants[controlAnt_index].incScale(0.1);
        }
        if (_key==='-' && RH_ants[controlAnt_index].scale >= 1){
            RH_ants[controlAnt_index].incScale(-0.1);
        }
    }
    
    static returnLastAntCreated(){
        return RH_ants[RH_ants.length-1];
    }
    
    // Checks for p5's 'keyIsDown'.
    static controlAntInput(){
        // First, check if keyTyped()...
        this.scaleAntInput(key);
        
        let forceAmount = 0;
        if (keyIsDown(UP_ARROW)) { 
            //setGravity(0,-1);
            if (myWorld.gravity.y > 0){
                forceAmount = 2;
            }
            else {forceAmount = 2;}
            //else {forceAmount = 0.3;}
            
            RH_ants[controlAnt_index].moveForward (forceAmount);
        }
        if (keyIsDown(DOWN_ARROW)){
            //setGravity(0,-1);
            if (myWorld.gravity.y > 0){
                forceAmount = 2;
        }
            //else {forceAmount = 0.3;}
            else {forceAmount = 2;}
            RH_ants[controlAnt_index].moveForward(-forceAmount);
        }
        if (keyIsDown(RIGHT_ARROW)) {
       // setGravity(1,0);
        RH_ants[controlAnt_index].steer(1);
            
            
        }
        if (keyIsDown(LEFT_ARROW)) {
       // setGravity(-1,0);
        RH_ants[controlAnt_index].steer(-1);
        }
    }
   
    
} // End of antBot utility class.


// antBot object.
class antBot {
    constructor (_hasMatterBod, _x, _y, _scale, _hasBrain){
    
    // Do we have a matter.js physics body?
    this.hasBod = _hasMatterBod;
    this.hasBrain = _hasBrain;
        
    // My dimensions.
    this.mass = 1;
    this.radius = 10;
    // Diameter.
    this.dm = this.radius*2;
    this.scale = _scale;
    
    // My locomotive attributes.
    this.hopForce = createVector(0,-1*(this.scale/42));
    this.steerAmount = 0.04;
    this.angularSpeedLimit = 0.4;
        
    if (this.hasBrain){
        this.brain = new antBrain(this);
    } else this.brain = null;
        
    // My physics.
    // If we have no pos parameters, then
    // position antBot in centre of screen.
    if (_x == null || _y == null){
        _x = width/2;
        _y = height/2;
    }
    this.pos = createVector(_x, _y);
    // If attached to matter.js body, request one here!
    if (this.hasBod===true){
        // NB This instantiation of
        // a matter-bod works with
        // the RedHen_2DPhysics class.
        RedHen_2DPhysics.newObj ("GhostRectangle", _x, _y, this.dm*this.scale,this.dm*this.scale*0.618);
        // Switch off auto remove if
        // off-screen (OSR), since this can
        // cause mis-match between 
        // ants and bods arrays.
        // Instead, antBot class should
        // handle event of ant going
        // off screen.
        bods[bods.length-1].OSR = false;
        // Get an id so we know which physics body's position
        // to use to draw our antBot!
        this.bodID = bods.length-1;   
        // *** OR just grab this matter.js body now?!
        this.myBod = bods[this.bodID];
        // Apply mass according to scale (don't let matter.js).
        //this.myBod.bod.mass = this.scale;
    }else{
        // Euler antBot.
        this.vel = createVector();
        this.acc = createVector();
        this.dec = 0.7; // Friction/air resistance.
    }
    
    // Generates a random appearance for
    // antBot. Also calls applyScale()
    // in order to correct for scale.
    this.mutate();
    }
    
    
    // Methods. ***
    
    mutate(){
    // The idea is that each antBot is unique.
    // An antBot will have an individual colour,
    // size of eyes, size of pupils, position of pupils, and position of aerial.
    // How many 'variable character components' is that? 5.
    // Each of these VCCs will need a maximum deviation, whose
    // units will always be a value between 0 and 1 -- in terms of
    // distance or size from maximum value allowed.
    
    // Colour, first, is either 2 combined hues or 1 alone.
    // Second, a selection of 1 of the 6 combinations.
    let oneOfSix = Math.floor(Math.random()*5) + 1;
    var myC;
    let thisC = 'hello';
    if (oneOfSix == 1) thisC = 'red';
    if (oneOfSix == 2) thisC = 'green';
    if (oneOfSix == 3) thisC = 'blue';
    if (oneOfSix == 4) thisC = 'red and blue';
    if (oneOfSix == 5) thisC = 'red and green';
    if (oneOfSix == 6) thisC = 'green and blue';
    
    let hueV1 = Math.round(Math.random()*155)+100;
    let hueV2 = 0;
    if (oneOfSix > 3) hueV2 = Math.round(Math.random()*155)+100;
    
    if (thisC === 'red') myC = color(hueV1, 0, 0);
    if (thisC === 'green') myC = color(0, hueV1, 0);
    if (thisC === 'blue') myC = color(0, 0, hueV1);
    
    if (thisC === 'red and green') myC = color(hueV1, hueV2, 0);
    if (thisC === 'red and blue') myC = color(hueV1, 0, hueV2);
    if (thisC === 'green and blue') myC = color(0, hueV1, hueV2);
    
    // Main body fill colour!
    this.col = myC;
    // Size of eyes! 1 = biggest, 0 = smallest.
    this.eyeSize = Math.random()+0.1;
    // Size of pupils! 1 = biggest, 0 = smallest.
    this.pupilSize = Math.random()-0.1;
    if (this.pupilSize < 0.2) this.pupilSize = 0.1;
    
    // My blink state.
    this.blinking = false;
    this.blinkTime = 0;
    this.blinkRate = Math.floor(Math.random()*100)+50;
    this.blinkDuration = 0.5; // seconds.
    this.blinkDuration *= 600; // Instead of calculating everytime we render.
        
    // Antenna 'handedness'/laterality.
    if (Math.random() < 0.5)
        this.antennaLeft = true;
        else this.antennaLeft = false;
    
    // Now apply scale factor (instead of doing this each time we have to render Blinkie...)
    this.applyScale();
    }
    
    // Do the calculations now for e.g. (this.radius * scale) etc.
    // Instead of in the render() function.
    applyScale(){
        
    // For use with main body and pods.
    let goldenRatio = 0.618;
    
    this.hopForce = this.scale*22;
    
    // Main body.
    this.width = this.dm*this.scale;
    this.height = this.dm*this.scale*goldenRatio;
    
    // Eye dimensions.
    this.eyePos = this.scale * (this.radius/2);
    this.eyeSizeX = this.scale * ((this.radius)-2) * this.eyeSize;
    this.eyeSizeY = this.eyeSizeX;
    this.pupSizeX = this.eyeSizeX * this.pupilSize;
        
    // Antenna dimensions.
    this.antY = (this.height/2) * goldenRatio;
    this.antX = 4;
        if (this.antennaLeft)
    this.antPX = -this.width/3;
        else this.antPX = this.width/3;
    this.antPY = (this.height/2) + (this.antY/2);
    this.antBulb = this.antX*6.18;
        
    // Pod dimensions.
    this.podSize = (this.scale * this.dm)/5;
    }
    
    // Apply 'antBrain class' functions.
    think(){
        if (this.hasBrain === false) return;
        //this.brain.setWayPoint(mouseX, mouseY);
        //this.brain.setWayPoint(RH_ants[0].myBod.bod.position.x,
        //RH_ants[0].myBod.bod.position.y)
        if (this.brain.targetObj == null)
        this.brain.chaseWayPoint(false);
        else
        this.brain.chaseParent(true);
    }
    
    // Negative for left, positive right.
    steer(_amount){
        if (this.myBod.bod.angularSpeed > this.angularSpeedLimit) return;
        
        // Always scale _amount between 0 and 1.
        if (Math.abs(_amount)>1)_amount = _amount/1;
        
        this.myBod.bod.angularSpeed = 0;
        //this.myBod.makeRotate(_amount);
        
        //this.myBod.bod.angularSpeed = 0;
        this.myBod.makeAngle(this.myBod.bod.angle+
                             (_amount * this.steerAmount)); 
        
        // To add torque!
//        this.myBod.makeSteer((_amount/40) * this.myBod.bod.mass);
    }
    
    incScale(_amount){
        // Record current scale.
        let oS = this.scale;
        // Increment scale.
        this.scale+=_amount;
        // Apply scale to appearance.
        this.applyScale();
        // Apply scale to matter-bod.
        this.myBod.makeScale (this.scale/oS);
    }

    // Call if using Euler physics.
    EulerUpdate(){
        // Don't add this physics if antBot already
        // attached to matter.js physics body.
        //if (this.hasBod) return;
    
        // Euler integration.
        this.vel.add(this.acc);
        this.pos.add(this.vel);
    
        this.acc.mult(0);
        this.vel.mult(this.dec);
    }
    // For Euler antBot.
    // Sets hard ground at _y by reversing
    // y-velocity; also returns Bool of 
    // whether ground was hit.
    checkGround(_y){
        if (this.pos.y > _y - 3 - (this.radius*this.scale)) {
        this.vel = createVector(this.vel.x, -this.vel.y/2);
        this.pos.y = _y - (this.radius*this.scale);
        return true;
        }
        else return false;
    }
    
    // Screenwrap.
    screenWrap(){
        // First we have to set pos
        // to matter-bod's position,
        // if not using Euler physics.
        if (this.hasBod){
            this.pos.x = this.myBod.bod.position.x;
            this.pos.y = this.myBod.bod.position.y;
        }
        
        if (this.pos.x < 0 - (this.radius*this.scale)) 
        this.pos.x = width + (this.radius*this.scale);

        if (this.pos.x > width + (this.radius*this.scale)) 
        this.pos.x = 0 - (this.radius*this.scale);
    
        if (this.pos.y < 0 - (this.radius*this.scale)) 
        this.pos.y = height + (this.radius*this.scale);
    
        if (this.pos.y > height + (this.radius*this.scale)) 
        this.pos.y = 0 - (this.radius*this.scale);
        
        // And now the reverse: set
        // matter-bod's position to pos,
        // if not using Euler physics.
        if (this.hasBod){
            this.myBod.makePosition (this.pos.x, this.pos.y); 
        }
        
    }
    
    // Tests whether antBot off-screen and
    // returns to centre top, and with
    // corrected angle.
    // NB if only using Euler, then
    // simply places bot at centre top.
    screenTrap(){
        if (this.hasBod){
        if (this.myBod.bod.position.x < -100 ||
            this.myBod.bod.position.x > width+100 ||
            this.myBod.bod.position.y < -100 ||
            this.myBod.bod.position.y > height+100){
        this.myBod.makePosition(
            width/2,
            height/6);
            this.myBod.makeAngle(0);
            }
        }
        
        else {
            if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0     || this.pos.y > height)
            this.pos = createVector(width/2,height/6);
            }
            
    }
    
    // Rel. to antBot's local up-direction.
    moveForward(_force){
        let hV = createVector(0,0);
        hV.x = Math.sin(this.myBod.bod.angle);
        hV.y = -Math.cos(this.myBod.bod.angle);
        hV = hV.mult(0.001*this.myBod.bod.mass*_force);
        this.myBod.addForce(hV);
    }
    
    render(){
        push();
    
    
        if (this.hasBod){
            translate(this.myBod.bod.position.x, this.myBod.bod.position.y);
            this.pos.x = 0;
            this.pos.y = 0;
            rotate(this.myBod.bod.angle);
        }
    
        
        // Antenna. How exciting.
        fill(this.col);
        stroke(0);
        strokeWeight(3);
        rect(this.pos.x + this.antPX, 
             this.pos.y - this.antPY,
                this.antX,this.antY);
        
        // Coloured bobble.
        //stroke(255);
        //strokeWeight(1);
        noStroke();
        fill(this.col,101);
        ellipse(this.pos.x + this.antPX,
                this.pos.y - this.antPY-(this.antY/2)-this.antBulb/3,
            this.antBulb*Math.sin((frameCount/(this.blinkRate/3))));
        // Bobble halo.
         noStroke();
        fill(255,72);
        ellipse(this.pos.x + this.antPX,
                this.pos.y - this.antPY-(this.antY/2)-this.antBulb/3,
  10+this.antBulb*2*Math.sin((frameCount/(this.blinkRate/3))));
        
        
        strokeWeight(3);
        stroke(0);
        rectMode(CENTER);
        fill(this.col);
        // Main body.
        rect(this.pos.x, this.pos.y, this.width, this.height);
    
        // Are we blinking?
        if (!this.blinking){
            // Not blinking, so decide if time to blink again.
            if (frameCount % this.blinkRate === 0 &&
            Math.random() > 0.8){
                this.blinking = true;
                this.blinkTime = millis();
            }
        }
        else if (this.blinking){
            if (millis() - this.blinkTime > this.blinkDuration){
                this.blinking = false;
            }
        }
    
        noStroke();
        // Left eye.
        if (!this.blinking) fill(255); else fill(this.col);
        rect(this.pos.x - this.eyePos, this.pos.y,
        this.eyeSizeX, 
        this.eyeSizeY);
        // Right eye.
        rect(this.pos.x + this.eyePos, this.pos.y,
        this.eyeSizeX, 
        this.eyeSizeY);
        // Left pupil (square).
        if (!this.blinking) fill(0); else fill(this.col);
        rect(this.pos.x - this.eyePos, this.pos.y,
        this.pupSizeX, 
        this.pupSizeX);
        // Right pupil (square).
        rect(this.pos.x + this.eyePos, this.pos.y,
        this.pupSizeX, 
        this.pupSizeX);
    
        
        
        // Pods.
        fill(0,0,255,101);
        stroke(255);
        strokeWeight(2);
        let goldenRatio= 0.618;
        this.posX = this.pos.x - (this.radius * this.scale) +    (this.podSize/2);
        this.posY = (this.height/2)+(goldenRatio * (this.radius + 3*this.scale));
        for (let i = 0; i < 4; i++){
        let xP = this.podSize * i + (2*this.scale);
        rect(   this.posX + xP, 
                this.pos.y + this.posY + (this.scale*3) * Math.sin((frameCount/8)+(i*this.blinkRate)),
                this.podSize, this.podSize);
        
        }
    
        pop();
    }
    
    
}// End of antBot class.


class Blinky extends antBot{
  constructor(_x, _y, _scale, _image, _imageS){
    // True = has matter.js body.
    // Final true = has antBrain.js :)
    super (true, _x, _y, _scale, true);
    
    // Our textures.
    this.image = _image;    // Normal.
    this.imageS = _imageS;  // Scared.
    
    // Lets us know how to draw Blinky.
    this.scared = false;
  }
  
  render(){
    push();
        //if (this.hasBod){
            translate(this.myBod.bod.position.x, this.myBod.bod.position.y);
            this.pos.x = 0;
            this.pos.y = 0;
            rotate(this.myBod.bod.angle);
           
    let whichImage = this.image;
    if (this.scared) whichImage =
                    this.imageS;  
       image(whichImage,0,0,this.dm*this.scale,this.dm*this.scale);
       // }
    pop();
  }
}// End of Blinky class :)
