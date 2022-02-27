let mcan = document.getElementById("maincanvas");
let mctx = mcan.getContext("2d");
mcan.width = window.innerWidth;
mcan.height = window.innerHeight;
let mcw = mcan.width;
let mch = mcan.height;
let mcm = 0;
if (mcw > mch) {
    mcm = mch;
} else {
    mcm = mcw;
}
let ledgeCount = 18;
let bc = [102/255, 77/255, 51/255];
yrm = mcm/20;
let velChange = 2;

class Ledge{
    constructor(){
        this.id = 0;
        this.y = randomBetween(0.1, 0.9, 0.01);
        this.x = randomBetween(0.1, 0.9, 0.01);
        this.w = randomBetween(1/16, 1/4, 0.01);
    }
    drawSelf(ctx, cw, ch){
        let a = (this.id/(ledgeCount-1))/2+0.25;
        ctx.fillStyle = colorMix(...bc, 1-a, 0, 0, 0, a);
        ctx.fillRect((this.x-this.w/2)*cw, this.y*ch, this.w*cw, ch);
    }
}

class YourRobot{
    constructor(){
        this.x = ledgeOrder[Math.ceil(ledgeCount/2)].x*mcw;
        this.y = ledgeOrder[Math.ceil(ledgeCount/2)].y*mch-yrm/2;
        this.velX = 0;
        this.velY = 0;
        this.lasers = [];
        this.idCounter = 0;
    }
    drawSelf(){
        mctx.fillStyle = colorString(0.5, 0.5, 0.5, 1);
        mctx.fillRect(this.x-yrm/2, this.y-yrm/2, yrm, yrm);
        mctx.strokeStyle = colorString(0, 0, 1, 1);
        mctx.lineWidth = yrm/8;
        mctx.strokeRect(this.x-yrm/4, this.y-yrm/4, yrm/2, yrm/2);
    }
}

class Laser{
    constructor(id, robot, yours, tarX, tarY){
        this.id = id;
        this.yours = yours;
        this.robot = robot;
        this.tarX = tarX;
        this.tarY = tarY;
        this.x = robot.x;
        this.y = robot.y;
        this.angle = Math.atan2(tarY-this.y, tarX-this.x);
    }
    drawSelf(){
        if (this.yours) {
            mctx.strokeStyle = "#0000ff";
        } else {
            mctx.strokeStyle = "#ffff00";
        }
        mctx.lineWidth = 5;
        mctx.beginPath();
        mctx.moveTo(this.x-Math.cos(this.angle)*10, this.y-Math.sin(this.angle)*10);
        mctx.lineTo(this.x+Math.cos(this.angle)*10, this.y+Math.sin(this.angle)*10);
        mctx.stroke();
    }
    remove(){
        for (let i=0; i<this.robot.lasers.length; i++) {
            if (this.robot.lasers[i].id == this.id) {
                this.robot.lasers.splice(i, 1);
            }
        }
    }
}

function randomBetween(min, max, precision){
    return Math.floor((Math.random()*(max-min)+min)/precision)*precision;
}

function colorString(r, g, b, a){
    r = Math.floor(r*255)*256*256*256;
    g = Math.floor(g*255)*256*256;
    b = Math.floor(b*255)*256;
    a = Math.floor(a*255);
    return "#"+(r+g+b+a).toString(16).padStart(8, "0");
}

function colorMix(r1, g1, b1, a1, r2, g2, b2, a2){
    let r = r1*a1+r2*a2;
    let g = g1*a1+g2*a2;
    let b = b1*a1+b2*a2;
    let a = a1+a2;
    return colorString(r, g, b, a);
}

let ledges = [];
for (let i=0; i<ledgeCount; i++) {
    let ledge = new Ledge();
    ledges.push(ledge);
}
let ledgeOrder = [];
while (ledges.length > 0) {
    let highest = {item: 0, y: 1};
    for (let i=0; i<ledges.length; i++) {
        if (ledges[i].y < highest.y) {
            highest.item = i;
            highest.y = ledges[i].y;
        }
    }
    ledges[highest.item].id = ledgeOrder.length;
    ledgeOrder.push(ledges[highest.item]);
    ledges.splice(highest.item, 1);
}
let yourRobot = new YourRobot();

function drawingLoop(){
    mctx.fillStyle = colorString(...bc, 1);
    mctx.fillRect(0, 0, mcw, mch);
    ledgeOrder.forEach((ledge)=>{
        ledge.drawSelf(mctx, mcw, mch);
    });
    yourRobot.lasers.forEach((laser)=>{
        laser.drawSelf();
    });
    yourRobot.drawSelf();
    mctx.fillStyle = colorString(0.7, 0, 0, 0.7);
    mctx.fillRect(0, mch*0.95, mcw, mch*0.05);
    requestAnimationFrame(drawingLoop);
}

let falling = true;
function physicsLoop(){
    yourRobot.x += yourRobot.velX;
    yourRobot.y += yourRobot.velY;
    falling = true;
    ledgeOrder.forEach((ledge)=>{
        if (yourRobot.y+yrm/2 > ledge.y*mch-yourRobot.velY-1) {
            if (yourRobot.y+yrm/2 < ledge.y*mch+yourRobot.velY+1) {
                if (yourRobot.x > (ledge.x-ledge.w/2)*mcw-yrm/2) {
                    if (yourRobot.x < (ledge.x+ledge.w/2)*mcw+yrm/2) {
                        falling = false;
                    }
                }
            }
        }
    });
    if (yourRobot.y+yrm/2 > mch-yourRobot.velY-1) {
        if (yourRobot.y+yrm/2 < mch+yourRobot.velY+1) {
            falling = false;
        }
    }
    if (falling) {
        yourRobot.velY += velChange/4;
    } else {
        yourRobot.velY = 0;
        yourRobot.velX *= 0.95;
    }
    yourRobot.lasers.forEach((laser)=>{
        laser.x += Math.cos(laser.angle)*10;
        laser.y += Math.sin(laser.angle)*10;
        if (laser.x > mcw) {
            laser.remove();
        }
        if (laser.y > mch) {
            laser.remove();
        }
        if (laser.x < 0) {
            laser.remove();
        }
        if (laser.y < 0) {
            laser.remove();
        }
    });
    requestAnimationFrame(physicsLoop);
}

physicsLoop();
drawingLoop();

function keyDown(event){
    if (event.key == "a") {
        yourRobot.velX = velChange*-3;
    }
    if (event.key == "d") {
        yourRobot.velX = velChange*3;
    }
    if (event.key == "w") {
        if (!falling) {
            yourRobot.velY = velChange*-6;
        }
    }
    if (event.key == "s") {
        if (!falling) {
            yourRobot.velY = velChange;
        }
    }
    if (event.key == "f") {
        yourRobot.velX = 0;
    }
}
document.addEventListener("keydown", keyDown);

function mcanClicked(event){
    let laser = new Laser(yourRobot.idCounter, yourRobot, true, event.x, event.y);
    yourRobot.lasers.push(laser);
    yourRobot.idCounter ++;
}
mcan.addEventListener("click", mcanClicked);