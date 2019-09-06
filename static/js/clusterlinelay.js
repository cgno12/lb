<!-- <script type="text/javascript"> -->

    function drawClusterline(lay)
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
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (var i = 0; i < datal.length; i++) 
        {
            var line = datal[i];
            for (var n = 0; n < line.length; n ++)
            {
                var pt = line[n];
                var p = new BMap.Point(pt.lng, pt.lat);
                var pixel = project.lngLatToPoint(p);

                var x = (pixel.x - nwMc.x) / zoomUnit;
                var y = (nwMc.y - pixel.y) / zoomUnit;

                if (n == 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }












