/** ***************************
 * environment.js
 * path: '/environment.js' (root of your project)
 ******************************/

import { Constants } from "expo";
// import { Platform } from "react-native";

//  localhost =  Platform.OS === "ios" ? "localhost:8080" : "10.0.2.2:8080";

const ENV = {
    dev: {
        apiKey: "AIzaSyAjwSCpOvLPgYcFr26V3gmfwJlGb-VtWAs",
        authDomain: "greenupvermont-de02b.firebaseapp.com",
        databaseURL: "https://greenupvermont-de02b.firebaseio.com",
        projectId: "greenupvermont-de02b",
        storageBucket: "greenupvermont-de02b.appspot.com",
        messagingSenderId: "439621369113"
    },
    staging: {
        apiKey: "AIzaSyAjwSCpOvLPgYcFr26V3gmfwJlGb-VtWAs",
        authDomain: "greenupvermont-de02b.firebaseapp.com",
        databaseURL: "https://greenupvermont-de02b.firebaseio.com",
        projectId: "greenupvermont-de02b",
        storageBucket: "greenupvermont-de02b.appspot.com",
        messagingSenderId: "439621369113"
    },
    prod: {
        apiKey: "AIzaSyAjwSCpOvLPgYcFr26V3gmfwJlGb-VtWAs",
        authDomain: "greenupvermont-de02b.firebaseapp.com",
        databaseURL: "https://greenupvermont-de02b.firebaseio.com",
        projectId: "greenupvermont-de02b",
        storageBucket: "greenupvermont-de02b.appspot.com",
        messagingSenderId: "439621369113"
    }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
    // What is __DEV__ ?
    // This variable is set to true when react-native is running in Dev mode.
    // __DEV__ is true when run locally, but false when published.
    if (__DEV__) {
        return ENV.dev;
    } else if (env === "staging") {
        return ENV.staging;
    } else if (env === "prod") {
        return ENV.prod;
    }
};

export default getEnvVars;