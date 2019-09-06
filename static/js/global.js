<!-- <script type="text/javascript"> -->

var         map = null;
var			DataModel = {};
var			dataModel = 1;
var 		ShowModel = {};
var			showModel = 1;
var         centerPt = {};
var         yunshanColor ="#ff0000";
var         dishanColor = "#000000";	
var			ptColor = ["#000000", "#ff0000", "#00ff00", "#0000ff", "#ff00ff","#ff00ff", "#ff00ff", "#ff00ff"];
var         mapDrag = true;
var         mapZoom = true;
var         zoom = 10;
var         stationShow = false;
var         pathShow = false;
var         areaShow = false;
var         postionShow = false;
var         airportShow = false;
var			stepTime = 10;
var         stationLay = [];
var         airportLay = [];
var         pathLay = [];
var         areaLay = [];
var         showCluster = false;
var         alarmPt = {};
var         alarmR = 300;
var         alarm = false;
var         showRadar = false;

function initGlobal()
{
    DataModel.real = 0;
	DataModel.his = 1;

    ShowModel.heat = 1;
	ShowModel.pt = 2;
	ShowModel.yord = 3;
}

function readCookies()
{
    var     temp = null;

    for (var i = 0; i < 5; i ++)
    {
        temp = getCookie("ptColor" + i);
        if (temp != null) ptColor[0] = temp;
    }

    temp = getCookie("zoom");
    if (temp != null) zoom = temp;

    temp = getCookie("yunshanColor");
    if (temp != null) yunshanColor = temp;
        
    temp = getCookie("dishanColor");
    if (temp != null) dishanColor = temp;

    temp = getCookie("alarm");
    if (temp != null) alarm = eval(temp.toLowerCase());

    temp = getCookie("showCluster");
    if (temp != null) showCluster = eval(temp.toLowerCase());

    temp = getCookie("mapDrag");
    if (temp != null) mapDrag = eval(temp.toLowerCase());
   
    temp = getCookie("mapZoom");
    if (temp != null) mapZoom = eval(temp.toLowerCase());

    temp = getCookie("stationShow");
    if (temp != null) stationShow = eval(temp.toLowerCase());

    temp = getCookie("airportShow");
    if (temp != null) airportShow = eval(temp.toLowerCase());

    temp = getCookie("pathShow");
    if (temp != null) pathShow = eval(temp.toLowerCase());

    temp = getCookie("areaShow");
    if (temp != null) areaShow = eval(temp.toLowerCase());

    temp = getCookie("postionShow");
    if (temp != null) postionShow = eval(temp.toLowerCase());
        
    temp = getCookie("centerLng");
    if (temp != null) 
        centerPt.lng = temp;
    else
        centerPt.lng = 117.67;

    temp = getCookie("centerLat");
    if (temp != null) 
        centerPt.lat = temp;
    else
        centerPt.lat = 31.82;

    temp = getCookie("alarmLng");
    if (temp != null) 
        alarmPt.lng = temp;
    else
        alarmPt.lng = centerPt.lng;

    temp = getCookie("alarmLat");
    if (temp != null) 
        alarmPt.lat = temp;
    else
        alarmPt.lat = centerPt.lat;

    temp = getCookie("showModel");
    if (temp != null) showModel = temp;   

    temp = getCookie("alarmR");
    if (temp != null) alarmR = temp;   

    temp = getCookie("stepTime");
    if (temp != null) stepTime = temp;
}

function initCtrl()
{
    $('#input-yunshan').val(yunshanColor);
    $('#input-dishan').val(dishanColor);

    $('#input-ptclolor1').val(ptColor[0]);
    $('#input-ptclolor2').val(ptColor[1]);
    $('#input-ptclolor3').val(ptColor[2]);
    $('#input-ptclolor4').val(ptColor[3]);
    $('#input-ptclolor5').val(ptColor[4]);

    $('#input-lng').val(centerPt.lng);
    $('#input-lat').val(centerPt.lat);
    $('#input-alarmlng').val(alarmPt.lng);
    $('#input-alarmlat').val(alarmPt.lat);

    $('#input-date').val(new Date());
    map.centerAndZoom(centerPt, 12);

    switchPng("img-radar", showRadar);
    switchPng("img-cluster", showCluster);
    switchPng("img-alarm", alarm);

    switchPng("img-path", pathShow);
    switchPng("img-area", areaShow);
    switchPng("img-station", stationShow);
    switchPng("img-postion", postionShow);
    switchPng("img-airport", airportShow);

    switchPng("img-drag", mapDrag);
    if (mapDrag)
        map.enableDragging();      
    else
        map.disableDragging();	 
            
    switchPng("img-zoom", mapZoom);
    if (mapZoom)
        map.enableScrollWheelZoom();
    else
        map.disableScrollWheelZoom();

    map.centerAndZoom(new BMap.Point(centerPt.lng, centerPt.lat), zoom);

    var obj=document.getElementById('select-showmodel');
    for (var i = 0; i < 3; i ++)
    {
        if (obj.options[i].value == showModel)
        {
            obj.selectedIndex = i;
            break ;
        }
    }

    $('#select-alarmR').val(alarmR);
    //var obj=document.getElementById('select-alarmR');
    //for (var i = 0; i < 5; i ++)
    //{
    //   if (obj.options[i].value == alarmR)
    //    {
    // /       obj.selectedIndex = i;
    //        break ;
    //    }
    //}

    if (showModel == ShowModel.pt)
			document.getElementById("div-ptcolortips").style.zIndex= 9999;
		else if (showModel == ShowModel.yord)
			document.getElementById("div-colortips").style.zIndex= 9999;

    var obj=document.getElementById('select-time');
    for (var i = 0; i < 5; i ++)
    {
        if (parseInt(obj.options[i].value)  == stepTime)
        {
            obj.selectedIndex = i;
            break ;
        }
    }

    var stepd = stepTime / 5;
    for (var i = 0; i < 5; i ++)
    {
        var lab = stepd*i + " - " + (stepd*(i+1) - 1);
        $('#lab-ptcolor' + (i+1)).html(lab);
    }

    if (stationShow)
        showStation();

    if (airportShow)
        showAirport();
    
    if (pathShow)
        showPath();

    if (areaShow)
        showArea();
}

