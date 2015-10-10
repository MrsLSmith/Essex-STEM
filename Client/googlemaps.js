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
        map: map
    });
}

function initMap() {
     var myLatLng = {lat: 1, lng: 131.044};

    //var myMarkers = MapMarkerList.find();
    //myMarkers = myMarkers.map(function(marker){
    //    return {
    //        lat: marker.lat,
    //        lng: marker.lng
    //    };
    //})

    ///var myLatLng = myMarkers[0];
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