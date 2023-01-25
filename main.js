var mapView = new ol.View({
    center: ol.proj.fromLonLat([38.763611, 9.005401]),
    zoom: 6,
});

var map = new ol.Map({
    target: 'map',
    view: mapView,
    controls: [], //this removes the default zoom in/out controls - remove this if you want those controls
});

// add additional base map
var nonTile = new ol.layer.Tile({
    title: 'None',
    type: 'base',
    visible: false
});

//add open street map layer 
var osmTile = new ol.layer.Tile({
    title: 'Open Street Map',
    visible: true,
    type: 'base',
    source: new ol.source.OSM()
});

// map.addLayer(osmTile);

// merge the two maps and create as one
var baseGroup = new ol.layer.Group({
    title: 'Base Maps',
    fold: true,
    layers: [osmTile, nonTile]
});

map.addLayer(baseGroup);

// add layers from geoserver/postgresql
var ethioWoredaTile = new ol.layer.Tile({
    title: 'Ethiopian Woredas',
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/TestProj1/wms',
        params: {'LAYERS': 'TestProj1:Eth_Woreda_2013', 'TILED': true},
        serverType: 'geoserver',
        visible: true
    })
});

// map.addLayer(ethioRegionTile);

var ethioRegionTile = new ol.layer.Tile({
    title: 'Ethiopian Regions',
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/TestProj1/wms',
        params: {'LAYERS': 'TestProj1:Eth_Region_2013', 'TILED': true},
        serverType: 'geoserver',
        visible: true
    })
});

// map.addLayer(ethioWoredaTile);

// add the two overlay layers 
var overlayGroup = new ol.layer.Group({
    title: 'Overlays',
    fold: true,
    layers: [ethioRegionTile, ethioWoredaTile]
})

map.addLayer(overlayGroup);

// layer switcher
var layerSwitcher =  new ol.control.LayerSwitcher({
    activation: 'click',
    startActive: false,
    groupSelectStyle: 'children',
});

map.addControl(layerSwitcher);

//show mouse position
var mousePosition = new ol.control.MousePosition({
    className: 'mousePosition',
    projection: 'EPSG:4326',
    coordinateFormat: function(coordinate){
        return ol.coordinate.format(coordinate, '{y}, {x}', 6); //y, x ---- lat then long   6-number of digits
    }
});

map.addControl(mousePosition);

// scale control
var scaleControl = new ol.control.ScaleLine({
    bar: true,
    text: true
});

map.addControl(scaleControl);

var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");

var popup = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
})

map.addOverlay(popup);

// onclick - show popup window with info on it
closer.onclick = function(){
    popup.setPosition(undefined);
    closer.blur();
}

// working with additional controls - home
var homeButton = document.createElement('button');
homeButton.innerHTML = '<img src="resources/images/home.png" alt="" style="width:25px;height:25px;vertical-alignment:middle"></img>';
homeButton.className = 'myButton';

var homeElement = document.createElement('div');
homeElement.className = 'homeButtonDiv';
homeElement.appendChild(homeButton);

var homeControl = new ol.control.Control({
    element: homeElement
})

homeButton.addEventListener('click', ()=>{
    location.href = 'index.html';
})

map.addControl(homeControl);
//end home control

// full screen control
var fsButton = document.createElement('button');
fsButton.innerHTML = '<img src="resources/images/fullscreen.png" alt="" style="width:25px;height:25px;vertical-alignment:middle"></img>';
fsButton.className = 'myButton';

var fsElement = document.createElement('div');
fsElement.className = 'fsButtonDiv';
fsElement.appendChild(fsButton);

var fsControl = new ol.control.Control({
    element: fsElement
})

fsButton.addEventListener('click', ()=>{
    var mapEle = document.getElementById("map");
    if(mapEle.requestFullScreen){
        mapEle.requestFullscreen();
    }else if(mapEle.msRequestFullScreen){
        mapEle.msRequestFullscreen();
    }else if(mapEle.mozRequestFullScreen){
        mapEle.mozRequestFullscreen();
    }else if(mapEle.webkitRequestFullScreen){
        mapEle.webkitRequestFullscreen();
    }
})

