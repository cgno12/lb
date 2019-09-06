<!-- <script type="text/javascript"> -->

    var			ptL = [];					//原始点数据
    var			clusterL = [];				//原始雷暴核数据
    var			lightLay = null;
    var         clusterlay = null;
    var         predictlay = null;	
    var         alarmLay = null;
    var         animationlay = null;
    var         radarimg = [];
    var         Animation = null;
    var         radarLay = null;
    
    //关闭等待窗口
        function closeWaiting() {
            var bgDiv = document.getElementById("bgDiv");
            var msgDiv = document.getElementById("msgDiv");
            //移除背景遮罩层div
            if(bgDiv != null){
                document.body.removeChild(bgDiv);
            }
            //移除中间信息提示层div    
            if(msgDiv != null){
                document.body.removeChild(msgDiv);
            }
        }
        
        //显示等待窗口
        function showWaiting() {
            var msgw, msgh, bordercolor;
            msgw = 300; //提示窗口的宽度 
            msgh = 100; //提示窗口的高度 
            bordercolor = "#336699"; //提示窗口的边框颜色 
            titlecolor = "#99CCFF"; //提示窗口的标题颜色 
    
            var sWidth, sHeight;
            sWidth = document.body.clientWidth;
            sHeight = document.body.clientHeight;
    
            //背景遮罩层div
            var bgObj = document.createElement("div");
            bgObj.setAttribute('id', 'bgDiv');
            bgObj.style.position = "absolute";
            bgObj.style.top = "0px";
            bgObj.style.background = "#888";
            bgObj.style.filter = "progid:DXImageTransform.Microsoft.Alpha(style=3,opacity=25,finishOpacity=75";
            bgObj.style.opacity = "0.6";
            bgObj.style.left = "0px";
            bgObj.style.zIndex = "9999";
            bgObj.style.width = sWidth + "px";
            bgObj.style.height = sHeight + "px";
            document.body.appendChild(bgObj);
            
            //信息提示层div
            var msgObj = document.createElement("div");
            msgObj.setAttribute("id", "msgDiv");
            msgObj.setAttribute("align", "center");
            msgObj.style.position = "absolute";
            msgObj.style.background = "white";
            msgObj.style.font = "12px/1.6em Verdana, Geneva, Arial, Helvetica, sans-serif";
            msgObj.style.border = "1px solid " + bordercolor;
            msgObj.style.width = msgw + "px";
            msgObj.style.height = msgh + "px";
            msgObj.style.top = (document.documentElement.scrollTop + (sHeight - msgh) / 2) + "px";
            msgObj.style.left = (sWidth - msgw) / 2 + "px";
            document.body.appendChild(msgObj);
            
            //标题栏
            var title = document.createElement("h4");
            title.setAttribute("id", "msgTitle");
            title.setAttribute("align", "left");
            title.style.margin = "0px";
            title.style.padding = "3px";
            title.style.background = bordercolor;
            title.style.filter = "progid:DXImageTransform.Microsoft.Alpha(startX=20, startY=20, finishX=100, finishY=100,style=1,opacity=75,finishOpacity=100);";
            title.style.opacity = "0.75";
            title.style.border = "1px solid " + bordercolor;
            title.style.height = "22px";
            title.style.font = "12px Verdana, Geneva, Arial, Helvetica, sans-serif";
            title.style.color = "white";
            title.innerHTML = "正在加载中，请稍候......";
            document.getElementById("msgDiv").appendChild(title);
            
            //中间等待图标
            var img = document.createElement("img");
            img.style.margin = "10px 0px 10px 0px";
            img.style.width = "48px";
            img.style.height = "48px";
            img.setAttribute("src", "/static/img/waiting.gif");
            document.getElementById("msgDiv").appendChild(img);
        }
    
    function getHisLight(date)
    {
        showWaiting();
        $.get("/gethislight/", { date:date},
            function (ret) {
                closeWaiting();
                ptL = ret.point;
                clusterL = ret.cluster;
                hisInterval = window.setInterval(showHis, 10);
            }, 
        "json");
    }
    
    function renderReal()
    {
        renderLinght();
        if (animationR < 14)
        {
            animationR = (animationR + 1) % 15;
            window.setTimeout(renderReal, 250);
        }  
        else
        {
            animationR = 0;
            renderLinght();
        }
    }

    function getRealLight()
	{
		if (curTime.getMinutes() == realCurM)
            return ;
        
		realCurM = curTime.getMinutes();
		$.get("/getRealLight/", { date:GMTToStr(curTime), first: ptL.length},
			function (ret) {
                var isalarm = false;
                var ptalarm = new BMap.Point(alarmPt.lng, alarmPt.lat);
                var light = ret.light;
                var cluster = ret.cluster;
                console.log(light.length);

				for (var i = 0; i < light.point.length; i ++)
					ptL.push(light.point[i]);

                clusterL = [];
				for (var i = 0; i < cluster.length; i ++)
					clusterL.push(cluster[i].line);

                BmapPtL = [];
                BmapCl = [];
				AnimationPtL = [];
				animationR = 0;
				var stepd = stepTime / 5;
				for (var i = 0; i < ptL.length; i ++)
				{
					var l = ptL[i];
					var date = new Date(l.time.replace('-', '/'));   
					var dd = curTime.getTime() - date;

					var mm = Math.floor(dd/(60*1000)) - 481;
					if (mm >= stepTime) continue;

					var num = l.rs + l.ic;
					var arr1 = l.data.split(",");
					for (var j = 0; j < num; j ++)
					{
						var str = (arr1[2 + 11*j]);
						str = str.replace(/\s*/g,"");
						let lng = str.substring(1,(str.length-1));

						str = (arr1[1 + 11*j]);
						str = str.replace(/\s*/g,"");
						let lat = str.substring(1,(str.length-1));

                        if (!isalarm && mm < 5)
                        {
                            var ppt = new BMap.Point(lng, lat);
                            var dis = Math.floor(map.getDistance(ppt, ptalarm) / 1000);
                            if (dis < alarmR)
                                isalarm = true;
                        }

						var ptbd = wgs2bd(parseFloat(lng), parseFloat(lat));

						let pt = {};
						pt.ll = new BMap.Point(ptbd[0], ptbd[1]);
						pt.time = Math.floor(mm / stepd);
						str = (arr1[7 + 11*j]);
						str = str.replace(/\s*/g,"");
						pt.type = str.substring(1,(str.length-1));

						BmapPtL.push(pt);
						
						if (mm == 1)
							AnimationPtL.push(pt);
					}
				}

                for (var i = 0; i < clusterL.length; i ++)
                {
                    var lls = [];
                    var lines = clusterL[i];
                    for (var j = 0; j < lines.length; j ++)
                    {
                        var line = lines[j];
                        var ll = [];
                        for (var m = 0; m < line.length; m ++)
                        {
                            var x = line[m][0] + ' - ' + line[m][1];
                            var ptbd = wgs2bd(parseFloat(line[m][1]), parseFloat(line[m][0]));
                            var pt = new BMap.Point(ptbd[0], ptbd[1]);
                            ll.push(pt);
                        }
                        lls.push(ll);
                    }
                    BmapCl.push(lls);
                }

                if (isalarm && alarm)
                    document.getElementById('audio').play();

				renderReal();
            }, "json");
    }
    
    function hisPlay()
	{
		stepTime = parseInt(stepTime);
		var timeE = parseInt($('#input-range-play').val());
		var timeS = timeE - stepTime;
		var ss = $('#input-date').val() + ' ' + Math.floor(timeE / 60) +' : ' + Math.floor(timeE % 60);	
		$('#span-time-now').html(ss);
		getRadarImg();

		var date = $('#input-date').val() + ' ' +  '00:00:00';
		date = new Date(date.replace('-', '/')).getTime();
		BmapPtL = [];
		BmapCl = [];
        CLlines = [];
		var stepd = stepTime / 5;
		for (var i = 0; i < ptL.length; i ++)
		{
			var dateE = ptL[i].time.replace('-', '/');   
			var date3 = new Date(dateE).getTime() - date;
			var mm = Math.floor(date3/(60*1000)) + 480;
	
			if (mm < timeS) continue ;
			if (mm > timeE) break;

			var num = ptL[i].rs + ptL[i].ic;
			var arr1=ptL[i].data.split(",");
			
			for (var j = 0; j < num; j ++)
			{
				var str = (arr1[2 + 11*j]);
				str = str.replace(/\s*/g,"");
				let lng = str.substring(1,(str.length-1));

				str = (arr1[1 + 11*j]);
				str = str.replace(/\s*/g,"");
				let lat = str.substring(1,(str.length-1));

				var ptbd = wgs2bd(parseFloat(lng), parseFloat(lat));


				var pt = {};
				pt.ll = new BMap.Point(ptbd[0], ptbd[1]);
				pt.time = Math.floor((timeE - mm) / stepd);

				str = (arr1[7 + 11*j]);
				str = str.replace(/\s*/g,"");
				pt.type = str.substring(1,(str.length-1));

				BmapPtL.push(pt);
			}
        }

        for (var i = 0; i < clusterL.length; i ++)
        {
            var cl = clusterL[i];

            var dateE = cl.te;
			var date3 = new Date(dateE).getTime() - date;
			var mm = Math.floor(date3/(60*1000)) + 480;

            if (mm < timeS) continue;

            var dateS = cl.ts;
            date3 = new Date(dateS).getTime() - date;
            mm = Math.floor(date3/(60*1000)) + 480;
            if (mm > timeE) continue;

            var cll = cl.cl;
            var line = []
            for (var n = 0; n < cll.length; n ++)
            {
                var dd = cll[n].timeS;
                date3 = new Date(dd).getTime() - date;
                mm = Math.floor(date3/(60*1000)) + 480;
                var x = mm + " - " + timeS + " - "  + timeE;
                line.push(cll[n]);
                if (mm < timeS) continue ;
                if (mm >= (timeS+ 3)) break;
                BmapCl.push(cll[n]);
            }
            if (line.length > 0)
                CLlines.push(line);
        }
 
		renderLinght();
	}

    function stopPlay()
	{
		$('#bt-play').html("播放");
		window.clearInterval(hisInterval);
	}

	function onPlay()
	{
		$('#bt-play').html("停止");
		var date = $('#input-date').val() + ' ' +  '00:00:00';
		if (date != hisDate)
		{
			hisDate = date;
			$('#input-range-play').val(0);
			getHisLight(date);
		}
		else
		{
			hisInterval = window.setInterval(showHis, 10);
		}
	}

	function showReal()
	{
		var time = new Date();
		//var time= $.ajax({async: false}).getResponseHeader("Date");
        $('#span-time-now').html(GMTToStr(time));
        console.log(time);
		getRealLight();
	}

	function showHis()
	{
		hisPlay();
		var timeS = parseInt($('#input-range-play').val());
		$('#input-range-play').val((timeS + rangeStep) % 1440);
	}

	/**
 * Created by Wandergis on 2015/7/8.
 * 提供了百度坐标（BD09）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换
 */

//定义一些常量
var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

function wgs2bd(lng, lat)
{
	var pt = wgs84togcj02(lng, lat);
	var ptbd = gcj02tobd09(pt[0], pt[1]);
	return ptbd;
}

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */

function bd09togcj02(bd_lon, bd_lat) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lng, gg_lat]
}

/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02tobd09(lng, lat) {
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat]
}

/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */

function wgs84togcj02(lng, lat) {
	if (out_of_china(lng, lat)) 
	{
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;
        return [mglng, mglat]
    }
}

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */

function gcj02towgs84(lng, lat) {
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        mglat = lat + dlat;
        mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat]
    }
}

function transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
}

function transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
}

/**

 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */

function out_of_china(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}

function getRadarImg()
{
    if (!showRadar) return;
    var sdate = $('#input-date').val().replace('-', '').replace('-', '');
    radarimg = [];
   // sdate = '20171215';
    for (var i = 0; i < 1440; i += 6)
    {
        var path = '/static/radar/MOSAIC_' + sdate;
        var h = Math.floor(i / 60);
        var m = Math.floor(i % 60);
        if (h < 10) path += '0';
        path += h;
        if (m < 10) path += '0';
        path += m;
        path += '00.png';
        console.log(path);
        var bgImg = new Image();
        bgImg.src = path;
        radarimg.push(bgImg);
    }
}