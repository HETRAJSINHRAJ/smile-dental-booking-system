import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDocument, getAvailableTimeSlots } from '../../lib/firestore';
import { Provider, Service, Appointment, RescheduleHistoryEntry } from '../../types/shared';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type RescheduleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Reschedule'
>;
type RescheduleScreenRouteProp = RouteProp<RootStackParamList, 'Reschedule'>;

interface Props {
  navigation: RescheduleScreenNavigationProp;
  route: RescheduleScreenRouteProp;
}

interface DateOption {
  value: string;
  label: string;
  fullDate: Date;
  dayName: string;
  day: number;
  month: string;
}

const RescheduleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { appointment } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dates, setDates] = useState<DateOption[]>([]);
  const [rescheduling, setRescheduling] = useState(false);

  // Check reschedule limits
  const rescheduleCount = appointment.rescheduleCount || 0;
  const maxReschedules = appointment.maxReschedules || 2;
  const canReschedule = rescheduleCount < maxReschedules;
  const remainingReschedules = maxReschedules - rescheduleCount;

  useEffect(() => {
    loadData();
    generateDates();
  }, []);

  useEffect(() => {
    if (selectedDate && service) {
      loadAvailableSlots();
    }
  }, [selectedDate, service]);

  const loadData = async () => {
    try {
      const [serviceData, providerData] = await Promise.all([
        getDocument<Service>('services', appointment.serviceId),
        getDocument<Provider>('providers', appointment.providerId),
      ]);
      
      if (!serviceData || !providerData) {
        Alert.alert('Error', 'Service or provider not found');
        navigation.goBack();
        return;
      }
      
      setService(serviceData);
      setProvider(providerData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const generateDates = () => {
    const dateOptions: DateOption[] = [];
    const today = new Date();

    for (let i = 1; i < 31; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip Sundays (day 0)
      if (date.getDay() !== 0) {
        dateOptions.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          fullDate: date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          day: date.getDate(),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
        });
      }
    }

    setDates(dateOptions);
  };

  const loadAvailableSlots = async () => {
    if (!service || !selectedDate) return;

    setLoadingSlots(true);
    try {
      const slots = await getAvailableTimeSlots(
        appointment.providerId,
        selectedDate,
        service.duration || service.durationMinutes || 60
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      Alert.alert('Error', 'Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatAppointmentDate = (date: any) => {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleReschedule = async () => {
    if (!canReschedule) {
      Alert.alert(
        'Reschedule Limit Reached',
        `You have reached the maximum number of reschedules (${maxReschedules}) for this appointment. Please contact us if you need to make changes.`
      );
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both date and time');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to reschedule');
      return;
    }

    Alert.alert(
      'Confirm Reschedule',
      `Reschedule appointment to ${formatAppointmentDate(new Date(selectedDate))} at ${formatTime(selectedTime)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setRescheduling(true);
            try {
              // Calculate end time
              const [startHour, startMinute] = selectedTime.split(':').map(Number);
              const duration = service?.duration || service?.durationMinutes || 60;
              const endHour = startHour + Math.floor((startMinute + duration) / 60);
              const endMinute = (startMinute + duration) % 60;
              const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

              // Create reschedule history entry
              const historyEntry: RescheduleHistoryEntry = {
                from: {
                  date: appointment.appointmentDate,
                  startTime: appointment.startTime,
                  endTime: appointment.endTime,
                },
                to: {
                  date: firestore.Timestamp.fromDate(new Date(selectedDate)),
                  startTime: selectedTime,
                  endTime: endTime,
                },
                reason: reason || undefined,
                rescheduledBy: user.uid,
                rescheduledByRole: 'patient',
                rescheduledAt: firestore.Timestamp.now(),
              };

              // Update appointment
              const rescheduleHistory = appointment.rescheduleHistory || [];
              await firestore()
                .collection('appointments')
                .doc(appointment.id)
                .update({
                  appointmentDate: firestore.Timestamp.fromDate(new Date(selectedDate)),
                  startTime: selectedTime,
                  endTime: endTime,
                  status: 'confirmed',
                  rescheduleCount: rescheduleCount + 1,
                  rescheduleHistory: [...rescheduleHistory, historyEntry],
                  updatedAt: firestore.Timestamp.now(),
                });

              // Send notification (optional - API call)
              try {
                // This would need to be implemented as an API endpoint
                // For now, we'll skip the notification
              } catch (notifError) {
                console.error('Failed to send reschedule notifications:', notifError);
              }

              Alert.alert(
                'Success',
                'Appointment rescheduled successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error rescheduling appointment:', error);
              Alert.alert('Error', 'Failed to reschedule appointment. Please try again.');
            } finally {
              setRescheduling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reschedule Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Reschedule Limit Warning */}
        {!canReschedule ? (
          <Card style={[styles.warningCard, { backgroundColor: '#fee2e2' }]}>
            <View style={styles.warningContent}>
              <Icon name="alert-circle" size={24} color="#dc2626" />
              <Text style={[styles.warningText, { color: '#dc2626' }]}>
                You have reached the maximum number of reschedules ({maxReschedules}) for this appointment.
                Please contact us if you need to make changes.
              </Text>
            </View>
          </Card>
        ) : remainingReschedules <= 1 && (
          <Card style={[styles.warningCard, { backgroundColor: '#fef3c7' }]}>
            <View style={styles.warningContent}>
              <Icon name="alert-circle" size={24} color="#d97706" />
              <Text style={[styles.warningText, { color: '#d97706' }]}>
                You have {remainingReschedules} reschedule{remainingReschedules !== 1 ? 's' : ''} remaining for this appointment.
              </Text>
            </View>
          </Card>
        )}

        {/* Current Appointment */}
        <Card style={styles.currentAppointmentCard}>
          <Text style={styles.sectionTitle}>Current Appointment</Text>
          <View style={styles.appointmentDetails}>
            <Text style={styles.serviceName}>{appointment.serviceName}</Text>
            <Text style={styles.providerName}>with {appointment.providerName}</Text>
            <Text style={styles.dateTime}>
              {formatAppointmentDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
            </Text>
          </View>
        </Card>

        {/* Reschedule History */}
        {appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Icon name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Reschedule History</Text>
            </View>
            {appointment.rescheduleHistory.map((entry, index) => (
              <View key={index} style={styles.historyEntry}>
                <Text style={styles.historyText}>
                  Changed from {formatAppointmentDate(entry.from.date)} at {formatTime(entry.from.startTime)}
                  {' → '}
                  {formatAppointmentDate(entry.to.date)} at {formatTime(entry.to.startTime)}
                </Text>
                <Text style={styles.historyMeta}>
                  By {entry.rescheduledByRole} on {formatAppointmentDate(entry.rescheduledAt)}
                </Text>
                {entry.reason && (
                  <Text style={styles.historyReason}>Reason: {entry.reason}</Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {canReschedule && (
          <>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select New Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScroll}
              >
                {dates.map((date) => (
                  <TouchableOpacity
                    key={date.value}
                    style={[
                      styles.dateCard,
                      selectedDate === date.value && styles.dateCardSelected,
                    ]}
                    onPress={() => setSelectedDate(date.value)}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        selectedDate === date.value && styles.dateTextSelected,
                      ]}
                    >
                      {date.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.day,
                        selectedDate === date.value && styles.dateTextSelected,
                      ]}
                    >
                      {date.day}
                    </Text>
                    <Text
                      style={[
                        styles.month,
                        selectedDate === date.value && styles.dateTextSelected,
                      ]}
                    >
                      {date.month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time Selection */}
            {selectedDate && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select New Time</Text>
                {loadingSlots ? (
                  <View style={styles.loadingSlotsContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingSlotsText}>Loading available times...</Text>
                  </View>
                ) : availableSlots.length === 0 ? (
                  <Card style={styles.noSlotsCard}>
                    <Text style={styles.noSlotsText}>
                      No available time slots for this date. Please select another date.
                    </Text>
                  </Card>
                ) : (
                  <View style={styles.timeGrid}>
                    {availableSlots.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          selectedTime === time && styles.timeSlotSelected,
                        ]}
                        onPress={() => setSelectedTime(time)}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            selectedTime === time && styles.timeTextSelected,
                          ]}
                        >
                          {formatTime(time)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Reason (Optional) */}
            {selectedDate && selectedTime && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reason for Rescheduling (Optional)</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Let us know why you need to reschedule..."
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Button */}
      {canReschedule && selectedDate && selectedTime && (
        <View style={styles.bottomContainer}>
          <Button
            title={rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
            onPress={handleReschedule}
            disabled={rescheduling}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  warningCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    ...typography.body,
    lineHeight: 20,
  },
  currentAppointmentCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  appointmentDetails: {
    gap: spacing.xs,
  },
  serviceName: {
    ...typography.h4,
    color: colors.text,
  },
  providerName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dateTime: {
    ...typography.body,
    color: colors.textSecondary,
  },
  historyCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#eff6ff',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  historyEntry: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },
  historyText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyReason: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  dateScroll: {
    marginTop: spacing.sm,
  },
  dateCard: {
    width: 70,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    ...shadows.sm,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
  },
  dayName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  day: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  month: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dateTextSelected: {
    color: colors.white,
  },
  loadingSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  loadingSlotsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  noSlotsCard: {
    padding: spacing.lg,
    backgroundColor: '#fef3c7',
  },
  noSlotsText: {
    ...typography.body,
    color: '#d97706',
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeText: {
    ...typography.body,
    color: colors.text,
  },
  timeTextSelected: {
    color: colors.white,
  },
  reasonInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 100,
  },
  bottomContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

export default RescheduleScreen;
