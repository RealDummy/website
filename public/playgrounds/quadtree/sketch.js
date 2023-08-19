let quad;
let points = []
let searchRadius = 110;
function setup(){
	let div = document.getElementById("canvas");
	let canvas = createCanvas(500,500);
	canvas.parent("canvas");
	frameRate(60);
	background(0);
}
function draw(){
	clear()
	background(51);
	fill(255);
	if(mouseIsPressed){
		points.push(new Point(mouseX + random(50)-25,mouseY+random(50)-25,random(2)-1,random(2)-1));
	}
	points.forEach((item)=>{
		item.update();
	});
	quad = new QuadTree(0,0,width,height,points);
	points.forEach( (item)=>{
		let l = quad.getPointsInRadius(item.x,item.y,70);
		for(let p of l){
			item.near(p);
		}
	} );
	strokeWeight(4);
	stroke(62,166,241);
	quad.draw();
	let selectedPoints = quad.getPointsInRadius(mouseX,mouseY,searchRadius);
	stroke(235,103,222);
	noFill();
	circle(mouseX,mouseY,searchRadius*2);

	for(let p of selectedPoints){
		point(p.x,p.y);
	}
}