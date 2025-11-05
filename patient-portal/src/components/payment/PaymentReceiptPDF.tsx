"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  User,
  CreditCard,
  FileText,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/localization/currency";
import { format } from "date-fns";

// Helper function to format currency for PDF (using Rs. instead of ₹ symbol)
const formatPDFCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
};

interface PaymentReceiptPDFProps {
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
}

// PDF Styles - Matching the exact design from image
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#22C55E",
    padding: "20 20",
    marginBottom: 16,
    borderRadius: 10,
    position: "relative",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: 30,
    backgroundColor: "#FFFFFF",
    padding: "4 12",
    borderRadius: 4,
  },
  badgeText: {
    color: "#15803D",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#000000",
  },
  appointmentBox: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 6,
  },
  appointmentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appointmentColumn: {
    width: "48%",
  },
  appointmentItem: {
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  patientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
  patientLabel: {
    fontSize: 9,
    color: "#000000",
  },
  patientValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textAlign: "right",
    maxWidth: "65%",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 9,
    color: "#000000",
  },
  paymentValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textAlign: "right",
  },
  amountBox: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    border: "1 solid #BFDBFE",
  },
  amountTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1E40AF",
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 9,
    color: "#000000",
  },
  amountValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textAlign: "right",
  },
  divider: {
    borderBottom: "1 solid #BFDBFE",
    marginTop: 4,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  totalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1E40AF",
    textAlign: "right",
  },
  serviceBox: {
    backgroundColor: "#FEF9C3",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    border: "1 solid #FCD34D",
  },
  serviceTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#78350F",
    marginBottom: 6,
  },
  serviceNote: {
    fontSize: 9,
    color: "#78350F",
    marginBottom: 12,
    lineHeight: 1.4,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  serviceLabel: {
    fontSize: 9,
    color: "#000000",
  },
  serviceValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textAlign: "right",
  },
  serviceDivider: {
    borderBottom: "1 solid #FCD34D",
    marginTop: 4,
    marginBottom: 10,
  },
  serviceTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#78350F",
  },
  serviceTotalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#78350F",
    textAlign: "right",
  },
  footer: {
    marginTop: 15,
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
    textAlign: "center",
  },
  monoFont: {
    fontFamily: "Courier",
    fontSize: 8,
  },
});

// PDF Document Component
export const ReceiptDocument = ({
  appointmentData,
  paymentData,
  servicePaymentInfo,
}: PaymentReceiptPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Badge */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PAID</Text>
        </View>
        <Text style={styles.headerTitle}>Payment Receipt</Text>
        <Text style={styles.headerSubtitle}>
          Appointment Reservation Confirmed
        </Text>
      </View>

      {/* Appointment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        <View style={styles.appointmentBox}>
          <View style={styles.appointmentGrid}>
            <View style={styles.appointmentColumn}>
              <View style={styles.appointmentItem}>
                <Text style={styles.label}>Service</Text>
                <Text style={styles.value}>{appointmentData.serviceName}</Text>
              </View>
              <View style={styles.appointmentItem}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>
                  {format(new Date(appointmentData.date), "dd MMMM yyyy")}
                </Text>
              </View>
            </View>
            <View style={styles.appointmentColumn}>
              <View style={styles.appointmentItem}>
                <Text style={styles.label}>Provider</Text>
                <Text style={styles.value}>{appointmentData.providerName}</Text>
              </View>
              <View style={styles.appointmentItem}>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.value}>{appointmentData.time}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Patient Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={{ marginBottom: 0 }}>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Name:</Text>
            <Text style={styles.patientValue}>
              {appointmentData.patientName}
            </Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Email:</Text>
            <Text style={styles.patientValue}>
              {appointmentData.patientEmail}
            </Text>
          </View>
          <View style={[styles.patientRow, { marginBottom: 0 }]}>
            <Text style={styles.patientLabel}>Phone:</Text>
            <Text style={styles.patientValue}>
              {appointmentData.patientPhone || "Not provided"}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={{ marginBottom: 0 }}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Transaction ID:</Text>
            <Text style={[styles.paymentValue, styles.monoFont]}>
              {paymentData.transactionId || "N/A"}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Date:</Text>
            <Text style={styles.paymentValue}>
              {format(new Date(paymentData.paymentDate), "dd MMMM yyyy, HH:mm")}
            </Text>
          </View>
          <View style={[styles.paymentRow, { marginBottom: 0 }]}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>
              {paymentData.paymentMethod.charAt(0).toUpperCase() +
                paymentData.paymentMethod.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Paid */}
      <View style={styles.section}>
        <View style={styles.amountBox}>
          <Text style={styles.amountTitle}>Amount Paid</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Appointment Reservation Fee:</Text>
            <Text style={styles.amountValue}>
              {formatPDFCurrency(paymentData.amount)}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>GST (18%):</Text>
            <Text style={styles.amountValue}>
              {formatPDFCurrency(paymentData.taxAmount)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>
              {formatPDFCurrency(paymentData.totalAmount)}
            </Text>
          </View>
        </View>
      </View>

      {/* Service Payment Due */}
      {servicePaymentInfo && (
        <View style={styles.section}>
          <View style={styles.serviceBox}>
            <Text style={styles.serviceTitle}>Service Payment Due</Text>
            <Text style={styles.serviceNote}>
              The following amount will be collected at the clinic during your
              visit:
            </Text>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>Service Fee:</Text>
              <Text style={styles.serviceValue}>
                {formatPDFCurrency(servicePaymentInfo.serviceAmount)}
              </Text>
            </View>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>GST (18%):</Text>
              <Text style={styles.serviceValue}>
                {formatPDFCurrency(servicePaymentInfo.serviceTax)}
              </Text>
            </View>
            <View style={styles.serviceDivider} />
            <View style={styles.serviceTotalRow}>
              <Text style={styles.serviceTotalLabel}>Total Due at Clinic:</Text>
              <Text style={styles.serviceTotalValue}>
                {formatPDFCurrency(servicePaymentInfo.serviceTotal)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a computer-generated receipt. No signature required.
        </Text>
        <Text style={styles.footerText}>
          Please keep this receipt for your records.
        </Text>
      </View>
    </Page>
  </Document>
);

// Main Component
export function PaymentReceiptPDF({
  appointmentData,
  paymentData,
  servicePaymentInfo,
}: PaymentReceiptPDFProps) {
  const fileName = `receipt_${paymentData.transactionId}_${format(new Date(), "yyyyMMdd")}.pdf`;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900">
                  Payment Receipt
                </CardTitle>
                <p className="text-sm text-green-700">
                  Appointment Reservation Confirmed
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Paid
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Appointment Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium">{appointmentData.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium">{appointmentData.providerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {format(new Date(appointmentData.date), "dd MMMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{appointmentData.time}</p>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Patient Information</h3>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {appointmentData.patientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {appointmentData.patientEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">
                  {appointmentData.patientPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Payment Information</h3>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium font-mono text-sm">
                  {paymentData.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-medium">
                  {format(
                    new Date(paymentData.paymentDate),
                    "dd MMMM yyyy, HH:mm",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">
                  {paymentData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium">
                  {paymentData.paymentDescription}
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Amount Paid</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Appointment Reservation Fee:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(paymentData.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">GST (18%):</span>
                  <span className="font-medium">
                    {formatCurrency(paymentData.taxAmount)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                  <span className="text-gray-900">Total Paid:</span>
                  <span className="text-blue-600">
                    {formatCurrency(paymentData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Payment Reminder */}
          {servicePaymentInfo && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">
                  Service Payment Due
                </h4>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                The following amount will be collected at the clinic during your
                visit:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Service Fee:</span>
                  <span className="font-medium">
                    {formatCurrency(servicePaymentInfo.serviceAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">GST (18%):</span>
                  <span className="font-medium">
                    {formatCurrency(servicePaymentInfo.serviceTax)}
                  </span>
                </div>
                <div className="border-t border-yellow-200 pt-1 flex justify-between font-semibold">
                  <span className="text-yellow-900">Total Due at Clinic:</span>
                  <span className="text-yellow-800">
                    {formatCurrency(servicePaymentInfo.serviceTotal)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Payment due: {servicePaymentInfo.paymentDue}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p className="mt-1">Please keep this receipt for your records.</p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-4">
            <PDFDownloadLink
              document={
                <ReceiptDocument
                  appointmentData={appointmentData}
                  paymentData={paymentData}
                  servicePaymentInfo={servicePaymentInfo}
                />
              }
              fileName={fileName}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              {({ loading }) => (
                <>
                  <Download className="w-5 h-5" />
                  {loading ? "Preparing PDF..." : "Download PDF Receipt"}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
