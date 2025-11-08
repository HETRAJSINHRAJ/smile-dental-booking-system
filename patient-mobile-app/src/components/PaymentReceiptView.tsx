import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Card } from './Card';
import { format } from 'date-fns';

interface PaymentReceiptViewProps {
  appointmentData: {
    id: string;
    serviceName: string;
    providerName: string;
    date: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
  };
  paymentData: {
    transactionId: string;
    amount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: string;
    paymentDate: string;
    paymentDescription: string;
  };
  servicePaymentInfo?: {
    serviceAmount: number;
    serviceTax: number;
    serviceTotal: number;
    paymentDue: string;
  };
  onClose: () => void;
}

const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const PaymentReceiptView: React.FC<PaymentReceiptViewProps> = ({
  appointmentData,
  paymentData,
  servicePaymentInfo,
  onClose,
}) => {
  const handleAddToCalendar = async () => {
    try {
      const { default: RNCalendarEvents } = await import('react-native-calendar-events');
      
      const status = await RNCalendarEvents.requestPermissions();
      
      if (status === 'authorized') {
        const eventConfig = {
          title: `${appointmentData.serviceName} - ${appointmentData.providerName}`,
          startDate: new Date(appointmentData.date).toISOString(),
          endDate: new Date(new Date(appointmentData.date).getTime() + 60 * 60 * 1000).toISOString(),
          location: 'Dental Clinic',
          notes: `Appointment with ${appointmentData.providerName}\nTransaction ID: ${paymentData.transactionId}`,
          alarms: [{ date: -60 }], // 1 hour before
        };
        
        await RNCalendarEvents.saveEvent(eventConfig.title, eventConfig);
        Alert.alert('Success', 'Appointment added to calendar');
      } else {
        Alert.alert('Permission Denied', 'Calendar permission is required');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to calendar. Please add manually.');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const receiptText = `
PAYMENT RECEIPT
Appointment Reservation Confirmed

APPOINTMENT DETAILS
Service: ${appointmentData.serviceName}
Provider: ${appointmentData.providerName}
Date: ${format(new Date(appointmentData.date), 'dd MMMM yyyy')}
Time: ${appointmentData.time}

PATIENT INFORMATION
Name: ${appointmentData.patientName}
Email: ${appointmentData.patientEmail}
Phone: ${appointmentData.patientPhone}

PAYMENT INFORMATION
Transaction ID: ${paymentData.transactionId}
Payment Date: ${format(new Date(paymentData.paymentDate), 'dd MMMM yyyy, HH:mm')}
Payment Method: ${paymentData.paymentMethod}

AMOUNT PAID
Appointment Fee: ${formatCurrency(paymentData.amount)}
GST (18%): ${formatCurrency(paymentData.taxAmount)}
Total Paid: ${formatCurrency(paymentData.totalAmount)}
${servicePaymentInfo ? `\nSERVICE PAYMENT DUE AT CLINIC
Service Fee: ${formatCurrency(servicePaymentInfo.serviceAmount)}
GST (18%): ${formatCurrency(servicePaymentInfo.serviceTax)}
Total Due: ${formatCurrency(servicePaymentInfo.serviceTotal)}` : ''}

This is a computer-generated receipt.
      `.trim();

      await Share.share({
        message: receiptText,
        title: 'Payment Receipt',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `Appointment Confirmed! 🎉

Service: ${appointmentData.serviceName}
Provider: ${appointmentData.providerName}
Date: ${format(new Date(appointmentData.date), 'dd MMMM yyyy')}
Time: ${appointmentData.time}

Payment: ${formatCurrency(paymentData.totalAmount)} (Paid)
Transaction ID: ${paymentData.transactionId}`;

      await Share.share({
        message: shareMessage,
        title: 'Appointment Details',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Receipt</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Header */}
        <Card style={styles.successCard}>
          <View style={styles.successHeader}>
            <View style={styles.successIcon}>
              <Icon name="checkmark-circle" size={48} color={colors.success.main} />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>Appointment Reservation Confirmed</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PAID</Text>
            </View>
          </View>
        </Card>

        {/* Appointment Details */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar" size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Appointment Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{appointmentData.serviceName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>{appointmentData.providerName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {format(new Date(appointmentData.date), 'dd MMMM yyyy')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{appointmentData.time}</Text>
            </View>
          </View>
        </Card>

        {/* Patient Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="person" size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Patient Information</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{appointmentData.patientName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{appointmentData.patientEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{appointmentData.patientPhone}</Text>
            </View>
          </View>
        </Card>

        {/* Payment Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="card" size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Payment Information</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transaction ID:</Text>
              <Text style={[styles.infoValue, styles.monoFont]}>{paymentData.transactionId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Date:</Text>
              <Text style={styles.infoValue}>
                {format(new Date(paymentData.paymentDate), 'dd MMM yyyy, HH:mm')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method:</Text>
              <Text style={styles.infoValue}>{paymentData.paymentMethod.toUpperCase()}</Text>
            </View>
          </View>
        </Card>

        {/* Amount Paid */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountTitle}>Amount Paid</Text>
          <View style={styles.amountList}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Appointment Fee:</Text>
              <Text style={styles.amountValue}>{formatCurrency(paymentData.amount)}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>GST (18%):</Text>
              <Text style={styles.amountValue}>{formatCurrency(paymentData.taxAmount)}</Text>
            </View>
            <View style={styles.amountDivider} />
            <View style={styles.amountRow}>
              <Text style={styles.amountTotalLabel}>Total Paid:</Text>
              <Text style={styles.amountTotalValue}>{formatCurrency(paymentData.totalAmount)}</Text>
            </View>
          </View>
        </Card>

        {/* Service Payment Due */}
        {servicePaymentInfo && (
          <Card style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Icon name="alert-circle" size={20} color={colors.warning.main} />
              <Text style={styles.serviceTitle}>Service Payment Due</Text>
            </View>
            <Text style={styles.serviceNote}>
              The following amount will be collected at the clinic during your visit:
            </Text>
            <View style={styles.serviceList}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceLabel}>Service Fee:</Text>
                <Text style={styles.serviceValue}>{formatCurrency(servicePaymentInfo.serviceAmount)}</Text>
              </View>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceLabel}>GST (18%):</Text>
                <Text style={styles.serviceValue}>{formatCurrency(servicePaymentInfo.serviceTax)}</Text>
              </View>
              <View style={styles.serviceDivider} />
              <View style={styles.serviceRow}>
                <Text style={styles.serviceTotalLabel}>Total Due:</Text>
                <Text style={styles.serviceTotalValue}>{formatCurrency(servicePaymentInfo.serviceTotal)}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a computer-generated receipt.</Text>
          <Text style={styles.footerText}>Please keep this for your records.</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddToCalendar}>
          <Icon name="calendar-outline" size={24} color={colors.primary[500]} />
          <Text style={styles.actionButtonText}>Add to Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadReceipt}>
          <Icon name="download-outline" size={24} color={colors.primary[500]} />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon name="share-social-outline" size={24} color={colors.primary[500]} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 80,
  },
  successCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
    borderWidth: 1,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.headlineMedium,
    color: colors.success.dark,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    ...typography.bodyMedium,
    color: colors.success.dark,
  },
  badge: {
    backgroundColor: colors.success.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  badgeText: {
    ...typography.labelMedium,
    color: colors.neutral.white,
    fontWeight: '700',
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  detailsGrid: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  detailItem: {
    gap: spacing.xs,
  },
  detailLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  infoList: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  monoFont: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  amountCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
    borderWidth: 1,
  },
  amountTitle: {
    ...typography.titleMedium,
    color: colors.primary[700],
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  amountList: {
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  amountValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  amountDivider: {
    height: 1,
    backgroundColor: colors.primary[200],
    marginVertical: spacing.xs,
  },
  amountTotalLabel: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontWeight: '700',
  },
  amountTotalValue: {
    ...typography.titleSmall,
    color: colors.primary[600],
    fontWeight: '700',
  },
  serviceCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.warning.light,
    borderColor: colors.warning.main,
    borderWidth: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  serviceTitle: {
    ...typography.titleMedium,
    color: colors.warning.dark,
    fontWeight: '700',
  },
  serviceNote: {
    ...typography.bodySmall,
    color: colors.warning.dark,
    marginBottom: spacing.md,
  },
  serviceList: {
    gap: spacing.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  serviceValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  serviceDivider: {
    height: 1,
    backgroundColor: colors.warning.main,
    marginVertical: spacing.xs,
  },
  serviceTotalLabel: {
    ...typography.titleSmall,
    color: colors.warning.dark,
    fontWeight: '700',
  },
  serviceTotalValue: {
    ...typography.titleSmall,
    color: colors.warning.dark,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.medium,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.labelSmall,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
