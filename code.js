let mcan = document.getElementById("maincanvas");
let mctx = mcan.getContext("2d");
mcan.width = window.innerWidth;
mcan.height = window.innerHeight;
let mcw = mcan.width;
let mch = mcan.height;

mctx.fillStyle = "#33271a";
mctx.fillRect(0, 0, mcw, mch);