map.addControl(fsControl);
//end of fullsceen control

//zoomIn Control

var zoomInInteraction = new ol.interaction.DragBox();

zoomInInteraction.on('boxend', function () {
    var zoomInExtent = zoomInInteraction.getGeometry().getExtent();
    map.getView().fit(zoomInExtent);
});

var ziButton = document.createElement('button');
ziButton.innerHTML = '<img src="resources/images/zoom-in.png" alt="" style="width:25px;height:25px;vertical-align:middle"></img>';
ziButton.className = 'myButton';
ziButton.id = 'ziButton';

var ziElement = document.createElement('div');
ziElement.className = 'ziButtonDiv';
ziElement.appendChild(ziButton);

var ziControl = new ol.control.Control({
    element: ziElement
})

var zoomInFlag = false;
ziButton.addEventListener("click", () => {
    ziButton.classList.toggle('clicked');
    //remove selected zoomout feature
    zoButton.classList.remove('clicked'); 
    zoomOutFlag = false;   
    map.removeInteraction(zoomOutInteraction);
    //end of remove zoomout feature
    zoomInFlag = !zoomInFlag;
    if (zoomInFlag) {
        document.getElementById("map").style.cursor = "zoom-in";
        map.addInteraction(zoomInInteraction);       
    } else {
        map.removeInteraction(zoomInInteraction);
         //check if other zoom feature is active
        if (zoomOutFlag) {
            document.getElementById("map").style.cursor = "zoom-out";
        }else document.getElementById("map").style.cursor = "default";
    }
})

map.addControl(ziControl);

//zoomOut Control

var zoomOutInteraction = new ol.interaction.DragBox();

zoomOutInteraction.on('boxend', function () {
    var zoomOutExtent = zoomOutInteraction.getGeometry().getExtent();
    map.getView().setCenter(ol.extent.getCenter(zoomOutExtent));

    mapView.setZoom(mapView.getZoom() - 1)
});

var zoButton = document.createElement('button');
zoButton.innerHTML = '<img src="resources/images/zoom-out.png" alt="" style="width:25px;height:25px;vertical-align:middle"></img>';
zoButton.className = 'myButton';
zoButton.id = 'zoButton';

var zoElement = document.createElement('div');
zoElement.className = 'zoButtonDiv';
zoElement.appendChild(zoButton);

var zoControl = new ol.control.Control({
    element: zoElement
})

var zoomOutFlag = false;
zoButton.addEventListener("click", () => {
    zoButton.classList.toggle('clicked');
    //remove selected zoomin feature
    ziButton.classList.remove('clicked'); 
    zoomInFlag = false;   
    map.removeInteraction(zoomInInteraction);
    //end of remove zoomin feature
    zoomOutFlag = !zoomOutFlag;
    if (zoomOutFlag) {
        document.getElementById("map").style.cursor = "zoom-out";       
        map.addInteraction(zoomOutInteraction);
    } else {
        map.removeInteraction(zoomOutInteraction);
        //check if other zoom feature is active
        if (zoomInFlag) {            
            document.getElementById("map").style.cursor = "zoom-in";
        }else document.getElementById("map").style.cursor = "default";
       
    }
})

map.addControl(zoControl);


// feature info control 
var infoButton = document.createElement('button');
infoButton.innerHTML = '<img src="resources/images/info.png" alt="" style="width:25px;height:25px;vertical-alignment:middle"></img>';
infoButton.className = 'myButton';

var infoElement = document.createElement('div');
infoElement.className = 'infoButtonDiv';
infoElement.appendChild(infoButton);

var infoControl = new ol.control.Control({
    element: infoElement
})

var infoFlag = false;
infoButton.addEventListener('click', ()=>{
    infoButton.classList.toggle('clicked');
    infoFlag = !infoFlag;
})


map.addControl(infoControl);
//end of feature info control

