/**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, Text, TouchableHighlight, View, Button, ScrollView} from 'react-native';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as messageTypes from '../../constants/message-types';
import * as actions from './actions';
import {defaultStyles} from '../../styles/default-styles';
import {Message} from '../../models/message';

const myStyles = {
    message: {
        marginBottom: 10,
        padding: 5,
        borderWidth: 1,
        borderColor: '#888',
        borderStyle: 'solid'
    },
    read: {
        backgroundColor: '#EFEFEF'
    },
    unread: {
        borderTopColor: 'green',
        borderTopWidth: 3
    },
    newMsg: {
        fontWeight: 'bold'
    },
    loadingScreen: {
        justifyContent: 'center',
        alignItems: 'center'
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);

class Messages extends Component {
    static propTypes = {
        actions: PropTypes.object,
        currentUser: PropTypes.object,
        invitations: PropTypes.object,
        invitationsLoaded: PropTypes.bool,
        messages: PropTypes.object,
        navigation: PropTypes.object,
        userHasTeams: PropTypes.bool,
        teamsLoaded: PropTypes.bool,
        messagesLoaded: PropTypes.bool
    };

    static navigationOptions = {
        title: 'Message Board',
        tabBarLabel: 'Messages'
    };

    constructor(props) {
        super(props);
        this.toMessageDetail = this.toMessageDetail.bind(this);
        this.toSendMessage = this.toSendMessage.bind(this);
    }

    // Stopping the redirect for now, this is causing issue with some of the new code. (JN)
    // componentWillUpdate(nextProps) {
    // if (nextProps.teamsLoaded === true && nextProps.userHasTeams !== true) {
    //     this.props.navigation.navigate('Teams');
    // }
    // }

    toSendMessage() {
        return () => {
            this.props.navigation.navigate('SendMessage');
        };
    }

    toMessageDetail(message) {
        const userId = this.props.currentUser.uid;
        switch (message.type) {
            case messageTypes.INVITATION :
                return () => {
                    // this.props.actions.readMessage(message, userId);
                    this.props.actions.selectTeamById(message.teamId);
                    this.props.navigation.navigate('TeamDetails');
                };
            case messageTypes.REQUEST_TO_JOIN :
                return () => {
                    const membershipId = message.sender.email.toLowerCase().replace(/\./g, ':');
                    const teamId = message.teamId;
                    this.props.actions.readMessage(message, userId);
                    this.props.navigation.navigate('TeamMemberDetails', {teamId, membershipId});
                };
            default :
                return () => {
                    // mark message as read
                    this.props.actions.readMessage(message, userId);
                    // navigate to details screen
                    this.props.navigation.navigate('MessageDetails', {messageId: message.uid});
                };
        }
    }

    render() {
        if (this.props.teamsLoaded && this.props.messagesLoaded && this.props.invitationsLoaded) {
            const invitations = this.props.invitations;
            const invitationMessages = Object.keys(invitations).reduce((obj, key) => (
                Object.assign({}, obj, {
                    [key]: Message.create(
                        {
                            uid: key,
                            text: `${invitations[key].sender.displayName} has invited you to join team : ${invitations[key].team.name}`,
                            sender: invitations[key].sender,
                            teamId: key,
                            read: false,
                            active: true,
                            type: messageTypes.INVITATION
                        }
                    )
                })
            ), {});
            const messages = Object.assign({}, this.props.messages, invitationMessages);
            const messageKeys = Object.keys(messages || {});
            const sortedKeys = messageKeys.sort((key1, key2) => (
                messages[key2].created.valueOf() - messages[key1].created.valueOf()
            ));
            const myMessages = sortedKeys.map(key =>
                (
                    <View key={key}>
                        <TouchableHighlight onPress={this.toMessageDetail(messages[key])}>
                            <View style={[styles.message,
                                messages[key].read
                                    ? styles.read : styles.unread]}>
                                <Text style={{
                                    fontSize: 10,
                                    textAlign: 'left'
                                }}>{(this.props.teams[messages[key].teamId] || {}).name || ''} :</Text>
                                <Text style={messages[key].read
                                    ? styles.oldMsg : styles.newMsg}>
                                    {messages[key].text.length > 80
                                        ? `${messages[key].text.slice(0, 80)}...`
                                        : messages[key].text}
                                </Text>
                                <Text style={{
                                    fontSize: 10,
                                    textAlign: 'right'
                                }}>--{messages[key].sender.displayName || messages[key].sender.email}</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                )
            );

            return (myMessages.length > 0 || this.props.userHasTeams) ? (
                <View style={styles.frame}>
                    <View style={styles.button}>
                        <Button
                            onPress={() => {
                                this.props.navigation.navigate('NewMessage');
                            }}
                            title='New Message'
                        />
                    </View>
                    <ScrollView style={styles.container}>
                        <View>
                            {myMessages.length > 0
                                ? myMessages
                                : (
                                    <View>
                                        <Text style={styles.alertInfo}>Sorry, no messages yet.</Text>
                                        <Text>
                                            {'\n'}{'Start the ball rolling by sending one to your team.'}
                                        </Text>
                                    </View>
                                )}
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.container}>
                    <Text style={styles.alertInfo}>
                        You don't have any teams to send messages to. Start your own team or join an existing one.
                    </Text>
                    <Button
                        onPress={() => {
                            this.props.navigation.navigate('Teams');
                        }}
                        title='Go to my teams'
                    />
                </View>
            );
        }

        return (
            <View style={[styles.container, styles.loadingScreen]}>
                <Text>Loading...</Text>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.login.user,
        invitations: state.teams.invitations || {},
        invitationsLoaded: state.messages.invitationsLoaded,
        messages: state.messages.messages || {},
        messagesLoaded: state.messages.loaded,
        userHasTeams: Object.values(state.profile.teams || {}).length > 0,
        teamsLoaded: state.messages.teamsLoaded,
        teams: state.teams.teams
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Messages);
