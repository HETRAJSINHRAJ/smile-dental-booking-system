/**
 * React Native Hook for Razorpay Payment Processing
 * Handles payment flow for appointment reservations
 */

import { useState, useCallback } from 'react';
import {
  RazorpayGateway,
  RazorpayConfig,
  PaymentOrder,
  PaymentResponse,
  generateReceiptId,
  convertRupeesToPaise
} from './razorpayGateway';

export interface UseRazorpayPaymentOptions {
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export interface UseRazorpayPaymentReturn {
  processPayment: (orderData: Omit<PaymentOrder, 'receipt'>) => Promise<void>;
  verifyPayment: (paymentId: string, orderId: string, signature?: string) => Promise<boolean>;
  refundPayment: (paymentId: string, amount: number, reason?: string) => Promise<boolean>;
  getPaymentStatus: (paymentId: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for Razorpay payment processing
 */
export function useRazorpayPayment(
  config: RazorpayConfig,
  options: UseRazorpayPaymentOptions = {}
): UseRazorpayPaymentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateway] = useState(() => new RazorpayGateway(config));

  const processPayment = useCallback(
    async (orderData: Omit<PaymentOrder, 'receipt'>) => {
      setLoading(true);
      setError(null);

      try {
        // Validate order data
        if (!orderData.amount || orderData.amount <= 0) {
          throw new Error('Invalid payment amount');
        }

        if (!orderData.customerDetails.name || !orderData.customerDetails.email) {
          throw new Error('Customer details are required');
        }

        // Generate receipt ID
        const receipt = generateReceiptId();

        // Create order on backend
        const orderId = await gateway.createOrder({
          ...orderData,
          receipt
        });

        // Process payment
        const response = await gateway.processPayment(
          {
            ...orderData,
            receipt
          },
          orderId
        );

        if (response.success) {
          options.onSuccess?.(response);
        } else {
          const errorMsg = response.errorMessage || 'Payment failed';
          setError(errorMsg);
          options.onError?.(errorMsg);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
        setError(errorMsg);
        options.onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [gateway, options]
  );

  const verifyPayment = useCallback(
    async (paymentId: string, orderId: string, signature?: string) => {
      try {
        const verified = await gateway.verifyPayment({
          paymentId,
          orderId,
          signature,
          amount: 0 // Amount verification handled server-side
        });

        if (!verified) {
          setError('Payment verification failed');
        }

        return verified;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Payment verification failed';
        setError(errorMsg);
        return false;
      }
    },
    [gateway]
  );

  const refundPayment = useCallback(
    async (paymentId: string, amount: number, reason?: string) => {
      try {
        const refunded = await gateway.refundPayment(paymentId, amount, reason);

        if (!refunded) {
          setError('Refund failed');
        }

        return refunded;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Refund failed';
        setError(errorMsg);
        return false;
      }
    },
    [gateway]
  );

  const getPaymentStatus = useCallback(
    async (paymentId: string) => {
      try {
        const status = await gateway.getPaymentStatus(paymentId);
        return status;
      } catch (err) {
        return 'unknown';
      }
    },
    [gateway]
  );

  return {
    processPayment,
    verifyPayment,
    refundPayment,
    getPaymentStatus,
    loading,
    error
  };
}

/**
 * Hook to get Razorpay configuration
 */
export function useRazorpayConfig(): RazorpayConfig {
  return {
    key: 'rzp_test_RbbZlQKYdQ6oAe',
    secret: 'j0YrTVr6k1I204JOkhcSMT2A',
    environment: 'test'
  };
}

/**
 * Hook for payment amount calculation and formatting
 */
export function usePaymentAmount() {
  const calculateAmount = (baseAmount: number, taxRate: number = 0.18, convenienceFee: number = 0) => {
    const taxAmount = baseAmount * taxRate;
    const totalAmount = baseAmount + taxAmount + convenienceFee;

    return {
      baseAmount,
      taxAmount,
      convenienceFee,
      totalAmount,
      taxRate,
      breakdown: {
        subtotal: baseAmount,
        tax: taxAmount,
        fee: convenienceFee,
        total: totalAmount
      }
    };
  };

  const formatAmountForGateway = (amountInRupees: number) => {
    return convertRupeesToPaise(amountInRupees);
  };

  return {
    calculateAmount,
    formatAmountForGateway
  };
}

/**
 * Hook for payment validation
 */
export function usePaymentValidation() {
  const validatePaymentData = (
    orderData: Omit<PaymentOrder, 'receipt'>
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!orderData.amount || orderData.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!orderData.customerDetails.name || orderData.customerDetails.name.trim().length < 2) {
      errors.push('Customer name is required and must be at least 2 characters');
    }

    if (
      !orderData.customerDetails.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.customerDetails.email)
    ) {
      errors.push('Valid email address is required');
    }

    if (!orderData.customerDetails.phone || orderData.customerDetails.phone.length < 10) {
      errors.push('Valid phone number is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const validateRefundAmount = (
    paidAmount: number,
    refundAmount: number
  ): { valid: boolean; error?: string } => {
    if (refundAmount <= 0) {
      return { valid: false, error: 'Refund amount must be greater than 0' };
    }

    if (refundAmount > paidAmount) {
      return { valid: false, error: 'Refund amount cannot exceed paid amount' };
    }

    return { valid: true };
  };

  return {
    validatePaymentData,
    validateRefundAmount
  };
}
