/**
 * Created by dan on 10/9/2015.
 */
var map;

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

window.mapDemo = window.mapDemo || {};

// Adds a marker to the map.
function addMarker(location) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    var marker = new google.maps.Marker({
        position: location,
        label:"ME",
        map: map,

    });
/////////////////////
    function initialize() {
        var map = new google.maps.Map(document.getElementById('map'), {
        });

    google.maps.event.addListener(map, 'click', function(event) {
        addMarker(event.latLng, map);
    });

    // Adds a marker to the map.
    function addMarker(location, map) {
        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        var marker = new google.maps.Marker({
            position: location,
            label: labels[labelIndex++ % labels.length],
            map: map
        });
    }

    google.maps.event.addDomListener(window, 'load', initialize)}
////////////////////////
}
function centerMap(location){
    map.setCenter(location);
    map.setZoom(10);
}

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