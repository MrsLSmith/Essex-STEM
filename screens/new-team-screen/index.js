// @flow
import React, { useReducer } from "react";
import {
    Alert,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView, KeyboardAvoidingView, TouchableWithoutFeedback
} from "react-native";

import { View, Button, TextInput, Text, Divider } from "@shoutem/ui";
import { fixAndroidTime } from "../../libs/fix-android-time";
import MiniMap from "../../components/mini-map";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import DateTimePicker from "react-native-modal-datetime-picker";
import * as actionCreators from "../../action-creators/team-action-creators";
import moment from "moment";
import { defaultStyles } from "../../styles/default-styles";
import Team from "../../models/team";
import TeamMember from "../../models/team-member";
import * as statuses from "../../constants/team-member-statuses";
import User from "../../models/user";
import { removeNulls } from "../../libs/remove-nulls";
import { TownLocation } from "../../models/town";
import ButtonBar from "../../components/button-bar";
import { getCurrentGreenUpDay } from "../../libs/green-up-day-calucators";
import * as constants from "../../styles/constants";
import * as R from "ramda";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { findTownIdByCoordinates } from "../../libs/geo-helpers";

const myStyles = {
    selected: {
        opacity: 0.5
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);
const dateRangeMessage = `${ moment(getCurrentGreenUpDay()).utc().format("dddd, MMM Do YYYY") } is the next Green Up Day, but teams may choose to work up to one week before or after.`;
const freshState = (owner: UserType, initialMapLocation: ?CoordinatesType = null): Object => ({
    team: Team.create({ owner }),
    startDateTimePickerVisible: false,
    endDateTimePickerVisible: false,
    datePickerVisible: false,
    query: "",
    town: "",
    locations: [],
    date: null,
    end: null,
    start: null,
    initialMapLocation
});
const setTime = (date: Date, time: string): Date => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // $FlowFixMe
    const year = date.getYear() + 1900;
    return new Date(`${ month }/${ day }/${ year } ${ time }`);
};

function reducer(state: Object, action: Object): Object {
    switch (action.type) {
        case "SET_STATE":
            return { ...state, ...action.data };
        case "SET_TEAM_STATE":
            return { ...state, team: { ...state.team, ...action.data } };
        case "RESET_STATE":
            return action.data;
        default:
            throw new Error("Invalid action type");
    }
}

type PropsType = {
    actions: { createTeam: (TeamType, UserType) => void },
    currentUser: User,
    locations: Array<TownLocation>,
    otherCleanAreas: Array<any>,
    vermontTowns: Array<Object>,
    navigation: Object
};

