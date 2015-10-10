
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

if (Meteor.isClient) {

    Template.hello.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });

    Template.hello.events({
        'click .location-button': function () {
            // increment the counter when button is clicked

            getLocation();

            window.mapDemo.addMarker({lat: Session.get("lat"), lng: Session.get("lng")});
            window.mapDemo.centerMap({lat: Session.get("lat"), lng: Session.get("lng")});
        }
    })
    Template.submit.events({
        'click .location-button': function () {
            // increment the counter when button is clicked

        }
    })
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}