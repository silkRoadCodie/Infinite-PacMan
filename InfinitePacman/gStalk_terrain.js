// Infinite 2D terrain using Perlin noise.

// Each 'gStalk' will need to keep a track of two things:
// who its neighbour(s) are. Oh, and colour, etc.

// Additionally, then, we need a 'manager', whose job will simply enough be to keep a track of which two gStalks are the current 'edge stalks' -- left and right (negative and positive).



// Array of 'object slots'.
// Primary function of these slots is to
// record whether an object has been placed,
// therewith permitting or denying the placement
// of an object on request (see 'placeObject()',
// called by moveMe()).
let objectSlots = [];


// Width of each individual stalk.
class GSterrain{
    constructor(_width){
        // Constructor will have to
        // create then store how many
        // gStalks needed to fit across
        // the designated 'span'.
        // Only then can it grab the
        // right-most or 'positive' edge stalk.
        // 'Negative' edge stalk will of course
        // be first edge stalk in array.
        // NB. should only grab the index, not the
        // stalk object itself :)
        
        this.width = _width;    // Width of each gStalk.
        this.height = height*3; // Height of each gStalk.
        this.xBegin = 0 - _width*5;  // Where to start span. 
        this.yPos = height;      // Y position.
        
//        this.seed = 9;
//        this.amplitude = height*3;
//        this.resolution = height;
        this.seed = 9;
//        this.amplitude = height*5;
//        this.resolution = height;
        // Jungle Mountain Gothica:
        this.amplitude = height*2;
        this.resolution = height/3;
        // Bumpy road:
//        this.amplitude = height/2;
//        this.resolution = height/2;
        
        this.span = width + _width * 10;
        
        this.gStalks = [];      // Array of gStalks.
        
        this.lEdge = null;
        this.rEdge = null;
        
        // Generate terrain, which will include
        // populating the gStalks arrary as well as
        // determinging lEdge and rEdge.
        this.genTerrain();
        
    }
    
    renderTerrain(){
        for (let i = 0; i < this.gStalks.length; i++){
            this.gStalks[i].render();
        }
    }
    
    // Bool moving right? RefPoint is subject's x.
    moveTerrain(_goingRight, _refPointX){
        
        // Will only move if will not
        // remove a gStalk from screen.
        if (_goingRight && 
            Math.abs(this.gStalks[this.lEdge].
            myBody.bod.position.x - _refPointX)
           > width/2 + this.width){
            //console.log("Rainbows glimmer.");
            // Current right edge gets new neighbour (r).
            // New right edge gets new neighbour (l).
            
            this.gStalks[this.rEdge].Rneighbour =
            this.lEdge;
            this.gStalks[this.lEdge].Lneighbour =
            this.rEdge;
            // Right edge is now, then, current left edge.
            this.rEdge = this.lEdge;
            this.gStalks[this.lEdge].moveMe
            ('right');
            // Left edge index is now current left edge's
            // right neighbour (which is just its index).
            // Will this cause self-referential prob?
            // To fix, just use a third term.
            this.lEdge =
            this.gStalks[this.lEdge].Rneighbour;
            
            // Check to see if we need any more terrain.
            if (Math.abs(this.gStalks[this.rEdge].
            myBody.bod.position.x - _refPointX)
           < width/2 + this.width/2)this.moveTerrain(true,_refPointX);
        }
        else if (!_goingRight && 
            Math.abs(this.gStalks[this.rEdge].
            myBody.bod.position.x - _refPointX)
           > width/2 + this.width){
            //console.log("Unicorns are fancy.");
            // Current right edge gets new neighbour (l).
            // New left edge gets new neighbour (r).
            
            this.gStalks[this.lEdge].Lneighbour =
            this.rEdge;
            this.gStalks[this.rEdge].Rneighbour =
            this.lEdge;
            // Left edge will become current right edge.
            this.lEdge = this.rEdge;
            this.gStalks[this.lEdge].moveMe
            ('left');
            // Right edge index is now current right edge's
            // left neighbour (which is just its index).
            this.rEdge =
            this.gStalks[this.rEdge].Lneighbour;
            
            // Check to see if we need any more terrain.
            if (Math.abs(this.gStalks[this.lEdge].
            myBody.bod.position.x - _refPointX)
           < width/2 + this.width/2)this.moveTerrain(false,_refPointX);
            
        }
        
    }
    
