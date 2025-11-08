import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { getAllDocuments, createDocument } from '../../lib/firestore';
import { Service, Provider, Appointment } from '../../types/firebase';
import { useAuth } from '../../contexts/AuthContextWithToast';
import firestore from '@react-native-firebase/firestore';
import { getPaymentConfig, formatPaymentBreakdown } from '../../lib/paymentConfig';
import PaymentModal from '../../components/PaymentModal';

type ConfirmBookingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ConfirmBooking'
>;
type ConfirmBookingScreenRouteProp = RouteProp<RootStackParamList, 'ConfirmBooking'>;

interface Props {
  navigation: ConfirmBookingScreenNavigationProp;
  route: ConfirmBookingScreenRouteProp;
}

const ConfirmBookingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { serviceId, providerId, date, time } = route.params;
  const { user, userProfile } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Payment configuration
  const paymentConfig = getPaymentConfig();

  useEffect(() => {
    loadData();
  }, [serviceId, providerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, providersData] = await Promise.all([
        getAllDocuments<Service>('services', []),
        getAllDocuments<Provider>('providers', []),
      ]);

      const selectedService = servicesData.find(s => s.id === serviceId);
      const selectedProvider = providersData.find(p => p.id === providerId);

      if (!selectedService || !selectedProvider) {
        Alert.alert('Error', 'Service or provider not found');
        navigation.goBack();
        return;
      }

      setService(selectedService);
      setProvider(selectedProvider);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculatePaymentBreakdown = () => {
    if (!service) return null;
    return formatPaymentBreakdown(service.price, paymentConfig);
  };

  const calculateEndTime = () => {
    if (!service) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  const handleConfirmBooking = async () => {
    if (!agreeToPolicy) {
      Alert.alert('Error', 'Please agree to the cancellation policy');
      return;
    }

    if (!user || !service || !provider) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    // Show payment modal for reservation fee
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (response: any) => {
    setPaymentResponse(response);
    setPaymentError(null);

    if (!user || !service || !provider) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setSubmitting(true);

    try {
      const paymentBreakdown = calculatePaymentBreakdown();
      if (!paymentBreakdown) {
        Alert.alert('Error', 'Failed to calculate payment');
        return;
      }

      // Create appointment after successful payment
      const appointmentDate = new Date(date + 'T' + time + ':00');
      const endTime = calculateEndTime();

      const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.fullName || user.displayName || '',
        userPhone: userProfile?.phone || '',
        serviceId: service.id,
        serviceName: service.name,
        providerId: provider.id,
        providerName: provider.name,
        appointmentDate: firestore.Timestamp.fromDate(appointmentDate),
        startTime: time,
        endTime,
        status: 'confirmed',
        notes,
        confirmationNumber: generateConfirmationNumber(),
        paymentStatus: 'reservation_paid',
        paymentAmount: paymentBreakdown.appointmentTotal,
        paymentTransactionId: response.paymentId || response.razorpay_payment_id,
        paymentType: 'appointment_reservation',
        paymentDate: firestore.Timestamp.now(),
        paymentMethod: 'razorpay',
        servicePaymentStatus: 'pending',
        servicePaymentAmount: paymentBreakdown.serviceTotal,
      };

      const appointmentId = await createDocument<Appointment>(
        'appointments',
        appointmentData
      );

      // Close payment modal and navigate to success screen
      setShowPayment(false);
      navigation.navigate('BookingSuccess', { appointmentId });
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'Failed to create appointment. Please try again.');
      setSubmitting(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentResponse(null);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentError(null);
    setPaymentResponse(null);
  };

  const generateConfirmationNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <ActivityIndicator size="large" color={colors.secondary[500]} />
      </SafeAreaView>
    );
  }

  const paymentBreakdown = calculatePaymentBreakdown();
  const endTime = calculateEndTime();

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
        <Text style={styles.headerTitle}>Confirm Appointment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Appointment Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Icon name="checkmark-circle-outline" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Appointment Details</Text>
          </View>

          {/* Service */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="medical" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{service?.name}</Text>
              <Text style={styles.detailSubtext}>
                {service?.duration} min • ₹{service?.price}
              </Text>
            </View>
          </View>

          {/* Provider */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="person" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>{provider?.name}</Text>
              <Text style={styles.detailSubtext}>{provider?.specialty}</Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="calendar" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(date)}</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="time" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {formatTimeTo12Hour(time)} - {formatTimeTo12Hour(endTime)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Patient Information Card */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="person-circle" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Your Information</Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {user?.displayName || userProfile?.fullName || 'Not provided'}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {userProfile?.phone || 'Not provided'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Notes Section */}
        <Card style={styles.notesCard}>
          <View style={styles.cardHeader}>
            <Icon name="document-text" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Additional Notes</Text>
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="Any specific concerns or requests? (Optional)"
            placeholderTextColor={colors.text.secondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* Payment Breakdown Card */}
        {paymentBreakdown && (
          <Card style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <Icon name="card" size={24} color={colors.secondary[500]} />
              <Text style={styles.cardTitle}>Payment Information</Text>
            </View>

            <View style={styles.paymentBreakdown}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Appointment Reservation Fee</Text>
                <Text style={styles.paymentValue}>₹{paymentBreakdown.appointmentReservationFee.toFixed(2)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>GST (18%)</Text>
                <Text style={styles.paymentValue}>₹{paymentBreakdown.appointmentTax.toFixed(2)}</Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabelTotal}>Total Payable Now</Text>
                <Text style={styles.paymentValueTotal}>₹{paymentBreakdown.appointmentTotal.toFixed(2)}</Text>
              </View>

              {!paymentConfig.enableServicePaymentOnline && (
                <View style={styles.paymentNote}>
                  <Icon name="information-circle" size={16} color={colors.secondary[500]} />
                  <Text style={styles.paymentNoteText}>
                    Service fee of ₹{paymentBreakdown.serviceTotal.toFixed(2)} will be collected at the clinic during your visit
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Cancellation Policy Card */}
        <Card style={styles.policyCard}>
          <View style={styles.cardHeader}>
            <Icon name="alert-circle" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Important Information</Text>
          </View>

          <View style={styles.policyList}>
            <View style={styles.policyItem}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                Please arrive 10 minutes early to complete necessary paperwork
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                Cancellations must be made at least 24 hours in advance
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                Late cancellations or no-shows may incur a fee
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyBullet}>•</Text>
              <Text style={styles.policyText}>
                You'll receive a confirmation email and reminder before your appointment
              </Text>
            </View>
          </View>

          {/* Policy Agreement */}
          <View style={styles.policyAgreement}>
            <Switch
              value={agreeToPolicy}
              onValueChange={setAgreeToPolicy}
              trackColor={{ false: colors.primary[100], true: colors.secondary[500] }}
              thumbColor={colors.neutral.white}
            />
            <Text style={styles.policyAgreementText}>
              I understand and agree to the cancellation policy
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!agreeToPolicy || submitting) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!agreeToPolicy || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.neutral.white} />
          ) : (
            <>
              <Icon name="checkmark" size={20} color={colors.neutral.white} />
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      {paymentBreakdown && (
        <PaymentModal
          visible={showPayment}
          amount={paymentBreakdown.appointmentTotal}
          serviceName={service?.name || ''}
          customerDetails={{
            name: user?.displayName || userProfile?.fullName || '',
            email: user?.email || '',
            phone: userProfile?.phone || '',
          }}
          paymentDescription={`Appointment Reservation - ${service?.name}`}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 80,
  },
  detailsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  notesCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  paymentCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  policyCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailSubtext: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  infoBox: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.primary[50],
    marginVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.bodyMedium,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.primary[100],
    minHeight: 100,
  },
  paymentBreakdown: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  paymentLabel: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  paymentValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: colors.primary[50],
    marginVertical: spacing.md,
  },
  paymentLabelTotal: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  paymentValueTotal: {
    ...typography.titleMedium,
    color: colors.secondary[500],
    fontWeight: '700',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  paymentNoteText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    flex: 1,
  },
  policyList: {
    marginBottom: spacing.lg,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  policyBullet: {
    ...typography.bodyMedium,
    color: colors.secondary[500],
    fontWeight: '700',
    marginTop: 2,
  },
  policyText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  policyAgreement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.primary[50],
  },
  policyAgreementText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.primary[50],
    ...shadows.small,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.labelLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.secondary[500],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.small,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.primary[200],
    opacity: 0.5,
  },
  confirmButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default ConfirmBookingScreen;
