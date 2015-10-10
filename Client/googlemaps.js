/**
 * Created by dan on 10/9/2015.
 */
var map;
var markerPoses = [];

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

window.mapDemo = window.mapDemo || {};

// Adds a marker to the map.
function addMarker(location) {

    markerPoses[labelIndex] = location;
    var marker = new google.maps.Marker({
        position: markerPoses[labelIndex],
        label:"ME",
        map: map,

    });
    LabelIndex ++;
}
function centerMap(location){
    map.setCenter(location);
    map.setZoom(10);
}

//google.maps.event.addListener(map, 'click', function(event) {
//    addMarker(event.latLng);
//});

function initMap() {
    var myLatLng = {"lat":44.4763409,"lng":-73.2083652};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: myLatLng
    });

    //var marker = new google.maps.Marker({
    //    position: myLatLng,
    //    map: map,
    //    title: 'Trash Here'
    //});
}

window.mapDemo.initMap = initMap;
window.mapDemo.addMarker = addMarker;
window.mapDemo.centerMap = centerMap;