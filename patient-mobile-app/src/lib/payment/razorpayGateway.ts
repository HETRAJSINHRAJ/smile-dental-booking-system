/**
 * Razorpay Payment Gateway Integration for React Native
 * Handles payment processing for appointment reservations
 * Uses react-native-razorpay package for direct Razorpay integration
 */

import RazorpayCheckout from 'react-native-razorpay';

/**
 * Base64 encode for React Native (Buffer alternative)
 */
function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += (i - 2) < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += (i - 1) < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
}

export interface RazorpayConfig {
  key: string;
  secret: string;
  environment: 'test' | 'production';
}

export interface PaymentOrder {
  amount: number; // Amount in paise (e.g., 50000 for ₹500)
  currency: string; // 'INR'
  receipt: string; // Unique receipt ID
  notes?: Record<string, string>;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface SimplePaymentConfig {
  razorpayKey: string;
  razorpaySecret: string;
  environment: 'test' | 'production';
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  gatewayResponse?: any;
}

export interface PaymentVerificationData {
  paymentId: string;
  orderId: string;
  signature?: string;
  amount: number;
}

/**
 * Razorpay Payment Gateway Class
 * Handles all payment operations for the mobile app
 */
export class RazorpayGateway {
  private config: RazorpayConfig;

  constructor(config: RazorpayConfig) {
    this.config = config;
  }

  /**
   * Create payment order via Razorpay API (same as patient portal)
   */
  async createOrder(orderData: PaymentOrder): Promise<string> {
    try {
      // Validate credentials
      if (!this.config.key || !this.config.secret || this.config.key.trim() === '' || this.config.secret.trim() === '') {
        console.error('Config validation failed:', {
          hasKey: !!this.config.key,
          hasSecret: !!this.config.secret,
          keyLength: this.config.key?.length,
          secretLength: this.config.secret?.length
        });
        throw new Error('Razorpay key and secret are required');
      }
      
      const auth = base64Encode(`${this.config.key}:${this.config.secret}`);
      console.log('Using Razorpay key:', this.config.key.substring(0, 8) + '...');
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: orderData.amount,
          currency: orderData.currency,
          receipt: orderData.receipt,
          notes: orderData.notes || {}
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API error: ${errorText}`);
      }

      const rpOrder = await response.json();
      console.log('Razorpay order created:', {
        orderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        status: rpOrder.status
      });

      return rpOrder.id;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Process payment using react-native-razorpay package
   * Opens Razorpay checkout and handles payment response
   */
  async processPayment(orderData: PaymentOrder, orderId?: string): Promise<PaymentResponse> {
    try {
      // Validate order data
      if (!orderData.amount || orderData.amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      if (!orderData.customerDetails.name || !orderData.customerDetails.email) {
        throw new Error('Customer details are required');
      }

      // Generate order ID if not provided
      const paymentOrderId = orderId || await this.createOrder(orderData);

      // Razorpay checkout options (same as patient portal)
      const options = {
        description: 'Appointment Reservation',
        image: 'https://your-logo-url',
        currency: orderData.currency,
        key: this.config.key,
        amount: orderData.amount,
        name: 'Dental Clinic',
        order_id: paymentOrderId, // Use real Razorpay order ID
        prefill: {
          email: orderData.customerDetails.email,
          contact: orderData.customerDetails.phone,
          name: orderData.customerDetails.name
        },
        notes: orderData.notes || {},
        theme: { color: '#3399cc' }
      };

      console.log('Opening Razorpay checkout with options:', options);

      return new Promise((resolve, reject) => {
        RazorpayCheckout.open(options)
          .then((data) => {
            console.log('Payment successful:', data);
            resolve({
              success: true,
              paymentId: data.razorpay_payment_id,
              orderId: data.razorpay_order_id || paymentOrderId,
              amount: orderData.amount,
              currency: orderData.currency,
              status: 'success',
              gatewayResponse: data
            });
          })
          .catch((error) => {
            console.error('Payment failed:', error);
            reject({
              success: false,
              amount: orderData.amount,
              currency: orderData.currency,
              status: 'failed',
              errorMessage: error.description || error.message || 'Payment failed'
            });
          });
      });
    } catch (error) {
      console.error('Error in processPayment:', error);
      return {
        success: false,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Verify payment signature (mobile app - simplified)
   */
  async verifyPayment(verificationData: PaymentVerificationData): Promise<boolean> {
    // For mobile app, we'll consider payment successful if we have paymentId
    // In production, implement server-side verification
    console.log('Payment verification (mobile):', verificationData);
    return !!verificationData.paymentId;
  }

  /**
   * Refund payment (mobile app - not supported)
   */
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<boolean> {
    console.log('Refund not supported in mobile app:', { paymentId, amount, reason });
    throw new Error('Refunds must be processed through admin portal');
  }

  /**
   * Get payment status (mobile app - simplified)
   */
  async getPaymentStatus(paymentId: string): Promise<string> {
    console.log('Payment status check (mobile):', paymentId);
    // For mobile app, return success if paymentId exists
    return paymentId ? 'success' : 'unknown';
  }
}

/**
 * Convert rupees to paise (for Razorpay)
 */
export function convertRupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 */
export function convertPaiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Generate unique receipt ID
 */
export function generateReceiptId(): string {
  return `rcpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Simple payment processing function (like patient portal)
 */
export async function processReservationPayment(
  amount: number,
  customerDetails: PaymentOrder['customerDetails']
): Promise<PaymentResponse> {
  const config = {
    key: 'rzp_test_RbbZlQKYdQ6oAe',
    secret: 'j0YrTVr6k1I204JOkhcSMT2A',
    environment: 'test' as const
  };
  
  console.log('Creating gateway with config:', {
    hasKey: !!config.key,
    hasSecret: !!config.secret,
    keyPrefix: config.key.substring(0, 8)
  });
  
  const gateway = new RazorpayGateway(config);
  
  const orderData: PaymentOrder = {
    amount: convertRupeesToPaise(amount),
    currency: 'INR',
    receipt: generateReceiptId(),
    customerDetails,
    notes: {
      service: 'Appointment Reservation',
      payment_type: 'reservation_fee'
    }
  };

  return gateway.processPayment(orderData);
}
