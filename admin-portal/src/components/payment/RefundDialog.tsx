import React, { useState } from 'react';
import {
  StandardizedDialog,
  StandardizedDialogContent,
  StandardizedDialogDescription,
  StandardizedDialogHeader,
  StandardizedDialogTitle,
  StandardizedDialogBody,
  StandardizedDialogFooter,
} from '@/components/ui/standardized-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/localization/currency';
import { AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment } from '@/types/shared';

interface RefundDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefundSuccess: () => void;
}

export function RefundDialog({ appointment, open, onOpenChange, onRefundSuccess }: RefundDialogProps) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(appointment.paymentAmount.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    const refundAmount = parseFloat(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (refundAmount > appointment.paymentAmount) {
      toast.error('Refund amount cannot exceed the payment amount');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          amount: refundAmount,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      toast.success('Refund processed successfully! 💰');
      onRefundSuccess();
      onOpenChange(false);
      setReason('');
      setAmount(appointment.paymentAmount.toString());
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setAmount(appointment.paymentAmount.toString());
    onOpenChange(false);
  };

  return (
    <StandardizedDialog open={open} onOpenChange={onOpenChange}>
      <StandardizedDialogContent size="lg">
        <StandardizedDialogHeader>
          <StandardizedDialogTitle>Process Refund</StandardizedDialogTitle>
          <StandardizedDialogDescription>
            Issue a refund for appointment #{appointment.confirmationNumber || appointment.id.slice(0, 8)}
          </StandardizedDialogDescription>
        </StandardizedDialogHeader>

        <form onSubmit={handleSubmit}>
          <StandardizedDialogBody className="space-y-6">
            {/* Appointment Details */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-medium">{appointment.userName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Amount:</span>
                <span className="font-medium">{formatCurrency(appointment.paymentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-medium capitalize">{appointment.paymentStatus}</span>
              </div>
              {appointment.paymentTransactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">{appointment.paymentTransactionId}</span>
                </div>
              )}
            </div>

            {/* Warning Alert */}
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. The refund will be processed immediately and the patient will be notified.
              </AlertDescription>
            </Alert>

            {/* Refund Amount */}
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={appointment.paymentAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  placeholder="Enter refund amount"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum refundable amount: {formatCurrency(appointment.paymentAmount)}
              </p>
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason for Refund *</Label>
              <Textarea
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this refund is being issued..."
                rows={4}
                required
                disabled={loading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This reason will be logged in the audit trail and included in the notification to the patient.
              </p>
            </div>
          </StandardizedDialogBody>

          <StandardizedDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Refund...
                </>
              ) : (
                'Process Refund'
              )}
            </Button>
          </StandardizedDialogFooter>
        </form>
      </StandardizedDialogContent>
    </StandardizedDialog>
  );
}
