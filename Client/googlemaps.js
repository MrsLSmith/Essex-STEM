/**
 * Created by dan on 10/9/2015.
 */
var map;
var markerPoses = [{"lat":44.4763409,"lng":-73.2083652},{"lat":45.4763409,"lng":-72.2083652},{"lat":43.4763409,"lng":-73.2083652} ];

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var lol = 0;
window.mapDemo = window.mapDemo || {};

// Adds a marker to the map.
function addMarker(location) {

    //markerPoses.push(location);
    var marker = new google.maps.Marker({
        position: markerPoses[lol],
        label: labels.split()[lol],
        map: map
    });
    console.log(markerPoses[lol]);
    lol +=1;
}
function centerMap(location){
    map.setCenter(markerPoses[lol-1]);
    map.setZoom(6);
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