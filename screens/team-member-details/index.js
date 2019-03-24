// @flow

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Alert, StyleSheet, ScrollView, Text, View, Image, TouchableHighlight} from 'react-native';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getMemberIcon} from '../../libs/member-icons';
import * as actions from './actions';
import TeamMember from '../../models/team-member';
import * as status from '../../constants/team-member-statuses';
import {defaultStyles} from '../../styles/default-styles';

const myStyles = {
    statusBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFE',
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#FDFDFE',
        width: '100%'
    },
    statusBarText: {fontSize: 12, textAlign: 'left'}
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);

class TeamMemberDetails extends Component {
    static propTypes = {
        actions: PropTypes.object,
        messages: PropTypes.object,
        navigation: PropTypes.object,
        profile: PropTypes.object,
        teamMembers: PropTypes.object,
        teams: PropTypes.object,
        currentUserId: PropTypes.string
    };

    static navigationOptions = {
        title: 'User Profile'
    };

    constructor(props) {
        super(props);
        this._updateTeamMember = this._updateTeamMember.bind(this);
        this._removeTeamMember = this._removeTeamMember.bind(this);
        this._cancel = this._cancel.bind(this);
        this.state = Object.assign({}, props.profile);
    }


    componentWillReceiveProps(nextProps: Object) {
        const {membershipId, teamId} = nextProps.navigation.state.params;
        const member = (nextProps.teamMembers[teamId] || {})[membershipId];
        if (!member) {
            nextProps.navigation.goBack();
        }
        if (JSON.stringify(nextProps.profile) !== JSON.stringify(this.props.profile)) {
            this.setState(nextProps.profile);
        }
    }

    _updateTeamMember(teamId: string, member: Object, currentUserId) {
        return (newStatus: Object) => {
            const messages = this.props.messages;
            const messageIds = Object.keys(this.props.messages).filter(id => messages[id].teamId === teamId && messages[id].type === 'REQUEST_TO_JOIN' && messages[id].sender.uid === member.uid);
            messageIds.map(id => this.props.actions.deleteMessage(currentUserId, id));
            const _member = TeamMember.create(Object.assign({}, member, (newStatus ? {memberStatus: newStatus} : {})));
            this.props.navigation.goBack();
            this.props.actions.updateTeamMember(teamId, _member, newStatus);
        };
    }

    _revokeInvitation(teamId: string, membershipId: string) {
        return () => {
            Alert.alert(
                'DANGER!',
                'Are you sure you want to revoke this invitation?',
                [
                    {
                        text: 'No', onPress: () => {
                        }, style: 'cancel'
                    },
                    {
                        text: 'Yes', onPress: () => {
                            this.props.navigation.goBack();
                            this.props.actions.revokeInvitation(teamId, membershipId);
                        }
                    }
                ],
                {cancelable: true}
            );

        };
    }

    _removeTeamMember(teamId: string, user: Object, currentUserId: string) {
        return () => {


            Alert.alert(
                'DANGER!',
                'Are you sure you want to remove this team member?',
                [
                    {
                        text: 'No', onPress: () => {
                        }, style: 'cancel'
                    },
                    {
                        text: 'Yes', onPress: () => {
                            const messages = this.props.messages;
                            const messageIds = Object.keys(this.props.messages).filter(id => messages[id].teamId === teamId && messages[id].type === 'REQUEST_TO_JOIN' && messages[id].sender.uid === user.uid);
                            messageIds.map(id => this.props.actions.deleteMessage(currentUserId, id));
                            this.props.navigation.goBack();
                            return this.props.actions.removeTeamMember(teamId, user);
                        }
                    }
                ],
                {cancelable: true}
            );

        };
    }

    _cancel() {
        this.setState(this.props.profile, () => {
            this.props.navigation.goBack();
        });
    }

