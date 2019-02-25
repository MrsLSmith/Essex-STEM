// @flow

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Ionicons} from '@expo/vector-icons';
import {getMemberIcon} from '../../libs/member-icons';
import {
    FlatList,
    ImageBackground,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    Modal,
    View,
    Platform
} from 'react-native';

import NewTeam from './new-team';
import TeamMember from '../../models/team-member';
import * as actions from './actions';
import User from '../../models/user';
import {defaultStyles} from '../../styles/default-styles';
import teamwork from '../../assets/images/teamwork.jpeg';
import {removeNulls} from '../../libs/remove-nulls';

const myStyles = {
    icon: {
        height: 50,
        width: 50,
        paddingTop: 10
    },
    teamName: {
        flex: 4
    }
};
const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);

class TeamItem extends Component {
    static propTypes = {
        item: PropTypes.object
    };

    render() {
        const item = this.props.item || {};
        return (
            <View key={item.key} style={styles.row}>
                <TouchableHighlight
                    style={{flex: 1, alignItems: 'stretch', height: 50, paddingLeft: 10}}
                    onPress={item.goToTeam}>
                    <Text style={[styles.textDark, {fontSize: 14, paddingTop: 20, height: 40}]}>{item.name}</Text>
                </TouchableHighlight>

                <TouchableOpacity style={styles.icon} onPress={item.goToMessage}>
                    <Ionicons
                        style={{paddingTop: 10}}
                        name={(Platform.OS === 'ios' ? 'ios-chatbubbles-outline' : 'md-chatboxes')}
                        size={30}
                    />
                </TouchableOpacity>


                <TouchableOpacity style={styles.icon} onPress={item.shareTeamDetails}>
                    <Ionicons
                        name={Platform.OS === 'ios' ? 'ios-share-outline' : 'md-share'}
                        size={30} style={{paddingTop: 10}}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.icon} onPress={item.goToTeam}>
                    {item.toTeamIcon}
                </TouchableOpacity>
            </View>
        );
    }
}

type Props = {
    actions: Object,
    user: Object,
    handleError: any => any,
    invitations: Object,
    navigation: Object,
    teamMembers: Object,
    teams: Object,
    teamStati: Object,
    toTeamDetails: any => any
};

class MyTeams extends Component<Props> {

    static navigationOptions = {
        title: 'My Teams',
        tabBarLabel: 'Teams'
    };

    constructor(props) {
        super(props);
        this.toTeamDetail = this.toTeamDetail.bind(this);
        this.toTeamSearch = this.toTeamSearch.bind(this);
        this.toNewTeamEditor = this.toNewTeamEditor.bind(this);
        this.state = {selectedTeamId: null, isModalVisible: false, messageText: ''};
    }

    toTeamSearch() {
        this.props.navigation.navigate('TeamSearch');
    }

    toTeamDetail(team, status) {
        return () => {

            const nextScreen = {
                [TeamMember.memberStatuses.INVITED]: 'TeamDetails',
                [TeamMember.memberStatuses.OWNER]: 'TeamEditor',
                [TeamMember.memberStatuses.NOT_INVITED]: 'TeamDetails',
                [TeamMember.memberStatuses.ACCEPTED]: 'TeamDetails'
            };

            this.props.actions.selectTeam(team);
            this.props.navigation.navigate(nextScreen[status] || 'TeamDetails', {status});
        };
    }

    toNewTeamEditor() {
        this.setState({openModal: 'NEW_TEAM'});
    }

    toTeamIcon = (teamKey: string, isInvited: boolean) => {
        const membershipId = (this.props.user.email || '').toLowerCase().trim();
        const memberList = (this.props.teamMembers || {})[teamKey] || {};
        const status = (memberList[this.props.user.uid] || {}).memberStatus || (memberList[membershipId] || {}).memberStatus;
        return getMemberIcon((!isInvited ? status : TeamMember.memberStatuses.INVITED), {
            height: 50,
            width: 50,
            paddingTop: 10
        });
    };

    shareTeamDetails = (team) => () => {
        const where = team.location ? `\nWhere : ${team.location}\n` : '';
        const date = team.date ? `When: ${team.date}\n` : '';
        const start = team.start ? `Start Time: ${team.start}\n` : '';
        const end = team.end ? `End Time: ${team.end}\n` : '';
        const owner = team.owner.displayName ? `Team Captain: ${team.owner.displayName}\n` : '';
        const town = team.town ? `Town: ${team.town}\n` : '';
        const notes = team.notes ? `Good to know: ${team.notes}\n` : '';
        const message = `Join my team "${team.name}" for Green Up Day!\n \
                ${where}${town}${date}${start}${end}${notes}${owner}`;
        const title = `I just joined ${team.name} for Green Up Day`;
        const url = ''; // TODO: Put in team deep link once that's implemented
        Share.share(
            {
                message: message,
                title: title,
                // iOS only
                url: url
            }, {
                // Android Only
                dialogTitle: 'Share Your Green Up Team Details',
                // iOS only
                subject: title,
                tintColor: 'green'
            });
    };

