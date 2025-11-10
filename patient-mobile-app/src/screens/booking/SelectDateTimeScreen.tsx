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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDocument, getAvailableTimeSlots } from '../../lib/firestore';
import { Provider, Service } from '../../types/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';

type SelectDateTimeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectDateTime'
>;
type SelectDateTimeScreenRouteProp = RouteProp<RootStackParamList, 'SelectDateTime'>;

interface Props {
  navigation: SelectDateTimeScreenNavigationProp;
  route: SelectDateTimeScreenRouteProp;
}

interface DateOption {
  value: string;
  label: string;
  fullDate: Date;
  dayName: string;
  day: number;
  month: string;
}

const SelectDateTimeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { serviceId, providerId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dates, setDates] = useState<DateOption[]>([]);

  useEffect(() => {
    loadData();
    generateDates();
  }, [serviceId, providerId]);

  useEffect(() => {
    if (selectedDate && service) {
      loadAvailableSlots();
    }
  }, [selectedDate, service]);

  const loadData = async () => {
    try {
      const [serviceData, providerData] = await Promise.all([
        getDocument<Service>('services', serviceId),
        getDocument<Provider>('providers', providerId),
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
            weekday: 'short',
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

  const generateAllTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeSlot);
      }
    }

    return slots;
  };

  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const date = new Date(selectedDate);
      const slots = await getAvailableTimeSlots(
        providerId,
        date,
        service!.duration
      );
      setAvailableSlots(slots);

      // Generate all possible time slots
      const allSlots = generateAllTimeSlots();
      setAllTimeSlots(allSlots);

      if (slots.length === 0) {
        Alert.alert(
          'No Available Slots',
          'No available slots for this date. Please select another date.'
        );
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      Alert.alert('Error', 'Failed to load available time slots');
      setAvailableSlots([]);
      setAllTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Selection Required', 'Please select both date and time');
      return;
    }

    navigation.navigate('ConfirmBooking', {
      serviceId,
      providerId,
      date: selectedDate,
      time: selectedTime,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <ActivityIndicator size="large" color={colors.secondary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Selection Summary */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{service?.name}</Text>
                <Text style={styles.summarySubtext}>
                  {service?.duration} min • ₹{service?.price}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Provider</Text>
                <Text style={styles.summaryValue}>{provider?.name}</Text>
                <Text style={styles.summarySubtext}>{provider?.specialty}</Text>
              </View>
            </View>
            
            {selectedDate && selectedTime && (
              <>
                <View style={styles.summaryDividerHorizontal} />
                <View style={styles.selectedSlotContainer}>
                  <Icon name="checkmark-circle" size={20} color={colors.secondary[500]} />
                  <Text style={styles.selectedSlotText}>
                    {dates.find(d => d.value === selectedDate)?.label} at{' '}
                    {formatTimeTo12Hour(selectedTime)}
                  </Text>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {dates.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateCard,
                  selectedDate === date.value && styles.dateCardActive,
                ]}
                onPress={() => handleDateSelect(date.value)}
              >
                <Text
                  style={[
                    styles.dateDayName,
                    selectedDate === date.value && styles.dateTextActive,
                  ]}
                >
                  {date.dayName}
                </Text>
                <Text
                  style={[
                    styles.dateDay,
                    selectedDate === date.value && styles.dateTextActive,
                  ]}
                >
                  {date.day}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    selectedDate === date.value && styles.dateTextActive,
                  ]}
                >
                  {date.month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Icon name="time-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>

          {!selectedDate ? (
            <Card style={styles.emptyTimeCard}>
              <View style={styles.emptyTimeIcon}>
                <Icon name="calendar-outline" size={32} color={colors.text.secondary} />
              </View>
              <Text style={styles.emptyTimeText}>Please select a date first</Text>
            </Card>
          ) : loadingSlots ? (
            <Card style={styles.emptyTimeCard}>
              <ActivityIndicator size="large" color={colors.secondary[500]} />
            </Card>
          ) : allTimeSlots.length === 0 ? (
            <Card style={styles.emptyTimeCard}>
              <View style={styles.emptyTimeIcon}>
                <Icon name="close-circle-outline" size={32} color={colors.text.secondary} />
              </View>
              <Text style={styles.emptyTimeText}>No slots available</Text>
              <Text style={styles.emptyTimeSubtext}>Please select another date</Text>
            </Card>
          ) : (
            <>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotAvailable]} />
                  <Text style={styles.legendText}>Available</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.legendDotBooked]} />
                  <Text style={styles.legendText}>Booked</Text>
                </View>
              </View>
              
              <View style={styles.timeGrid}>
                {allTimeSlots.map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  const isSelected = selectedTime === slot;

                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                        !isAvailable && styles.timeSlotDisabled,
                      ]}
                      onPress={() => isAvailable && handleTimeSelect(slot)}
                      disabled={!isAvailable}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isSelected && styles.timeSlotTextSelected,
                          !isAvailable && styles.timeSlotTextDisabled,
                        ]}
                      >
                        {formatTimeTo12Hour(slot)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDate || !selectedTime) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Icon name="arrow-forward" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.primary[100],
    marginHorizontal: spacing.md,
  },
  summaryLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  summarySubtext: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  summaryDividerHorizontal: {
    height: 1,
    backgroundColor: colors.primary[100],
    marginVertical: spacing.md,
  },
  selectedSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedSlotText: {
    ...typography.bodyMedium,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  dateScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  dateCard: {
    width: 70,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.paper,
    borderWidth: 2,
    borderColor: colors.primary[100],
    alignItems: 'center',
  },
  dateCardActive: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  dateDayName: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dateDay: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateMonth: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  dateTextActive: {
    color: colors.neutral.white,
  },
  emptyTimeCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyTimeIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTimeText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptyTimeSubtext: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotAvailable: {
    backgroundColor: colors.secondary[500],
  },
  legendDotBooked: {
    backgroundColor: colors.background.paper,
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  legendText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  timeSlot: {
    width: '31%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.paper,
    borderWidth: 2,
    borderColor: colors.primary[100],
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  timeSlotDisabled: {
    backgroundColor: colors.background.default,
    borderColor: colors.primary[50],
  },
  timeSlotText: {
    ...typography.labelMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: colors.neutral.white,
  },
  timeSlotTextDisabled: {
    color: colors.text.secondary,
    opacity: 0.5,
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.primary[50],
    ...shadows.small,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  continueButtonDisabled: {
    backgroundColor: colors.primary[200],
    opacity: 0.5,
  },
  continueButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default SelectDateTimeScreen;
