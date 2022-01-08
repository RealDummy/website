
class base{
    //x1 and x2 are normalized
    constructor(x1,x2, points){
        this.start = x1;
        this.end = x2;
        this.segs = [];
        let a,b;
        a = createVector(0,0.5);
        for(let i = 0; i < points.length; i++){
            //create a line with the x only going forward by a somewhat random amount
            b = createVector(points[i].x,points[i].y);
            this.segs.push(new lineSegment(a,b));
            a = b;
        }
        //finish the line 1 unit away from where it started
        this.segs.push(new lineSegment(a,createVector(1,0.5)));
    }

    draw(){
        push();
        noFill();
        
        for(let s of this.segs){
            s.draw((this.start+0.025)*width,height/10,(this.end-this.start - 0.05)*width,height-height/5,true);
        }
        strokeWeight(2);
        stroke(255);
        rect(this.start*width,height/10,(this.end-this.start)*width, height-height/5);
        pop();
    }
}

class fractal{
    //x1 and x2 are normalized
    constructor(x1,x2,base,level){
        this.start = x1;
        this.end = x2;
        this.base = base;
        this.depth = level;
        this.segs = base.segs;
        for(let i = 0; i < this.depth; i++){
            let temp = [];
            for(let s of this.segs){
                //subdivide the line segments for each depth
                temp.push(...s.div(this.base));
            }
            this.segs = temp;
        }
    }
    draw(){
        push();
        noFill();
        
        for(let s of this.segs){
            s.draw((this.start+0.025)*width,height/10,(this.end-this.start - 0.05)*width,height-height/5);
        }
        strokeWeight(2);
        stroke(255);
        rect(this.start*width,height/10,(this.end-this.start)*width, height-height/5);
        pop();
    }
}

class lineSegment{
    constructor(a,b, c = undefined){
        this.a = a;
        this.b = b;
        this.length = Math.hypot(this.b.x-this.a.x,this.b.y-this.a.y);
        this.c = c;
    }
    div(base){
        let res = [];
        //get direction the line segment is facing
        let heading = Math.atan2(this.b.y-this.a.y,this.b.x-this.a.x);
        let a,b;
        a = this.a;
        let head = this.a;
        for(let p of base.segs){
            //get a slice of the base relative to the start
            let v = createVector(p.b.x,p.b.y-0.5);
            //rotate that vector to match the line segments angle
            v.rotate(heading);
            //scale it to the size of the line seg
            v.mult(this.length);
            //position relative vector at start of line segment
            v.add(head);
            
            b = v;
            res.push(new lineSegment(a,b));
            //set a to b because last segment of bases "b" is the next segments "a"
            a = b;
        }
        return res;
    }
    draw(x,y,w,h,bCircle){
        if(this.c !== undefined){
            stroke(this.c);
        }
        line(x+this.a.x*w,y+this.a.y*h,x+this.b.x*w,y+this.b.y*h);
        if(bCircle) {
            fill(255);
            circle(x+this.a.x*w,y+this.a.y*h,5);
            circle(x+this.b.x*w,y+this.b.y*h, 5);
            noFill();
        }
    }
}
//initialize stuff
let b, f;
let complexitySlider = document.getElementById("complexity_slider");
let depthSlider = document.getElementById("depth_slider");

let complexity = -1;
let levelDepth = -1;
const bgc = {r:62,g:166,b:241};
let points, holding = null;

function normPoints(x,y,w,h,points) {
    let res = [];
    for (let p of points) {
        res.push(createVector(
            (p.x - x) / w,
            (p.y - y) / h,
        ));
    }
    return res;
}
function genRadomPoints(x,y,w,h, n) {
    let res = [];
    for(let i = 0; i < n; ++i){
        let xr = x + Math.random() * w;
        let yr = y + Math.random() * h;
        res.push(createVector(
            xr,
            yr
        ));
    }
    res.sort((a,b) => {
        return a.x - b.x;
    });
    return res;
}
//remake the whole thing with updated vars
function update(bForce = false){
    let newPoints = false;
    if (complexity !== complexitySlider.value) {
        complexity = complexitySlider.value;
        newPoints = true;
    }
    if(levelDepth !== depthSlider.value) {
        levelDepth = depthSlider.value;
        newPoints = true;
    }
    let bupdate = bForce;
    if(newPoints || bForce) {
        points = genRadomPoints(0.0725*width, height / 10, 0.3 * width, height * 0.8, complexity);
        holding = null;
        bupdate = true;
    }
    if (mouseIsPressed && holding == null) {
        for(let i = 0; i < points.length; ++i) {
            if(Math.abs(mouseX - points[i].x) <= 10 && Math.abs(mouseY - points[i].y) <= 10 ) {
                holding = points[i];
                break;
            }
        }
    }
    if (mouseIsPressed && holding !== null) {
        holding.x = mouseX;
        holding.y = mouseY;
        bupdate = true;
    }

    if (!mouseIsPressed) {
        holding = null;
    }
    if(bupdate){
        b = new base(
            0.05, 0.4,
            normPoints(0.0725*width, height / 10, 0.3 * width, height * 0.8, points)
        );
    f = new fractal(0.5,0.95,b,levelDepth);
    b.draw();
    f.draw();
    }
    
}
complexitySlider.addEventListener("input",()=>{update(true)});
depthSlider.addEventListener("input",(e)=>{
    levelDepth = depthSlider.value;
    f = new fractal(0.5,0.95,b,levelDepth)
});
document.getElementById("new").addEventListener("click",()=>{update(true)});
function windowResized(){
    resizeCanvas(window.innerWidth - 20, window.innerHeight - 150);
}

function setup(){
    let cvs = createCanvas(window.innerWidth - 20, window.innerHeight - 150);
    cvs.parent("canvas");
    background(bgc.r,bgc.g,bgc.b);
    update();
}
function draw(){
    background(bgc.r,bgc.g,bgc.b);
    stroke(255);
    update();
    b.draw();
    f.draw();
    
}