    // Generate new terrain.
    genTerrain(){
    
        // Individual stalk width.
        // We use this here so as to be able
        // to be variable at a later stage...
        let thisWidth = this.width;
        
        let totalW = 0; // Total width so far.

        noiseSeed(this.seed);
    
        for (let i = 0; totalW <= this.span; i++){
            
            let xOffset = this.xBegin + 
            totalW - thisWidth/2;
        
            // Spawn a new stalk body with matter.js.
            RedHen_2DPhysics.newObj
            ('GhostRectangle', 0, 0, this.width,
            this.height);
            RedHen_2DPhysics.lastObjectCreated().OSR =
            false;
            RedHen_2DPhysics.lastObjectCreated().
            makeStatic();
            // ...and grab this body.
            // Note here that we are for the
            // first time populating this array.
            this.gStalks. 
            push(new Gstalk(i, this));
        
            // Use gStalk's own method to calc
            // noise. So as to be consistent
            // in terms of generating terrain.
            let nF = this.gStalks[this.gStalks.length-1].
            calcNoise(1, xOffset);
            
            this.gStalks[this.gStalks.length-
            1].myBody.makePosition(xOffset, 
            this.yPos + nF);
            
            totalW += thisWidth;  
        }   // End of for loop.
        
        // So, now we can find our 'edge stalks'.
        // Well, rEdge the only mystery.
        this.lEdge = 0;
        this.rEdge = this.gStalks.length-1;
    }
    
}   // End of GSterrain object.

class Gstalk{
    constructor(_index, _parent){
        
        // These are just indeces, not
        // the objects themselves!
        this.Lneighbour = _index -1;
        this.Rneighbour = _index +1;
        
        this.index = _index;
        this.parent = _parent;
        
        //this.fill = color(0,Math.random()*100+42,0);
        //this.fill = color(0,22,0);
        this.fill = color(0,100,0);
        
        this.myBody = 
        RedHen_2DPhysics.lastObjectCreated();
    }
    
    render(){
        
        push();
        rectMode(CENTER);
        fill(this.fill);
        //noStroke();
        //stroke(color(255,42));
        stroke(this.fill);
        strokeWeight(1);
        
        translate(  this.myBody.bod.position.x,
                    this.myBody.bod.position.y);
        
        // Main stalk green body.
        rect(0,0,   this.myBody.width,
                    this.myBody.height);
        
        // Pattern of 'boxes'.
        // Number of levels = 4.
        // For all layers, use nOb.
        strokeWeight(2);
        let nOb = this.myBody.height/this.myBody.width;
        for (let i = 0; i < 8; i++){
            
            fill(0,i*12+100,0);
            if (i%2===0)
            stroke(255,100);
            else stroke(0);
            
            rect(0,-((nOb/2)*this.myBody.width) + 
            this.myBody.width*i+this.myBody.width/2,
                                this.myBody.width,
                                this.myBody.width); 
        }
        
        
        pop();
    }
    
    // Moving left (-1) or right (+1).
    // Returns output of noise calculation.
    calcNoise(_negORpos, _xOffset){
        // Here we can affect the Perlin.
        // Problem -- when we change direction,
        // the new amplitude has not taken account
        // of the sum of intervening gStalks.
        // So, first we have to take account of this.
        // Can I do it by looking at neighbour index?
        // Yes, if moving from right to left edge,
        // then this.Left neighbour will still be
        // current right edge index. Nice! Else,
        // left neighbour will be previous r edge index.
        
        let changedDirection = false;
        
        if (_negORpos === -1){
            // If moving left...
            changedDirection =
                (this.Lneighbour ===
                this.parent.rEdge);
        }
        if (_negORpos === 1){
            // If moving right...
            changedDirection =
                (this.Rneighbour ===
                this.parent.lEdge);
        }
        
        // Comment this out to stop 'biomic increment'.
//        let incFactor = 1;
//        if (changedDirection) {_negORpos *= 
//            (this.parent.gStalks.length-3) * incFactor;
//        this.parent.resolution -= _negORpos * incFactor;
//        this.parent.amplitude += _negORpos * incFactor;
        
        
//        let Octave1 = noise(
//                _xOffset
//                /this.parent.resolution)
//                *this.parent.amplitude*0.5;
//        
//        let Octave2 = noise(
//                _xOffset
//                /(this.parent.resolution*100))
//                *this.parent.amplitude*0.001;
//        
//        let Octave3 = noise(
//                _xOffset
//                /(this.parent.resolution*200))
//                *this.parent.amplitude*0.01;
        
        // To avoid Divine Symmetry.
        _xOffset += 100000000;
        
        let Octave1 = noise(
                _xOffset
                /2000)
                *2000;
        
        let Octave2 = noise(
                _xOffset
                /800)
                *1000;
        
        let Octave3 = noise(
                _xOffset
                /7)
                *3;
        
        return Octave1 + Octave2 + Octave3;
        
//        return noise(
//                _xOffset
//                /this.parent.resolution)
//                *this.parent.amplitude;
    }
    
