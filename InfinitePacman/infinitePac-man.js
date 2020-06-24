// Global canvas element necessary!
// This is to allow mouse/touch interaction to work.
let canvas;

// Not moving obj, so can spawn obj.
// See how this is handled in touchEnded() and
// mouseDragged().
let canSpawn = true;
// For swiping.
let mouseX_prev = 0;
let mouseY_prev = 0;

// Our subject.
let boo;
// Original mass of pac-boo, so as
// to maintain consistent mass through
// scale changes.
let origMass = 0;
let health;
let resetTime = false;
let gameOvering = false;
let gameWon = false;
let GOstamp = 0;

// Variable used in collisions, storing
// bod to be removed in draw().
let toRemove = null;
// Which blinkie to eat, sent to sleep in 
// updateBlinkies().
let toEat = null;

let blinkies = [];
let scared = false; // Blinkies scared?
let scaredTime;     // TimeStamp for scared.

// To organise tint of sky.
let skyTint;


// Testing new terrain generator...
let urizen;

// Testing voice...
// This is our speech object.
let robot;

let clouds = [];
let cloudTimer = 0;

p5.disableFriendlyErrors = true;

//const RP = require('RedHen_2DPhysics');

// Sound effects.
let voxMusic;
let voxGobble;
let voxGameOver;
let voxPower;
let voxHit;

// Images.
let imgBlinky;
let imgBlinkyS;

function preload(){
  
  //voxMusic = loadSound("sound/song17.mp3");
  //voxMusic = loadSound("sound/Drift.mp3");
  //voxMusic = loadSound("sound/interstellarO.ogg");
  voxMusic = loadSound("sound/Destractor.mp3");
  voxGobble = loadSound("sound/gobble.mp3");
  voxGameOver = loadSound("sound/gameOver.mp3");
  voxPower = loadSound("sound/powerUp.mp3");
  voxHit = loadSound("sound/hit.mp3");
  voxWin = loadSound("sound/song17.mp3");
  
  imgBlinky = loadImage("blinky.png");
  imgBlinkyS = loadImage("blinkyS.png");
}

function setup(){
    // Remember to assign value of canvas like this :)
    canvas = createCanvas(windowWidth,windowHeight);
    
    // Correct for mouse positions.
    mouseX = 0;
    mouseY = 0;
    
    // Set first argument to 'true' to create window bounds automatically. Second argument is for mouse constraint (NB. true == OFF).
    RedHen_2DPhysics.setupMatter(false, true);
    RedHen_2DPhysics.setupCollisions();
        
    // Our subject.
    setupBoo();
    
    // Setup clouds.
    for (let i = 0; i < 24; i++){
        clouds.push(new Cloud(Math.random()*width*4-width*2, Math.random()*height*2-height*0.8,
                   Math.random()*100+200));
    }
    
    // Blinkies :)
    for (let i = 0; i < 10; i++){
       // blinkies.push(new antBot(true,
        //Math.random()*width*4-width*2,
        //-height,Math.random()*3+0.7,true));
        
      blinkies.push(new Blinky(
        Math.random()*width*4-width*2,
        -height,
        Math.random()*5+0.7,
          imgBlinky,
          imgBlinkyS));
     
        RedHen_2DPhysics.
        lastObjectCreated().label('blinky');
      
        // Bubbly air friction :)
        RedHen_2DPhysics.
        lastObjectCreated().bod.frictionAir = 0.1;
    }
    
    // Here we goooooo...
    // 51 seems OK.
    // Nah, 12 is where it's at.
    urizen = new GSterrain(22);
    
    // Celestial orbs that can be woken/put to sleep
    // depending on collision speed with boo.
    createDigitBalls();
    
    rectMode(CENTER);
   
  // Play music:
  voxMusic.play();
  voxMusic.setVolume(0.04);
  
}

