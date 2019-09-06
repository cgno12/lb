<!-- <script type="text/javascript"> -->

function Cluster(x, y, ctx, pt, radius, id)
{
    this.bx = this.x = x;
    this.by = this.y = y;
    this.pt = pt;
    this.ctx = ctx;
    this.radius = radius;
    this.size = 10;
    this.id = id;

    this.render = function()
    {
        var ctx = this.ctx;
        var p = this;
        var x = p.x;
        var y = p.y;

        p.isVisible = false;

        if (x < 0 || y < 0)
            return false;
        if (x > ctx.canvas.width || y > ctx.canvas.height)
            return false;

        ctx.beginPath();
        if (p.id == clusterID)
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
        else
            ctx.fillStyle = "rgba(0, 255, 0, 0.4)";

        ctx.arc(x , y , p.size, 0, Math.PI * 2);
        ctx.fill();

        p.isVisible = true;
        return true;
    }
}

function drawCluster(lay)
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

    var layl = [];
    for (var i = 0; i < datal.length; i ++)
    {
        var cl = datal[i];
        var p = new BMap.Point(cl.lng, cl.lat);
        var py = project.lngLatToPoint(p);
        layl.push(new Cluster(py.x, py.y, ctx, p, cl.border*1000, cl.cluster));
    }
    

    var realtopixel = getRealtoPixel();

    for (var i = 0; i < layl.length; i++) 
    {
        var c = layl[i];

        if (c.pt && (!c.by || !c.bx))
        {
            var pixel = project.lngLatToPoint(c.pt);
            c.bx = pixel.x;
            c.by = pixel.y;
        }
        if (c.bx && c.by) 
        {
            c.x = (c.bx - nwMc.x) / zoomUnit;
            c.y = (nwMc.y - c.by) / zoomUnit;
        }
        c.size = c.radius/realtopixel;
    }
   
    canvas.style.opacity = 0.8;
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.globalCompositeOperation = "lighter"; 

    for(var i = 0; i < layl.length; i ++)
        layl[i].render();
}












