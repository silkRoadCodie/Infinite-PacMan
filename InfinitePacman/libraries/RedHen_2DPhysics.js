
//*********&&&&&&&&&&&&****************&&&&&&&&&&&&****************

// Modular 'Obj' wrapper classes for use with Liam Brummit's matter.js 

// B 'Red Hen' New 2017.

//*********&&&&&&&&&&&&****************&&&&&&&&&&&&****************


// Global variables, giving reference to engine and world.
// Unlike 'myEngine', 'myWorld' is only an alias.
let myWorld; 
let myEngine;
// Mouse contraint.
let mConstraint;


// Array of RedHen_2DPhysics bodies.
// Handled via this wrapper class.
// However, should build in clear way
// for main .js file to create own arrays
// (as is the necessary case at time of writing).
let bods = [];

// Off Screen Remove.
// See updateBods().
// Each bod wil also have an individual
// OSR bool, so that they can opt out.
// *** WHAT ABOUT OPTING IN WHEN ALL ELSE
// OUT? I.E. OSR OFF? 
// *** SO, THIS NEEDS A RE-THINK.
let OSR = true;

// Static class for setting up physics and setting gravity etc.
// Mouse interaction will be ON as default.
class RedHen_2DPhysics { 
    
    // Main program calls this to begin using this wrapper class.
    // Sets up mouse contraint by default.
    static setupMatter(_createWindowBounds, _mouseCon){
        
        // Instantiate a matter.js world and begin physics.
        myEngine = Matter.Engine.create();
        myWorld = myEngine.world;  
    
        // Start the engine!
        Matter.Engine.run(myEngine);
        
        // Mouse constraint.
        // Default (null or false) is ON.
        if (!_mouseCon)
        this.setupMouseConstraint();
        
        // We have functionality, but not yet implemented for general use.
        //this.setupCollisions();
        
        // Create window bounds if parameter set to true.
        if (_createWindowBounds != null &&
            _createWindowBounds === true)
            this.createWindowBounds();
        
        // Make sure we are drawing rectangles from their centres.
        rectMode(CENTER);
        imageMode(CENTER);
    }
    
    // Gives you access to the last object
    // you instantiated; this is to be found,
    // then, on the very end of the bods array.
    static lastObjectCreated(){
        return bods[bods.length-1];
    }
    
    
    static createWindowBounds(){
           
        // Ground.
        this.newObj
        ("box",width/2,height-9+width/2,width, true);
        bods[0].makeStatic();
        bods[0].fill = color(0,255,0);
        bods[0].stroke = color(0,200,0);
        bods[0].strokeWeight = 4;
        bods[0].OSR = false;
        // Edges.
        this.newObj ("GhostRectangle",0-10,height/2,20,height);
        bods[bods.length-1].makeStatic();
        bods[bods.length-1].OSR = false;
        this.newObj ("GhostRectangle",width+
        10,height/2,20,height);
        bods[bods.length-1].makeStatic();
        bods[bods.length-1].OSR = false;
        // Glass ceiling.
        this.newObj("ghostrectangle", width/2,-50,width,100);
        bods[bods.length-1].makeStatic();
    }
    
    static setGravity(_xDir, _yDir){
        // This is a matter.js's
        // gravity vector.
        myWorld.gravity.x = _xDir;
        myWorld.gravity.y = _yDir;
    }
    