function reset(){
  if (resetTime===false) return;
  resetTime = false;
  health = 32;
  boo.rotation = false;
  
  voxGameOver.play();
  voxGameOver.setVolume(0.1);
  
  boo.myBod.makePosition=(Math.round(width/2),
                          Math.round(height/2));
  
  for (p of blinkies){
    p.myBod.makePosition(width/2, -height);
  }
  
  while(boo.myBod.bod.circleRadius > 22){
    boo.myBod.makeScale(0.99);
    boo.width*=0.99;
  }
  boo.myBod.makeMass(origMass);
  
  // Regenerate terrain.
  //urizen = [];
  //urizen = new GSterrain(22);
}

function setupBoo(){
    
    boo = new Pac(  Math.round(width/2),
                    Math.round(height/2),
                    22);
    //robot.speak("Bubble boo is ready.");
    boo.bubblesON = false;
    boo.maxV = 14;
    
    //origMass = boo.myBod.bod.mass;
    origMass = 1.499;
    boo.myBod.makeMass(origMass);
  
  health = 32;
  //reset();
}

function myCollision(event){
    // Ref to all pairs of bodies colliding.
        let pairs = event.pairs;
        // Iterate over the pairs to
        // find the condition you're
        // looking for.
        for (let i = 0; i < pairs.length; i++){
            // The event's pairs will have a 
            // bodyA and bodyB object that
            // we can grab here...
            let bodA = pairs[i].bodyA;
            let bodB = pairs[i].bodyB;
            
            // If boo hits another object.
            // Hmmmmm...should create boo first,
            // so that it is always first object
            // in pair, viz. 'boo'.
            // Oh, also must be moving faster
            // than specified velocity.
             if (bodA.label === 'boo' &&
                 bodB.label !== 'boo' &&
                 bodB.label === 'digit' &&
                 Math.abs(bodA.velocity.x) +             Math.abs(bodA.velocity.y) > 9){
                Matter.Sleeping.set(bodB, 
                !bodB.isSleeping);} 
            
            // If pac eats pellet...
            if (bodA.label === 'boo' &&
                bodB.label === 'pellet'){
                
                toRemove = bodB.id;
              //  console.log('Nom ' + bodB.id
                //            + ' @ '+ toRemove);
                
            }
          
            // If ghost hits pac...
            if (bodA.label === 'boo' &&
                bodB.label === 'blinky'){
                
              // Scared mode?
              if (blinkies[0].scared){
                // Grab id of this blinkie.
                // Will be 'eaten' (not removed)
                // in blinkieUpdate() using toEat.
                  health+=5;
                toEat = bodB.id;
              } else  {
                  if (!gameWon){
                  health-=10;}
                  if (!voxHit.isPlaying() &&
                      !gameWon){
                    voxHit.play();
                    voxHit.setVolume(0.4);
                  }
                    
                }
              
                // GAME OVER?
                if (health < 1) {
                  resetTime = true;
                  gameOvering = true;
                  GOstamp = millis();
                                }
            }
          
          // If pac eats super pellet...
            if (bodA.label === 'boo' &&
                bodB.label === 'eatMe'){
             
              // Turn on SCARED mode.
              scared = true;
              toRemove = bodB.id;
              
            }
          
            }   // End of forLoop.
         
}

