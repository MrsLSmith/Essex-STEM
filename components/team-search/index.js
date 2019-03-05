// @flow

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableHighlight,
    View
} from 'react-native';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as actions from './actions';
import {defaultStyles} from '../../styles/default-styles';
import * as teamMemberStatuses from '../../constants/team-member-statuses';

/**
 *
 * @param {string} term
 * @param {string[]} searchableString - things we search
 * @returns {number} the number of matches
 */
function searchScore(term: string, searchableString: [string]) {
    const terms = term.trim().split(' ');
    const testTerm = terms[0].toLowerCase();
    const score = searchableString.reduce((_score, interrogee) =>
        (_score + (typeof interrogee === 'string' &&
        interrogee.toLowerCase().indexOf(testTerm) > -1 ? 1 : 0)), 0);
    return (terms.length <= 1) ? score : score + searchScore(terms.slice(1).join(' '), searchableString);

}

const myStyles = {
    scrollview: {
        marginTop: 10
    },
    details: {
        fontWeight: 'bold'
    },
    teamInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#EFEFEF',
        padding: 3
    }
};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);


class SearchItem extends Component {
    static propTypes = {item: PropTypes.object};

    render() {
        const item = this.props.item;
        return (
            <TouchableOpacity
                key={item.teamId}
                onPress={item.toDetail}
                style={styles.searchResult}
            >
                <View>
                    <Text style={[styles.textDark, {marginBottom: 0, textAlign: 'center'}]}>
                        {item.team.name}
                    </Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.teamSearchTown}>
                            {item.team.town}
                        </Text>
                        <Text style={styles.teamSearchOwner}>
                            {item.team.owner.displayName}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>);
    }
}

type Props = {
    actions: Object,
    closeModal: () => void;
    teamMembers: Object,
    teams:Object,
    navigation: Object,
    searchResults: Array<Object>,
    currentUser: Object
};

class TeamSearch extends Component<Props> {

    static navigationOptions = {
        title: 'Find a Team'
    };

    constructor(props) {
        super(props);
        this.toTeamDetail = this.toTeamDetail.bind(this);
        this.onSearchTermChange = this.onSearchTermChange.bind(this);
        this.state = {
            searchTerm: '',
            searchResults: []
        };
    }

    componentWillMount() {
        return this.onSearchTermChange(this.state.searchTerm);
    }

    componentWillReceiveProps() {
        return this.onSearchTermChange(this.state.searchTerm);
    }

    onSearchTermChange(searchTerm: string = '') {
        const {teams, teamMembers, currentUser} = this.props;
        const mkey = currentUser.uid;
        // get all the teams the user is on
        const teamsImOn = Object.keys(teamMembers).filter(key =>
            !!teamMembers[key] &&
            (
                (teamMembers[key][mkey] && teamMembers[key][mkey].memberStatus === teamMemberStatuses.OWNER) ||
                (teamMembers[key][mkey] && teamMembers[key][mkey].memberStatus === teamMemberStatuses.ACCEPTED)
            )
        );

        const _searchResults = Object.keys(teams)
            .filter(key => teams[key].isPublic === true ||
                teamsImOn.indexOf(key) > -1)
            .map(key => ({
                key,
                score: searchScore(searchTerm, [teams[key].name,
                    teams[key].description,
                    teams[key].town,
                    teams[key].owner.displayName])
            }))
            .filter(score => (searchTerm.trim() === '' || score.score > 0))
            .sort((score1, score2) => (score2.score - score1.score))
            .map(score => score.key);
        // eliminate dupes
        const searchResults = Array.from(new Set(_searchResults));
        this.setState({searchResults, searchTerm});
    }

    toTeamDetail(teamId: string) {
        return () => {
            const team = this.props.teams[teamId];
            this.props.actions.selectTeam(team);
            this.props.closeModal();
            this.props.navigation.navigate('TeamDetails');
        };
    }

    render() {
        const teams = this.props.teams;
        const searchResults = this.state.searchResults.map(teamId => (
            {key: teamId, teamId, toDetail: this.toTeamDetail(teamId), team: teams[teamId]}
        ));
        return (
            <View style={styles.frame}>
                <View style={[styles.buttonBarHeader, {backgroundColor: '#EEE', marginTop: 30}]}>
                    <View style={styles.buttonBar}>
                        <View style={styles.buttonBarButton}>
                            <TouchableHighlight
                                style={styles.headerButton}
                                onPress={this.props.closeModal}
                            >
                                <Text style={styles.headerButtonText}>{'Close'}</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView
                    style={defaultStyles.frame}
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                >
                    <View style={styles.searchHeader}>
                        <TextInput
                            keyBoardType={'default'}
                            onChangeText={this.onSearchTermChange}
                            placeholder={'Team Name, Team Owner, or City/Town'}
                            style={styles.textInput}
                            value={this.state.searchTerm}
                            underlineColorAndroid={'transparent'}
                        />
                    </View>
                    <ScrollView style={styles.scroll}>
                        <View style={styles.infoBlockContainer}>
                            <FlatList data={searchResults} renderItem={({item}) => (<SearchItem item={item}/>)}/>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    teams: state.teams.teams || {},
    teamMembers: state.teams.teamMembers || {},
    currentUser: state.login.user
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamSearch);