    moveMe(_leftORright){
        
        // To record xOffset value to be passed
        // into placeObject().
        let xOffset;
        
        if (_leftORright === 'right'){
            // Calculate noise here.
            
            xOffset = this.parent.gStalks[
                    this.parent.gStalks[
                    this.parent.rEdge].Lneighbour].
            myBody.bod.position.x + 
                this.parent.gStalks[
                    this.parent.rEdge].
            myBody.width/2;
            
        this.myBody.makePosition(
            xOffset + this.parent.gStalks[
                    this.parent.rEdge].
            myBody.width/2, 
            this.parent.yPos + this.calcNoise(1, xOffset)); 
              
            
            
        }
        else if (_leftORright === 'left'){
            //this.myBody.makePosition(_x, _y);
            //console.log("Can't be doing anything yet like.");
            
             xOffset = this.parent.gStalks[
                    this.parent.gStalks[
                    this.parent.lEdge].Rneighbour].
            myBody.bod.position.x - 
                this.parent.gStalks[
                    this.parent.lEdge].
            myBody.width/2;
            
          // Where noise calc used to be.
        
        this.myBody.makePosition(
            xOffset - this.parent.gStalks[
                    this.parent.lEdge].
            myBody.width/2, 
            this.parent.yPos + this.calcNoise(-1, xOffset)); 
            
        }
        
        // I think here is where we might
            // generate trees etc.
            // For, here we have decided to move
            // the terrain 'stalk' either left or
            // right and have just calculated and
            // positioned this 'stalk' according to
            // Perlin noise. So...we might take the
            // value of its new position, or even
            // the raw noise value, with which to 
            // decide to place a tree, a rock, etc.
        this.placeObject(xOffset);
        
    }
    
    placeObject(_xOffset){
        
        // Determine slot id by looking at xOffset pos.
        let id = Math.floor(_xOffset);
        
        // First, see if slot is empty (null).
        if (objectSlots[id] == null){
        
        if(this.myBody.bod.position.y < height*7 &&
          id % 5 === 0) {
          
          let pelletSize = 12;
          let chance = Math.random();
          let powerUp = false;
          let pLabel = "pellet";
          if (chance < 0.03){
            powerUp = true;
            pLabel = "eatMe";
            pelletSize = 24;
          }
          
          RedHen_2DPhysics.newObj('circle', this.myBody.bod.position.x, this.myBody.bod.position.y - 
            (100 - Math.random()*32) 
            - height*1.5, pelletSize);
           
            // Switch OFF 'off-screen-remove'.
        RedHen_2DPhysics.lastObjectCreated().OSR = false;
           
            // Label for collisions...
            RedHen_2DPhysics.lastObjectCreated().
            label(pLabel);
            
            // Colour of pellet/power-pellet.
           if (!powerUp){
  RedHen_2DPhysics.lastObjectCreated()
    .fill = color(255,255,0);
  RedHen_2DPhysics.lastObjectCreated()
    .strokeWeight = 3;
  RedHen_2DPhysics.lastObjectCreated()
    .stroke = color(0);
           } else {
             RedHen_2DPhysics.lastObjectCreated()
    .fill = color(185,185,0);
  RedHen_2DPhysics.lastObjectCreated()
    .strokeWeight = 2;
  RedHen_2DPhysics.lastObjectCreated()
    .stroke = color(0);
           }
            
           
            
            // Freeze position of object.
//            RedHen_2DPhysics.lastObjectCreated().
//            makeStatic();
            RedHen_2DPhysics.lastObjectCreated().makeMass(0);
            RedHen_2DPhysics.lastObjectCreated().makeSleep(true);
            
            // Delcare this slot as filled.
            objectSlots[id] = 1;
            }
            
        }
    }
}


