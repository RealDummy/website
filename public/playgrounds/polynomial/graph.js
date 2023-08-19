/*
*   The graphing element of the polynomial finder
*   contains the polynomial, polypoint, graph class
*   created by Sam Wortzman
*/


//div that contains the polynomial text
let div = document.getElementById("poly");
//div that contains the canvas
let canvasDiv = document.getElementById('canvas');

//a class that takes in any number of coefficients and constructs a polynomial.
//get y value with polynomial.f(x)
class polynomial{
    constructor(...coefficients){
        let trimedCoefficients = [];
        for(let i = 0; i < coefficients.length; i++){
            if(coefficients[i] !== 0){
                trimedCoefficients = coefficients.slice(i);
                break;
            }
        }
        this.degree = trimedCoefficients.length - 1;
        this.coefficients = trimedCoefficients;
    }
    derivitive(){
        let newCoefficients = [];
        for(let d = this.degree, i = 0; d>0;d--,i++){
            newCoefficients.push(this.coefficients[i]*d);
        }
        return new polynomial(...newCoefficients);
    }
    print(){
        let str = "";
        for(let i = 0; i <= this.degree; i++){
            let power = this.degree - i;
            //i am truly sorry for this
            if(this.coefficients[i] !== 0){
                str += `${str !== "" ? (this.coefficients[i]>0 ? " + ":" - ") :this.coefficients[i]>0 ? " ":"-"}${Math.abs(Math.round(this.coefficients[i]*1000)/1000)}${power > 0 ? 'x':''}${power>1 ? '<sup>'+power+'</sup>':''}`;
            }
            
        }
        return str;
    }
    f(x){
        let y = 0;
        let power = this.degree;
        for(let c of this.coefficients){
            y += c * Math.pow(x,power);
            power -= 1;
        }
        return y;
    }
}
//a point used by the graph class to remember the relative and absolute positions of points.
class polyPoint{
    constructor(x,y,xAbs,yAbs,radius=5){
        this.x = x;
        this.y = y;
        this.xAbs = xAbs;
        this.yAbs = yAbs;
        this.radius = radius;
    }
    //check if an canvas position is touching the point's canvas position
    touching(x,y){
        return Math.hypot(this.yAbs-y,this.xAbs-x) <= this.radius;
    }
    //draws a cirlce, its up to the caller to style the circle
    draw(){
        circle(this.pAbs.x,this.pAbs.y,this.radius*2);
    }
    //updates the points relative and absolute positions
    update(x,y,xAbs,yAbs){
        this.x = x;
        this.y = y;
        this.xAbs = xAbs;
        this.yAbs = yAbs;
    }
}

//a graph class that draws a polynomial based on where points are added
class graph{
    constructor(width,height,scale=10,resolution = 0.2,position={x:0,y:0},offset={x:0,y:0},maxPoints=6){
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.resolution = resolution;
        this.maxPoints = maxPoints;
        this.p = {x:position.x,y:position.y};
        this.offset = {x:offset.x,y:offset.y};
        this.realOffset = {
          x:  (this.offset.x/(2*this.scale))*this.width + this.width/2 + this.p.x,
          y:  (this.offset.y/(2*this.scale))*this.height + this.height/2 + this.p.y, 
        }
        this.polynomial = undefined;
        this.points = [];
        this.graphPoints = [];
        this.holdingPoint = null;
    }
    update(x,y){
        if(this.holdingPoint){
            if(!mouseIsPressed){
                this.holdingPoint = null;
                return;
            }
            if(x>this.width + this.p.x || x < this.p.x || y > this.height + this.p.y || y < this.p.y){
                x = Math.min(Math.max(x,this.p.x),this.width+this.p.x);
                y = Math.min(Math.max(y,this.p.y),this.height+this.p.y);
            }
            let rel = this.translate(x,y);
            this.holdingPoint.update(rel.x,rel.y,x,y);
            this.createPolynomialFromPoints();
            return;
        }
        if(!mouseIsPressed){return;}
        if(mouseButton === LEFT){
            for(let i = 0; i < this.points.length; i++){
                if(this.points[i].touching(x,y)){
                    this.holdingPoint = this.points[i];
                    return;
                }
            }
            if(this.addPoint(x,y)){
                this.holdingPoint = this.points[this.points.length - 1];
                this.createPolynomialFromPoints();
            }
            
        }
        else if (mouseButton === RIGHT){
            if(!movedX && !movedY){return;}
            let m = {x:movedX,y:movedY};
            this.realOffset.x += m.x;
            this.realOffset.y += m.y;
            this.offset.x += (m.x/this.width)*2*this.scale;
            this.offset.y += (m.y/this.height)*2*this.scale;
            this.updatePointsPosition();
            this.createPoints();
        }
    }
    calculateRealOffset(){
        this.realOffset = {
            x:  (this.offset.x/(2*this.scale))*this.width + this.width/2 + this.p.x,
            y:  (this.offset.y/(2*this.scale))*this.height + this.height/2 + this.p.y, 
          }
    }
    createPolynomial(...coefficients){
        this.polynomial = new polynomial(...coefficients);
        let p = document.createElement('p');
        p.innerHTML = this.polynomial.print();
        div.innerHTML = "";
        div.appendChild(p);
        this.createPoints();
    }
    //turns positions on the canvas to positions on the graph 
    translate(x,y){
        let xrel = x;
        let yrel = y;
        xrel = ((xrel-this.p.x-(this.width/2))/this.width)*this.scale*2 - this.offset.x;
        yrel = (-(yrel-this.p.y-(this.height/2))/this.height)*this.scale*2 + this.offset.y;
        return {x:xrel,y:yrel};
    }
    untranslate(xrel,yrel){
        let x = xrel;
        let y = yrel;
        x = (x/(2*this.scale))*this.width + this.realOffset.x;
        y = -(y/(2*this.scale))*this.height + this.realOffset.y;
        return {x:x,y:y};
    }
    //adds a point (x,y) is a canvas location
    addPoint(x,y){
        if(this.points.length >= this.maxPoints){
            return false;
        }
        if(x>this.width + this.p.x || x < this.p.x || y > this.height + this.p.y || y < this.p.y){
            return false;
        }
        let rel = this.translate(x,y);
        for(let p of this.points){
            if(p.x === rel.x){
                return false;
            }
        }
        this.points.push(new polyPoint(rel.x,rel.y,x,y,5));
        return true;
    }
    createPolynomialFromPoints(){
        if(this.points.length < 2){return;}
        let degree = this.points.length - 1;
        let m = [];
        for(let i = 0; i < this.points.length; i++){
            let temp = [];
            for(let j = degree; j >= 0; j--){
                temp.push(Math.pow(this.points[i].x,j))
            }
            temp.push(this.points[i].y);
            m.push(temp);
        }
        //console.log(m);
        let system = new AugMatrix(...m);
        system.rref();
        if(system.checkValid() === false){return;}
        let coefficients = [];
        for(let i = 0; i < system.rowCount; i++){
            coefficients.push(system.data[i][system.colCount-1]);
        }
        this.createPolynomial(...coefficients);
        
    }
    updatePointsPosition(){
        for(let i = 0; i < this.points.length; i++){
            let p = this.points[i];
            let recalcPos = this.untranslate(p.x,p.y);
            p.xAbs = recalcPos.x;
            p.yAbs = recalcPos.y;
        }
    }
    changeScale(newScale){
        if(this.scale === newScale || mouseIsPressed){
            return;
        }
        if(newScale > 100){
            newScale = 100;
        }
        else if(newScale < 1){
            newScale = 1;
        }
        this.resolution = (newScale/this.scale)*this.resolution;
        this.scale = newScale;
        this.calculateRealOffset();
        if(this.points.length !== 0){
            this.updatePointsPosition();
        }
        if(this.polynomial){
            this.createPoints();
        }
        
    }
    createPoints(){
        if(!this.polynomial){
            console.warn('no polynomial loaded');
            return;
        }
        this.graphPoints = [];
        for(let x = -this.scale-this.offset.x; x<=this.scale-this.offset.x; x+=this.resolution){
            this.graphPoints.push({x:x,y:this.polynomial.f(x)});
        }
    }

