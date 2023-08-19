let bucketCapacity = 4;
function distance2(x1,y1,x2,y2){
    return ((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}
class QuadTree{
    constructor(x,y,width,height,points){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.subQuads = [];
        this.points = [];
        this.bSplit = false;
        if(points){
         for(let p of points){
                this.addPoint(p.x,p.y,p.vX,p.vY);
         }
    }
    }
   
    //adds a point to a tree and splits it if it goes over bucketCapacity;
    addPoint(x,y,xV,yV) { 
        if(this.points.length > bucketCapacity && !this.bSplit && this.width > 1 && this.height > 1){ 
            this.split();
        }
        if(!this.bSplit){
            this.points.push(new Point(x,y,xV,yV));
        }else{
            for(let sub of this.subQuads){
                if(x >= sub.x && x <= sub.x + sub.width && y >= sub.y && y <= sub.y + sub.height){
                    sub.addPoint(x,y,xV,yV);
                }
            }
        }
        
    }
    getLowestQuad(x,y,radius){
        let quadTemp = this;
        while(quadTemp.bSplit === true && quadTemp.width > radius && quadTemp.height > radius){
            for( let sub of quadTemp.subQuads){
                if(x >= sub.x && x <= sub.x + sub.width && y >= sub.y && y <= sub.y + sub.height){
                    quadTemp = sub;
                    break;
                }
            }
        }
        return quadTemp;
    }


    //splits a quadtree
    split(){
        if(this.bSplit === true){
            return;
        }
        this.bSplit = true;
        this.subQuads.push(new QuadTree(this.x,this.y,this.width/2,this.height/2));
        this.subQuads.push(new QuadTree(this.x + this.width/2,this.y,this.width/2,this.height/2));
        this.subQuads.push(new QuadTree(this.x,this.y + this.width/2,this.width/2,this.height/2));
        this.subQuads.push(new QuadTree(this.x + this.width/2 ,this.y + this.height/2,this.width/2,this.height/2));
        for(let p of this.points){
            this.addPoint(p.x,p.y,p.vX,p.vY);
        }
        this.points = [];
    }
    
    draw(){
        push();
        stroke(114,205,82);
        strokeWeight(this.width/30);
        line(this.x,this.y,this.x,this.y + this.height);
        line(this.x,this.y,this.x + this.width,this.y);
        pop();
        for(let i = 0; i < this.points.length;i++){
            point(this.points[i].x,this.points[i].y);
            
        }
        for(let i = 0; i < this.subQuads.length;i++){
            this.subQuads[i].draw();
        }
    }

    getPointsInRadius(px,py,radius){
        let points = [];
        
        function gpir (px,py,radius,sub){
            if(
                ((px - radius < sub.x +sub.width) && (py - radius < sub.y + sub.height)) &&
                ((px + radius > sub.x) && (py + radius > sub.y))
            ){
                if(sub.bSplit){
                    for(let s of sub.subQuads){
                        gpir(px,py,radius,s);
                    }
                }
                else{
                    for(let p of sub.points){
                        if(distance2(px,py,p.x,p.y) < radius*radius){
                            points.push(p);
                        }
                    }
                }
                
            }
        }
        gpir(px,py,radius,this);
        return points;
    }

}

class Point{
    constructor(x,y,xV,yV){
        this.x = x;
        this.y = y;
        this.vX = xV;
        this.vY = yV;
    }
    update(){
        this.x += this.vX;
        this.y += this.vY;
        this.vX *= .6;
        this.vY *= .6;
        if(this.x < 0 || this.x > height){
            this.vX *= -1;
            this.x += this.vX * 3;
        }
        if(this.y < 0 || this.y > height){
            this.vY *= -1;
            this.y += this.vY * 3;
        }
    }
    near(point){
        if (this.x === point.x && this.y === point.y) return;
        this.vX += 1/(this.x-point.x);
        this.vY += 1/(this.y-point.y);
        this.vX = Math.min(this.vX,5);
        this.vX = Math.max(this.vX,-5);
        this.vY = Math.min(this.vY,5);
        this.vY = Math.max(this.vY,-5);
    }
}