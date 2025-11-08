import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SelectDateTimeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Select Date & Time Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default SelectDateTimeScreen;
