<!-- <script type="text/javascript"> -->

function DrawPredict(lay)
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

    for (var i = 0; i < datal.length; i++) 
    {
        var lines = datal[i];
        ctx.strokeStyle="#000000";
        for (var m = 0; m < lines.length; m ++)
        {
            var line = lines[m];
            if (m)
                ctx.strokeStyle="#ff0000";
            else
                ctx.strokeStyle="#000000";
                
            ctx.beginPath();
            var pixel = project.lngLatToPoint(line[0]);
            var x = (pixel.x - nwMc.x) / zoomUnit;
            var y = (nwMc.y - pixel.y) / zoomUnit;
            ctx.moveTo(x, y);
            for (var j = 1; j < line.length; j ++)
            {
                pixel = project.lngLatToPoint(line[j]);
                var x1 = (pixel.x - nwMc.x) / zoomUnit;
                var y1 = (nwMc.y - pixel.y) / zoomUnit;
                ctx.lineTo(x1, y1);
            }
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
            
            
        }
    }
}












