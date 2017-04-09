import * as firebase from "firebase";

// Initialize Firebase
const config = {
    apiKey           : "AIzaSyD_7U3I_OgalZCHneod3MFAy7fzvzQZKWw",
    authDomain       : "greenup-57e8e.firebaseapp.com",
    databaseURL      : "https://greenup-57e8e.firebaseio.com",
    projectId        : "greenup-57e8e",
    storageBucket    : "greenup-57e8e.appspot.com",
    messagingSenderId: "967102333139"
};
const fb = firebase.initializeApp(config).database().ref();
const googleLoginButton = document.getElementById("googleLoginButton");
var provider = new firebase.auth.GoogleAuthProvider();


firebase.auth().getRedirectResult().then(function (result) {
    if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        let token = result.credential.accessToken;
        console.log("yay");
    }
    // The signed-in user info.
    let user = result.user;
}).catch(function (error) {
    // Handle Errors here.
    let errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log("so sad");
});

function login() {
    firebase.auth().signInWithRedirect(provider);
}

googleLoginButton.addEventListener('click', login);