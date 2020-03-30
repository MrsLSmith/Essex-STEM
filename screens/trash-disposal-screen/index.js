// @flow
import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    Dimensions
} from "react-native";
import { connect } from "react-redux";
import { defaultStyles } from "../../styles/default-styles";
import * as R from "ramda";
import WatchGeoLocation from "../../components/watch-geo-location";
import { dateIsInCurrentEventWindow } from "../../libs/green-up-day-calucators";
import EnableLocationServices from "../../components/enable-location-services/enable-location-services";
import * as actionCreators from "../../action-creators/map-action-creators";
import { bindActionCreators } from "redux";
import TrashDropForm from "../../components/trash-drop-form";
import User from "../../models/user";
import { removeNulls } from "../../libs/remove-nulls";
import * as constants from "../../styles/constants";
import Coordinates from "../../models/coordinates";
import DisposalSiteSelector from "../../components/disposal-site-selector";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const styles = StyleSheet.create(defaultStyles);

type PropsType = {
    actions: Object,
    currentUser: UserType,
    trashCollectionSites: Array<Object>,
    townInfo: Array<Object>,
    userLocation: Object,
    navigation: Object,
    teamOptions: { id: string, name: ?string }[]
};


const routes = [
    { key: "townInfo", title: "Town Info" },
    { key: "bagTagger", title: "Bag Tagger" }
];

const TrashDisposalScreen = ({ actions, teamOptions, currentUser, navigation, townInfo, userLocation, trashCollectionSites }: PropsType): React$Element<any> => {
    const [activeTab, setActiveTab] = useState(dateIsInCurrentEventWindow() ? 1 : 0);
    const navState = { index: activeTab, routes };

    const initialMapLocation = userLocation
        ? Coordinates.create(userLocation.coordinates)
        : null;

    const contents = R.cond([
        [
            () => Boolean(userLocation.error),
            () => (<EnableLocationServices errorMessage={ userLocation.error }/>)
        ],
        [
            () => !Boolean(initialMapLocation),
            () => (
                <View style={ [styles.frame, { display: "flex", justifyContent: "center" }] }>
                    <Text style={ { fontSize: 20, color: "white", textAlign: "center" } }>
                        { "...Locating You" }
                    </Text>
                </View>)
        ],
        [R.T, () => (
            <TabView
                renderTabBar={ props =>
                    <TabBar
                        { ...props }
                        indicatorStyle={ {
                            backgroundColor: constants.colorBackgroundDark,
                            color: constants.colorBackgroundDark
                        } }
                        style={ { backgroundColor: constants.colorBackgroundHeader } }
                        renderLabel={ ({ route, focused }) => (
                            <Text style={ { margin: 8, color: (focused ? "black" : "#555") } }>
                                { (route.title || "").toUpperCase() }
                            </Text>
                        ) }
                    />
                }

                navigationState={ navState }
                renderScene={ SceneMap({
                    townInfo: () => (<DisposalSiteSelector userLocation={ userLocation } townInfo={ townInfo }/>),
                    bagTagger: () => (
                        <TrashDropForm
                            currentUser={ currentUser }
                            onSave={ (drop) => {
                                actions.dropTrash(drop);
                                navigation.goBack();
                            } }
                            townData={ townInfo }
                            trashCollectionSites={ trashCollectionSites }
                            userLocation={ userLocation }
                            teamOptions={ teamOptions }
                        />
                    )
                }) }
                onIndexChange={ setActiveTab }
                initialLayout={ { width: Dimensions.get("window").width } }
            />
        )]
    ])();

    return (
        <SafeAreaView style={ styles.container }>
            <WatchGeoLocation/>
            { contents }
        </SafeAreaView>
    );
};

TrashDisposalScreen.navigationOptions = {
    title: "Trash Disposal",
    headerStyle: {
        backgroundColor: constants.colorBackgroundDark
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
        fontFamily: "Rubik-Regular",
        fontWeight: "bold",
        fontSize: 20,
        color: constants.colorHeaderText
    },
    headerBackTitleStyle: {
        fontFamily: "Rubik-Regular",
        fontWeight: "bold",
        fontSize: 20,
        color: constants.colorHeaderText
    }
};

const mapStateToProps = (state: Object): Object => {
    const trashCollectionSites = Object.values(state.trashCollectionSites.sites).filter((site: Object) => {
        const hasLatitude = typeof (site.coordinates || {}).latitude === "number";
        const hasLongitude = typeof (site.coordinates || {}).longitude === "number";
        return hasLatitude && hasLongitude;
    });

    const townInfo = R.compose(
        R.map((entry): Object => (
            {
                townId: entry[0],
                townName: entry[1].name,
                notes: entry[1].notes,
                dropOffInstructions: entry[1].dropOffInstructions,
                allowsRoadside: entry[1].roadsideDropOffAllowed,
                collectionSites: trashCollectionSites.filter((site: Object) => site.townId === entry[0])
            })),
        Object.entries
    )(state.towns.townData);
    const currentUser = User.create({ ...state.login.user, ...removeNulls(state.profile) });

    const teamOptions = Object.entries(currentUser.teams || {}).map((entry: [string, Object]) => ({
        id: entry[0],
        name: state.teams.teams[entry[0]].name
    }));

    return (
        {
            currentUser,
            townInfo,
            userLocation: state.userLocation,
            trashCollectionSites,
            teamOptions
        });
};

const mapDispatchToProps = (dispatch: Dispatch<Object>
): Object => ({ actions: bindActionCreators(actionCreators, dispatch) });

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(TrashDisposalScreen);

