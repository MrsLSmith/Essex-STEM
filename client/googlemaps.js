/**
 * Created by dan on 10/9/2015.
 */
var map;
var markerPoses = [{"lat":44.4763409,"lng":-73.2083652},{"lat":45.4763409,"lng":-72.2083652},{"lat":43.4763409,"lng":-73.2083652} ];

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var lol = 0;

var markers = [];

window.mapDemo = window.mapDemo || {};

function popupAdd() {
    var bags = window.prompt("How many bags of trash are there at your location?");
    markerPoses[lol].bags = bags;
}
// Adds a marker to the map.
function addMarker(location) {
    popupAdd();
    console.log(markerPoses[lol].lat);
    //markerPoses.push(location);
    var marker = new google.maps.Marker({
        position: {"lat":markerPoses[lol].lat,"lng": markerPoses[lol].lng},
        label: markerPoses[lol].bags,
        map: map,
        title: markerPoses[lol].bags + " Bags"
    });
    markers.push(marker);
    listeners();
    lol +=1;
}
function listeners(){
    markers[lol].addListener('click', function(event) {
        if( window.confirm("did ya do it")){
           markers.filter(function(marker){
               return (event.latLng.J === marker.position.J) && (event.latLng.M === marker.position.M);
           }).forEach(function(marker){
               marker.setMap(null);
           })

        }
});
}
function deleteMarker(chooser) {
    markerPoses.splice(chooser, 1);
    markers[chooser].setMap(null);
}

function centerMap(location){
    map.setCenter(markerPoses[lol-1]);
    map.setZoom(6);
}
function initMap() {
    var myLatLng = {"lat":44.4763409,"lng":-73.2083652};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: myLatLng
    });
}

window.mapDemo.initMap = initMap;
window.mapDemo.addMarker = addMarker;
window.mapDemo.centerMap = centerMap;
window.mapDemo.deleteMarker = deleteMarker;