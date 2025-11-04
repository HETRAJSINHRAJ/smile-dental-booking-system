import { formatCurrency } from '../localization/currency';

export interface PaymentGatewayConfig {
  gateway: 'razorpay' | 'payu' | 'stripe';
  key: string;
  secret?: string;
  environment: 'test' | 'production';
  webhookSecret?: string;
}

export interface PaymentOrder {
  amount: number; // in INR paise (for Razorpay) or rupees (for others)
  currency: 'INR';
  receipt: string;
  notes?: Record<string, string>;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
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

export class PaymentGateway {
  private config: PaymentGatewayConfig;
  private scriptLoaded: boolean = false;

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  /**
   * Load payment gateway script dynamically
   */
  private async loadScript(): Promise<void> {
    if (this.scriptLoaded) return;

    const scripts = {
      razorpay: 'https://checkout.razorpay.com/v1/checkout.js',
      payu: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
      stripe: 'https://js.stripe.com/v3/'
    };

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scripts[this.config.gateway];
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${this.config.gateway} script`));
      document.head.appendChild(script);
    });
  }

  /**
   * Create payment order
   */
  async createOrder(orderData: PaymentOrder): Promise<string> {
    try {
      // In a real implementation, this would call your backend API
      // which would communicate with the payment gateway
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          gateway: this.config.gateway,
          environment: this.config.environment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  /**
   * Process payment with Razorpay
   */
  private async processRazorpayPayment(orderData: PaymentOrder, orderId: string): Promise<PaymentResponse> {
    await this.loadScript();

    return new Promise((resolve) => {
      const options = {
        key: this.config.key,
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: 'Dental Clinic',
        description: 'Dental Appointment Payment',
        order_id: orderId,
        handler: function (response: any) {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: orderData.amount,
            currency: orderData.currency,
            status: 'success',
            gatewayResponse: response
          });
        },
        prefill: {
          name: orderData.customerDetails.name,
          email: orderData.customerDetails.email,
          contact: orderData.customerDetails.phone
        },
        notes: orderData.notes,
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            resolve({
              success: false,
              amount: orderData.amount,
              currency: orderData.currency,
              status: 'failed',
              errorMessage: 'Payment cancelled by user'
            });
          }
        }
      };

      // @ts-ignore - Razorpay will be available after script load
      const razorpay = new Razorpay(options);
      razorpay.open();
    });
  }

  /**
   * Process payment with Stripe (INR)
   */
  private async processStripePayment(orderData: PaymentOrder): Promise<PaymentResponse> {
    await this.loadScript();

    // @ts-ignore - Stripe will be available after script load
    const stripe = Stripe(this.config.key);

    try {
      // Create checkout session on backend
      const response = await fetch('/api/payments/create-stripe-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderData.amount,
          currency: orderData.currency,
          customerEmail: orderData.customerDetails.email,
          customerName: orderData.customerDetails.name,
          receipt: orderData.receipt,
          notes: orderData.notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        throw new Error(error.message);
      }

      // This will only be reached if there's an error in redirectToCheckout
      return {
        success: false,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'failed',
        errorMessage: error?.message || 'Failed to redirect to Stripe checkout'
      };
    } catch (error) {
      return {
        success: false,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Process payment with PayU
   */
  private async processPayUPayment(orderData: PaymentOrder): Promise<PaymentResponse> {
    // PayU implementation would require server-side integration
    // This is a simplified version
    try {
      const response = await fetch('/api/payments/initiate-payu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: this.config.key,
          amount: orderData.amount,
          productinfo: 'Dental Appointment Payment',
          firstname: orderData.customerDetails.name,
          email: orderData.customerDetails.email,
          phone: orderData.customerDetails.phone,
          surl: `${window.location.origin}/payment/success`,
          furl: `${window.location.origin}/payment/failure`,
          environment: this.config.environment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate PayU payment');
      }

      const data = await response.json();
      
      // Redirect to PayU payment page
      window.location.href = data.paymentUrl;

      return {
        success: true,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'pending',
        orderId: data.txnid
      };
    } catch (error) {
      return {
        success: false,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'PayU payment initiation failed'
      };
    }
  }

  /**
   * Main payment processing method
   */
  async processPayment(orderData: PaymentOrder): Promise<PaymentResponse> {
    try {
      // Validate order data
      if (!orderData.amount || orderData.amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      if (!orderData.customerDetails.name || !orderData.customerDetails.email) {
        throw new Error('Customer details are required');
      }

      // Create order first
      const orderId = await this.createOrder(orderData);

      // Process payment based on gateway
      switch (this.config.gateway) {
        case 'razorpay':
          return await this.processRazorpayPayment(orderData, orderId);
        case 'stripe':
          return await this.processStripePayment(orderData);
        case 'payu':
          return await this.processPayUPayment(orderData);
        default:
          throw new Error('Unsupported payment gateway');
      }
    } catch (error) {
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
   * Verify payment signature (for Razorpay)
   */
  async verifyPayment(verificationData: PaymentVerificationData): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...verificationData,
          gateway: this.config.gateway
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount,
          reason,
          gateway: this.config.gateway
        }),
      });

      if (!response.ok) {
        throw new Error('Refund request failed');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}?gateway=${this.config.gateway}`);
      
      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Get payment status error:', error);
      return 'unknown';
    }
  }
}

/**
 * Factory function to create payment gateway instance
 */
export function createPaymentGateway(config: PaymentGatewayConfig): PaymentGateway {
  return new PaymentGateway(config);
}

/**
 * Get supported payment methods for Indian users
 */
export function getSupportedPaymentMethods(): Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  supported: boolean;
}> {
  return [
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm',
      icon: '📱',
      supported: true
    },
    {
      id: 'cards',
      name: 'Credit/Debit Cards',
      description: 'Visa, Mastercard, RuPay cards',
      icon: '💳',
      supported: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major Indian banks',
      icon: '🏦',
      supported: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      description: 'Paytm, PhonePe, Amazon Pay',
      icon: '👛',
      supported: true
    }
  ];
}

/**
 * Format amount for display in Indian currency
 */
export function formatPaymentAmount(amountInPaise: number): string {
  const amountInRupees = amountInPaise / 100;
  return formatCurrency(amountInRupees);
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