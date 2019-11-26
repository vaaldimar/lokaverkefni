const SPEED = 10, MOVES = 20; // variables for animation speed and moves for computer to solve

function randomInt(max){
    return Math.floor(Math.random()*max); // ramdom integer function for computer moves
}

class Cubie{ // class for cubie on the rubiks cube. Each cube is called a "cubie"
    constructor(x, y, z, idx){ //keeping track of x, y z values

        this.idx = idx; //idx = cubie direction index
        this.update(x,y,z); // set x, y, z
        this.faces = []; // array for cubie faces
		//cubie face, color and pos
        this.faces[0] = new Face(createVector(0, 0, -1), color(0,0,255)); //blue face
        this.faces[1] = new Face(createVector(0, 0, 1), color(0,255,0)); // green face
        this.faces[2] = new Face(createVector(0, 1, 0), color(255,255,255)); // white face
        this.faces[3] = new Face(createVector(0, -1, 0), color(255,255,0)); // yellow face
        this.faces[4] = new Face(createVector(1, 0, 0), color(255,150,0)); // orange face
        this.faces[5] = new Face(createVector(-1, 0, 0), color(255,0,0)); // red face
    }

    update(x, y, z){
		// updating x, y, z after calling turn functions
        this.x = x;
        this.y = y;
        this.z = z;
        this.m = new p5.Matrix(); //create a new matrix for cubie posistion
        this.m.translate([x, y, z]); // positioning what im about to draw

    }

    turnFacesZ(dir) { // Z is forward and back
        this.faces.forEach(f =>{ // if cube.z == 1, then rotate z axis of cube
            f.turnZ(dir*HALF_PI); // call turnZ function. HALF_PI = 90 degrees
        });
    }

    turnFacesY(dir) { // Y is left and right
        this.faces.forEach(f =>{
            f.turnY(dir*HALF_PI);
        });
    }

    turnFacesX(dir) { // X is top and bottom
        this.faces.forEach(f =>{
            f.turnX(dir*HALF_PI);
        });
    }

    draw(){
        noFill();
        stroke(0);
        strokeWeight(1);
        push();
        let idx = 0;
        let mat4 = this.m.mat4;
        applyMatrix( // each matrix contains info where the pos and rotation of the cubie
            mat4[idx++],mat4[idx++],mat4[idx++],mat4[idx++],
            mat4[idx++],mat4[idx++],mat4[idx++],mat4[idx++],
            mat4[idx++],mat4[idx++],mat4[idx++],mat4[idx++],
            mat4[idx++],mat4[idx++],mat4[idx++],mat4[idx++]
        );
        box(1); // make a box

        this.faces.forEach(f =>{ // draw all faces
            f.draw();
        });
        pop(); // restores transformation states

    }

    drawIdx(){
        push();
        translate(0,0,1);
        fill(0);
        text(this.idx, 0, 0);
        pop();
    }

}

class Face{

    constructor(normal, color){
        this.normal = normal; // default pos
        this.color = color; // default color
    }

    turnZ(angle) {
        this.normal = createVector (// making a 2D vector out of the XY and rotating it
            round(this.normal.x * cos(angle) - this.normal.y * sin(angle)), // geting the new X and replacing it
            round(this.normal.x * sin(angle) + this.normal.y * cos(angle)), // geting the new y and replacing it
            round(this.normal.z));
			// using round because values might be off
			// ---- math is from matrix formulas, I dont really understand them 100% :/ ----
    }

    turnY(angle) {
        this.normal = createVector( // making a 2D vector out of the XZ and rotating it
            round(this.normal.x * cos(angle) - this.normal.z * sin(angle)),// geting the new X and replacing it
            round(this.normal.y), //round Y value 
            round(this.normal.x * sin(angle) + this.normal.z * cos(angle)));// geting the new Z and replacing it

    }

    turnX(angle) {
        this.normal = createVector( // making a 2D vector  out of the YZ and rotating it
            round(this.normal.x), // round X value
            round(this.normal.y * cos(angle) - this.normal.z * sin(angle)),// geting the new Y and replacing it
            round(this.normal.y * sin(angle) + this.normal.z * cos(angle)) // geting the new Z and replacing it
        );
    }
    draw(){ // draw rectancle with normal pos and color
        push(); // save face to matrix 
        fill(this.color); //fill face with color
        noStroke();
        rectMode(CENTER); // center is 0.5
        translate(this.normal.x/2, this.normal.y/2, this.normal.z/2); // vector lenghts are in increments of 1. So 1/2 = 0.5
        if (abs(this.normal.x) > 0) { // if along X axis do a Y rotation
            rotateY(HALF_PI);
        } else if (abs(this.normal.y) > 0) { // if along Z axis do a X rotation
            rotateX(HALF_PI);
        }
        square(0, 0, 1); // square with size 1
        pop(); // restores transformation states
    }



}

class Move{
    constructor(x, y, z, dir){ // When the cube moves give it X, Y, Z and direction value
        this.x = x;
        this.y = y;
        this.z = z;
        this.dir = dir;
        this.angle = 0;
    }
    copy() {
        return new Move(this.x, this.y, this.z, this.dir); //copying randomized moves so the cube can reverse 
    }

