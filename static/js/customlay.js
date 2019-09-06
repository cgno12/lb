<!-- <script type="text/javascript"> -->

function customlay(datal, callback) 
{
    this._render = callback;
    this._datal = datal;
}

customlay.prototype = new BMap.Overlay();

customlay.prototype.initialize = function(map)
{
    this._map = map;
    this._canvas = document.createElement("canvas");
    this._canvas.style.cssText = "position:absolute;left:0;top:0;";
    this._ctx = this._canvas.getContext("2d");
    var size = map.getSize();
    this._canvas.width = size.width;
    this._canvas.height = size.height;
    this._map.getPanes().labelPane.appendChild(this._canvas);
    return this._canvas;
}

customlay.prototype.draw = function () 
{
    var render = this._render;
    if (render != null)
        render(this);
}

customlay.prototype.setRender = function (callback) 
{
    this._render = callback;
}

customlay.prototype.render = function (datal)
{
    this._datal = datal;
    this.draw();
}

customlay.prototype.render$1 = function(callback, datal)
{
    this._render = callback;
    this._datal = datal;
    this.draw();
}

function getRealtoPixel()
{
    var center = map.getCenter();
    var pointAPixel = map.pointToOverlayPixel(center);   
    var pointB = new BMap.Point(center.lng, center.lat + 30);
    var pointBPixel = map.pointToOverlayPixel(pointB);
    var piexlDistanceBetween2Points = Math.abs(pointBPixel.y - pointAPixel.y);
    var realDistanceBetween2Points = map.getDistance(center, pointB);
    var	realtopixel = (realDistanceBetween2Points / piexlDistanceBetween2Points);
    return realtopixel;
}

function getRealtoPixel2(pt)
{
    var pointAPixel = map.pointToOverlayPixel(pt);   
    var pointB = new BMap.Point(pt.lng, pt.lat + 20);
    var pointBPixel = map.pointToOverlayPixel(pointB);
    var piexlDistanceBetween2Points = Math.abs(pointBPixel.y - pointAPixel.y);
    var realDistanceBetween2Points = map.getDistance(pt, pointB);
    var	realtopixel = (realDistanceBetween2Points / piexlDistanceBetween2Points);
    return realtopixel;
}