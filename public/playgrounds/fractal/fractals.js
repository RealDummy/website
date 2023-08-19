let colors; 
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
            this.segs.push(new lineSegment(a,b,colors[i%colors.length]));
            a = b;
        }
        //finish the line 1 unit away from where it started
        this.segs.push(new lineSegment(a,createVector(1,0.5), colors[points.length%colors.length]));
    }

    draw(){
        push();
        noFill();
        
        this.segs[0].draw((this.start+0.025)*width,height/10,(this.end-this.start - 0.05)*width,height-height/5,false);
        for(let i = 1; i < this.segs.length - 1; ++i){
            this.segs[i].draw((this.start+0.025)*width,height/10,(this.end-this.start - 0.05)*width,height-height/5,true);
        }
        this.segs[this.segs.length - 1].draw((this.start+0.025)*width,height/10,(this.end-this.start - 0.05)*width,height-height/5,false);

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
        let [minx, miny] = [this.segs[0].a.x, this.segs[0].a.y];
        let [maxx, maxy] = [minx, miny];
        for(let p of this.segs) {
            for( let q of [p.a, p.b]){
                minx = Math.min(minx, q.x);
                maxx = Math.max(maxx, q.x);
                miny = Math.min(miny, q.y);
                maxy = Math.max(maxy, q.y);
            }
        }
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
        let i = 0;
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
            res.push(new lineSegment(a,b, lerpColor(colors[i%colors.length], this.c, 0.75)));
            //set a to b because last segment of bases "b" is the next segments "a"
            a = b;
            ++i;
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
const bgc = {r:34,g:34,b:34};
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
    let o = createVector(x, y + h/2);
    const maxDist = w * 1.5/ n;
    const maxLen = w * 2 / n;
    for(let i = 0; i < n; ++i){
        const minDist = (p5.Vector.dist(createVector(x+w, y + h/2), o) - maxDist * (n - i)) / (n - i);
        const dist = Math.random() * (maxDist - minDist) + minDist;
        const maxangle = Math.acos(dist/maxLen);
        const minangle = -maxangle;
        const angle = Math.random() * (maxangle - minangle) + minangle;
        const len = dist / Math.cos(angle);
        const v = createVector(len, 0);
        v.limit(maxLen);
        v.rotate(angle);
        o = p5.Vector.add(v, o);
        o.x = Math.min(Math.max(o.x,x), x+w);
        o.y = Math.min(Math.max(o.y,y), y+h);
        res.push(o);
    }
    res.sort((a,b) => {
        return a.x - b.x;
    });
    return res;
}
//remake the whole thing with updated vars
function update(bForce = false){
    let newPoints = false;
    if (complexity !== max(min(complexitySlider.value,5), 0)) {
        complexity = max(min(complexitySlider.value,5), 0);
        newPoints = true;
    }
    let bupdate = bForce;
    if(levelDepth !== depthSlider.value) {
        levelDepth = depthSlider.value;
        newPoints = true;
    }
    if(newPoints || bForce) {
        points = genRadomPoints(0.0725*width, height / 10, 0.3 * width, height * 0.8, complexity);
        holding = null;
        bupdate = true;
    }
    let [nmx, nmy] = [mouseX, mouseY];

    if (mouseIsPressed && holding == null) {
        for(let i = 0; i < points.length; ++i) {
            if(Math.abs(nmx - points[i].x) <= 10 && Math.abs(nmy - points[i].y) <= 10 ) {
                holding = points[i];
                break;
            }
        }
    }
    if (mouseIsPressed && holding !== null) {
        holding.x = nmx;
        holding.y = nmy;
        bupdate = true;
    }

    if (!mouseIsPressed) {
        holding = null;
    }
    if(bupdate == true){
        b = new base(
            0.05, 0.4,
            normPoints(0.0725*width, height * 0.1, 0.3 * width, height * 0.8, points)
        );
        f = new fractal(0.5,0.95,b,levelDepth);
        background(bgc.r,bgc.g,bgc.b);
        b.draw();
        f.draw();
    }
    
}
complexitySlider.addEventListener("input",()=>{update(true)});
depthSlider.addEventListener("input",(e)=>{
    levelDepth = max(min(6,depthSlider.value), 0);
    f = new fractal(0.5,0.95,b,levelDepth)
});
document.getElementById("new").addEventListener("click",()=>{update(true)});
function windowResized(){
    let [ow, oh] = [width, height];
    resizeCanvas(window.innerWidth - 20, window.innerHeight - 150);
    for(a of points) {
        a.x = a.x / ow * width;
        a.y = a.y / oh * height;
    }
    update(true);

}

function setup(){
    colors = [color(114, 205, 82), color(235, 103, 222),color(62, 166, 241)];
    let cvs = createCanvas(window.innerWidth - 20, window.innerHeight - 150);
    cvs.parent("canvas");
    background(bgc.r,bgc.g,bgc.b);
    update();
}
function draw(){
    stroke(255);
    update();
}