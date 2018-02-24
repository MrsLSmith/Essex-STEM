/**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, StyleSheet, Text, ScrollView, TouchableHighlight, View, Platform, Alert} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import * as actions from './actions';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Ionicons} from '@expo/vector-icons';
import * as memberStatus from '../../constants/team-member-statuses';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        width: '100%'
    },
    teams: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    }
});

class TeamEditorMembers extends Component {
    static propTypes = {
        actions: PropTypes.object,
        teams: PropTypes.object,
        selectedTeam: PropTypes.object,
        screenProps: PropTypes.object
    };

    static navigationOptions = {
        title: 'Team Members',
        tabBarLabel: 'Members',
        // Note: By default the icon is only shown on iOS. Search the showIcon option below.
        tabBarIcon: ({tintColor}) => (<FontAwesome name='users' size={24} color='blue'/>)
    };

    constructor(props) {
        super(props);
        this.inviteContacts = this.inviteContacts.bind(this);
        this.inviteForm = this.inviteForm.bind(this);
        this._handleRequestToJoin = this._handleRequestToJoin.bind(this);
        this._handleCurrentMember = this._handleCurrentMember.bind(this);
        this._handleInvitation = this._handleCurrentMember.bind(this);
    }

    inviteContacts() {
        this.props.screenProps.stacknav.navigate('InviteContacts');
    }

    inviteForm() {
        this.props.screenProps.stacknav.navigate('InviteForm');
    }

    _handleRequestToJoin(member: Object, team: Object) {
        return () => {
            this.props.screenProps.stacknav.navigate('TeamMemberDetails', {team, member});
        };
    }

    _handleCurrentMember(member: Object, team: Object) {
        return () => {
            Alert.alert('handle current member');
        };
    }


    _handleInvitation(member: Object, team: Object) {
        return () => {
            Alert.alert('handle Invitation');
        };
    }


    render() {

        const icons = {
            [memberStatus.REQUEST_TO_JOIN]: Platform.OS === 'ios' ? 'ios-add-circle-outline' : 'md-plus',
            [memberStatus.ACCEPTED]: Platform.OS === 'ios' ? 'ios-checkmark-circle-outline' : 'md-checkmark',
            [memberStatus.INVITED]: Platform.OS === 'ios' ? 'ios-mail-outline' : 'md-mail',
            [memberStatus.OWNER]: Platform.OS === 'ios' ? 'ios-star-outline' : 'md-star'
        };


        const memberActions = {
            [memberStatus.REQUEST_TO_JOIN]: this._handleRequestToJoin,
            [memberStatus.ACCEPTED]: this._handleCurrentMember,
            [memberStatus.INVITED]: this._handleInvitation,
            [memberStatus.OWNER]: () => {
            }
        };


        const members = (this.props.selectedTeam.members || []).map(member => (
            <View key={member.uid}>
                <TouchableHighlight onPress={memberActions[member.memberStatus](member, this.props.selectedTeam)}>
                    <View>
                        <Ionicons
                            name={icons[member.memberStatus] || (Platform.OS === 'ios' ? 'ios-help-outline' : 'md-help')}
                            size={30}/>
                        <Text>{member.email}</Text>
                        <Text>{(`${member.displayName}`)}</Text>
                    </View>
                </TouchableHighlight>
            </View>

        ));

        return (
            <View style={styles.container}>
                <View>
                    <Text>Team Editor Members Screen</Text>
                    <Button onPress={this.inviteContacts} title='Invite Contacts'/>
                    <Button onPress={this.inviteForm} title='Invite to Team'/>
                </View>
                <View>
                    <ScrollView>
                        {members}
                    </ScrollView>
                </View>
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {teams: state.teams.teams, selectedTeam: state.teams.selectedTeam};
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamEditorMembers);