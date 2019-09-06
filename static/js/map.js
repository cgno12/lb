<!-- <script type="text/javascript">  -->

    var         bmapDrag = true;
    var         bmapZoom = true;
    var         bstation = false;
    var         centerPt = new BMap.Point(117.2506, 31.8182);
    var         curTime;
    var         curM;
    var 		pointsIC = [];
    var 		pointsRS = [];
    var 		pIC = null;
    var	 		pRS = null;
    var         stationOverlay = [];
    var         midulist = [];
    
    var         hislist = [];

    function onColorChange(e)
   {
		if (e == 0)
        {
			dishanColor = $('#input-dishan').val();        
			var color = dishanColor + dishanAlpha;
            setLightPointColor(color, pIC);
            setCookie("dishanColor", dishanColor);
        }
        
        if (e == 1)
        {
            yunshanColor = $('#input-yunshan').val();         
            var color = yunshanColor + yunshanAlpha;
            setLightPointColor(color, pRS);
            setCookie("yunshanColor", yunshanColor);
		}
	}

    

    function PrefixInteger(num, n) 
    {
        return (Array(n).join(0) + num).slice(-n);
    }

    

   

    

    

    

   

   

    

    

   

   

