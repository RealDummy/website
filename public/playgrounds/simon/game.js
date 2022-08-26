
let rlights, llights, lsquares, rsquares; //parent elements
let level, maxlevel, pattern, correctNumber; //game variables
let repressGuard, enabled; //button guard counters/boolean that stop repeat button presses / 
// button presses while the sequence is being desplayed.
let stars = []; //array of objects {x:num,y:num, size: num, speed:num} with star positions
let canvas, ctx;

let onTime = 200; //ms
let delay = 100;
let bigDelay = 800;
let errorTime = 250;
let displayTime = 400;
let starCount = 50;

//timeout that returns a promise to await
const wait = (delay) => new Promise( (resolve) => setTimeout(resolve, delay) );

//calls a function after an interval
async function delayCall(func, delay, ...args){
    await wait(delay);
    await func(...args);
}

function clearlights(lights){
    let arr = lights.children;
    for(let i = 0; i < arr.length; ++i){
        arr[i].className = 'off';
    }
}

//changes an elements (e) class to off
//if guardable is true, will use elements id
//to lookup weather the button is currently active.
//increase repressGuard[id] by 1 when it is pressed
async function guardedToggle(e, guardable=false){
    if(guardable){
        if(repressGuard[e.id] === 1){
            e.className = 'off';
        }
        repressGuard[e.id] -= 1;
        
    }
    else{
        e.className = 'off';
    }
}

// changes element (e) to (className), then back to off after (time)
// if (guardable), then guarded === true in guardedToggle() call
async function flicker(e, className, time, guardable = false){
    e.className = className;
    if(guardable){

        if(!repressGuard[e.id]){
            repressGuard[e.id] = 0;
            console.log(repressGuard);
        }
        repressGuard[e.id] += 1;
    }
    await delayCall( guardedToggle, time, e, guardable);
}

//shows next sequence of simon says.
//also waits a bit b4 it starts, and clears rlights and adds a light to llights
async function displayNext(){
    disable();
    clearlights(rlights);
    await wait(bigDelay);
    llights.children[level - 1].className = 'on';
    for(let i = 0; i < level; ++i){
        await flicker(lsquares.children[pattern[i]],'on', displayTime);
        await wait(delay);
    }
    enable();
}

//reset the game to the first level and start
function reset(){
    clearlights(rlights);
    clearlights(llights);
    correctNumber = 0;
    level = 1;
    repressGuard = {};
    enabled = true; //eventually should be false, and a seperate function will call enable()
    pattern = [];
    maxlevel = llights.children.length;
    for(let i = 0; i < maxlevel; ++i){
        pattern.push(Math.floor(Math.random()*9));
    }
    displayNext();
}

//disable button presses from mattering
function disable(){
    enabled = false;
    for(let e of rsquares.children){
        e.className = 'disabled';
    }
}

//enable button presses
function enable(){
    enabled = true;
    for(let e of rsquares.children){
        e.className = 'off';
    }
}

async function doubleBlink(e){
    await flicker(e, 'wrong', errorTime);
    await flicker(e, 'off', errorTime);
    await flicker(e, 'wrong', errorTime);
    e.className = 'off';
    
}
async function wrongInput(){
    disable();
    for(let e of rsquares.children){
        doubleBlink(e);
    }
    for(let e of rlights.children){
        doubleBlink(e);
    }
    await delayCall(reset, errorTime * 3);
}

async function handlePress(i){
    let e = rsquares.children[i];
    if(enabled === false){
        return;
    }
    if(pattern[correctNumber] === i){
        rlights.children[correctNumber].className = 'on';
        correctNumber += 1;
        await flicker(e, 'on', onTime, true);
        if(correctNumber === level){
            correctNumber = 0;
            level += 1;  
            if(level === maxlevel + 1){
                //win
                reset();
                return;
            }
            displayNext();
        }
        
    }
    else{
        wrongInput();
    }
}
function handleResize(){
    let ow = canvas.width;
    let oh = canvas.height;
    
    let w = window.innerWidth;
    let h = window.innerHeight;

    let wratio = w / ow;
    let hratio = h / oh;

    for(let s of stars){
        s.y *= hratio;
        s.x *= wratio;
    }

    canvas.width = w;
    canvas.height = h;

    ctx = canvas.getContext('2d');
    console.log(ctx);
}

function init(){
    let arr = rsquares.children;
    for(let i = 0; i < arr.length; ++i){
        arr[i].addEventListener('click', handlePress.bind(this,i));
    }
    for(let i = 0; i < starCount; ++i){
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 6 + 2,
            speed: Math.random() * 2 + 1,
        });
    }
    window.addEventListener('resize',handleResize);
    reset();
}

function drawStars(){
    ctx.fillStyle = 'black';
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'none';
    for(let s of stars){
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
        ctx.fill();
        s.x += s.speed;
        if(s.x > window.innerWidth + s.size){
            s.x = -s.size;
        }
    }

    requestAnimationFrame(drawStars)
}

function main(){
    llights = document.getElementById('lights-1');
    rlights = document.getElementById('lights-2');
    lsquares = document.getElementById('light-squares');
    rsquares = document.getElementById('button-squares');

    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    console.log(ctx);

    init();
    drawStars();
}
