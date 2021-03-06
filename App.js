// @flow
import React, { useState } from "react";
import { AppLoading } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import AppState from "./components/app-state";
import Session from "./components/session";
import { Ionicons } from "@expo/vector-icons";
import AppNavigator from "./navigation/app-navigator";
import { YellowBox } from "react-native";

// Stop annoying Android users with useless warnings.
YellowBox.ignoreWarnings(["Setting a timer"]);

type PropsType = { skipLoadingScreen: boolean };
// Bootstrapping the app
const App = ({ skipLoadingScreen }: PropsType): React$Element<any> => {

    const [isLoadingComplete, setIsLoadingComplete] = useState(false);

    const loadResourcesAsync = async (): Promise<any> => Promise.all([
        Asset.loadAsync([
            require("./assets/images/circle-turquoise.png"),
            require("./assets/images/circle-blue.png"),
            require("./assets/images/circle-red.png"),
            require("./assets/images/circle-yellow.png"),
            require("./assets/images/circle-green.png"),
            require("./assets/images/circle-purple.png"),
            require("./assets/images/circle-orange.png"),
            require("./assets/images/broom.png"),
            require("./assets/images/google-logo.jpg"),
            require("./assets/images/facebook-logo.png"),
            require("./assets/images/green-up-logo.png"),
            require("./assets/images/covered-bridge2.jpg")
        ]),
        Font.loadAsync({
            // This is the font that we are using for our tab bar
            ...Ionicons.font,
            "Rubik-Regular": require("./assets/fonts/Rubik/Rubik-Regular.ttf"),
            "rubicon-icon-font": require("./assets/fonts/Rubik/rubicon-icon-font.ttf")

        })
    ]);

    const handleLoadingError = (error: Error) => {
        // In this case, you might want to report the error to your error
        // reporting service, for example Sentry
        console.warn(error); // eslint-disable-line no-console
    };

    const handleFinishLoading = () => {
        setIsLoadingComplete(true);
    };

    const load = (
        <AppLoading
            onError={ handleLoadingError }
            onFinish={ handleFinishLoading }
            startAsync={ loadResourcesAsync }
        />
    );

    const mainApp = (
        <AppState>
            <Session>
                <AppNavigator/>
            </Session>
        </AppState>
    );

    return (!isLoadingComplete && !skipLoadingScreen ? load : mainApp);

};

export default App;