
<!-- <script type="text/javascript"> -->

function DrawLinghtPt(lay)
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
   // ctx.globalCompositeOperation = "lighter"; 
    for (var i = 0; i < datal.length; i++) 
    {
        var pixel = project.lngLatToPoint(datal[i].ll);
        var x = (pixel.x - nwMc.x) / zoomUnit;
        var y = (nwMc.y - pixel.y) / zoomUnit;
        var index = datal[i].time;
        //var x ="index :" + index + "color : " + ptColor[index];
        //alert(x);

        if (x < 0 || y < 0)
            continue ;
        if (x > ctx.canvas.width || y > ctx.canvas.height)
            continue ;

        ctx.beginPath();
        //alert(ptColor[index]);
        ctx.fillStyle = ptColor[index];
        ctx.arc(x , y , 3, 0, Math.PI * 3);
        ctx.fill();
    }
}