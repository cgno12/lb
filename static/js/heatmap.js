<!-- <script type="text/javascript"> -->

function drawHeatMap(lay) 
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
   // ctx.canvas.style.zindex = 99;
    if (center) 
    {
        ctx.canvas.style.left = pixel.x - size.width / 2 + 'px';
        ctx.canvas.style.top = pixel.y - size.height / 2 + 'px';
    }

    if (ctx.canvas.width <= 0 || ctx.canvas.height <= 0) return;
    
    var strength =  0.3;
    ctx.strokeStyle = 'rgba(0,0,0,' + strength + ')';
    ctx.clearRect(0, 0, size.width, size.height);

    if (datal.length == 0 ) return;

    var layl = [];
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

       layl.push([x, y]);
    }

    if (layl.length == 0) return;

    var shadowCanvas = new Canvas(ctx.canvas.width, ctx.canvas.height);
    var shadowContext = shadowCanvas.getContext('2d');
 
    ctx.save();
    drawGray(shadowContext, layl, 10);

    var colored = shadowContext.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    colorize(colored.data);
    ctx.putImageData(colored, 0, 0);
    ctx.restore();
    shadowCanvas = null;
}

function getRadius()
{
    var radius = 10000;
    var realtopixel = getRealtoPixel();
    return radius / realtopixel;
}

function drawGray(context, data, max)
{
    var size = getRadius();
    var circle = createCircle(size);
    var circleHalfWidth = circle.width / 2;
    var circleHalfHeight = circle.height / 2;
    var alpha = Math.min(1, 1 / max).toFixed(2);
    context.beginPath();
    context.globalAlpha = alpha;
    context.strokeStyle = "#0000ff";
    data.forEach(function (item, index) {
        if (!item) return;
        context.drawImage(circle, item[0] - circleHalfWidth, item[1] - circleHalfHeight);
    });
}

function createCircle(size) 
{
    var shadowBlur = size / 2;
    var r2 = size + shadowBlur;
    var offsetDistance = 10000;
    var circle = new Canvas(r2 * 2, r2 * 2);
    var context = circle.getContext('2d');
    context.shadowBlur = shadowBlur;
    context.shadowColor = 'black';
    context.shadowOffsetX = context.shadowOffsetY = offsetDistance;
    context.beginPath();
    context.arc(r2 - offsetDistance, r2 - offsetDistance, size, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
    return circle;
}

function colorize(pixels) 
{
    for (var i = 3, len = pixels.length, j; i < len; i += 4) 
    {
        if (pixels[i] == 0) continue;
        j = pixels[i] * 3;
        var m = Math.floor(pixels[i] * 1.4)
        if (m < 256) pixels[i] = m;
        var index = j > 767 ? 767 : j;
        var x = Math.floor(index / 256);
        switch (x)
        {
        case 0:
            pixels[i - 3] = 0x00;
            pixels[i - 1] = 0xff;
            pixels[i - 2] = index % 256 + 20;
            break;

        case 1:
            pixels[i - 3] = (index % 256);
            pixels[i - 2] = 0xff;
            pixels[i - 1] = 0xff - (index % 256);
            break;

        case 2:
            pixels[i - 3] = 0xff;
            pixels[i - 1] = 0x00;
            pixels[i - 2] = 0xff - (index % 256);
            break;
        } 
    }
}

function colorize2(pixels) 
{
    for (var i = 3, len = pixels.length, j; i < len; i += 4) 
    {
        if (pixels[i] == 0) continue;

        var x = Math.floor(pixels[i] / 64);
        switch (x)
        {
        case 0:
            pixels[i - 3] = 0x00;
            pixels[i - 1] = 0xff;
            pixels[i - 2] = 0x00;
            break;

        case 1:
            pixels[i - 3] = 0x00;
            pixels[i - 2] = 0xff;
            pixels[i - 1] = 0x00;
            break;

        case 2:
            pixels[i - 3] = 0xff;
            pixels[i - 1] = 0x00;
            pixels[i - 2] = 0xff;
            break;

        case 4:
        case 3:
            pixels[i - 3] = 0xff;
            pixels[i - 1] = 0x00;
            pixels[i - 2] = 0x00;
            break;
        } 
    }
}

function Canvas(width, height) 
{
    var canvas;
    if (typeof document === 'undefined') {
    } 
    else 
    {
        var canvas = document.createElement('canvas');
        if (width) 
            canvas.width = width;

        if (height) 
            canvas.height = height;
    }
    return canvas;
}