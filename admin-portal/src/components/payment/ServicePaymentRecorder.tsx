import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/localization/currency';
import { format } from 'date-fns';
import { CheckCircle, CreditCard, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { paymentAuditService } from '@/lib/payment/paymentAudit';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceName: string;
  providerName: string;
  appointmentDate: Timestamp;
  startTime: string;
  endTime: string;
  status: string;
  servicePaymentStatus: 'pending' | 'paid' | 'partial';
  servicePaymentAmount: number;
  servicePaymentDate?: Timestamp;
  servicePaymentMethod?: string;
  servicePaymentTransactionId?: string;
  servicePaymentNotes?: string;
}

interface ServicePaymentRecorderProps {
  appointment: Appointment;
  onPaymentRecorded: () => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: <DollarSign className="w-4 h-4" />, requiresTransactionId: false },
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="w-4 h-4" />, requiresTransactionId: true },
  { id: 'upi', name: 'UPI', icon: <CheckCircle className="w-4 h-4" />, requiresTransactionId: true },
  { id: 'other', name: 'Other', icon: <DollarSign className="w-4 h-4" />, requiresTransactionId: false }
];

export function ServicePaymentRecorder({ appointment, onPaymentRecorded }: ServicePaymentRecorderProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>(appointment.servicePaymentAmount.toString());
  const [transactionId, setTransactionId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!amountPaid) {
      newErrors.amountPaid = 'Amount is required';
    } else {
      const paidAmount = parseFloat(amountPaid);
      if (isNaN(paidAmount) || paidAmount <= 0) {
        newErrors.amountPaid = 'Please enter a valid amount greater than 0';
      } else if (paidAmount > appointment.servicePaymentAmount) {
        newErrors.amountPaid = `Amount cannot exceed ${appointment.servicePaymentAmount}`;
      }
    }

    // Check if transaction ID is required for the selected payment method
    const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    if (selectedMethod?.requiresTransactionId && !transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required for this payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const paidAmount = parseFloat(amountPaid);
    setLoading(true);

    try {
      // Update appointment with payment details
      const appointmentRef = doc(db, 'appointments', appointment.id);
      const updateData = {
        servicePaymentStatus: 'paid',
        servicePaymentAmount: paidAmount,
        servicePaymentDate: Timestamp.now(),
        servicePaymentMethod: paymentMethod,
        servicePaymentTransactionId: transactionId || null,
        servicePaymentNotes: notes || null,
        status: 'completed'
      };

      await updateDoc(appointmentRef, updateData);

      // Log the payment in audit trail
      await paymentAuditService.logPaymentEvent({
        appointmentId: appointment.id,
        patientId: appointment.userEmail,
        patientName: appointment.userName,
        patientEmail: appointment.userEmail,
        serviceName: appointment.serviceName,
        providerName: appointment.providerName,
        paymentType: 'service_payment',
        action: 'payment_success',
        amount: paidAmount,
        currency: 'INR',
        paymentMethod: paymentMethod,
        transactionId: transactionId || undefined,
        gatewayResponse: {
          appointmentId: appointment.id,
          paymentMethod,
          amount: paidAmount,
          transactionId: transactionId || null,
          notes: notes || null,
          recordedBy: user?.email || 'admin'
        }
      });

      // Create audit log entry for service payment
      if (user) {
        const { auditLogger } = await import('@/lib/audit');
        await auditLogger.logAction(
          user.uid,
          user.displayName || user.email || 'Admin',
          user.email || '',
          'admin',
          'update',
          'appointment',
          appointment.id,
          { servicePaymentStatus: appointment.servicePaymentStatus },
          { servicePaymentStatus: 'paid', servicePaymentAmount: paidAmount },
          { ipAddress: '', userAgent: '' },
          `Service payment of ₹${paidAmount} recorded via ${paymentMethod}${transactionId ? ` (Transaction ID: ${transactionId})` : ''}`
        );
      }

      toast.success('Service payment recorded successfully!');
      onPaymentRecorded();
    } catch (error) {
      console.error('Error recording service payment:', error);
      toast.error('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const appointmentDate = appointment.appointmentDate.toDate();
  const isOverdue = appointmentDate < new Date() && appointment.servicePaymentStatus === 'pending';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Record Service Payment</CardTitle>
            <CardDescription>
              Record payment for {appointment.serviceName} on {format(appointmentDate, 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          <Badge 
            variant={appointment.servicePaymentStatus === 'paid' ? 'default' : 'destructive'}
            className="capitalize"
          >
            {appointment.servicePaymentStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Patient:</span>
              <span className="font-medium">{appointment.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Service:</span>
              <span className="font-medium">{appointment.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Provider:</span>
              <span className="font-medium">{appointment.providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date & Time:</span>
              <span className="font-medium">
                {format(appointmentDate, 'MMM dd, yyyy')} at {appointment.startTime}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">Service Fee:</span>
              <span className="font-bold text-lg">{formatCurrency(appointment.servicePaymentAmount)}</span>
            </div>
          </div>

          {isOverdue && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This appointment is overdue for payment. Please collect the service fee immediately.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method *</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => {
                setPaymentMethod(value);
                setErrors(prev => ({ ...prev, paymentMethod: '' }));
              }} 
              required
            >
              <SelectTrigger id="payment-method" className={errors.paymentMethod ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span>{method.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-xs text-red-500">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Amount Paid */}
          <div className="space-y-2">
            <Label htmlFor="amount-paid">Amount Paid *</Label>
            <Input
              id="amount-paid"
              type="number"
              step="0.01"
              min="0"
              max={appointment.servicePaymentAmount}
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                setErrors(prev => ({ ...prev, amountPaid: '' }));
              }}
              placeholder={`Enter amount (max: ${formatCurrency(appointment.servicePaymentAmount)})`}
              required
              disabled={loading}
              className={errors.amountPaid ? 'border-red-500' : ''}
            />
            {errors.amountPaid && (
              <p className="text-xs text-red-500">{errors.amountPaid}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Maximum amount: {formatCurrency(appointment.servicePaymentAmount)}
            </p>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transaction-id">
              Transaction ID {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.requiresTransactionId ? '*' : '(Optional)'}
            </Label>
            <Input
              id="transaction-id"
              type="text"
              value={transactionId}
              onChange={(e) => {
                setTransactionId(e.target.value);
                setErrors(prev => ({ ...prev, transactionId: '' }));
              }}
              placeholder="Enter transaction reference number"
              disabled={loading}
              className={errors.transactionId ? 'border-red-500' : ''}
            />
            {errors.transactionId && (
              <p className="text-xs text-red-500">{errors.transactionId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.requiresTransactionId 
                ? 'Transaction ID is required for card/UPI payments' 
                : 'Optional for cash payments'}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about this payment..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || appointment.servicePaymentStatus === 'paid'}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording Payment...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Record Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}