const NewTeam = ({ actions, currentUser, otherCleanAreas, navigation }: PropsType): React$Element<any> => {

    const [state, dispatch] = useReducer(reducer, freshState(currentUser));

    const handleMapClick = (coordinates: Object) => {
        Keyboard.dismiss();
        const town = findTownIdByCoordinates(coordinates);
        dispatch({
            type: "SET_TEAM_STATE",
            data: {
                town,
                locations: state.team.locations.concat({
                    title: "Clean Area",
                    description: "tap to remove",
                    coordinates
                })
            }
        });
    };

    const removeLastMarker = () => {
        const locations = state.team.locations.slice(0, state.team.locations.length - 1);
        dispatch({ type: "SET_TEAM_STATE", data: { locations } });
    };

    const removeMarker = (index: number) => {
        const myLocations = state.team.locations || [];
        if (index < myLocations.length) {
            const locations = myLocations.slice(0, index).concat(myLocations.slice(index + 1));
            dispatch({ type: "SET_TEAM_STATE", data: { locations } });
        }
    };

    const cancel = () => {
        dispatch({ type: "RESET_STATE", data: freshState(currentUser) });
    };

    const createTeam = () => {
        const team = Team.create({ ...state.team });
        if (!team.name) {
            Alert.alert("Please give your team a name.");
        } else {
            actions.createTeam(team, currentUser);
            navigation.goBack();
        }
    };

    const setTeamValue = (key: string): (any=>void) => (value: any) => {
        dispatch({
            type: "SET_TEAM_STATE",
            data: { [key]: value }
        });
    };

    const setState = (data: Object): (()=>void) => () => {
        dispatch({
            type: "SET_STATE",
            data
        });
    };

    const handleDatePicked = (pickedDate: Date) => {
        const arr = pickedDate.toString().split(" ");
        const date = `${ arr[0] } ${ arr[1] } ${ arr[2] } ${ arr[3] }`;
        setTeamValue("date")(date);
        setState({ datePickerVisible: false })();
    };

    const handleStartDatePicked = (date: Date) => {
        let start = date.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit" });
        if (Platform.OS === "android") {
            start = fixAndroidTime(start);
        }
        setTeamValue("start")(start);
        setState({ startDateTimePickerVisible: false })();
    };

    const handleEndDatePicked = (date: Date) => {
        let end = date.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit" });
        if (Platform.OS === "android") {
            end = fixAndroidTime(end);
        }
        setTeamValue("end")(end);
        setState({ endDateTimePickerVisible: false })();
    };

    // DateTimePicker

    const dateIsSelected = state.team.date === null;
    const endIsSelected = state.team.end === null;
    const startIsSelected = state.team.start === null;
    const applyDateOffset = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    const eventDate = getCurrentGreenUpDay();
    const minDate = applyDateOffset(eventDate, -6);
    const maxDate = applyDateOffset(eventDate, 6);
    const headerButtons = [{ text: "Save", onClick: createTeam }, { text: "Clear", onClick: cancel }];

    const pinsConfig = state.team.locations
        .map(l => ({
            coordinates: l.coordinates,
            title: state.team.name,
            description: "Click here to remove pin",
            onCalloutPress: removeMarker,
            color: "green"
        }))
        .concat(otherCleanAreas.map(o => ({ ...o, color: "yellow" })));

    return (

        <SafeAreaView style={ styles.container }>
            <ButtonBar buttonConfigs={ headerButtons }/>
            <TouchableWithoutFeedback onPress={ Keyboard.dismiss }>
                <KeyboardAvoidingView
                    keyboardVerticalOffset={ 100 }
                    style={ { flex: 1 } }
                    behavior={ Platform.OS === "ios" ? "padding" : null }
                >
                    <View style={ { flex: 1, justifyContent: "flex-end" } }>

                        <ScrollView
                            automaticallyAdjustContentInsets={ false }
                            scrollEventThrottle={ 200 }
                            style={ { paddingLeft: 20, paddingRight: 20 } }
                        >


                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>{ "Team Name" }</Text>
                                <TextInput
                                    keyBoardType={ "default" }
                                    onChangeText={ setTeamValue("name") }
                                    placeholder={ "Team Name" }
                                    value={ state.team.name }
                                    underlineColorAndroid={ "transparent" }
                                />
                            </View>
                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>
                                    { state.team.isPublic ? "Anyone can join your team" : "You control who joins your team" }
                                </Text>
                                <View styleName="horizontal flexible">
                                    <Button
                                        onPress={ () => setTeamValue("isPublic")(true) }
                                        styleName={ `full-width${ !state.team.isPublic ? " secondary muted" : "" }` }>
                                        <MaterialCommunityIcons
                                            name="earth"
                                            size={ 25 }
                                            style={ { marginRight: 10 } }
                                            color={ !state.team.isPublic ? "#555" : "black" }
                                        />
                                        <Text>PUBLIC</Text>
                                    </Button>
                                    <Button
                                        onPress={ () => setTeamValue("isPublic")(false) }
                                        styleName={ `full-width${ state.team.isPublic ? " secondary muted" : "" }` }>
                                        <MaterialCommunityIcons
                                            name="earth-off"
                                            size={ 25 }
                                            style={ { marginRight: 10 } }
                                            color={ state.team.isPublic ? "#555" : "black" }
                                        />
                                        <Text>PRIVATE</Text>
                                    </Button>
                                </View>
                            </View>
                            <Divider styleName={ "line" } style={ { marginTop: 20, marginBottom: 20 } }/>
                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>{ "Clean Up Site" }</Text>
                                <TextInput
                                    keyBoardType={ "default" }
                                    onChangeText={ setTeamValue("location") }
                                    placeholder={ "The park, school, or road name" }
                                    value={ state.team.location }
                                    style={ { backgroundColor: "white", padding: 20 } }
                                    underlineColorAndroid={ "transparent" }
                                />
                            </View>
                            <View style={ styles.formControl }>
                                <Text style={ { ...styles.label, maxHeight: 63 } }>
                                    { "Mark your spot(s)" }
                                </Text>
                                <MiniMap
                                    pinsConfig={ pinsConfig }
                                    onMapClick={ handleMapClick }
                                />
                                <Button
                                    styleName={ "secondary" }
                                    onPress={ removeLastMarker }
                                >
                                    <Text>{ "REMOVE MARKER" }</Text>
                                </Button>
                            </View>
                            <Divider styleName={ "line" } style={ { marginTop: 20, marginBottom: 20 } }/>
                            <View style={ styles.formControl }>
                                <Text style={ styles.alertInfo }>
                                    { dateRangeMessage }
                                </Text>
                            </View>
                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>{ "Which day will your team be cleaning?" }</Text>
                                <View>
                                    <TouchableOpacity onPress={ setState({ datePickerVisible: true }) }>
                                        <Text
                                            style={ { ...styles.textInput, ...(dateIsSelected ? styles.selected : {}) } }>
                                            { state.team.date || "Which day will your team be cleaning?" }
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePicker
                                        mode="date"
                                        date={ eventDate }
                                        minimumDate={ minDate }
                                        maximumDate={ maxDate }
                                        isVisible={ state.datePickerVisible }
                                        onConfirm={ handleDatePicked }
                                        onCancel={ setState({ datePickerVisible: false }) }
                                        titleIOS={ "Which day is your team cleaning?" }
                                        titleStyle={ styles.datePickerTitleStyle }
                                    />
                                </View>
                            </View>
                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>{ "What time will your team start?" }</Text>
                                <View>
                                    <TouchableOpacity onPress={ setState({ startDateTimePickerVisible: true }) }>
                                        <Text
                                            style={ { ...styles.textInput, ...(startIsSelected ? styles.selected : {}) } }>
                                            { state.team.start || "Pick a Starting Time" }
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePicker
                                        date={ setTime(eventDate, (state.team.start || "9:00 AM")) }
                                        mode="time"
                                        isVisible={ state.startDateTimePickerVisible }
                                        onConfirm={ handleStartDatePicked }
                                        onCancel={ setState({ startDateTimePickerVisible: false }) }
                                        is24Hour={ false }
                                        titleIOS={ "Pick a starting time." }
                                        titleStyle={ styles.datePickerTitleStyle }
                                    />
                                </View>
                            </View>
                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>{ "What time will your team end?" }</Text>
                                <View>
                                    <TouchableOpacity onPress={ setState({ endDateTimePickerVisible: true }) }>
                                        <Text
                                            style={ { ...styles.textInput, ...(endIsSelected ? styles.selected : {}) } }>
                                            { state.team.end || "Pick an Ending Time" }
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePicker
                                        date={ setTime(eventDate, (state.team.end || "5:00 PM")) }
                                        mode="time"
                                        isVisible={ state.endDateTimePickerVisible }
                                        onConfirm={ handleEndDatePicked }
                                        onCancel={ setState({ endDateTimePickerVisible: false }) }
                                        is24Hour={ false }
                                        titleIOS={ "Pick an ending time." }
                                        titleStyle={ styles.datePickerTitleStyle }
                                    />
                                </View>
                            </View>
                            <Divider styleName={ "line" } style={ { marginTop: 20, marginBottom: 20 } }/>
                            <View style={ styles.formControl }>
                                <Text style={ styles.label }>{ "Team Information" }</Text>
                                <TextInput
                                    keyBoardType={ "default" }
                                    multiline={ true }
                                    numberOfLines={ 10 }
                                    textAlignVertical="top"
                                    onChangeText={ setTeamValue("description") }
                                    placeholder={ "Add important information here" }
                                    style={ styles.textArea }
                                    value={ state.team.description }
                                    underlineColorAndroid={ "transparent" }
                                />
                            </View>


                        </ScrollView>
                        <View style={ { flex: 1 } }/>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

NewTeam.navigationOptions = {
    title: "Start a Team",
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

type PinType<T> = ?(Array<T> | T);

const mapStateToProps = (state: Object): Object => {
    const profile = state.profile;

    const currentUser = User.create({ ...state.login.user, ...removeNulls(state.profile) });

    const owner = TeamMember.create({ ...currentUser, ...profile, memberStatus: statuses.OWNER });

    const mapToPinData = R.cond([
        [
            (locations: any): boolean => !locations,
            (): Array<any> => []
        ],
        [
            Array.isArray,
            (locations: PinType<any>, teamName: any): Array<Object> => (locations || [])
                .filter((l: PinType<any>): boolean => Boolean(l))
                .map((l: Object): mixed => mapToPinData(l, teamName))
        ],
        [
            R.T,
            (location: any, teamName: any): Object => ({
                key: "",
                coordinates: location.coordinates,
                title: `${ teamName || "Another Team" }`,
                description: "has claimed this area"
            })]
    ]);

    // $FlowFixMe
    const otherCleanAreas = R.compose(
        R.flatten,
        R.map((team: TeamType): Array<Object> => mapToPinData(team.locations, team.name)),
        Object.values
    )(state.teams.teams);

    // // $FlowFixMe
    // const vermontTowns = R.compose(
    //     R.sort((a: TeamType, b: TeamType): number => ((a.name || "").toLowerCase() < (b.name || "").toLowerCase()) ? 1 : -1),
    //     R.filter((town: Town): boolean => Boolean(town.name)), // hedge against bad data.
    //     Object.values
    // )(state.towns.townData);

    return { owner, currentUser, otherCleanAreas };
};

const mapDispatchToProps = (dispatch: Dispatch<Object>): Object =>
    ({ actions: bindActionCreators(actionCreators, dispatch) });

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(NewTeam);