// ***** UDPATE LOOP *****
function draw(){ 
    
//  if (keyIsDown(32)){
//    blinkies[0].scared = true;
//  }
  
  // Will reset game once resetTime is TRUE.
  reset();
  
  // Restart the music when needed.
  // Or stop if GAME WON.
  if (!voxMusic.isPlaying() && !gameWon){
    voxMusic.play();
    voxMusic.setVolume(0.04);
  } else if (voxMusic.isPlaying() &&
            gameWon) voxMusic.stop();
  
  if (!voxWin.isPlaying() && gameWon)
    voxWin.play();
  
  if (gameOvering){
    
    if (millis()-GOstamp < 2000)
    {
      boo.rotation = true;
    } else if (!gameWon) {
      gameOvering = false;
      boo.rotation = false;
    }
  }
  
    if (!gameOvering){
    skyTint = map(  boo.myBod.bod.position.y,
                    height*3, -height*5, 222, 0);
    // Orig tints = (0,111,222);
    background(0,skyTint/2,skyTint);
    } else background(0,32);
    
    // Spit blocks if boo in correct area.
//    if (boo.myBod.bod.position.x > -700 &&
//        boo.myBod.bod.position.x < 1000)
//        spitObjects();
    
    // After collisions, do we need to
    // remove anything?
    if (toRemove !== null){
        
         //First, this must mean that
         //we can grow/shrink pac-man.
        if (health >= 100 &&
            boo.myBod.bod.velocity.x > 0 &&
            boo.width < width/3){
            boo.myBod.makeScale(1.08);
            boo.width*=1.08;
          
            if (boo.width > width/3){
              // GAME WON!
              gameWon = true;
              boo.rotation = true;
              //voxWin.play();
            }
          
        }
//        if (boo.myBod.bod.velocity.x < 0 &&
//            boo.width > 22){
//            boo.myBod.makeScale(0.8);
//            boo.width*=0.8;
//        }
        boo.myBod.makeMass(origMass);
      
        for (let i = 0; i < bods.length; i++){
            if (bods[i].bod.id === toRemove){
              
              // What did we just eat?
              if (bods[i].bod.label === 'pellet'){
                // Sound effect :)
                voxGobble.play();
                voxGobble.setVolume(0.1);
                // Gain health point :(
                health+=1;
                if (health > 100) health = 100;
              }
              
              if (bods[i].bod.label === 'eatMe'){
                voxPower.play();
                voxPower.setVolume(0.1);
                // No health gained with powerUp.
              }
              
            RedHen_2DPhysics.removeObj(i);
            break;
            }
        }
        
        toRemove = null;
    }
  
    
    //boo.spawnBubbles();
    

    push();
    // Move 'camera' to centre on boo.
    translate(  -boo.myBod.bod.position.x+width/2,
                -boo.myBod.bod.position.y+height/2);
    
    // Test sea...
    rectMode(CORNER);
    let seaWobble = Math.sin(radians(frameCount));
    fill(0,0,200,128);
    strokeWeight(6*Math.abs(seaWobble)+3);
    stroke(255,160);
    rect(boo.myBod.bod.position.x-width,
    height*2 + 32 * seaWobble,width*2,70000);
    rectMode(CENTER);
    
    updateClouds();
    
    urizen.renderTerrain();
    
    
    updateBlinkies();
    
    RedHen_2DPhysics.updateObjs();
    
     // Pellet sine bob.
//    for (p of bods){
//        if (p.bod.label === 'pellet'){
//            let newY = p.bod.position.y + Math.sin(frameCount*10/(p.id*2))*2.3;
//            p.makePosition(p.bod.position.x,
//            newY);
//        }
//    }
    
    boo.control();// NB. contains speedlimiter.
    boo.hitWaterCheck();
    boo.render();
    
    // Work out when to move the infinite terrain.
    // note that previous version of terrain generator
    // used 'width' instead of 'urizen.width'.
    boo.trackX = 
                Math.abs(boo.myBod.bod.position.x - boo.oX);
    if (boo.trackX > urizen.width){
        //moveGround(boo.oX-width);
        boo.oX = boo.myBod.bod.position.x;
        
            urizen.moveTerrain(
            boo.myBod.bod.velocity.x > 0,
            boo.myBod.bod.position.x);   
    }
    pop();
    
    // These things, if rendered to canvas,
    // will appear over the top of other things.
    // See frameCount etc.
    printInstructions();
    
}

