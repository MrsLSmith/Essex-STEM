



Markerlist = new Mongo.Collection('markers');
Markerlist.insert(
    {

        lat: 2, long: 3, bags: 3, time: new Date()

    });


if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);

    Template.hello.helpers({
        counter: function () {
            return Session.get('counter');
        },
        markers: function () {
            return Markerlist.find();
        }


    });

    Template.hello.events({
        'click button': function () {
            // increment the counter when button is clicked
            window.prompt('How many bags');
            var numberOfBags = (Session.set('numberOfBags', 1));
        }
    });


    Template.gone.helpers({
        counter: function () {
            return Session.get('counter');
        },
        markers: function () {
            return Markerlist.find();
        }
    });

    Template.gone.events({
        'click button': function () {
            // increment the counter when button is clicked

            var trashGone = window.confirm('Is the trash really gone?');


        },
    });

}




if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}

