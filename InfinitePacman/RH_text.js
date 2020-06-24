// OK. So -- can we do this in a functional way?
// Functions that return functions...
// Immutable data. Hmm.

// Uses vector3 for x,y, and rotation.
function renderTB(_posR, _message){
  push();
  translate(_posR.x, _posR.y);
  rotate(_posR.z)
  
  let tbWidth = 240;
  let tbHeight = 80;
  let tSize = 20;
  
  fill(255,0,255,128);
  strokeWeight(2);
  stroke(255);
  //noStroke();
    rect(0,0,tbWidth,
      tbHeight);
  
    // Before printing text to screen,
    // we need to 'wrap' it inside the
    // available area.
    // So, this will involve organising
    // the _message into appropriately
    // sized lines of text.
    
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(tSize);
  text(_message, 5-tbWidth/2, tbHeight/2-tSize*1.5);
  pop();
}