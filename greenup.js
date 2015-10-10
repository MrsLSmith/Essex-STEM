MarkerList = new Mongo.Collection("markers");

MarkerList.insert({lat: 2, long: 3, bags: 3, time: new Date()});


ESSEX = {};
ESSEX.maps= {};
ESSEX.maps.placePin = function(m){
    console.log(m.lat);
};

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

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

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}