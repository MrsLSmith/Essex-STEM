/**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import NavHeader from '../../components/NavHeader';

import {
    Alert,
    Button,
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        width: '100%'
    }
});
export default class AllAboutGreenUpDay extends Component {
    static propTypes = {};
    static navigationOptions = {
        drawerLabel: 'About Green Up Day',
        drawerIcon: ({tintColor}) => (
            <MaterialCommunityIcons name="information" size={24} color="blue" />
        )
    };

    componentDidMount() {
    }

    constructor(props) {
        super(props);
        this._myAwesomeMethod = this._myAwesomeMethod.bind(this);
    }

    _myAwesomeMethod() {
        Alert.alert('Huzzah!');
    }

    render() {
        return (
            <View style={styles.container}>
                <NavHeader navigation={this.props.navigation} screenTitle="About Green Up Day" showBack={false}/>

                <TouchableHighlight onPress={this._myAwesomeMethod} underlayColor={'rgba(0, 0, 0, 0.054)'}>
                    <Text style={styles.text}>
                        All About Green Up Day
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }
}