map.on('singleclick', function(evt){
    if(infoFlag){
        content.innerHTML = '';
        var resolution = mapView.getResolution();
        var projection = mapView.getProjection();
        var url = ethioWoredaTile.getSource().getFeatureInfoUrl(evt.coordinate, resolution, projection,{
            'INFO_FORMAT': 'application/json',
        });
        if(url){
            $.getJSON(url, function(data){
                var feature = data.features[0];
                var props = feature.properties;
                content.innerHTML = "<h3> State: </h3> <p>"+ props.REGIONNAME.toUpperCase() +"</p><br><h3> District: </h3> <p>"+ props.WOREDANAME.toUpperCase() + "</p>";
                popup.setPosition(evt.coordinate);
            });
        } else {
            popup.setPosition(undefined);
        }
    }    
})

//length measurment control
var lenButton = document.createElement('button');
lenButton.innerHTML = '<img src="resources/images/measure-length.png" alt="" style="width:25px;height:25px;vertical-alignment:middle"></img>';
lenButton.className = 'myButton';

var lenElement = document.createElement('div');
lenElement.className = 'lenButtonDiv';
lenElement.appendChild(lenButton);

var lenControl = new ol.control.Control({
    element: lenElement
})

var lenFlag = false;
lenButton.addEventListener('click', ()=>{
    lenButton.classList.toggle('clicked');
    lenFlag = !lenFlag;
    document.getElementById("map").style.cursor = 'default';
    if(lenFlag){
        map.removeInteraction(draw);
        addInteraction('LineString');
    }else{
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName('ol-tooltip ol-tooltip-static');
        while(elements.length > 0) elements[0].remove();
    }
})

map.addControl(lenControl);

//Area measurment control
var areaButton = document.createElement('button');
areaButton.innerHTML = '<img src="resources/images/measure-area.png" alt="" style="width:25px;height:25px;vertical-alignment:middle"></img>';
areaButton.className = 'myButton';

var areaElement = document.createElement('div');
areaElement.className = 'areaButtonDiv';
areaElement.appendChild(areaButton);

var areaControl = new ol.control.Control({
    element: areaElement
})

var areaFlag = false;
areaButton.addEventListener('click', ()=>{
    areaButton.classList.toggle('clicked');
    areaFlag = !areaFlag;
    document.getElementById("map").style.cursor = 'default';
    if(areaFlag){
        map.removeInteraction(draw);
        addInteraction('Polygon');
    }else{
        map.removeInteraction(draw);
        source.clear();
        const elements = document.getElementsByClassName('ol-tooltip ol-tooltip-static');
        while(elements.length > 0) elements[0].remove();
    }
})

map.addControl(areaControl);


var continuePolygonMsg = 'Click to continue polygon, Double click to complete';
var continueLineMsg = 'Click to continue line, Double click to complete';
var draw; 
var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)', //polygon fill color
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33', // line color
            width: 2, 
        }),
        image: new ol.style.Circle({
            radius: 17,
            fill: new ol.style.Fill({
                color: '#ffcc33',  //???????
            }),
        }),
    }),
});

map.addLayer(vector);

function addInteraction(intType) {

    draw = new ol.interaction.Draw({
        source: source,
        type: intType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(200, 200, 200, 0.6)',
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
            }),
        }),
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();
    
    var sketch;
    var pointerMoveHandler = function (evt) {
        if (evt.dragging) {
            return;
        }      
        var helpMsg = 'Click to start drawing';
        if (sketch) {
            var geom = sketch.getGeometry();          
        }
    };

    map.on('pointermove', pointerMoveHandler);

    draw.on('drawstart', function (evt) {
        // set sketch
        sketch = evt.feature;      
        var tooltipCoord = evt.coordinate;
        sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // unset sketch
        sketch = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement = null;
        createMeasureTooltip();       
    });
}


var helpTooltipElement;
var helpTooltip;
/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);
}

var measureTooltipElement;
var measureTooltip;

/**
 * Creates a new measure tooltip
 */

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });
    map.addOverlay(measureTooltip);
}

var formatLength = function (line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};

var formatArea = function (polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};