function updateBlinkies(){
  
  // Turn on scared mode?
  if (scared){
    scaredTime = millis();
    scared = false;
    
    // Make sure all blinkies are in
    // scared mode.
    for (let i = 0; i < blinkies.length; i++){
      blinkies[i].scared = true;
    }
  }
  
  // Time to switch off scared mode?
  if (scaredTime !== 0 && millis() - 
      scaredTime > 5000){
    // Make sure all blinkies are not in
    // scared mode.
    for (let i = 0; i < blinkies.length; i++){
      blinkies[i].scared = false;
    }
    scaredTime = 0;
  }
  
  
  // Waypoint setting.
  let wpY = boo.myBod.bod.position.y;
  let wpX = boo.myBod.bod.position.x;
  
  // If scared, set waypoint high in air.
  if (blinkies[0].scared){
    wpY = -height;
  }
  
  
  for (let i = 0; i < blinkies.length; i++){
    
        // First, set new waypoint using 'brain'.
        blinkies[i].brain.
        setWayPoint(wpX+ Math.random()*50,
                    wpY);
    
        // If eaten, set me high and sleeping.
          if (toEat !== null &&
              blinkies[i].myBod.bod.id ===
              toEat){
                blinkies[i].myBod.makeSleep(true);
            blinkies[i].myBod.makePosition(0,0);
              toEat = null;
              // Louder 'gobble' sound effect.
              voxGobble.play();
              voxGobble.setVolume(0.4);
            }
    
        // If not sleeping...'think' and render.
        if (!blinkies[i].myBod.bod.isSleeping){
        blinkies[i].think();
        blinkies[i].render();
        }
        
    // When far away, sleep (so as not to
        // fall through the terrain).
        if (Math.abs(blinkies[i].myBod.bod.
            position.x - 
            boo.myBod.bod.position.x) > width/1.5){
            blinkies[i].myBod.makeSleep(true); 
  // Reposition blinkies, so as to seem like
  // a host of new blinkies.
          let newX = boo.myBod.bod.position.x + width/1.8 - Math.random()*width/8;
          let newY = boo.myBod.bod.position.y - height/2 - Math.random()*width/8;
        blinkies[i].myBod.makePosition(newX,newY);
        } else blinkies[i].myBod.makeSleep(false);
    }
  
}

// ***** INPUT and OTHER FUNCTIONS *****
function mouseDragged(){
    canSpawn = false;
    
    // Swipe controls.
    if (mouseX > mouseX_prev)
        boo.control('RIGHT');
    if (mouseX < mouseX_prev)
        boo.control('LEFT');
    
    if (mouseY > mouseY_prev)
        boo.control('DOWN');
    if (mouseY < mouseY_prev)
        boo.control('UP');
    
    // For swipe controls.
    mouseX_prev = mouseX;
    mouseY_prev = mouseY;
}

function touchEnded(){
    
    if (canSpawn){
        boo.bubblesON = !boo.bubblesON;
//        if (boo.bubblesON)
//        robot.speak("Crash bubbles engaged!");
//        else
//        robot.speak("Crash bubbles disengaged...and whatever!");
    }
    
    // Legacy spawning. Might come in useful
    // for creating blocks etc.
//    if (canSpawn && mouseX < width/2){
//        spawnBlock(mouseX, mouseY, 28);
//    }
//    if (canSpawn && mouseX > width/2){
//        spawnBall(mouseX, mouseY, 14);
//    }
    
    canSpawn = true;
}

function updateClouds(){
    // Test clouds...
    //drawCloud(width/2, 300,200);
    for (let i = 0; i < clouds.length; i++){
        clouds[i].drawMe();
    } 
    // If 10 seconds elapsed, reset positions of clouds.
    if (millis()-cloudTimer > 500){
        cloudTimer = millis();
        for (let i = 0; i < clouds.length; i++){
            
            // First, check distance of cloud from
            // boo's position. I *think* we could
            // do this via x only?
            if (Math.abs(clouds[i].x - boo.myBod.bod.position.x) > width*2){
                // Place left or right of screen.
                if (frameCount%2===0)
                clouds[i].x = boo.myBod.bod.position.x +
                Math.random()*width*2+width;
                else
                clouds[i].x = boo.myBod.bod.position.x -
                Math.random()*width*2-width;
                // Random height.
                clouds[i].y = Math.random()*height*2-
                height/3;
            }
        }
    }
}

class Cloud{
    constructor(_x, _y, _s){
        this.x = _x;
        this.y = _y;
        this.s = _s;
        
        this.wobble = Math.random()*100+20;
    }
    