    render() {
        const {membershipId, teamId} = this.props.navigation.state.params;
        const member = (this.props.teamMembers[teamId] || {})[membershipId] || {};
        const avatar = (member || {}).photoURL;
        const isOwner = ((this.props.teams[teamId] || {}).owner || {}).uid === this.props.currentUserId;

        const getButtons = (teamMember: Object = {}) => {
            switch (teamMember.memberStatus) {
                case status.OWNER :
                    return null;
                case status.REQUEST_TO_JOIN :
                    return (
                        <View style={styles.buttonBarHeader}>
                            <View style={styles.buttonBar}>
                                <View style={styles.buttonBarButton}>
                                    <TouchableHighlight
                                        style={styles.headerButton}
                                        onPress={this._removeTeamMember(teamId, member, this.props.currentUserId)}>
                                        <Text style={styles.headerButtonText}>{'Ignore'}</Text>
                                    </TouchableHighlight>
                                </View>
                                <View style={styles.buttonBarButton}>
                                    <TouchableHighlight
                                        style={styles.headerButton}
                                        onPress={() => this._updateTeamMember(teamId, member, this.props.currentUserId)(status.ACCEPTED)}>
                                        <Text style={styles.headerButtonText}>{'Add to Team'}</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                    );
                case status.ACCEPTED :
                    return (
                        <View style={styles.singleButtonHeader}>
                            <TouchableHighlight
                                style={styles.headerButton}
                                onPress={this._removeTeamMember(teamId, member, this.props.currentUserId)}
                            >
                                <Text style={styles.headerButtonText}>{'Remove from Team'}</Text>
                            </TouchableHighlight>
                        </View>
                    );
                case status.INVITED :
                    return (
                        <View style={styles.singleButtonHeader}>
                            <TouchableHighlight
                                style={styles.headerButton}
                                onPress={this._revokeInvitation(teamId, membershipId)}
                            >
                                <Text style={styles.headerButtonText}>{'Revoke Invitation'}</Text>
                            </TouchableHighlight>
                        </View>
                    );
                default :
                    return null;
            }
        };

        function getStatus(teamMember: Object = {}, _isOwner: boolean) {
            switch (teamMember.memberStatus) {
                case status.OWNER :
                    return (
                        <View style={styles.statusBar}>
                            {getMemberIcon(status.OWNER)}
                            <Text style={styles.statusBarText}>
                                {`${teamMember.displayName && teamMember.displayName.trim() || teamMember.email}`} is
                                the owner of this team
                            </Text>
                        </View>
                    );
                case status.REQUEST_TO_JOIN :
                    return (
                        <View style={styles.statusBar}>
                            {getMemberIcon(status.REQUEST_TO_JOIN, {}, _isOwner)}
                            <Text style={styles.statusBarText}>
                                {teamMember.displayName && teamMember.displayName.trim() || teamMember.email} wants to
                                join this team
                            </Text>
                        </View>
                    );
                case status.ACCEPTED :
                    return (
                        <View style={styles.statusBar}>
                            {getMemberIcon(status.ACCEPTED)}
                            <Text style={styles.statusBarText}>
                                {teamMember.displayName && teamMember.displayName.trim() || teamMember.email} is a
                                member of this team.
                            </Text>
                        </View>
                    );
                case status.INVITED :
                    return (
                        <View style={styles.statusBar}>
                            {getMemberIcon(status.INVITED)}
                            <Text style={styles.statusBarText}>
                                {`${teamMember.displayName && teamMember.displayName.trim() || teamMember.email} has not yet accepted the invitation`}
                            </Text>
                        </View>
                    );
                default :
                    return (
                        <View style={styles.statusBar}>
                            {getMemberIcon(status.NOT_INVITED)}
                            <Text style={styles.statusBarText}>
                                {teamMember.displayName && teamMember.displayName.trim() || teamMember.email || 'This person'} is
                                not a member of this
                                team
                            </Text>
                        </View>);
            }
        }

        return (
            <View style={styles.frame}>
                {isOwner ? getButtons.bind(this)(member) : (<View style={{height: 10}}/>)}
                <ScrollView style={styles.scroll}>
                    <View style={styles.infoBlockContainer}>
                        <View style={styles.profileHeader}>
                            <Image
                                style={{width: 50, height: 50}}
                                source={{uri: avatar}}
                            />
                            <Text style={[styles.profileName, styles.heading]}>
                                {`${member.displayName && member.displayName.trim() || member.email || ''}`}
                            </Text>
                        </View>
                        <View>
                            {getStatus.bind(this)(member, isOwner)}
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text
                                style={styles.labelDark}>{`About ${member.displayName && member.displayName.trim() || ''}: `}</Text>
                            <Text style={{marginTop: 5}}>{member.bio || 'This person has not completed a bio :-('}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

        );
    }
}

const mapStateToProps = state => {
    const messages = state.messages.messages || {};
    const teamMembers = state.teams.teamMembers || {};
    const teams = state.teams.teams || {};
    const currentUserId = state.login.user.uid;
    return {messages, teamMembers, teams, currentUserId};
};

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamMemberDetails);
