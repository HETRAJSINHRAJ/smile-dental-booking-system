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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { getDocument } from '../../lib/firestore';
import { Appointment, Service, Provider } from '../../types/firebase';

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
        Alert.alert('Error', 'Appointment not found');
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
      Alert.alert('Error', 'Failed to load appointment details');
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
    if (!appointment) return;

    try {
      const RNHTMLtoPDF = require('react-native-html-to-pdf');
      
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Helvetica,Arial,sans-serif;padding:30px;background:#FFF}.header{background:#22C55E;color:#FFF;padding:20px;border-radius:10px;text-align:center;position:relative;margin-bottom:16px}.badge{position:absolute;top:-6px;right:30px;background:#FFF;color:#15803D;padding:4px 12px;border-radius:4px;font-weight:bold;font-size:10px}.header-title{font-size:22px;font-weight:bold;margin-bottom:3px}.header-subtitle{font-size:11px}.section{margin-bottom:12px}.section-title{font-size:12px;font-weight:bold;margin-bottom:8px}.appointment-box{background:#F3F4F6;padding:10px;border-radius:6px}.appointment-grid{display:flex;justify-content:space-between}.appointment-column{width:48%}.appointment-item{margin-bottom:8px}.label{font-size:9px;color:#6B7280;margin-bottom:2px}.value{font-size:10px;font-weight:bold}.info-row{display:flex;justify-content:space-between;margin-bottom:5px}.info-label{font-size:9px}.info-value{font-size:9px;font-weight:bold;text-align:right;max-width:65%}.amount-box{background:#EFF6FF;padding:16px;border-radius:8px;margin-bottom:16px;border:1px solid #BFDBFE}.amount-title{font-size:13px;font-weight:bold;color:#1E40AF;margin-bottom:10px}.amount-row{display:flex;justify-content:space-between;margin-bottom:4px}.amount-label{font-size:9px}.amount-value{font-size:9px;font-weight:bold;text-align:right}.divider{border-bottom:1px solid #BFDBFE;margin-top:4px;margin-bottom:10px}.total-row{display:flex;justify-content:space-between}.total-label{font-size:10px;font-weight:bold}.total-value{font-size:10px;font-weight:bold;color:#1E40AF;text-align:right}.footer{margin-top:15px;text-align:center}.footer-text{font-size:9px;color:#6B7280;margin-bottom:2px}</style></head><body><div class="header"><div class="badge">PAID</div><div class="header-title">Payment Receipt</div><div class="header-subtitle">Appointment Reservation Confirmed</div></div><div class="section"><div class="section-title">Appointment Details</div><div class="appointment-box"><div class="appointment-grid"><div class="appointment-column"><div class="appointment-item"><div class="label">Service</div><div class="value">${appointment.serviceName}</div></div><div class="appointment-item"><div class="label">Date</div><div class="value">${formatDate(appointment.appointmentDate)}</div></div></div><div class="appointment-column"><div class="appointment-item"><div class="label">Provider</div><div class="value">${appointment.providerName}</div></div><div class="appointment-item"><div class="label">Time</div><div class="value">${formatTimeTo12Hour(appointment.startTime)}</div></div></div></div></div></div><div class="section"><div class="section-title">Patient Information</div><div><div class="info-row"><span class="info-label">Name:</span><span class="info-value">${appointment.patientName || 'N/A'}</span></div><div class="info-row"><span class="info-label">Email:</span><span class="info-value">${appointment.patientEmail || 'N/A'}</span></div><div class="info-row"><span class="info-label">Phone:</span><span class="info-value">${appointment.patientPhone || 'Not provided'}</span></div></div></div><div class="section"><div class="section-title">Payment Information</div><div><div class="info-row"><span class="info-label">Transaction ID:</span><span class="info-value">${appointment.confirmationNumber || 'N/A'}</span></div><div class="info-row"><span class="info-label">Payment Date:</span><span class="info-value">${formatDate(appointment.appointmentDate)}</span></div><div class="info-row"><span class="info-label">Payment Method:</span><span class="info-value">${(appointment.paymentMethod || 'Online').charAt(0).toUpperCase() + (appointment.paymentMethod || 'Online').slice(1)}</span></div></div></div><div class="section"><div class="amount-box"><div class="amount-title">Amount Paid</div><div class="amount-row"><span class="amount-label">Appointment Reservation Fee:</span><span class="amount-value">Rs. ${appointment.paymentAmount.toFixed(2)}</span></div><div class="divider"></div><div class="total-row"><span class="total-label">Total Paid:</span><span class="total-value">Rs. ${appointment.paymentAmount.toFixed(2)}</span></div></div></div><div class="footer"><div class="footer-text">This is a computer-generated receipt. No signature required.</div><div class="footer-text">Please keep this receipt for your records.</div></div></body></html>`;

      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `receipt_${appointment.confirmationNumber}`,
        directory: 'Documents',
      });
      
      await Share.share({
        url: `file://${file.filePath}`,
        title: 'Appointment Receipt',
      });
      
      Alert.alert('Success', 'Receipt PDF generated successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      Alert.alert('Error', `Install: npm install react-native-html-to-pdf`);
    }
  };

  const handleAddToCalendar = async () => {
    if (!appointment) return;

    try {
      const RNCalendarEvents = require('react-native-calendar-events');
      
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
        
        Alert.alert('Success', 'Appointment added to calendar');
      } else {
        Alert.alert('Permission Denied', 'Calendar permission is required. Please enable it in Settings.');
      }
    } catch (error) {
      console.error('Calendar error:', error);
      Alert.alert('Error', `Failed to add to calendar: ${error.message || 'Unknown error'}`);
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
          >
            <Icon name="calendar-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.actionButtonText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownloadReceipt}
          >
            <Icon name="download-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Icon name="share-social-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.actionButtonText}>Share</Text>
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
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 80,
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
    borderWidth: 2,
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
  },
  paymentCard: {
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
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.primary[50],
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
