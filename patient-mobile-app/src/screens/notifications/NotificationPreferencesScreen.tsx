import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { NotificationPreferences } from '../../components/NotificationPreferences';
import { Header } from '../../components/Header';

export const NotificationPreferencesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Notification Settings"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <NotificationPreferences />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
