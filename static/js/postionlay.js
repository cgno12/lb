
<!-- <script type="text/javascript"> -->

function DrawPostion(lay)
{
    var datal = lay._datal;
    var map = lay._map;
    var canvas = lay._canvas;
    var	ctx = lay._ctx;
    var project = map.getMapType().getProjection();
    var size = map.getSize();
    var center = map.getCenter();
    var pixel = map.pointToOverlayPixel(center);
    var zoomUnit = Math.pow(2, 18 - map.getZoom());
    var mcCenter = project.lngLatToPoint(map.getCenter());
    var nwMc = new BMap.Pixel(mcCenter.x - size.width / 2 * zoomUnit, mcCenter.y + size.height / 2 * zoomUnit);
    if (center) 
    {
        canvas.style.left = pixel.x - size.width / 2 + 'px';
        canvas.style.top = pixel.y - size.height / 2 + 'px';
    }

    canvas.style.opacity = 0.8;
    ctx.clearRect(0, 0, size.width, size.height);

    var ptbd = wgs2bd(parseFloat(centerPt.lng), parseFloat(centerPt.lat));

    var p = new BMap.Point(ptbd[0], ptbd[1]);
    var pixel = project.lngLatToPoint(p);

    var x = (pixel.x - nwMc.x) / zoomUnit;
    var y = (nwMc.y - pixel.y) / zoomUnit;

    var radius = 150000;
    var realtopixel = getRealtoPixel2(p);
    var rr = radius / realtopixel;

    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.font="12px 微软雅黑";
    ctx.fillStyle= "red";
    ctx.fillText("150 km", rr-40,-5);
    ctx.fillText("100 km", rr*2/3-40,-5);
    ctx.fillText("50 km", rr/3-40,-5);
    ctx.arc(0, 0, rr, 0, 2*Math.PI);
    ctx.arc(0, 0, rr*2/3, 0, 2*Math.PI);
    ctx.arc(0, 0, rr*1/3, 0, 2*Math.PI);

    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);
    ctx.rotate(30*Math.PI/180);
    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);
    ctx.rotate(30*Math.PI/180);
    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);
    ctx.rotate(30*Math.PI/180);
    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);
    ctx.rotate(30*Math.PI/180);
    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);
    ctx.rotate(30*Math.PI/180);
    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);
    ctx.rotate(30*Math.PI/180);
    ctx.moveTo(- rr, 0);
    ctx.lineTo(rr, 0);

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}