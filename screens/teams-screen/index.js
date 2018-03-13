// @flow

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Ionicons} from '@expo/vector-icons';
import {
    Button,
    StyleSheet,
    Text,
    TouchableHighlight,
    ScrollView,
    Modal,
    View,
    Platform
} from 'react-native';

import NewTeam from './new-team';
import {TeamMember} from '../../models/team-member';
import * as actions from './actions';
import {User} from '../../models/user';
import {defaultStyles} from '../../styles/default-styles';
import * as teamStatus from '../../constants/team-member-statuses';

const myStyles = {
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#888',
        height: 50,
        alignItems: 'center'
    },
    teamIcon: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    messageIcon: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    teamName: {
        flex: 4
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);

class MyTeams extends Component {
    static propTypes = {
        actions: PropTypes.object,
        currentUser: PropTypes.object,
        handleError: PropTypes.func,
        invitations: PropTypes.object,
        navigation: PropTypes.object,
        teamMembers: PropTypes.object,
        teams: PropTypes.object,
        toTeamDetails: PropTypes.func
    };

    static navigationOptions = {
        title: 'My Teams',
        tabBarLabel: 'Teams'
    };

    constructor(props) {
        super(props);
        this.toTeamDetail = this.toTeamDetail.bind(this);
        this.toTeamSearch = this.toTeamSearch.bind(this);
        // this.sendMessage = this.sendMessage.bind(this);
        this.toNewTeamEditor = this.toNewTeamEditor.bind(this);
        // this.onMessageTextChange = this.onMessageTextChange.bind(this);
        this.state = {selectedTeamId: null, isModalVisible: false, messageText: ''};
    }

    toTeamSearch() {
        this.props.navigation.navigate('TeamSearch');
    }

    toTeamDetail(status, team) {
        return () => {
            let nextScreen = 'TeamDetails';
            switch (true) {
                case status === TeamMember.memberStatuses.INVITED:
                    nextScreen = 'TeamInvitationDetails';
                    break;
                case status === TeamMember.memberStatuses.OWNER:
                    nextScreen = 'TeamEditor';
                    break;
                default:
                    nextScreen = 'TeamDetails';
                    break;
            }
            this.props.actions.selectTeam(team);
            this.props.navigation.navigate(nextScreen, {status});
        };
    }

    toNewTeamEditor() {
        this.setState({openModal: 'NEW_TEAM'});
    }

    toTeamIcon = (teamKey: string) => {
        const membershipId = ((this.props.currentUser || {}).email || '').toLowerCase().trim().replace(/\./g, ':');
        const status = (((this.props.teamMembers || {})[teamKey] || {})[membershipId] || {}).memberStatus;
        const memberStatus = TeamMember.memberStatuses;
        const icons = {
            [memberStatus.REQUEST_TO_JOIN]: Platform.OS === 'ios' ? 'ios-person-add-outline' : 'md-person-add',
            [memberStatus.ACCEPTED]: Platform.OS === 'ios' ? 'ios-checkmark-circle-outline' : 'md-checkmark',
            [memberStatus.INVITED]: Platform.OS === 'ios' ? 'ios-mail-outline' : 'md-mail',
            [memberStatus.OWNER]: Platform.OS === 'ios' ? 'ios-star-outline' : 'md-star'
        };

        return icons[status || 'INVITED'];
    };


    getIconColor = (teamKey: string) => {
        const membershipId = ((this.props.currentUser || {}).email || '').toLowerCase().trim().replace(/\./g, ':');
        const status = (((this.props.teamMembers || {})[teamKey] || {})[membershipId] || {}).memberStatus;
        const iconColors = {
            ACCEPTED: 'green',
            OWNER: 'blue',
            INVITED: 'orange',
            NOT_INVITED: 'red',
            REQUEST_TO_JOIN: 'purple'
        };
        return iconColors[status || 'INVITED'] || 'black';
    };

    render() {
        const _closeModal = () => this.setState({openModal: 'none'});
        const teams = this.props.teams;
        const user = this.props.currentUser;
        const membershipId = (user.email || '').toLowerCase().replace(/\./g, ':').trim();
        const canSendMessage = (teamId) => [teamStatus.OWNER, teamStatus.ACCEPTED].indexOf(((this.props.teamMembers[teamId] || {})[membershipId] || {}).memberStatus) > -1;
        const teamKeys = Object.keys((user.teams || {})).concat(Object.keys(this.props.invitations || {}));
        const myTeams = teamKeys.filter(key => Boolean(teams[key])) // avoid null exceptions if team was deleted
            .map(key => (
                <TouchableHighlight key={key} onPress={this.toTeamDetail(user.teams[key], teams[key])}>
                    <View style={styles.row}>
                        <Text style={styles.teamName}>{teams[key].name}</Text>
                        <View style={styles.teamIcon}>
                            <Ionicons
                                style={{color: this.getIconColor(key)}}
                                name={this.toTeamIcon(key)}
                                size={30}
                            />
                        </View>
                        <View style={styles.messageIcon}>
                            {
                                canSendMessage(key)
                                    ? (
                                        <TouchableHighlight onPress={() => {
                                            this.props.navigation.navigate('NewMessage', {selectedTeamId: key});
                                        }}>
                                            <Ionicons
                                                name={(Platform.OS === 'ios' ? 'ios-chatbubbles-outline' : 'md-chatboxes')}
                                                size={30}
                                            />
                                        </TouchableHighlight>
                                    )
                                    : null
                            }
                        </View>
                    </View>
                </TouchableHighlight>
            ));
        return (
            <View style={styles.frame}>
                <View style={{width: '100%', height: 60}}>
                    <View style={styles.buttonBar}>
                        <View style={styles.buttonBarButton}>
                            <Button
                                onPress={() => {
                                    this.props.navigation.navigate('TeamSearch');
                                }}
                                title='Search Teams'/>
                        </View>
                        <View style={styles.buttonBarButton}>
                            <Button
                                onPress={this.toNewTeamEditor}
                                title='New Team'/>
                        </View>
                    </View>
                </View>
                <ScrollView style={styles.container}>
                    <View>
                        {myTeams}
                    </View>
                </ScrollView>
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.openModal === 'NEW_TEAM'}
                    onRequestClose={() => {
                    }}>
                    <View style={styles.container}>
                        <NewTeam closeModal={_closeModal}/>
                    </View>
                </Modal>
            </View>
        );
    }
}

function mapStateToProps(state) {
    const user = state.login.user;
    const profile = state.profile;
    const invitations = state.teams.invitations;
    const currentUser = User.create(Object.assign({}, user, profile));
    const teams = state.teams.teams;
    const teamMembers = state.teams.teamMembers || {};
    return {teams, currentUser, teamMembers, invitations};
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyTeams);