    static setupCollisions(){
        
    // Turn on collision events.
    // The third parameter 'myCollision' is a 
    // call back to a custom function.
        Matter.Events.on(myEngine, 'collisionStart', myCollision);
        
    function exampleCollision(event){
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
            
            // E.g.
            // Will swap sleeping mode of
            // collided object if 'hitter'
            // is labelled 'boo'.
             if (bodB.label === 'boo' &&
                 Math.abs(bodB.velocity.x *             bodB.velocity.y) > 4){
                Matter.Sleeping.set(bodA, 
                !bodA.isSleeping);}
            }   // End of forLoop.
        }       // End of example collision events function.
    
    }   // End of setupCollisions.
    
    // ON as default. Bodies removed from world and array if having gone off-screen.
    static offscreenRemove(_trueIfOn){
        if (typeof _trueIfOn == Boolean)
             OSR = _trueIfOn;
        else OSR = true;
    }
    
    static removeObj(_index){
        
        // First remove body from matter.js world.
        Matter.World.remove(myWorld, bods[_index].bod);
        
        // Next, remove this object from bods array.
        bods.splice(_index,1); 
    }
    
    // Call to make a new 2D_Physics object of any type.
    static newObj(_requestedBody, _x, _y, _size, _size2, _other){
        
        // NB constructors need to know
        // whether they are responsible
        // for instantiating a matter-bod,
        // or else to leave to an extended
        // subclass's constructor.
        // Here, we are just calling the
        // relevant class ourselves, so
        // will always want that particular
        // constructor to instantiate the 
        // matter-bod (set to true).
        let _makeDirect = true;
        
        // If user enters nonsense, they'll hopefully just get a box. So, not too big a loss :)
        if (_requestedBody == null ||
             typeof _requestedBody != "string" || _requestedBody === "Box" ||
           _requestedBody === "box")
        bods.push(new Box(_x, _y, _size, _makeDirect));
        
        else if (_requestedBody === "square" || _requestedBody === "Square")
        bods.push(new Box(_x, _y, _size, _makeDirect));
        
         else if (_requestedBody === "circle" || _requestedBody === "Circle")
        bods.push(new Circle(_x, _y, _size, _makeDirect));
        
        else if (_requestedBody === "GhostCircle" || _requestedBody === "ghostCircle")
        bods.push(new GhostCircle(_x, _y, _size, _makeDirect));
        
        else if (_requestedBody === "GhostRectangle" || _requestedBody === "ghostRectangle" || _requestedBody === "ghostrectangle")
        bods.push(new GhostRectangle(_x, _y, _size, _makeDirect, _size2));
        
        else if (_requestedBody === "Rectangle" || _requestedBody === "rectangle")
        bods.push(new Rectangle(_x, _y, _size, _size2, _makeDirect));
    }
    
    // Renders all objects to canvas. This is managed through an array. Main js file, then, does not have to look after this array -- it's all taken care of by the RedHen_2DPhysics class.
    static updateObjs(){
        for (let i = bods.length-1; i >= 0; i--){
            // Render to canvas.
            bods[i].render();
            // Off_Screen_Remove ON?
            // Off screen position?
            if (OSR && bods[i].OSR && 
                    (    
                    bods[i].bod.position.x + bods[i].dia < -9 ||
                    bods[i].bod.position.y + bods[i].dia < -9 ||
                    bods[i].bod.position.x - bods[i].dia > width+9 ||
                    bods[i].bod.position.y - bods[i].dia > height+9
                    )
                ){this.removeObj(i);}
        }
    }
    
    // Moves all bods in dir. passed in.
    // We iterate backwards so as to avoid
    // array-splice problems if OSR used during
    // the iteration of this for loop.
    static globalMovement(_xDir, _yDir){
        for (let i = bods.length-1; i >= 0; i--){
            bods[i].makePosition( bods[i].bod.position.x+ _xDir, bods[i].bod.position.y+ _yDir);
            }
    }
    
    // Gravity and movement of all bods through
    // p5 input system 'keyIsDown'.
    static checkInputgGlobalMovement(){
        // Gravity controls.
        // Space-bar to...go to space! 
        // Zero gravity :D
        if (keyIsDown(32)) this.setGravity(0,0);
        // 'G' for familiar gravity.
        if (keyIsDown(71)) this.setGravity(0,1);
    
        // w
        if (keyIsDown(87)){
            this.globalMovement( 0,-1);
        }
        // d
        if (keyIsDown(68)){
            this.globalMovement( 1,0);
        }
        // s
        if (keyIsDown(83)){
            this.globalMovement( 0,1);
        }
        // a
        if (keyIsDown(65)){
            this.globalMovement( -1,0);
        }
    }
    
    static setupMouseConstraint(){
       let canvasMouse = Matter.Mouse.create(canvas.elt);
  
        // For retina screens, ratio will be 2 not 1. P5's 'pixedDensity' will dynamically return correct ratio for us :)
        canvasMouse.pixelRatio = pixelDensity();
  
        let options = {
            mouse: canvasMouse
        }
        
        // Add the mouse contraint to the world.
        mConstraint = Matter.MouseConstraint.create(myEngine, options);
        Matter.World.add(myWorld, mConstraint);
        //mConstraint.stiffness = 1;
        //mConstraint.length = 0.1;
    }
    
    // Draw a circle and constraint line from mouse to selected body.
    static renderMouseConstraint(){
  
        if (mConstraint.body){
        strokeWeight(1);
        fill(0,0,255,101);
        let pos = mConstraint.body.position;
        ellipse(pos.x,pos.y,12,12);
        stroke(0,0,255,101);
        line(pos.x, pos.y, mouseX, mouseY);    
        }
    }
}
    

