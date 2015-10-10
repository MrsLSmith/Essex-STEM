/**
 * Created by dan on 10/9/2015.
 */
var map;

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

}
function centerMap(location){
    map.setCenter(location);
    map.setZoom(10);
}

function initMap() {
     var myLatLng = {"lat":44.4763409,"lng":-73.2083652};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
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