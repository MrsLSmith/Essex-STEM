/**
 * GreenUpVermont React Native App
 * https://github.com/johnneed/GreenUpVermont
 * @flow
 */
import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import * as actions from './actions';
import Anchor from '../../components/anchor'
import {defaultStyles} from '../../styles/default-styles';

const myStyles = {};

const combinedStyles = Object.assign({}, defaultStyles, myStyles);
const styles = StyleSheet.create(combinedStyles);


type Props = {
    eventDescription: Object,
    actions: Object,
    eventName: string,
    eventDate: Date,
    navigation: Object,
    faqs: Object
}

class About extends Component<Props> {

    static navigationOptions = {
        title: 'About'
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {eventDescription, faqs, eventName, eventDate, contactUs} = this.props;

        return (
            <View style={styles.frame}>
                <ScrollView style={styles.scroll}>
                    <View style={styles.infoBlockContainer}>
                        <View style={styles.infoBlockHeader}>
                            <Text style={styles.headerText}>{eventName}</Text>
                            <Text style={styles.headerText}>
                                {moment(eventDate).utc().format('dddd, MMMM Do YYYY')}
                            </Text>
                        </View>
                        <Text style={[styles.textDark, {textAlign: 'justify', fontSize: 16}]}>{eventDescription}</Text>
                    </View>
                    <View style={styles.infoBlockContainer}>
                        <Text style={styles.infoBlockHeader}>FAQ's</Text>
                        <View>
                            {
                                faqs.map(
                                    (faq, i) => (
                                        <View key={i} style={styles.infoBlock}>
                                            <Text style={[styles.textDark, {textAlign: 'justify', fontSize: 18}]}>{faq.question}</Text>
                                            <Text style={[styles.textDark, {textAlign: 'justify', fontSize: 16}]}>{faq.answer}</Text>
                                        </View>
                                    )
                                )
                            }
                        </View>
                    </View>
                    <View style={styles.infoBlockContainer}>
                        <Text style={styles.infoBlockHeader}>Contact Us</Text>
                        <View style={styles.infoBlock}>
                            <Text style={[styles.textDark, {fontSize: 18}]}>{contactUs.fullName}</Text>
                            <Text style={[styles.textDark, {fontSize: 16}]}>Phone: <Anchor style={[styles.textDark, {fontSize: 16, textDecorationLine: 'underline'}]} href={"tel:" + contactUs.phoneNumber}>{contactUs.phoneNumber}</Anchor></Text>
                            <Text style={[styles.textDark, {fontSize: 16}]}>Email: <Anchor style={[styles.textDark, {fontSize: 16, textDecorationLine: 'underline'}]} href={"mailto:" + contactUs.email}>{contactUs.email}</Anchor></Text>
                            <Text style={[styles.textDark, {fontSize: 16}]}>By mail: </Text>
                            <Text style={[styles.textDark, {fontSize: 16}]}>{contactUs.fullName}</Text>
                            <Text style={[styles.textDark, {fontSize: 16}]}>{contactUs.addressLine1}</Text>
                            <Text style={[styles.textDark, {fontSize: 16}]}>{contactUs.addressLine2}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = state => {
    const eventDate = state.about.date || null;
    const eventDescription = state.about.description || '';
    const faqs = state.about.faqs || [];
    const eventName = state.about.name;
    const contactUs = state.about.contactUs;
    return {eventDate, eventDescription, eventName, faqs, contactUs};

};

const mapDispatchToProps = dispatch => ({actions: bindActionCreators(actions, dispatch)});

export default connect(mapStateToProps, mapDispatchToProps)(About);