// The fundamental object. 
// A non-rendered circle, e.g. if you want to render yourself.
// The Obj (and extended objs) will have a .bod matter.js body.
class Obj { 
    
    // Constructor can accept no or null parameters.
    constructor(_x, _y, _rad, _ImakeObject){
        
        // Objects removed if off-screen
        // by default.
        this.OSR = true;
        
        // Position.
        // NB! matter-bod will
        // use the matter.js bod.position.
        this.pos = createVector(0,0);
        
        // Place body at screen centre if any funny business.
        if (_x != null) this.pos.x = _x;
        else            this.pos.x = width/2;
        if (_y != null) this.pos.y = _y;
        else            this.pos.y = height/2;
       
        if (_rad != null)   this.rad = _rad;
        else                this.rad = 9;
        
        // We calculate now for efficiency when rendering.
        this.dia = this.rad * 2;
        
        // The 'ImakeObject' parameter
        // manages which constructor
        // has final responsibility for
        // instantiating the matter-bod in
        // the inheritance chain.
        if (_ImakeObject){
        // Instantiate a 2D Physics Body, a circle.
       this.bod = Matter.Bodies.circle(this.pos.x,this.pos.y,this.dia,options); 
        this.id = bods.length-1;
        // Add the body to the Physics World.
       Matter.World.add(myWorld, this.bod);
        }
        
        // Designate id.
        // With this, the bods array can map to
        // the matter bod array, and vice-versa.
        // Handy for finding bods via the 
        // matter collisions pairs reporting,
        // which returns the bod, not the bods.
        //this.id = bods[length-1];
       // this.bod.bodsID = bods.length-1;
        
    }
    
    // Just in case this is called by
    // mistake :)
    render(){return;}
    
    // Changes the body's scale.
    // NB mass also scaled up by matter.js
    // (I think according to new area).
    makeScale(_scale){
        Matter.Body.scale(this.bod, _scale, _scale);
        this.dia *= _scale;
    }

    // Set a new mass.
    makeMass(_mass){
        Matter.Body.setMass(this.bod, _mass);
    }
    
    // Makes the body (permanently) static.
    makeStatic(){
        Matter.Body.setStatic(this.bod, true);
    }
    
    // Makes the body temporarily static/non-static.
    makeSleep(_trueOrFalse){
        Matter.Sleeping.set(this.bod, _trueOrFalse)
    }
    
    // Add rotation force using
    //  matter.js torque.
    makeSteer(_turn){
        //let tF = _turn * (this.bod.mass * this.bod.mass * 10);
        //this.bod.torque += tF;
        this.bod.torque += _turn;
    }
    
    makeRotate(_angle){
        Matter.Body.rotate(this.bod, _angle);
    }