function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function setCookie(name,value)
{
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

function switchPng(elementID, off)
{
    var temp = document.getElementById(elementID);
    if (off)
        temp.setAttribute("src","/static/img/开关1.png");
    else
        temp.setAttribute("src","/static/img/开关2.png");
}

function GMTToStr(time)
{
    var zeroize = function (value, length)
    {
        if (!length) length = 2;
        value = String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++)
            zeros += '0';

        return zeros + value;
    };

    curTime= new Date(time);
    let Str=curTime.getFullYear() + '-' +
    zeroize((curTime.getMonth() + 1)) + '-' + 
    zeroize(curTime.getDate()) + ' ' + 
    zeroize(curTime.getHours()) + ':' + 
    zeroize(curTime.getMinutes()) + ':' + 
    zeroize(curTime.getSeconds())
    return Str;
}


function showStation()
{
    $.ajax({
            type: "get",
            url: "/static/station.json",
            dataType: "json",
            async: false,
            success: function(data){
                for (var i = 0; i < data.length; i ++)
                {
                    var st = data[i];
                    var ptbd = wgs2bd(parseFloat(st.postion.lng), parseFloat(st.postion.lat));
                    var pt = new BMap.Point(ptbd[0], ptbd[1]);
                    var myIcon = new BMap.Icon("/static/img/wifi.png", new BMap.Size(20,20));
                    myIcon.setImageSize(new BMap.Size(20,20));
                    var marker2 = new BMap.Marker(pt,{icon:myIcon});
                    var label = new BMap.Label(st.name,{offset:new BMap.Size(20,-10)});
                    label.setStyle({
                        color : "#07AFFF",
                        fontSize : "10px",
                        height : "20px",
                        lineHeight : "20px",
                        fontWight: "900",
                        fontFamily:"微软雅黑"
                    });
                    marker2.setLabel(label);
                    stationLay.push(marker2);
                    map.addOverlay(marker2); 
                }
            }
        });
}

function showAirport()
{
    $.ajax({
            type: "get",
            url: "/static/airport.json",
            dataType: "json",
            async: false,
            success: function(data){
                for (var i = 0; i < data.length; i ++)
                {
                    var st = data[i];
                    var ptbd = wgs2bd(parseFloat(st.postion.lng), parseFloat(st.postion.lat));
                    var pt = new BMap.Point(ptbd[0], ptbd[1]);
                    var myIcon = new BMap.Icon("/static/img/feijichang.png", new BMap.Size(20,20));
                    myIcon.setImageSize(new BMap.Size(20,20));
                    var marker2 = new BMap.Marker(pt,{icon:myIcon});
                    var label = new BMap.Label(st.name,{offset:new BMap.Size(20,-10)});
                    label.setStyle({
                        color : "#07AFFF",
                        fontSize : "10px",
                        height : "20px",
                        lineHeight : "20px",
                        fontWight: "900",
                        fontFamily:"微软雅黑"
                    });
                    marker2.setLabel(label);
                    airportLay.push(marker2);
                    map.addOverlay(marker2); 
                }
            }
        });
}

function showPath()
{
    $.ajax({
            type: "get",
            url: "/static/path.json",
            dataType: "json",
            async: false,
            success: function(data){
                for (var i = 0; i < data.length; i ++)
                {
                    var path = data[i].path;
                    var pts = new Array;
                    for (var j = 0; j < path.length; j ++)
                    {
                        var ptbd = wgs2bd(path[j][0], path[j][1]);
                        var pt = new BMap.Point(ptbd[0], ptbd[1]);
                        pts.push(pt);
                    }
                    var polyline = new BMap.Polyline( pts, {strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5}); 
                    pathLay.push(polyline);
                    map.addOverlay(polyline); 
                }
            }
        });
}

function showArea()
{
    $.ajax({
            type: "get",
            url: "/static/area.json",
            dataType: "json",
            async: false,
            success: function(data){
                for (var i = 0; i < data.length; i ++)
                {
                    var path = data[i].path;
                    var pts = new Array;
                    for (var j = 0; j < path.length; j ++)
                    {
                        var ptbd = wgs2bd(path[j][0], path[j][1]);
                        var pt = new BMap.Point(ptbd[0], ptbd[1]);
                        pts.push(pt);
                    }
                    var polyline = new BMap.Polygon( pts, {strokeColor:"red", strokeWeight:2, strokeOpacity:0.8, fillColor:"#FFFFFF", fillOpacity:0.1}); 
                    areaLay.push(polyline);
                    map.addOverlay(polyline); 
                }
            }
        });
}

function clearOverlay(overlay)
{
    for (var i = 0; i < overlay.length; i ++)
        map.removeOverlay(overlay[i]);
    overlay.clear();
}