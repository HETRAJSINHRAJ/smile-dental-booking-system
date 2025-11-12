import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Share,
} from 'react-native';
import { Alert } from '../../utils/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import RNCalendarEvents from 'react-native-calendar-events';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { getDocument } from '../../lib/firestore';
import { Appointment, Service, Provider } from '../../types/firebase';
import { PDFDownloadManager } from '../../utils/pdfDownloadManager';
import { ReceiptPDFGenerator } from '../../utils/receiptPDFGenerator';

type BookingSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingSuccess'
>;
type BookingSuccessScreenRouteProp = RouteProp<RootStackParamList, 'BookingSuccess'>;

interface Props {
  navigation: BookingSuccessScreenNavigationProp;
  route: BookingSuccessScreenRouteProp;
}

const BookingSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointmentDetails();
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      const appointmentData = await getDocument<Appointment>('appointments', appointmentId);

      if (!appointmentData) {
        Alert.error('Error', 'Appointment not found', [{ text: 'OK' }]);
        navigation.navigate('Main');
        return;
      }

      setAppointment(appointmentData);

      // Load service and provider details
      const [serviceData, providerData] = await Promise.all([
        getDocument<Service>('services', appointmentData.serviceId),
        getDocument<Provider>('providers', appointmentData.providerId),
      ]);

      setService(serviceData);
      setProvider(providerData);
    } catch (error) {
      console.error('Error loading appointment details:', error);
      Alert.error('Error', 'Failed to load appointment details', [{ text: 'OK' }]);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (!appointment) return;

    try {
      const message = `I have booked an appointment with ${appointment.providerName} for ${appointment.serviceName}. Confirmation #: ${appointment.confirmationNumber}`;

      await Share.share({
        message,
        title: 'Appointment Confirmation',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!appointment) {
      Alert.error('Error', 'Appointment data not available', [{ text: 'OK' }]);
      return;
    }

    try {
      // Generate HTML content using the utility
      const htmlContent = ReceiptPDFGenerator.generateReceiptHTML({
        appointment,
        service,
      });

      // Generate filename
      const fileName = `receipt_${appointment.confirmationNumber || appointment.id}.pdf`;

      // Download PDF with progress tracking
      await PDFDownloadManager.downloadPDF({
        htmlContent,
        fileName,
        title: 'Appointment Receipt',
        onProgress: (progress) => {
          console.log(`Download progress: ${progress}%`);
        },
        onComplete: (filePath) => {
          console.log(`Receipt downloaded successfully: ${filePath}`);
        },
        onError: (error) => {
          console.error('Download error:', error);
        },
      });
    } catch (error: any) {
      console.error('Receipt generation error:', error);
      Alert.error(
        'Error',
        'Failed to generate receipt. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddToCalendar = async () => {
    if (!appointment) return;

    try {
      const status = await RNCalendarEvents.requestPermissions();
      
      if (status === 'authorized' || status === 'restricted') {
        const appointmentDate = appointment.appointmentDate.toDate ? 
          appointment.appointmentDate.toDate() : new Date(appointment.appointmentDate);
        
        const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
        const startDate = new Date(appointmentDate);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
        const endDate = new Date(appointmentDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        await RNCalendarEvents.saveEvent(`${appointment.serviceName} - ${appointment.providerName}`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: 'Dental Clinic',
          notes: `Confirmation: ${appointment.confirmationNumber}\nProvider: ${appointment.providerName}`,
          alarms: [{ date: -60 }],
        });
        
        Alert.success('Success', 'Appointment added to calendar successfully!', [{ text: 'OK' }]);
      } else {
        Alert.warning(
          'Permission Required',
          'Calendar permission is required to add appointments. Please enable it in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Calendar error:', error);
      Alert.error(
        'Error',
        `Failed to add to calendar: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <ActivityIndicator size="large" color={colors.secondary[500]} />
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>Appointment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Main')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Booking Confirmed</Text>
          
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Animation Card */}
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="checkmark-circle" size={80} color={colors.secondary[500]} />
          </View>
          <Text style={styles.successTitle}>Appointment Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your appointment has been successfully booked
          </Text>
        </View>

        {/* Confirmation Number Card */}
        <Card style={styles.confirmationCard}>
          <View style={styles.confirmationContent}>
            <Text style={styles.confirmationLabel}>Confirmation Number</Text>
            <Text style={styles.confirmationNumber}>{appointment.confirmationNumber}</Text>
            <Text style={styles.confirmationSubtext}>
              Save this number for your records
            </Text>
          </View>
        </Card>

        {/* Appointment Details Card */}
        <Card style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Icon name="calendar-outline" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Appointment Details</Text>
          </View>

          {/* Service */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="medical" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{appointment.serviceName}</Text>
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
              <Text style={styles.detailValue}>{appointment.providerName}</Text>
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
              <Text style={styles.detailValue}>
                {formatDate(appointment.appointmentDate)}
              </Text>
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
                {formatTimeTo12Hour(appointment.startTime)} -{' '}
                {formatTimeTo12Hour(appointment.endTime)}
              </Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="checkmark-done" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Payment Information Card */}
        <Card style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <Icon name="card" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Payment Information</Text>
          </View>

          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount Paid</Text>
              <Text style={styles.paymentValue}>₹{appointment.paymentAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <View style={styles.paymentStatusBadge}>
                <Text style={styles.paymentStatusText}>
                  {appointment.paymentStatus === 'pending' ? 'Pending' : 'Paid'}
                </Text>
              </View>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>
                {appointment.paymentMethod || 'Online'}
              </Text>
            </View>
          </View>

          <View style={styles.paymentNote}>
            <Icon name="information-circle" size={16} color={colors.secondary[500]} />
            <Text style={styles.paymentNoteText}>
              Service fee will be collected at the clinic during your visit
            </Text>
          </View>
        </Card>

        {/* Important Information Card */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="alert-circle" size={24} color={colors.secondary[500]} />
            <Text style={styles.cardTitle}>Important Information</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Please arrive 10 minutes early to complete necessary paperwork
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Cancellations must be made at least 24 hours in advance
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                You'll receive a reminder email before your appointment
              </Text>
            </View>
          </View>
        </Card>

        {/* Notes Section */}
        {appointment.notes && (
          <Card style={styles.notesCard}>
            <View style={styles.cardHeader}>
              <Icon name="document-text" size={24} color={colors.secondary[500]} />
              <Text style={styles.cardTitle}>Your Notes</Text>
            </View>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToCalendar}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonIconContainer}>
              <Icon name="calendar-outline" size={22} color={colors.secondary[500]} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Add to Calendar</Text>
              <Text style={styles.actionButtonSubtext}>Save to your device</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownloadReceipt}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonIconContainer}>
              <Icon name="download-outline" size={22} color={colors.secondary[500]} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Download Receipt</Text>
              <Text style={styles.actionButtonSubtext}>Get PDF copy</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonIconContainer}>
              <Icon name="share-social-outline" size={22} color={colors.secondary[500]} />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Share</Text>
              <Text style={styles.actionButtonSubtext}>Send to others</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Icon name="home" size={20} color={colors.neutral.white} />
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    ...typography.titleLarge,
    color: colors.error.main,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 80,
  },
  header: {
    backgroundColor: colors.background.paper,
    paddingTop: spacing.xs,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    flex: 1,
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 17,
    letterSpacing: -0.41,
  },
  headerSpacer: {
    width: 44,
  },
  headerBorder: {
    height: 0.5,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  confirmationCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primary[50],
    borderWidth: 0.5,
    borderColor: colors.secondary[500],
  },
  confirmationContent: {
    alignItems: 'center',
  },
  confirmationLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  confirmationNumber: {
    ...typography.headlineSmall,
    color: colors.secondary[500],
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: 2,
  },
  confirmationSubtext: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  detailsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  paymentCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  infoCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  notesCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border.light,
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
  statusBadge: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.labelSmall,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  paymentInfo: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  paymentStatusBadge: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  paymentStatusText: {
    ...typography.labelSmall,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  paymentNoteText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    flex: 1,
  },
  infoList: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoBullet: {
    ...typography.bodyMedium,
    color: colors.secondary[500],
    fontWeight: '700',
    marginTop: 2,
  },
  infoText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  notesText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    lineHeight: 20,
  },
  actionButtons: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.paper,
    borderWidth: 0.5,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  actionButtonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtonSubtext: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.light,
    ...shadows.small,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.secondary[500],
    ...shadows.small,
  },
  homeButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default BookingSuccessScreen;