    // Sets a new angle, without affecting forces etc.
    makeAngle(_angle){
        Matter.Body.setAngle(this.bod, _angle);
    }

    // Sets a new position (without affecting velocity etc.).
    makePosition(_x, _y){
        let newPos = createVector(_x, _y);
        Matter.Body.setPosition(this.bod, newPos);
    }

    // Applies force from centre of the matter.js body.
    addForce(_vector){
        Matter.Body.applyForce(this.bod, this.bod.position, _vector)
    }
    
    // Add or change the label of an object.
    // So that we can write 'obj.label(...)'
    // instead of 'obj.bod.label = ...'
    label(_label){
        this.bod.label = _label;
    }

}

// A permanently non-rendered rectangle.
class GhostRectangle extends Obj{
    constructor(_x, _y, _width, _ImakeBody, _height){
        super(_x, _y, 0.5 * _width, false);
        
        this.width = _width;
        this.height = _height;
        
        if (_ImakeBody){
            
            let options = {
                isStatic: false,
                restitution: 0.89,
                friction: 0.04
            }
            
            this.bod = Matter.Bodies.rectangle(this.pos.x,this.pos.y,this.dia,this.height,options);  
        this.id = bods.length-1;
            // Add the body to the Physics World.
            Matter.World.add(myWorld, this.bod);
        }
    }
}

// A permanently non-rendered circle.
class GhostCircle extends Obj{
    constructor(_x, _y, _radius, _ImakeBody){
        super(_x, _y, _radius * 2, false);
        
        if (_ImakeBody){
            
            let options = {
                isStatic: false,
                restitution: 0.89,
                friction: 0.04
            }
            
            this.bod = Matter.Bodies.circle(this.pos.x,this.pos.y,this.rad,options);  
        this.id = bods.length-1;
            // Add the body to the Physics World.
            Matter.World.add(myWorld, this.bod);
        }
    }
}

// First class of object to include 
// rendering properties. See .texture and
// .roll.
class Box extends Obj {
    constructor(_x, _y, _diameter, _ImakeBody){
        super(_x, _y, 0.5 * _diameter, false);
        
        // Render() returns immediately if set to false.
        this.visible = true;
        
        // If ever other than null,
        // render will use image.
        this.texture = null;
        
        // If true, translate and rotate
        // used in render, else bod always
        // painted in upright orientation.
        this.roll = true;
        
        // *** default ***
        // NEEDS UPDATE
        // Randomizes colour.
        this.alpha = 255;
        let boodles = Math.random();
        // OK NOW JUST SOME KINDA PINK :)
        if (boodles <= 1){
        this.fill =                                 color(Math.random()*100+155,
                    0,
                    Math.random()*100+155,
                    this.alpha);
        }
        else if (boodles < 0.0){
        this.fill =                                 color(Math.random()*100+155,
                    0,
                    0, this.alpha);
        }
        else if (boodles < 0.0){
        this.fill =                                 color(0,
                    Math.random()*100+155,
                    0, this.alpha);   
        }
        else {
        this.fill =                                 color(0,
                    0,
                    Math.random()*100+155,
                    this.alpha);   
        }
        this.stroke         = 0;
        this.strokeWeight   = 1;
        
        // Instantiate a 2D Physics Body, a rectangle.
        // Set default poperties of matter.js object.
        if (_ImakeBody){
        let options = {
            isStatic: false,
            restitution: 0.89,
            friction: 0.04
        }
        this.bod = Matter.Bodies.rectangle(this.pos.x,this.pos.y,this.dia,this.dia,options); 
        this.id = bods.length-1;
        // Add the body to the Physics World.
        Matter.World.add(myWorld, this.bod);
        }
        
    }
    
