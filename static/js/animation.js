<!-- <script type="text/javascript"> -->

var animationR = 0;
var Animation = null;
var pixell = [];

function drawAnimation(lay)
{
    var datal = lay._datal;
    var ctx= lay._ctx;
    var project = map.getMapType().getProjection();
    var size = map.getSize();
    var center = map.getCenter();
    var pixel = map.pointToOverlayPixel(center);
    var zoomUnit = Math.pow(2, 18 - map.getZoom());
    var mcCenter = project.lngLatToPoint(map.getCenter());
    var nwMc = new BMap.Pixel(mcCenter.x - size.width / 2 * zoomUnit, mcCenter.y + size.height / 2 * zoomUnit);

    if (center) 
    {
        ctx.canvas.style.left = pixel.x - size.width / 2 + 'px';
        ctx.canvas.style.top = pixel.y - size.height / 2 + 'px';
    }

    if (ctx.canvas.width <= 0 || ctx.canvas.height <= 0) return;

    if (datal.length == 0 ) return;

    ctx.clearRect(0, 0, size.width, size.height);
    ctx.globalCompositeOperation = "lighter"; 

    pixell = [];    
    for (var i = 0; i < datal.length; i++) 
    {
        var pixel = project.lngLatToPoint(datal[i].ll);
        var x = (pixel.x - nwMc.x) / zoomUnit;
        var y = (nwMc.y - pixel.y) / zoomUnit;
        var index = datal[i].time;

        if (x < 0 || y < 0)
            continue ;
        if (x > ctx.canvas.width || y > ctx.canvas.height)
            continue ;
        
        pixell.push([x, y]);
    }
    animation(lay);
}

function animation(lay) 
{
    var ctx= lay._ctx;
    var size = map.getSize();
    ctx.clearRect(0, 0, size.width, size.height);
    var r = animationR % 5;
    for (var i = 0; i < pixell.length; i++) 
    {
        var x = pixell[i][0];
        var y = pixell[i][1];
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.globalAlpha = 1 - r*0.192;
        ctx.arc(x , y , r*10, 0, Math.PI * 2);
        ctx.fill();
    } 
}
