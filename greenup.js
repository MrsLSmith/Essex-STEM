<<<<<<< HEAD
MarkerList = new Mongo.Collection("markers");

MarkerList.insert({lat: 2, long: 3, bags: 3, time: new Date()});


ESSEX = {};
ESSEX.maps= {};
ESSEX.maps.placePin = function(m){
    console.log(m.lat);
};
=======

function getLocation() {
    navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
    console.log(JSON.stringify({lat: position.coords.latitude, lng: position.coords.longitude}));
    Session.set({lat: position.coords.latitude, lng: position.coords.longitude});
    console.log(JSON.stringify(Session.get('lat')));
    MarkerList.insert({lat: position.coords.latitude, lng: position.coords.longitude, bags: 3, time: new Date()});
}

MarkerList = new Mongo.Collection('markers');
>>>>>>> c196730efeca258b4cae3b0af2b2adff2df541fd

if (Meteor.isClient) {

<<<<<<< HEAD
  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
      markers : function(){
           var myMarkers =  MarkerList.find({});
       var newArray =   myMarkers.map(function(marker){
              return {lat: marker.lat, lng : marker.long};
          });
          newArray.forEach(function(marker){
             ESSEX.maps.placePin(marker);
          })

      }
  });
=======
    Template.hello.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });
>>>>>>> c196730efeca258b4cae3b0af2b2adff2df541fd

  Template.hello.events({
    'click .location-button': function () {
      // increment the counter when button is clicked

        getLocation();

        window.mapDemo.addMarker({lat: Session.get("lat"), lng: Session.get("lng")});
        window.mapDemo.centerMap({lat: Session.get("lat"), lng: Session.get("lng")});
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