    render(){
    
        if (!this.visible) return;
        
        fill(this.fill);
        stroke(this.stroke);
        strokeWeight(this.strokeWeight);
    
        // Render rotation?
        if (this.roll){
            push();
            //this.pos.x = this.bod.position.x;
            //this.pos.y = this.bod.position.y;
            translate(this.bod.position.x, this.bod.position.y);
            rotate(this.bod.angle);
            // Textured or not?
            if (this.texture == null){
                rect(0,0,this.dia,this.dia);
                }
            else{
                image(this.texture,0,0,this.dia,this.dia);
                }
            
            pop();
        }   // Render without rotation.
            // NB matter-bod still rotates. 
        else if (!this.roll){
            // Textured or not?
            if (this.texture == null){
                rect(this.bod.position.x, this.bod.position.y,this.dia,this.dia);
                }
                else{
                    image(this.texture,this.bod.position.x,this.bod.position.y,this.dia,this.dia);
                }
        }
    
    }

}

class Rectangle extends Box{
    constructor(_x, _y, _width, _height, _ImakeBody){
        super(_x, _y, _width, false);

        
        this.width = _width;
        this.height = _height;
        
        
        // Instantiate a 2D Physics Body, a circle.
        // Set default poperties of matter.js object.
        if (_ImakeBody){
        let options = {
            isStatic: false,
            restitution: 0.8,
            friction: 0.04
        }
        this.bod = Matter.Bodies.rectangle(this.pos.x,this.pos.y,this.width, this.height,options); 
        this.id = bods.length-1;
        // Add the body to the Physics World.
        Matter.World.add(myWorld, this.bod);
        }
        
    }
    
    render(){
    if (!this.visible) return;
        
        fill(this.fill);
        stroke(this.stroke);
        strokeWeight(this.strokeWeight);
    
        // Render rotation?
        if (this.roll){
            push();
            //this.pos.x = this.bod.position.x;
            //this.pos.y = this.bod.position.y;
            translate(this.bod.position.x, this.bod.position.y);
            rotate(this.bod.angle);
            // Textured or not?
            if (this.texture == null){
                rect(0,0,this.width,this.height);
                }
            else{
                image(this.texture,0,0,this.width,this.height);
                }
            
            pop();
        }   // Render without rotation.
            // NB matter-bod still rotates. 
        else if (!this.roll){
            // Textured or not?
            if (this.texture == null){
                rect(this.bod.position.x, this.bod.position.y,this.width,this.height);
                }
                else{
                    image(this.texture,this.bod.position.x,this.bod.position.y,this.width,this.height);
                }
        }
    
    }
    
    
}

class Circle extends Box{
    constructor(_x, _y, _radius, _ImakeBody){
        super(_x, _y, _radius * 2, false);
        
        // Differently to Box, more efficient
        // to render circles without
        // translation and rotation (since
        // they look the same any angle).
        this.roll = false;
        
        // Instantiate a 2D Physics Body, a circle.
        // Set default poperties of matter.js object.
        if (_ImakeBody){
        let options = {
            isStatic: false,
            restitution: 0.8,
            friction: 0.04
        }
        this.bod = Matter.Bodies.circle(this.pos.x,this.pos.y,this.rad,options); 
        this.id = bods.length-1;
        // Add the body to the Physics World.
        Matter.World.add(myWorld, this.bod);
        }
        
    }
    
    render(){
        if (!this.visible) return;
        
        fill(this.fill);
        stroke(this.stroke);
        strokeWeight(this.strokeWeight);
        
        // Render rotation?
        if (this.roll){
            
            push();
            
            translate(this.bod.position.x,
                this.bod.position.y);
            rotate(this.bod.angle);
            // Textured or not?
            if (this.texture == null){
                ellipse(0,0,this.dia);
                
            
            }
            else{
                image(this.texture, 0, 0, this.dia, this.dia);
            }
            pop();
        }
        else if (!this.roll){
            if (this.texture == null){
                ellipse(this.bod.position.x,
                this.bod.position.y,
                this.dia);
             }
            else{
                image(this.texture, this.bod.position.x, this.bod.position.y, this.dia, this.dia);
            }
        }
        
    }
}




//*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&
//*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&
