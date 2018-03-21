/**
 /**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Location, MapView, Permissions} from 'expo';
import CheckBox from 'react-native-checkbox';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    KeyboardAvoidingView,
    TouchableHighlight,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    Text,
    View,
    Platform
} from 'react-native';

import * as turf from '@turf/helpers';
import booleanWithin from '@turf/boolean-within';

import TrashDrop from '../../models/trash-drop';
import * as actions from './actions';
import {defaultStyles} from '../../styles/default-styles';

const myStyles = {
    toggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);


class TownInformation extends React.Component {
    static propTypes = {
        townInfo: PropTypes.object,
        town: PropTypes.string
    };

    render() {
        const {townInfo, town} = this.props;
        return (
            <View style={styles.statusBar}>
                {typeof townInfo.RoadsideDropOffAllowed === 'undefined' && (
                    <Text style={styles.statusBarText}>
                        {'Information about trash dropping is not available at this time for the town you are in.'}
                    </Text>
                )}
                {townInfo.RoadsideDropOffAllowed === true && (
                    <Text style={styles.statusBarText}>
                        <Text>{`You are in ${town} and leaving trash bags on the roadside is allowed.`}</Text>
                    </Text>
                )}
                {townInfo.RoadsideDropOffAllowed === false && (
                    <Text style={styles.statusBarText}>
                        <Text>{`You are in ${town} and leaving trash bags on the roadside is`}
                            <Text style={{fontWeight: 'bold'}}>
                                {' not'}
                            </Text>
                            {' allowed. \n Please bring collected trash to the designated drop off locations:'}
                        </Text>
                        {townInfo.DropOffLocations.map(d => (
                            <Text>{`\n${d.DropOffLocationName}, ${d.DropOffLocationAddress}`}</Text>
                        ))}
                    </Text>)}
            </View>
        );
    }
}

class TrashMap extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        actions: PropTypes.object,
        drops: PropTypes.array,
        currentUser: PropTypes.object,
        townData: PropTypes.object,
        location: PropTypes.object
    };

    static navigationOptions = {
        title: 'Trash Tracker'
    };

    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this._toggleTag = this._toggleTag.bind(this);
        this._getLocationAsync = this._getLocationAsync.bind(this);
        this._getTown = this._getTown.bind(this);
        this.state = {
            drop: {
                id: null,
                location: {},
                tags: [],
                bagCount: 1,
                wasCollected: false,
                createdBy: {uid: props.currentUser.uid, email: props.currentUser.email}
            },
            modalVisible: false,
            errorMessage: null,
            showCollectedTrash: false,
            showUncollectedTrash: true,
            showTrashDropLocations: true,
            hackyHeight: 300
        };
    }

    componentWillMount() {
        // Hack to work around known issue where the my location button doesn't show
        // https://github.com/react-community/react-native-maps/issues/1332
        setTimeout(() => this.setState({hackyHeight: 301}), 500);
        setTimeout(() => this.setState({hackyHeight: 300}), 1000);

    }

    componentDidMount() {
        if (!this.props.location) {
            this._getLocationAsync();
        }
    }

    _getTown(location) {
        const townPolygonsData = require('../../libs/VT_Boundaries__town_polygons.json');
        const currentLocation = turf.point([location.coords.longitude, location.coords.latitude]);
        const town = townPolygonsData.features.find((f) => {
            const feature = turf.feature(f.geometry);
            return booleanWithin(currentLocation, feature);
        });

        return town ? town.properties.TOWNNAMEMC : '';
    }

    _getLocationAsync = async () => {
        // TODO: what if the user doesn't grant permission to location
        const {status} = await Permissions.askAsync(Permissions.LOCATION);

        if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            this.props.actions.locationUpdated(location);

            Location.watchPositionAsync({timeInterval: 3000, distanceInterval: 20}, (l) => {
                this.props.actions.locationUpdated(l);
            });
        }
    };

    _toggleTag = (tag) => () => {
        const hasTag = this.state.drop.tags.indexOf(tag) > -1;
        const tags = hasTag ? this.state.drop.tags.filter(_tag => _tag !== tag) : this.state.drop.tags.concat(tag);
        this.setState({drop: {...this.state.drop, tags}});
    };

    closeModal() {
        this.setState({
            modalVisible: false,
            drop: {
                id: null,
                location: {},
                tags: [],
                bagCount: 1,
                wasCollected: false,
                createdBy: {uid: this.props.currentUser.uid, email: this.props.currentUser.email}
            }
        });
    }

    render() {
        const saveTrashDrop = () => {
            if (this.state.drop.uid) {
                this.props.actions.updateTrashDrop(this.state.drop);
            } else {
                this.props.actions.dropTrash(TrashDrop.create(Object.assign({}, this.state.drop, {location: this.props.location.coords})));
            }

            this.closeModal();
        };

        const collectTrashDrop = () => {
            this.setState(
                {
                    drop: Object.assign({}, this.state.drop, {
                        wasCollected: true,
                        collectedBy: {
                            uid: this.props.currentUser.uid,
                            email: this.props.currentUser.email
                        }
                    })
                }, saveTrashDrop);
        };

        const goToTrashDrop = () => {
            this.setState({modalVisible: true});
        };

        const {drops, townData} = this.props;

        // by convention, we're importing town names as upper case, any characters different
        // than uppercase letters replaced with underscore
        const town = this.props.location ? this._getTown(this.props.location) : '';
        const encodedTownName = town.toUpperCase().replace(/[^A-Z]/g, '_');
        const townInfo = townData[encodedTownName] || {};
        const trashDropOffLocations = Object.getOwnPropertyNames(townData).reduce((acc, p) => acc.concat(townData[p].DropOffLocations), []).filter(l => l.DropOffLocationCoordinates);
        const initialMapLocation = this.props.location ? {
            latitude: Number(this.props.location.coords.latitude),
            longitude: Number(this.props.location.coords.longitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
        } : null;


        const showFirstButton = !this.state.drop.wasCollected && this.state.drop.createdBy && this.state.drop.createdBy.uid === this.props.currentUser.uid;
        return this.state.errorMessage ? (<Text>{this.state.errorMessage}</Text>)
            : initialMapLocation &&
            (
                <View style={styles.frame}>
                    {townInfo.RoadsideDropOffAllowed === true && (
                        <View style={styles.singleButtonHeader}>
                            <TouchableHighlight
                                style={styles.singleButtonHeaderHighlight}
                                onPress={goToTrashDrop}>
                                <Text style={styles.headerButton}>
                                    {'Create Trash Drop'}
                                </Text>
                            </TouchableHighlight>
                        </View>
                    )}
                    <ScrollView style={styles.scroll}>
                        <TownInformation townInfo={townInfo} town={town}/>
                        <MapView
                            initialRegion={initialMapLocation}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                            showsCompass={true}
                            style={{alignSelf: 'stretch', height: this.state.hackyHeight}}>
                            {drops && drops.filter(drop => (this.state.showCollectedTrash && drop.wasCollected === true) || (this.state.showUncollectedTrash && !drop.wasCollected)).map(drop => (
                                <MapView.Marker
                                    key={drop.uid}
                                    image={drop.wasCollected ? require('../../assets/images/checkbox-marked-circle.png') : require('../../assets/images/delete-circle.png')}
                                    coordinate={drop.location}
                                    title={`${drop.bagCount} bag(s)${drop.tags.length > 0 ? ' & other trash' : ''}`}
                                    description={'Tap to view, edit or collect'}
                                    onCalloutPress={() => {
                                        this.setState({modalVisible: true, drop: drop});
                                    }}
                                />
                            ))}
                            {this.state.showTrashDropLocations && trashDropOffLocations.map((d, i) => (
                                <MapView.Marker
                                    key={`${town}DropOffLocation${i}`}
                                    image={require('../../assets/images/home-circle.png')}
                                    coordinate={d.DropOffLocationCoordinates}
                                    title='Drop Off Location'
                                    description={`${d.DropOffLocationName}, ${d.DropOffLocationAddress}`}
                                />
                            ))}
                        </MapView>
                        <View>
                            <View style={styles.toggle}>
                                <Text style={styles.label}>Show Collected Trash</Text>
                                <Switch
                                    value={this.state.showCollectedTrash}
                                    onValueChange={(value) => this.setState({showCollectedTrash: value})}/>
                            </View>
                            <View style={styles.toggle}>
                                <Text style={styles.label}>Show Uncollected Trash</Text>
                                <Switch
                                    value={this.state.showUncollectedTrash}
                                    onValueChange={(value) => this.setState({showUncollectedTrash: value})}/>
                            </View>
                            <View style={styles.toggle}>
                                <Text style={styles.label}>Show Trash Drop Locations</Text>
                                <Switch
                                    value={this.state.showTrashDropLocations}
                                    onValueChange={(value) => this.setState({showTrashDropLocations: value})}
                                />
                            </View>
                        </View>
                        <View style={defaultStyles.padForIOSKeyboard}/>
                    </ScrollView>
                    <Modal
                        animationType={'slide'}
                        transparent={false}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {
                            this.closeModal();
                        }}>
                        <View style={styles.frame}>
                            <View style={[styles.buttonBarHeader, {backgroundColor: '#EEE', marginTop: 30}]}>
                                <View style={styles.buttonBar}>
                                    {
                                        showFirstButton
                                            ? (
                                                <View style={styles.buttonBarButton}>
                                                    <TouchableHighlight style={styles.button} onPress={saveTrashDrop}>
                                                        <Text style={styles.headerButton}>
                                                            {this.state.drop.uid ? 'Update This Spot' : 'Mark This Spot'}
                                                        </Text>
                                                    </TouchableHighlight>
                                                </View>
                                            )
                                            : null
                                    }


                                    <View style={styles.buttonBarButton}>
                                        <TouchableHighlight style={styles.button} onPress={this.closeModal}>
                                            <Text style={styles.headerButton}>{'Cancel'}</Text>
                                        </TouchableHighlight>
                                    </View>

                                </View>
                            </View>
                            <KeyboardAvoidingView
                                style={defaultStyles.frame}
                                behavior={Platform.OS === 'ios' ? 'padding' : null}
                            >
                                <ScrollView style={styles.scroll}>
                                    <View style={styles.container}>
                                        <Text style={styles.label}>Number of Bags</Text>
                                        <TextInput
                                            underlineColorAndroid='transparent'
                                            editable={!this.state.drop.wasCollected}
                                            value={this.state.drop.bagCount.toString()}
                                            keyboardType='numeric'
                                            placeholder='1'
                                            style={styles.textInput}
                                            onChangeText={(text) => this.setState({
                                                drop: {
                                                    ...this.state.drop,
                                                    bagCount: Number(text)
                                                }
                                            })}
                                        />
                                        <Text style={styles.label}>Other Items</Text>
                                        <View style={styles.fieldset}>
                                            <CheckBox
                                                editable={!this.state.drop.wasCollected}
                                                label='Needles/Bio-Waste'
                                                checked={this.state.drop.tags.indexOf('bio-waste') > -1}
                                                onChange={this._toggleTag('bio-waste')}/>
                                            <CheckBox
                                                editable={!this.state.drop.wasCollected}
                                                label='Tires'
                                                checked={this.state.drop.tags.indexOf('tires') > -1}
                                                onChange={this._toggleTag('tires')}/>
                                            <CheckBox
                                                editable={!this.state.drop.wasCollected}
                                                label='Large Object'
                                                checked={this.state.drop.tags.indexOf('large') > -1}
                                                onChange={this._toggleTag('large')}/>
                                        </View>

                                    </View>
                                    {
                                        this.state.drop.uid && !this.state.drop.wasCollected && (
                                            <View style={styles.buttonBarButton}>
                                                <TouchableHighlight style={styles.button} onPress={collectTrashDrop}>
                                                    <Text style={styles.menuButtonText}>{'Collect Trash'}</Text>
                                                </TouchableHighlight>
                                            </View>
                                        )
                                    }
                                </ScrollView>
                                {
                                    Platform.OS === 'ios'
                                        ? (<View style={defaultStyles.padForIOSKeyboardBig}/>)
                                        : null
                                }
                            </KeyboardAvoidingView>
                        </View>
                    </Modal>
                </View>
            );
    }
}

function mapStateToProps(state) {
    const drops = Object.keys(state.trashTracker.trashDrops || {})
        .filter(key => !!(state.trashTracker.trashDrops[key].location && state.trashTracker.trashDrops[key].location.longitude && state.trashTracker.trashDrops[key].location.latitude))
        .map(key => ({...state.trashTracker.trashDrops[key], uid: key}));
    const townData = state.trashBagFinder.townData;

    return {drops: drops, currentUser: state.login.user, townData, location: state.trashTracker.location};
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TrashMap);
