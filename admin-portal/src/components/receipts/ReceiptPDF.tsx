import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

interface ReceiptData {
  appointmentId: string;
  receiptNumber: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceName: string;
  providerName: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  confirmationNumber?: string;
  issueDate: Date;
  // Payment information
  paymentAmount: number;
  servicePaymentAmount: number;
  paymentStatus: string;
  servicePaymentStatus: string;
  paymentMethod?: string;
  paymentTransactionId?: string;
}

interface ReceiptDocumentProps {
  receiptData: ReceiptData;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#22C55E',
    padding: 20,
    marginBottom: 30,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: '#1F2937',
    borderBottom: '2 solid #E5E7EB',
    paddingBottom: 6,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 6,
    border: '1 solid #E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6B7280',
    width: '40%',
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    width: '60%',
    textAlign: 'right',
  },
  badge: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    padding: '6 12',
    borderRadius: 4,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #E5E7EB',
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  companyInfo: {
    marginTop: 30,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  paymentSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  paymentTable: {
    border: '1 solid #E5E7EB',
    borderRadius: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    padding: 10,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 10,
  },
  tableRowTotal: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F3F4F6',
    fontFamily: 'Helvetica-Bold',
  },
  tableLabel: {
    fontSize: 10,
    color: '#1F2937',
    width: '60%',
  },
  tableValue: {
    fontSize: 10,
    color: '#1F2937',
    width: '40%',
    textAlign: 'right',
  },
  tableLabelBold: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    width: '60%',
  },
  tableValueBold: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    width: '40%',
    textAlign: 'right',
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
    border: '1 solid #FCD34D',
  },
  noteText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4,
  },
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({ receiptData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointment Receipt</Text>
        <Text style={styles.headerSubtitle}>
          Booking Confirmation
        </Text>
      </View>

      {/* Status Badge */}
      <View style={styles.badge}>
        <Text>✓ CONFIRMED</Text>
      </View>

      {/* Receipt Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receipt Information</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Receipt Number:</Text>
            <Text style={styles.infoValue}>{receiptData.receiptNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Issue Date:</Text>
            <Text style={styles.infoValue}>{formatDate(receiptData.issueDate)}</Text>
          </View>
          {receiptData.confirmationNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Confirmation Number:</Text>
              <Text style={styles.infoValue}>{receiptData.confirmationNumber}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Appointment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service:</Text>
            <Text style={styles.infoValue}>{receiptData.serviceName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Provider:</Text>
            <Text style={styles.infoValue}>{receiptData.providerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(receiptData.appointmentDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {formatTime(receiptData.startTime)} - {formatTime(receiptData.endTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Patient Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{receiptData.patientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{receiptData.patientEmail}</Text>
          </View>
          {receiptData.patientPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{receiptData.patientPhone}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Payment Breakdown */}
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Breakdown</Text>
        <View style={styles.paymentTable}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Reservation Fee (Paid Online)</Text>
            <Text style={styles.tableValue}>₹{receiptData.paymentAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>GST (18%)</Text>
            <Text style={styles.tableValue}>₹{(receiptData.paymentAmount * 0.18).toFixed(2)}</Text>
          </View>
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableLabelBold}>Total Paid</Text>
            <Text style={styles.tableValueBold}>₹{(receiptData.paymentAmount * 1.18).toFixed(2)}</Text>
          </View>
          {receiptData.paymentMethod && (
            <View style={styles.tableRowLast}>
              <Text style={styles.tableLabel}>Payment Method</Text>
              <Text style={styles.tableValue}>{receiptData.paymentMethod}</Text>
            </View>
          )}
          {receiptData.paymentTransactionId && (
            <View style={styles.tableRowLast}>
              <Text style={styles.tableLabel}>Transaction ID</Text>
              <Text style={styles.tableValue}>{receiptData.paymentTransactionId}</Text>
            </View>
          )}
        </View>

        {/* Service Payment Due */}
        {receiptData.servicePaymentStatus === 'pending' && receiptData.servicePaymentAmount > 0 && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              ⚠️ Service Payment Due: ₹{receiptData.servicePaymentAmount.toFixed(2)} (to be paid at clinic)
            </Text>
            <Text style={styles.noteText}>
              This amount includes the full service charge and will be collected at the time of your appointment.
            </Text>
          </View>
        )}

        {receiptData.servicePaymentStatus === 'paid' && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              ✓ Service Payment Completed: ₹{receiptData.servicePaymentAmount.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Company Info */}
      <View style={styles.companyInfo}>
        <Text style={styles.companyName}>Dental Care Clinic</Text>
        <Text style={styles.companyDetails}>123 Healthcare Street, Medical District</Text>
        <Text style={styles.companyDetails}>Phone: +91 1234567890 | Email: info@dentalcare.com</Text>
      </View>
    </Page>
  </Document>
);
