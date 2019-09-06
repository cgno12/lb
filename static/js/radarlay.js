
<!-- <script type="text/javascript"> -->

ptRadarRblat = 27.6108;
ptRadarLtlat = 35.2635;
ptRadarLtlng = 112.2894;
ptRadarRblng = 121.2725;

function DrawRadar(lay)
{
    var datal = lay._datal;
    if (!datal) return;
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

    var p1 = wgs2bd(ptRadarLtlng, ptRadarLtlat);
    var p2 = wgs2bd(ptRadarRblng, ptRadarRblat);

    var pt1 = new BMap.Point(p1[0], p1[1]);
    var pt2 = new BMap.Point(p2[0], p2[1]);
    var pixel1 = project.lngLatToPoint(pt1);
    var pixel2 = project.lngLatToPoint(pt2);
    var x1 = (pixel1.x - nwMc.x) / zoomUnit;
    var y1 = (nwMc.y - pixel1.y) / zoomUnit;
    var x2 = (pixel2.x - nwMc.x) / zoomUnit;
    var y2 = (nwMc.y - pixel2.y) / zoomUnit;

    ctx.globalAlpha = 0.6;
    ctx.drawImage(datal, x1, y1, x2-x1, y2-y1);
}