    render() {
        const _closeModal = () => this.setState({openModal: 'none'});
        const {teams, teamStati, user} = this.props;
        // const user = this.props.currentUser;
        const teamKeys = Object.keys((user.teams || {}));
        const invitedKeys = (Object.keys(this.props.invitations || {})).filter(key => teamKeys.indexOf(key) === -1);
        const invitedTeams = invitedKeys.filter(key => Boolean(teams[key])) // avoid null exceptions if team was deleted
            .map(key => ({
                key,
                toTeamIcon: this.toTeamIcon(key, true),
                ...(teams[key] || {}),
                goToTeam: this.toTeamDetail(teams[key], teamStati[key]),
                goToMessage: () => this.props.navigation.navigate('NewMessage', {selectedTeamId: key}),
                shareTeamDetails: this.shareTeamDetails(teams[key])
            }));

        const myTeams = teamKeys.filter(key => Boolean(teams[key])) // avoid null exceptions if team was deleted
            .map(key => ({
                key,
                toTeamIcon: this.toTeamIcon(key),
                ...(teams[key] || {}),
                goToTeam: this.toTeamDetail(teams[key], teamStati[key]),
                goToMessage: () => this.props.navigation.navigate('NewMessage', {selectedTeamId: key}),
                shareTeamDetails: this.shareTeamDetails(teams[key])
            })).concat(invitedTeams);

        return (
            <View style={styles.frame}>
                <View style={styles.buttonBarHeader}>
                    <View style={styles.buttonBar}>
                        <View style={styles.buttonBarButton}>
                            <TouchableHighlight
                                style={styles.headerButton}
                                onPress={() => {
                                    this.props.navigation.navigate('TeamSearch');
                                }}>
                                <Text style={styles.headerButtonText}>{'Search Teams'}</Text>
                            </TouchableHighlight>
                        </View>
                        <View style={styles.buttonBarButton}>
                            <TouchableHighlight
                                style={styles.headerButton}
                                onPress={this.toNewTeamEditor}>
                                <Text style={styles.headerButtonText}>{'New Team'}</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
                <View style={styles.container}>
                    {myTeams.length === 0 ? (
                        <ImageBackground source={teamwork} style={styles.backgroundImage}>
                            <View
                                style={{
                                    marginTop: '20%',
                                    paddingLeft: 20,
                                    paddingRight: 20,
                                    paddingTop: 50,
                                    paddingBottom: 50,
                                    backgroundColor: 'rgba(255,255,255, 0.85)'
                                }}>
                                <Text
                                    style={[styles.textDark]}>
                                    {'Green Up Day is all about community and teamwork.'}
                                </Text>
                                <Text
                                    style={[styles.textDark]}>
                                    {'Search for teams in your area, or create a new one and invite some friends.'}
                                </Text>
                            </View>
                        </ImageBackground>
                    )
                        : (
                            <ScrollView style={styles.scroll}>
                                <View style={styles.infoBlockContainer}>
                                    <FlatList
                                        data={myTeams}
                                        renderItem={({item}) => (<TeamItem item={item}/>)}
                                        style={styles.infoBlockContainer}
                                    />
                                </View>
                            </ScrollView>
                        )
                    }
                </View>
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.openModal === 'NEW_TEAM'}
                    onRequestClose={() => {
                    }}>
                    <NewTeam closeModal={_closeModal}/>
                </Modal>
            </View>
        );
    }
}

function mapStateToProps(state) {
    const getStatus = (team: Object, invitations: Object, user: Object): string => {
        switch (true) {
            case team.owner.uid === user.uid :
                return TeamMember.memberStatuses.OWNER;
            case team :
                return TeamMember.memberStatuses.ACCEPTED;
                // Match invitations on team and email
            case Boolean(Object.entries(invitations).find(entry => entry[1].team.id == team.id && entry[1].teamMember.email === user.email)) :
                return TeamMember.memberStatuses.INVITED;
            default:
                return TeamMember.memberStatuses.NOT_INVITED;
        }
    };
    const invitations = state.teams.invitations;
    const user = User.create({...state.login.user, ...removeNulls(state.profile)});
    const teams = state.teams.teams || {};
    const teamMembers = state.teams.teamMembers || {};
    const teamStati = Object.entries(teams).reduce((obj, entry) => ({
        ...obj,
        [entry[0]]: getStatus(entry[1], invitations, user)
    }), {});
    return {teams, user, teamMembers, invitations, teamStati};
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyTeams);
