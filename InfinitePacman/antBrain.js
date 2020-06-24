


// The antBrain object, then, will 
// become a child of the antBot object itself.
class antBrain{

    constructor(_parent){
        this.antBot = _parent;  // Not genetic parent! OOP parent.
        this.state = "chase";
        this.targetObj = null;
        
        this.wayPoint = createVector(width/2,height/2);
        this.forwardWill = Math.random() * 2 + 1;
        
        
    }

    // Want instaTurn?
    findHeading(_instantTurn){
       
        // Angle directly facing target.
        let newH = Math.atan2(this.wayPoint.x - this.antBot.myBod.bod.position.x, this.antBot.myBod.bod.position.y-this.wayPoint.y);
        
        // Apply this rotation instantly to the antBot.
        if (_instantTurn===true){
            this.antBot.myBod.makeAngle(newH);
        }
        else if (_instantTurn===false){
            // Add just a little steering. 
        let steerDeg = (newH-this.antBot.myBod.bod.angle);
        this.antBot.steer(steerDeg);
            // NB whatever the steeringDeg here, the steer()
            // function will always scale this between 0 and 1.
        }
        
    }
    
    
    chaseParent(_instantTurn){
        this.setWayPoint(   this.targetObj.myBod.bod.position.x,
                            this.targetObj.myBod.bod.position.y);
        this.chaseWayPoint(_instantTurn);
    }
    
    setWayPoint(_x, _y){
        this.wayPoint.x = _x;
        this.wayPoint.y = _y;
    }
    
    
    chaseWayPoint(_instantTurn){
        this.findHeading(_instantTurn);
        this.antBot.moveForward(this.forwardWill);
    }


}