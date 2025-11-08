import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Card } from './Card';
import { useRazorpayPayment, usePaymentValidation } from '../lib/payment/useRazorpayPayment';
import { convertRupeesToPaise } from '../lib/payment/razorpayGateway';

interface PaymentModalProps {
  visible: boolean;
  amount: number; // Amount in rupees
  serviceName: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  paymentDescription?: string;
  onSuccess: (paymentResponse: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  amount,
  serviceName,
  customerDetails,
  paymentDescription,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [processing, setProcessing] = useState(false);

  const razorpayConfig = {
    key: 'rzp_test_RbbZlQKYdQ6oAe',
    secret: 'j0YrTVr6k1I204JOkhcSMT2A',
    environment: 'test' as const,
  };

  const { processPayment, loading, error } = useRazorpayPayment(razorpayConfig, {
    onSuccess: (response) => {
      setProcessing(false);
      onSuccess(response);
    },
    onError: (errorMsg) => {
      setProcessing(false);
      onError(errorMsg);
    },
    onCancel: () => {
      setProcessing(false);
      onCancel();
    },
  });

  const { validatePaymentData } = usePaymentValidation();

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: 'phone-portrait-outline',
    },
    {
      id: 'cards',
      name: 'Credit/Debit Cards',
      description: 'Visa, Mastercard, RuPay',
      icon: 'card-outline',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: 'business-outline',
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      description: 'Paytm, PhonePe, Amazon Pay',
      icon: 'wallet-outline',
    },
  ];

  const handlePayment = async () => {
    // Validate payment data
    const validation = validatePaymentData({
      amount: convertRupeesToPaise(amount),
      currency: 'INR',
      notes: {
        service: serviceName,
        payment_method: selectedMethod,
      },
      customerDetails,
    });

    if (!validation.valid) {
      Alert.alert('Validation Error', validation.errors[0]);
      return;
    }

    setProcessing(true);

    try {
      console.log('Processing payment with method:', selectedMethod);
      console.log('Amount:', amount, 'Paise:', convertRupeesToPaise(amount));
      
      await processPayment({
        amount: convertRupeesToPaise(amount),
        currency: 'INR',
        notes: {
          service: serviceName,
          payment_method: selectedMethod,
          payment_description: paymentDescription || 'Appointment booking payment',
        },
        customerDetails,
      });
    } catch (err) {
      setProcessing(false);
      const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
      console.error('Payment error:', errorMsg);
      onError(errorMsg);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} disabled={processing || loading}>
            <Icon name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Payment Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>Payment Summary</Text>
            </View>

            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Service</Text>
                <Text style={styles.summaryRowValue}>{serviceName}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Amount</Text>
                <Text style={styles.summaryRowValue}>₹{amount.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total Payable</Text>
                <Text style={styles.summaryTotalValue}>₹{amount.toFixed(2)}</Text>
              </View>
            </View>
          </Card>

          {/* Payment Method Selection */}
          <Card style={styles.methodsCard}>
            <View style={styles.methodsHeader}>
              <Text style={styles.methodsTitle}>Choose Payment Method</Text>
            </View>

            <View style={styles.methodsList}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodItem,
                    selectedMethod === method.id && styles.methodItemSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  disabled={processing || loading}
                >
                  <View style={styles.methodIcon}>
                    <Icon
                      name={method.icon}
                      size={24}
                      color={selectedMethod === method.id ? colors.secondary[500] : colors.text.primary}
                    />
                  </View>

                  <View style={styles.methodContent}>
                    <Text
                      style={[
                        styles.methodName,
                        selectedMethod === method.id && styles.methodNameSelected,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>

                  <View
                    style={[
                      styles.methodRadio,
                      selectedMethod === method.id && styles.methodRadioSelected,
                    ]}
                  >
                    {selectedMethod === method.id && (
                      <View style={styles.methodRadioDot} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Security Notice */}
          <Card style={styles.securityCard}>
            <View style={styles.securityContent}>
              <Icon name="shield-checkmark" size={20} color={colors.secondary[500]} />
              <Text style={styles.securityText}>
                Your payment information is secure. We use industry-standard encryption and comply with RBI guidelines.
              </Text>
            </View>
          </Card>

          {/* Error Display */}
          {error && (
            <Card style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Icon name="alert-circle" size={20} color={colors.error.main} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </Card>
          )}

          {/* Customer Details */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Billing Details</Text>
            </View>

            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{customerDetails.name}</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{customerDetails.email}</Text>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{customerDetails.phone}</Text>
              </View>
            </View>
          </Card>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={processing || loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.payButton,
              (processing || loading) && styles.payButtonDisabled,
            ]}
            onPress={handlePayment}
            disabled={processing || loading}
          >
            {processing || loading ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <>
                <Icon name="card" size={20} color={colors.neutral.white} />
                <Text style={styles.payButtonText}>Pay ₹{amount.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    borderBottomColor: colors.primary[50],
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
    paddingBottom: spacing.xl + 100,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  summaryHeader: {
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  summaryContent: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryRowLabel: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  summaryRowValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.primary[50],
    marginVertical: spacing.md,
  },
  summaryTotalLabel: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  summaryTotalValue: {
    ...typography.titleMedium,
    color: colors.secondary[500],
    fontWeight: '700',
  },
  methodsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  methodsHeader: {
    marginBottom: spacing.md,
  },
  methodsTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  methodsList: {
    gap: spacing.md,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.default,
    borderWidth: 2,
    borderColor: colors.primary[100],
  },
  methodItemSelected: {
    borderColor: colors.secondary[500],
    backgroundColor: colors.secondary[50],
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    ...typography.titleSmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodNameSelected: {
    color: colors.secondary[500],
  },
  methodDescription: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  methodRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioSelected: {
    borderColor: colors.secondary[500],
  },
  methodRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary[500],
  },
  securityCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.secondary[50],
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  securityText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  errorCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.error.light,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  errorText: {
    ...typography.labelSmall,
    color: colors.error.main,
    flex: 1,
    lineHeight: 18,
  },
  detailsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  detailsHeader: {
    marginBottom: spacing.md,
  },
  detailsTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  detailsList: {
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.primary[50],
    marginVertical: spacing.sm,
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
  payButton: {
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
  payButtonDisabled: {
    backgroundColor: colors.primary[200],
    opacity: 0.5,
  },
  payButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default PaymentModal;
