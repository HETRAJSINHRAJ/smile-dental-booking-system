import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContextWithToast';
import { NotificationPreferences as NotificationPreferencesType } from '../types/firebase';

const defaultPreferences: Omit<NotificationPreferencesType, 'userId' | 'updatedAt'> = {
  email: {
    enabled: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false,
  },
  sms: {
    enabled: false,
    appointmentReminders: false,
    appointmentUpdates: false,
    paymentUpdates: false,
  },
  push: {
    enabled: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    paymentUpdates: true,
    promotional: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  language: 'en',
};

export const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Omit<NotificationPreferencesType, 'userId' | 'updatedAt'>>(defaultPreferences);

  useEffect(() => {
    if (!user?.uid) return;

    // Set up real-time listener for notification preferences
    const unsubscribe = firestore()
      .collection('notificationPreferences')
      .doc(user.uid)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data() as NotificationPreferencesType;
            setPreferences({
              email: data.email,
              sms: data.sms,
              push: data.push,
              quietHours: data.quietHours,
              language: data.language,
            });
            console.log('✅ Notification preferences updated from Firestore');
          }
          setLoading(false);
        },
        (error) => {
          console.error('❌ Error listening to preferences:', error);
          // Fallback to one-time fetch on error
          loadPreferences();
        }
      );

    return () => unsubscribe();
  }, [user?.uid]);

  const loadPreferences = async () => {
    if (!user?.uid) return;

    try {
      // Enable offline persistence and get from cache first
      const doc = await firestore()
        .collection('notificationPreferences')
        .doc(user.uid)
        .get({ source: 'default' }); // Try cache first, then server

      if (doc.exists) {
        const data = doc.data() as NotificationPreferencesType;
        setPreferences({
          email: data.email,
          sms: data.sms,
          push: data.push,
          quietHours: data.quietHours,
          language: data.language,
        });
        console.log('✅ Notification preferences loaded', doc.metadata.fromCache ? '(from cache)' : '(from server)');
      }
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      // Keep default preferences on error
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: typeof preferences) => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      // Save to Firestore with offline persistence
      await firestore()
        .collection('notificationPreferences')
        .doc(user.uid)
        .set(
          {
            userId: user.uid,
            ...newPreferences,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      console.log('✅ Notification preferences saved');
    } catch (error: any) {
      console.error('❌ Error saving preferences:', error);
      
      // Check if it's an offline error
      if (error.code === 'unavailable') {
        console.log('📴 Offline - preferences will sync when online');
        // Don't revert - let offline persistence handle it
      } else {
        // Revert on other errors
        await loadPreferences();
      }
    } finally {
      setSaving(false);
    }
  };

  const updateEmailPreference = (key: keyof NotificationPreferencesType['email'], value: boolean) => {
    const newPreferences = {
      ...preferences,
      email: { ...preferences.email, [key]: value },
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const updateSmsPreference = (key: keyof NotificationPreferencesType['sms'], value: boolean) => {
    const newPreferences = {
      ...preferences,
      sms: { ...preferences.sms, [key]: value },
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const updatePushPreference = (key: keyof NotificationPreferencesType['push'], value: boolean) => {
    const newPreferences = {
      ...preferences,
      push: { ...preferences.push, [key]: value },
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const updateQuietHours = (key: keyof NotificationPreferencesType['quietHours'], value: string | boolean) => {
    const newPreferences = {
      ...preferences,
      quietHours: { ...preferences.quietHours, [key]: value },
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
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
      {/* Email Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Email Notifications</Text>
        <Text style={styles.sectionDescription}>
          Manage your email notification preferences
        </Text>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Enable Email Notifications</Text>
          <Text style={styles.preferenceDescription}>
            Receive notifications via email
          </Text>
        </View>
        <Switch
          value={preferences.email.enabled}
          onValueChange={value => updateEmailPreference('enabled', value)}
          disabled={saving}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.email.enabled ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      {preferences.email.enabled && (
        <>
          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Appointment Reminders</Text>
            </View>
            <Switch
              value={preferences.email.appointmentReminders}
              onValueChange={value => updateEmailPreference('appointmentReminders', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.email.appointmentReminders ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Appointment Updates</Text>
            </View>
            <Switch
              value={preferences.email.appointmentUpdates}
              onValueChange={value => updateEmailPreference('appointmentUpdates', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.email.appointmentUpdates ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Payment Updates</Text>
            </View>
            <Switch
              value={preferences.email.paymentUpdates}
              onValueChange={value => updateEmailPreference('paymentUpdates', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.email.paymentUpdates ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Promotional Emails</Text>
            </View>
            <Switch
              value={preferences.email.promotional}
              onValueChange={value => updateEmailPreference('promotional', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.email.promotional ? '#6366F1' : '#F3F4F6'}
            />
          </View>
        </>
      )}

      {/* SMS Notifications */}
      <View style={[styles.section, styles.sectionMarginTop]}>
        <Text style={styles.sectionTitle}>💬 SMS Notifications</Text>
        <Text style={styles.sectionDescription}>
          Manage your SMS notification preferences
        </Text>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Enable SMS Notifications</Text>
          <Text style={styles.preferenceDescription}>
            Receive notifications via SMS
          </Text>
        </View>
        <Switch
          value={preferences.sms.enabled}
          onValueChange={value => updateSmsPreference('enabled', value)}
          disabled={saving}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.sms.enabled ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      {preferences.sms.enabled && (
        <>
          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Appointment Reminders</Text>
            </View>
            <Switch
              value={preferences.sms.appointmentReminders}
              onValueChange={value => updateSmsPreference('appointmentReminders', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.sms.appointmentReminders ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Appointment Updates</Text>
            </View>
            <Switch
              value={preferences.sms.appointmentUpdates}
              onValueChange={value => updateSmsPreference('appointmentUpdates', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.sms.appointmentUpdates ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Payment Updates</Text>
            </View>
            <Switch
              value={preferences.sms.paymentUpdates}
              onValueChange={value => updateSmsPreference('paymentUpdates', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.sms.paymentUpdates ? '#6366F1' : '#F3F4F6'}
            />
          </View>
        </>
      )}

      {/* Push Notifications */}
      <View style={[styles.section, styles.sectionMarginTop]}>
        <Text style={styles.sectionTitle}>📱 Push Notifications</Text>
        <Text style={styles.sectionDescription}>
          Manage your push notification preferences
        </Text>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Enable Push Notifications</Text>
          <Text style={styles.preferenceDescription}>
            Receive notifications on your device
          </Text>
        </View>
        <Switch
          value={preferences.push.enabled}
          onValueChange={value => updatePushPreference('enabled', value)}
          disabled={saving}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.push.enabled ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      {preferences.push.enabled && (
        <>
          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Appointment Reminders</Text>
            </View>
            <Switch
              value={preferences.push.appointmentReminders}
              onValueChange={value => updatePushPreference('appointmentReminders', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.push.appointmentReminders ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Appointment Updates</Text>
            </View>
            <Switch
              value={preferences.push.appointmentUpdates}
              onValueChange={value => updatePushPreference('appointmentUpdates', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.push.appointmentUpdates ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Payment Updates</Text>
            </View>
            <Switch
              value={preferences.push.paymentUpdates}
              onValueChange={value => updatePushPreference('paymentUpdates', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.push.paymentUpdates ? '#6366F1' : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Promotional Notifications</Text>
            </View>
            <Switch
              value={preferences.push.promotional}
              onValueChange={value => updatePushPreference('promotional', value)}
              disabled={saving}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={preferences.push.promotional ? '#6366F1' : '#F3F4F6'}
            />
          </View>
        </>
      )}

      {/* Quiet Hours */}
      <View style={[styles.section, styles.sectionMarginTop]}>
        <Text style={styles.sectionTitle}>🌙 Quiet Hours</Text>
        <Text style={styles.sectionDescription}>
          Set times when you don't want to receive notifications
        </Text>
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceInfo}>
          <Text style={styles.preferenceTitle}>Enable Quiet Hours</Text>
          <Text style={styles.preferenceDescription}>
            Pause notifications during specific hours
          </Text>
        </View>
        <Switch
          value={preferences.quietHours.enabled}
          onValueChange={value => updateQuietHours('enabled', value)}
          disabled={saving}
          trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
          thumbColor={preferences.quietHours.enabled ? '#6366F1' : '#F3F4F6'}
        />
      </View>

      {preferences.quietHours.enabled && (
        <>
          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceTitle}>Quiet Hours Period</Text>
              <Text style={styles.preferenceDescription}>
                {preferences.quietHours.start} - {preferences.quietHours.end}
              </Text>
              <Text style={styles.preferenceNote}>
                Note: Time picker UI can be added in future enhancement
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.bottomPadding} />
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
    marginBottom: 1,
  },
  sectionMarginTop: {
    marginTop: 8,
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
  preferenceNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
  bottomPadding: {
    height: 32,
  },
});