    drawMe(){
        push();
        fill(255);
        noStroke();

        translate(this.x,this.y);
        rotate(10*radians(Math.sin(frameCount/this.wobble)));

        ellipse(-this.s*0.618/2,0-this.s*0.1,this.s*0.618*0.618,this.s*0.618*0.618);
        ellipse(this.s*0.618/2,0-this.s*0.1,this.s*0.618*0.618,this.s*0.618*0.618);
        ellipse(0,-this.s*0.15,this.s*0.618,this.s*0.618);

        pop();
        
        this.x -= 0.001 * this.y;
        
    }
}


function spawnBlock(_x,_y,_sz){
    RedHen_2DPhysics.newObj("box", _x, _y, _sz);
    
    RedHen_2DPhysics.lastObjectCreated().fill = 
        color(Math.random()*205+50,101);
    RedHen_2DPhysics.lastObjectCreated().stroke = 
        color(255,0,255);
    RedHen_2DPhysics.lastObjectCreated().strokeWeight = 2;
    RedHen_2DPhysics.lastObjectCreated().OSR = true;
}

function spawnBall(_x,_y,_sz){
    RedHen_2DPhysics.newObj("circle", _x, _y, _sz);
    
    RedHen_2DPhysics.lastObjectCreated().OSR = false;
    RedHen_2DPhysics.lastObjectCreated().fill = 
        color(255,Math.random()*100+69);
    RedHen_2DPhysics.lastObjectCreated().stroke = 
        color(0);
    RedHen_2DPhysics.lastObjectCreated().strokeWeight = 3;
}

function spitObjects(){
//        if (frameCount % 33 === 0 &&
//       frameCount < 10240){
    if (frameCount % 5 === 0 && frameCount < 1024){
        spawnBlock(width/3 - 50, height*0.6, Math.random()*3+12);
        RedHen_2DPhysics.lastObjectCreated().OSR = false;
        RedHen_2DPhysics.lastObjectCreated().
        makeAngle(Math.random()*360);
        RedHen_2DPhysics.lastObjectCreated().
        makeMass(10);
        
        // Lava colour...
        RedHen_2DPhysics.lastObjectCreated().fill = 
        color(Math.random()*205+50,0,0,255);
        RedHen_2DPhysics.lastObjectCreated().stroke = 
        color(255,0,0);
        
        // Give him a little kick ;)
        let force = createVector(
        Math.random()*0.002 - 0.01,-0.4);
        RedHen_2DPhysics.lastObjectCreated().
        addForce(force);
    } 
}

function createDigitBalls(){
    // Create 'digit' balls in air.
    for (let i = 0; i < 12; i++){
        let oSize = Math.random()*12 + 20;
        
        RedHen_2DPhysics.newObj ('circle', Math.random()*width*3 - width, Math.random()*height*2-height*3, oSize);
       
        RedHen_2DPhysics.lastObjectCreated().
        fill = color(0,Math.random()*255,0);
        RedHen_2DPhysics.lastObjectCreated().
        strokeWeight = 2;
        RedHen_2DPhysics.lastObjectCreated().
        //makeStatic();
        makeSleep(true);
        RedHen_2DPhysics.lastObjectCreated().
        OSR = false;
        RedHen_2DPhysics.lastObjectCreated().bod.
        label = 'digit';
    }
}



function printInstructions(){
    
    // TextBox test.
//    renderTB(createVector
//    ((width-200)+ 30 * Math.cos(radians(frameCount*3)),
//     64,
//     0),
//    "Altitude: " + boo.getAltitude() +
//            "m > SEA");
    
  if (!gameWon){
    strokeWeight(2);
    textSize(20); stroke(0); fill(255,255,0); 
    text("Swipe or use arrow keys to move", 32, height/10);
//    text("Position = " + 
//         Math.round(boo.myBod.bod.position.x), 32,32);
    text("FPS = " + Math.floor(frameRate()), 32,height-32);
    
//   textSize(22);
//  text("Health = " + health, 32, 64);
  rectMode(CORNER);
  rect(2,2,width/100*health,height/20);
  rectMode(CENTER);
    //text("Tap/Click to toggle crash bubbles", 32, 64);
  }
    
}