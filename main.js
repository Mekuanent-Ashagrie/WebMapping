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