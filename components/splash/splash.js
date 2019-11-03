// @flow
import React from "react";
import { Image, StyleSheet, Text, View, SafeAreaView } from "react-native";
import logo from "../../assets/images/green-up-logo.png";
import { defaultStyles } from "../../styles/default-styles";

const myStyles = {
    logo: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40
    },
    linkText: {
        textAlign: "center",
        color: "#333",
        fontSize: 10,
        marginBottom: 5
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);

export const Splash = ({ message }: { message: string }): React$Element<Container> => (
    <SafeAreaView style={ styles.container }>
        <View style={ { paddingTop: 60 } }>
            <View style={ styles.logo }>
                <Image source={ logo } style={ { height: 120, width: 120 } }/>
            </View>
            <View style={ { width: "100%" } }>
                <Text style={ [styles.text, { color: "black", textAlign: "center" }] }>{ message }</Text>
            </View>
        </View>
    </SafeAreaView>
);
