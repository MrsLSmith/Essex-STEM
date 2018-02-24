/**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
    Picker,
    ScrollView,
		TouchableOpacity
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {SegmentedControls} from 'react-native-radio-buttons';

import * as actions from './actions';
import {vermontTowns} from '../../libs/vermont-towns';
import {defaultStyles} from  '../../styles/default-styles';

const myStyles = {
};

const combinedStyles = Object.assign({},defaultStyles,myStyles);
const styles = StyleSheet.create(combinedStyles);

class TeamEditorDetails extends Component {
    static propTypes = {
        actions: PropTypes.object,
        navigation: PropTypes.any,
        selectedTeam: PropTypes.object,
        screenProps: PropTypes.object
    };

    static navigationOptions = {
        title: 'Team Details',
        tabBarLabel: 'Details',
        // Note: By default the icon is only shown on iOS. Search the showIcon option below.
        tabBarIcon: () => (<MaterialCommunityIcons name='information' size={24} color='blue'/>)
    };

    constructor(props) {
			super(props);
			this.state = {
					selectedTeam: {...props.selectedTeam},
					isDateTimePickerVisible: false
			};
    }

		_showDateTimePicker = () => this.setState({ isDateTimePickerVisible: !this.state.isDateTimePickerVisible });

		// would be great to combined these two, but not sure how to pass the second param
		_handleStartDatePicked = (date) => {
			this.setTeamValue('start')(date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
			this._showDateTimePicker();
		};

		_handleEndDatePicked = (date) => {
			this.setTeamValue('end')(date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
			this._showDateTimePicker();
		};

    setSelectedOption = (option) => {
        this.setTeamValue('isPublic')(option.value);
    }

    saveTeam = () => {
        this.props.actions.saveTeam(this.state.selectedTeam, this.state.selectedTeam.id);
        this.props.screenProps.stacknav.goBack();
    }

    setTeamValue = (key) => {
        return (value) => {
            const newSelectedTeam = Object.assign({}, this.state.selectedTeam);
            newSelectedTeam[key] = value;
            this.setState(Object.assign({}, this.state, {selectedTeam: newSelectedTeam}));
        };
    }

//			<View>
//					<Text style={styles.heading2}>Select Town/City</Text>
//					<Picker
//							selectedValue={this.state.selectedTeam.town}
//							onValueChange={this.setTeamValue('town')}>
//							{vermontTowns.map(town => (<Picker.Item key={town} label={town} value={town}/>))}
//					</Picker>
//			</View>

    render() {
        const isPublicOptions = [
            {
                label: 'Public',
                value: true
            }, {
                label: 'Private',
                value: false
            }
        ];

        return (
            <ScrollView
                automaticallyAdjustContentInsets={false}
                scrollEventThrottle={200}
								style={styles.container}>

                <View>
                    <Text style={styles.heading2}>Team Name</Text>
                    <TextInput
                        keyBoardType={'default'}
                        onChangeText={this.setTeamValue('name')}
                        placeholder={'Team Name'}
                        style={styles.textInput}
                        value={this.state.selectedTeam.name}/>
                </View>
								<View style={{marginTop: 10}}>
                <SegmentedControls
                    options={isPublicOptions}
                    onSelection={this.setSelectedOption}
                    selectedOption={this.state.selectedTeam.isPublic}
                    selectedTint={'#EFEFEF'} tint={'#666666'}
                    extractText={(option) => option.label}
                    testOptionEqual={(selectedValue, option) => selectedValue === option.value}/>
                </View>

                <View>
                    <Text style={styles.heading2}>Clean Up Site</Text>
                    <TextInput
												keyBoardType={'default'}
												onChangeText={this.setTeamValue('location')}
												placeholder={'Location'}
                        style={styles.textInput}
												value={this.state.selectedTeam.location}/>
                </View>

                <View>
                    <Text style={styles.heading2}>Start Time</Text>
										<View>
											<TouchableOpacity onPress={this._showDateTimePicker}>
    										<Text style={styles.textInput}>{this.state.selectedTeam.start || 'Select a Time'}</Text>
											</TouchableOpacity>
											<DateTimePicker
												mode='time'
												isVisible={this.state.isDateTimePickerVisible}
												onConfirm={this._handleStartDatePicked}
												onCancel={this._showDateTimePicker}
											/>
										</View>
                </View>
                <View>
                    <Text style={styles.heading2}>End Time</Text>
										<View>
											<TouchableOpacity onPress={this._showDateTimePicker}>
    										<Text style={styles.textInput}>{this.state.selectedTeam.end || 'Select a Time'}</Text>
											</TouchableOpacity>
											<DateTimePicker
												mode='time'
												isVisible={this.state.isDateTimePickerVisible}
												onConfirm={this._handleEndDatePicked}
												onCancel={this._showDateTimePicker}
											/>
										</View>
                </View>
                <View>
                    <Text style={styles.heading2}>Notes</Text>
                    <TextInput
												keyBoardType={'default'}
												onChangeText={this.setTeamValue('notes')}
												placeholder={'Notes'}
                        style={styles.textInput}
												value={this.state.selectedTeam.notes}/>
                </View>
								<View style={styles.button}>
									<Button
										title='Save'
										onPress={this.saveTeam}/>
								</View>

            </ScrollView>
        );
    }
}

const mapStateToProps = (state) => {
    const selectedTeam = state.teams.selectedTeam;
    return {selectedTeam};
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamEditorDetails);