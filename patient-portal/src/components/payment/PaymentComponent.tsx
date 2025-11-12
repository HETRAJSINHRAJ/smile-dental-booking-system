import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/localization/currency';
import { 
  usePayment, 
  usePaymentGatewayConfig, 
  usePaymentAmount, 
  usePaymentValidation 
} from '@/lib/payment/usePayment';
import { PaymentOrder } from '@/lib/payment/paymentGateway';
import { paymentAuditService } from '@/lib/payment/paymentAudit';

interface PaymentComponentProps {
  amount: number;
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

export function PaymentComponent({
  amount,
  serviceName,
  customerDetails,
  paymentDescription,
  onSuccess,
  onError,
  onCancel
}: PaymentComponentProps) {
  const [processing, setProcessing] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string>('');
  
  const gatewayConfig = usePaymentGatewayConfig();
  const { processPayment, loading, error } = usePayment({
    ...gatewayConfig,
    gateway: 'razorpay'
  }, {
    onSuccess: async (paymentResponse) => {
      // Log successful payment
      if (appointmentId) {
        await paymentAuditService.logPaymentEvent({
          appointmentId,
          patientId: customerDetails.email,
          patientName: customerDetails.name,
          patientEmail: customerDetails.email,
          serviceName,
          providerName: 'Dental Clinic',
          paymentType: 'appointment_reservation',
          action: 'payment_success',
          amount: amountBreakdown.totalAmount,
          currency: 'INR',
          transactionId: paymentResponse.paymentId || paymentResponse.orderId,
          gatewayResponse: paymentResponse
        });
      }
      onSuccess(paymentResponse);
    },
    onError: async (errorMessage) => {
      // Log failed payment
      if (appointmentId) {
        await paymentAuditService.logPaymentEvent({
          appointmentId,
          patientId: customerDetails.email,
          patientName: customerDetails.name,
          patientEmail: customerDetails.email,
          serviceName,
          providerName: 'Dental Clinic',
          paymentType: 'appointment_reservation',
          action: 'payment_failed',
          amount: amountBreakdown.totalAmount,
          currency: 'INR',
          errorMessage
        });
      }
      onError(errorMessage);
    },
    onCancel: async () => {
      // Log cancelled payment
      if (appointmentId) {
        await paymentAuditService.logPaymentEvent({
          appointmentId,
          patientId: customerDetails.email,
          patientName: customerDetails.name,
          patientEmail: customerDetails.email,
          serviceName,
          providerName: 'Dental Clinic',
          paymentType: 'appointment_reservation',
          action: 'payment_cancelled',
          amount: amountBreakdown.totalAmount,
          currency: 'INR'
        });
      }
      onCancel();
    }
  });
  
  const { calculateAmount } = usePaymentAmount();
  const { validatePaymentData } = usePaymentValidation();

  // Calculate amounts with GST
  const amountBreakdown = calculateAmount(amount, 0.18, 0);

  const handlePayment = async () => {
    setProcessing(true);
    
    // Generate appointment ID for audit logging
    const generatedAppointmentId = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setAppointmentId(generatedAppointmentId);
    
    const orderData: PaymentOrder = {
      amount: Math.round(amountBreakdown.totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: generatedAppointmentId,
      notes: {
        service: serviceName,
        payment_description: paymentDescription || 'Appointment booking payment',
        appointment_id: generatedAppointmentId
      },
      customerDetails
    };

    // Log payment initiation
    await paymentAuditService.logPaymentEvent({
      appointmentId: generatedAppointmentId,
      patientId: customerDetails.email,
      patientName: customerDetails.name,
      patientEmail: customerDetails.email,
      serviceName,
      providerName: 'Dental Clinic',
      paymentType: 'appointment_reservation',
      action: 'payment_initiated',
      amount: amountBreakdown.totalAmount,
      currency: 'INR'
    });

    // Validate payment data
    const validation = validatePaymentData(orderData);
    if (!validation.valid) {
      onError(validation.errors[0]);
      setProcessing(false);
      return;
    }

    await processPayment(orderData);
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Amount Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>
            {paymentDescription || 'Review your payment details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>{formatCurrency(amountBreakdown.baseAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{formatCurrency(amountBreakdown.taxAmount)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(amountBreakdown.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <AlertDescription className="text-sm">
          🔒 Your payment information is secure. We use industry-standard encryption and comply with 
          RBI guidelines for payment processing in India. All transactions are processed in Indian Rupees (INR).
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading || processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading || processing}
          className="flex-1"
        >
          {loading || processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amountBreakdown.totalAmount)}`
          )}
        </Button>
      </div>

      {/* Payment Support */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Need help with payment? Contact support at</p>
        <p className="font-medium">support@dentalclinic.in or +91-12345-67890</p>
      </div>
    </div>
  );
}

/**
 * Payment Success Component
 */
export function PaymentSuccess({ paymentResponse }: { paymentResponse: any }) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="text-green-800">Payment Successful! 🎉</CardTitle>
        <CardDescription className="text-green-700">
          Your payment has been processed successfully
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-green-700">Payment ID:</span>
            <span className="font-mono text-green-800">{paymentResponse.paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Amount Paid:</span>
            <span className="font-semibold text-green-800">
              {formatCurrency(paymentResponse.amount / 100)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Status:</span>
            <Badge variant="default" className="bg-green-600">Success</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Payment Error Component
 */
export function PaymentError({ error }: { error: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        <div className="font-semibold">Payment Failed</div>
        <div className="mt-1">{error}</div>
        <div className="mt-2 text-sm">
          Please try again or contact support if the issue persists.
        </div>
      </AlertDescription>
    </Alert>
  );
}