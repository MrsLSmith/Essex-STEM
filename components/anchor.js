import React from 'react';

import {Text, Linking} from 'react-native';

export default class Anchor extends React.Component {
    _handlePress = () => {
      Linking.openURL(this.props.href);
      this.props.onPress && this.props.onPress();
    };
  
    render() {
      return (
        <Text {...this.props} onPress={this._handlePress}>
          {this.props.children}
        </Text>
      );
    }
  }
