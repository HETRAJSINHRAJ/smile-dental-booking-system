import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContextWithToast';

interface Preferences {
  appointmentReminders: boolean;
  appointmentUpdates: boolean;
  paymentUpdates: boolean;
  promotional: boolean;
  pushNotifications: boolean;
}

export const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false,
    pushNotifications: true,
  });

  useEffect(() => {
    loadPreferences();
  }, [user?.uid]);

  const loadPreferences = async () => {
    if (!user?.uid) return;

    try {
      const doc = await firestore()
        .collection('notificationPreferences')
        .doc(user.uid)
        .get();

      if (doc.exists) {
        setPreferences(doc.data() as Preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof Preferences, value: boolean) => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      await firestore()
        .collection('notificationPreferences')
        .doc(user.uid)
        .set(newPreferences, { merge: true });
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <Text style={styles.sectionDescription}>
          Choose what notifications you want to receive
        </Text>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Push Notifications</Text>
          <Text style={styles.preferenceDescription}>
            Enable or disable all push notifications
          </Text>
        </View>
        <Switch
          value={preferences.pushNotifications}
          onValueChange={value => updatePreference('pushNotifications', value)}
          disabled={saving}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.pushNotifications ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Appointment Reminders</Text>
          <Text style={styles.preferenceDescription}>
            Get reminded about upcoming appointments
          </Text>
        </View>
        <Switch
          value={preferences.appointmentReminders}
          onValueChange={value => updatePreference('appointmentReminders', value)}
          disabled={saving || !preferences.pushNotifications}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.appointmentReminders ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Appointment Updates</Text>
          <Text style={styles.preferenceDescription}>
            Notifications about appointment confirmations and changes
          </Text>
        </View>
        <Switch
          value={preferences.appointmentUpdates}
          onValueChange={value => updatePreference('appointmentUpdates', value)}
          disabled={saving || !preferences.pushNotifications}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.appointmentUpdates ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Payment Updates</Text>
          <Text style={styles.preferenceDescription}>
            Notifications about payment status and receipts
          </Text>
        </View>
        <Switch
          value={preferences.paymentUpdates}
          onValueChange={value => updatePreference('paymentUpdates', value)}
          disabled={saving || !preferences.pushNotifications}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.paymentUpdates ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Promotional</Text>
          <Text style={styles.preferenceDescription}>
            Special offers and promotional messages
          </Text>
        </View>
        <Switch
          value={preferences.promotional}
          onValueChange={value => updatePreference('promotional', value)}
          disabled={saving || !preferences.pushNotifications}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.promotional ? '#6366F1' : '#F3F4F6'}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
});