    //for p5.js functions only!!!
    draw(){
        push();
        noFill();
        stroke(0);
        let x2,y2;
        //x axis line
        line(this.p.x,this.realOffset.y,this.width+this.p.x,this.realOffset.y);
        //yaxis line
        line(this.realOffset.x,this.p.y,this.realOffset.x,this.p.y+this.height);
        //border
        rect(this.p.x,this.p.y,this.width,this.height);
        //tick marks
        let tickSize = 6 - Math.log(this.scale);
        for(let i = -this.scale; i <= this.scale; i++){
            let tickX = (Math.round(i)/this.scale)*this.width + this.realOffset.x;
            let tickY = (Math.round(i)/this.scale)*this.height + this.realOffset.y;
            line(tickX,this.realOffset.y - tickSize,tickX,this.realOffset.y + tickSize);
            line(this.realOffset.x - tickSize,tickY,this.realOffset.x+tickSize,tickY);
        }
        stroke(62,166,241);
        for(let i = 0; i < this.graphPoints.length; i++){
            let p1 = this.graphPoints[i];
            //console.log(p1);
            let x1 = (p1.x/(2*this.scale))*this.width + this.realOffset.x;
            let y1 = -(p1.y/(2*this.scale))*this.height + this.realOffset.y;
            if(i !== 0){
                line(x1,y1,x2,y2);
            }
            x2 = x1;
            y2 = y1;
        }

        fill(235,103,222);
        noStroke();
        for(let p of this.points){
            if(p === this.holdingPoint){
                fill(114,205,82);
                circle(p.xAbs,p.yAbs,2.5*p.radius);
            }
            else{
                fill(235,103,222);
                circle(p.xAbs,p.yAbs,2*p.radius);
            }
            
        }
        pop();
    }
}
let g1;
let c;

function mouseWheel(event){
    if(event.delta > 0){
        g1.changeScale(g1.scale + g1.scale*.2);
    }
    else{
        g1.changeScale(g1.scale - g1.scale*0.2)
    }
    return false;
}

let bgColor;
function setup(){
    /*
    let rect = canvasDiv.getBoundingClientRect();
    let h = window.innerHeight - rect.top - 10;
    let w = rect.right - rect.left - 10;
    let size = Math.min(h,w);
    
    */
    c = createCanvas(500,400);
    canvasDiv.addEventListener('contextmenu', (e)=>{
        e.preventDefault();
        return false;
    });
    c.parent("canvas");
    bgColor = color(219,219,219);
    background(bgColor);
    g1 = new graph(width,height,10,0.1);
    g1.createPolynomialFromPoints();
}
function draw(){
    background(bgColor);
    g1.update(mouseX,mouseY);
    g1.draw();
}