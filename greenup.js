MarkerList = new Mongo.Collection('markers');

if (Meteor.isClient) {
        function getLocation() {
                navigator.geolocation.getCurrentPosition(showPosition);
        }
        function showPosition(position) {

         MarkerList.insert({lat: position.coords.latitude, lng: position.coords.longitude, bags: 3, time: new Date()});
            Session.set('currentLocation', {lat: position.coords.latitude, lng: position.coords.longitude});
        }


    Template.hello.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });

  Template.hello.events({
    'click .location-button': function () {
      // increment the counter when button is clicked
      getLocation();
        window.mapDemo.addMarker(Session.get("currentLocation"));
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
