import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {fontPixel} from '../utils/Normalize';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: '#ffffff',
          fontSize: fontPixel(50),
          fontWeight: 'bold',
        }}>
        Loading
      </Text>
    </View>
  );
};

export {SplashScreen};

const styles: {container: ViewStyle} = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5E2DBB',
  },
});
