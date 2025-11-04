import { useState, useCallback } from 'react';
import { PaymentGateway, PaymentOrder, PaymentResponse, PaymentGatewayConfig } from './paymentGateway';
import { toast } from 'sonner';

export interface UsePaymentOptions {
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export interface UsePaymentReturn {
  processPayment: (orderData: PaymentOrder) => Promise<void>;
  verifyPayment: (paymentId: string, orderId: string, signature?: string) => Promise<boolean>;
  refundPayment: (paymentId: string, amount: number, reason?: string) => Promise<boolean>;
  getPaymentStatus: (paymentId: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * React hook for payment processing
 */
export function usePayment(
  gatewayConfig: PaymentGatewayConfig,
  options: UsePaymentOptions = {}
): UsePaymentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentGateway] = useState(() => new PaymentGateway(gatewayConfig));

  const processPayment = useCallback(async (orderData: PaymentOrder) => {
    setLoading(true);
    setError(null);

    try {
      const response = await paymentGateway.processPayment(orderData);

      if (response.success) {
        toast.success('Payment processed successfully!');
        options.onSuccess?.(response);
      } else {
        const errorMsg = response.errorMessage || 'Payment failed';
        setError(errorMsg);
        toast.error(errorMsg);
        options.onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMsg);
      toast.error(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [paymentGateway, options]);

  const verifyPayment = useCallback(async (paymentId: string, orderId: string, signature?: string) => {
    try {
      const verified = await paymentGateway.verifyPayment({
        paymentId,
        orderId,
        signature,
        amount: 0 // Amount verification handled server-side
      });
      
      if (verified) {
        toast.success('Payment verified successfully!');
      } else {
        toast.error('Payment verification failed');
      }
      
      return verified;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment verification failed';
      toast.error(errorMsg);
      return false;
    }
  }, [paymentGateway]);

  const refundPayment = useCallback(async (paymentId: string, amount: number, reason?: string) => {
    try {
      const refunded = await paymentGateway.refundPayment(paymentId, amount, reason);
      
      if (refunded) {
        toast.success('Payment refunded successfully!');
      } else {
        toast.error('Refund failed');
      }
      
      return refunded;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Refund failed';
      toast.error(errorMsg);
      return false;
    }
  }, [paymentGateway]);

  const getPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      const status = await paymentGateway.getPaymentStatus(paymentId);
      return status;
    } catch (err) {
      return 'unknown';
    }
  }, [paymentGateway]);

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
 * Hook for payment gateway configuration
 */
export function usePaymentGatewayConfig(): PaymentGatewayConfig {
  // In a real app, this would come from environment variables or API
  const config: PaymentGatewayConfig = {
    gateway: 'razorpay', // Default to Razorpay for Indian market
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_1234567890',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
  };

  return config;
}

/**
 * Hook for payment amount calculation
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

  const formatAmountForGateway = (amountInRupees: number, gateway: 'razorpay' | 'payu' | 'stripe') => {
    switch (gateway) {
      case 'razorpay':
        return Math.round(amountInRupees * 100); // Convert to paise
      case 'stripe':
        return Math.round(amountInRupees * 100); // Convert to paise
      case 'payu':
        return amountInRupees; // PayU uses rupees
      default:
        return amountInRupees;
    }
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
  const validatePaymentData = (orderData: PaymentOrder): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!orderData.amount || orderData.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!orderData.customerDetails.name || orderData.customerDetails.name.trim().length < 2) {
      errors.push('Customer name is required and must be at least 2 characters');
    }

    if (!orderData.customerDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.customerDetails.email)) {
      errors.push('Valid email address is required');
    }

    if (!orderData.customerDetails.phone || orderData.customerDetails.phone.length < 10) {
      errors.push('Valid phone number is required');
    }

    if (!orderData.receipt || orderData.receipt.trim().length === 0) {
      errors.push('Receipt/Order ID is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const validateRefundAmount = (paidAmount: number, refundAmount: number): { valid: boolean; error?: string } => {
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