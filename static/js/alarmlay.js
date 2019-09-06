
<!-- <script type="text/javascript"> -->

    function DrawAlarm(lay)
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
        ctx.clearRect(0, 0, size.width, size.height);
        var shadowCanvas = new Canvas(ctx.canvas.width, ctx.canvas.height);
        var shadowContext = shadowCanvas.getContext('2d');
        var pt = new BMap.Point(alarmPt.lng, alarmPt.lat);
        var pixel = project.lngLatToPoint(pt);
        var x = (pixel.x - nwMc.x) / zoomUnit;
        var y = (nwMc.y - pixel.y) / zoomUnit;
        var realtopixel = alarmR * 1000 / getRealtoPixel2(pt) ;
        shadowContext.globalAlpha = 1;
        shadowContext.strokeStyle = "#0000ff";
        shadowContext.beginPath();
        shadowContext.arc(x , y , realtopixel, 0, Math.PI * 2);
        shadowContext.fill();
        ctx.save();
        var colored = shadowContext.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        colorizemm(colored.data);
        ctx.putImageData(colored, 0, 0);
        ctx.restore();
        shadowCanvas = null;
    }


function colorizemm(pixels) 
{
    for (var i = 3, len = pixels.length; i < len; i += 4) 
    {
        if (pixels[i] == 0)
        {
            pixels[i - 3] = 200;
            pixels[i - 2] = 200;
            pixels[i - 1] = 200;

            pixels[i] = 180;
        }      
        else
            pixels[i] = 0;   
    }
}