    reverse() {
        this.dir *= -1; //solves the cube backwards
    }
    start(){
        this.animating = true;
        this.finished = false;
    }
    update(){
        if(this.animating){
            this.angle += this.dir * .01 * SPEED;
            if (abs(this.angle) > HALF_PI) {
                this.angle = 0;
                this.animating = false;
                this.finished = true;
                if (abs(this.z) > 0) {
                    turnZ(this.z, this.dir);
                } else if (abs(this.x) > 0) {
                    turnX(this.x, this.dir);
                } else if (abs(this.y) > 0) {
                    turnY(this.y, this.dir);
                }
            }
        }

    }
}

function keyPressed(){ // basically an event listener for keystrokes

    if(key == ' '){
        if(this.counter == 0){
            this.currentMove = this.sequence[counter];
            this.currentMove.start();
        }else if(this.counter == this.sequence.length - 1){
            this.counter = 0;
            this.currentMove = this.sequence[counter];
            this.currentMove.start();
        }
    }else{
        applyMove(key);
    }
}

// up, down, left, right. Uppercase for negatvie direction
function applyMove(move) {

    switch (move) {
        case 'f':
            turnZ(1, 1);
            break;
        case 'F':
            turnZ(1, -1);
            break;
        case 'b':
            turnZ(-1, 1);
            break;
        case 'B':
            turnZ(-1, -1);
            break;
        case 'u':
            turnY(1, 1);
            break;
        case 'U':
            turnY(1, -1);
            break;
        case 'd':
            turnY(-1, 1);
            break;
        case 'D':
            turnY(-1, -1);
            break;
        case 'l':
            turnX(-1, 1);
            break;
        case 'L':
            turnX(-1, -1);
            break;
        case 'r':
            turnX(1, 1);
            break;
        case 'R':
            turnX(1, -1);
            break;
    }

}

function turnZ(idx, dir){
    for (cube of CUBES) { // look at all the cubes
        if(cube.z == idx){ //if Z is same as the index
            let m = new p5.Matrix(); // taking the side and turning it into a 2D matrix
            m.rotate(dir*HALF_PI, [0,0,1]);
            m.translate([cube.x, cube.y, 1]);
            cube.update(m.mat4[12], m.mat4[13], cube.z);
            cube.turnFacesZ(dir);
        }
    }
}

function turnY(idx, dir){
    for (cube of CUBES) { // look at all the cubes
        if(cube.y == idx){ //if Y is same as the index
            let m = new p5.Matrix(); // taking the side and turning it into a 2D matrix
            m.rotate(dir*HALF_PI, [0,-1,0]);
            m.translate([cube.x, 0, cube.z]);
            cube.update(m.mat4[12], cube.y,  m.mat4[14]);
            cube.turnFacesY(dir);
        }
    }
}

function turnX(idx, dir){
    for (cube of CUBES) { // look at all the cubes
        if(cube.x == idx){ //if X is same as the index
            let m = new p5.Matrix(); // taking the side and turning it into a 2D matrix
            m.rotate(dir*HALF_PI, [1,0,0]);
            m.translate([0, cube.y, cube.z]);
            cube.update(cube.x, m.mat4[13],  m.mat4[14]);
            cube.turnFacesX(dir);
        }
    }
}


const CUBES = [];
const ALLMOVES = [
    new Move(0, 1, 0, 1),
    new Move(0, 1, 0, -1),
    new Move(0, -1, 0, 1),
    new Move(0, -1, 0, -1),
    new Move(1, 0, 0, 1),
    new Move(1, 0, 0, -1),
    new Move(-1, 0, 0, 1),
    new Move(-1, 0, 0, -1),
    new Move(0, 0, 1, 1),
    new Move(0, 0, 1, -1),
    new Move(0, 0, -1, 1),
    new Move(0, 0, -1, -1)];

let counter = 0;
let text;
function setup() {

    text = createDiv("<h2>Press space key to start!</h2>")
    text.id("text");

    createCanvas(500, 500, WEBGL); //windows size 

    for(var x=-1; x<2; x++) { // create cubies
        for(var y=-1; y<2; y++) {
            for(var z=-1; z<2; z++) {
                CUBES.push(new Cubie(x, y, z, CUBES.length));
            }
        }
    }
    this.sequence = []; //cube moves
    let reverseSequence = []; // reverse moves for solfing
    for (let i = 0; i <MOVES; i++) { // shuffle and solve
        let move = ALLMOVES[randomInt(ALLMOVES.length)];
        this.sequence.push(move);
        let reverse = move.copy();
        reverse.reverse();
        reverseSequence.push(reverse);
    }
    reverseSequence.reverse();
    this.sequence = this.sequence.concat(reverseSequence);
    this.counter = 0;
    this.currentMove = this.sequence[counter];
}

function draw() {
    background(200);
    orbitControl(); // camera
	// camera orbits around the target
    scale(50);
    rotateX(-.5);
    rotateY(.5);
    rotateZ(.1);
    this.currentMove.update();
    if(this.currentMove.finished) {
        if(this.counter < this.sequence.length-1) {
            this.counter ++;
            this.currentMove = this.sequence[this.counter];
            this.currentMove.start();
            text.html("<h2>"+(this.counter+1)+"</h2>");
        }
    }

    for (cube of CUBES) {
        push();
        if (abs(cube.z) > 0 && cube.z == this.currentMove.z) {
            rotateZ(this.currentMove.angle);
        } else if (abs(cube.x) > 0 && cube.x == this.currentMove.x) {
            rotateX(this.currentMove.angle);
        } else if (abs(cube.y) > 0 && cube.y ==this.currentMove.y) {
            rotateY(-this.currentMove.angle);
        }
        cube.draw();
        pop();
    }
}