/**
 * Payment Configuration for React Native
 * Uses same credentials as patient portal
 */

export interface PaymentGatewayConfig {
  razorpayKey: string;
  razorpaySecret: string;
  environment: 'test' | 'production';
}

/**
 * Get Razorpay configuration (same as patient portal)
 */
export const getRazorpayConfig = (): PaymentGatewayConfig => {
  return {
    razorpayKey: 'rzp_test_RbbZlQKYdQ6oAe',
    razorpaySecret: 'j0YrTVr6k1I204JOkhcSMT2A',
    environment: 'test'
  };
};

/**
 * Get appointment reservation fee
 */
export const getAppointmentFee = (): number => {
  return 500;
};