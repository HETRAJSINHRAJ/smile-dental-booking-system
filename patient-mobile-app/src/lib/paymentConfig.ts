import {
  APPOINTMENT_RESERVATION_FEE,
  ENABLE_SERVICE_PAYMENT_ONLINE,
  GST_TAX_RATE,
  CONVENIENCE_FEE,
} from '@env';

/**
 * Payment Configuration
 * These values should match the web app configuration
 */

export interface PaymentConfig {
  appointmentReservationFee: number; // Fixed amount in INR
  enableServicePaymentOnline: boolean;
  taxRate: number; // 18% GST
  convenienceFee: number;
}

/**
 * Get payment configuration from environment variables
 * Defaults match the web app configuration
 */
export const getPaymentConfig = (): PaymentConfig => {
  // Parse environment variables with fallback defaults
  const appointmentFee = APPOINTMENT_RESERVATION_FEE 
    ? parseInt(APPOINTMENT_RESERVATION_FEE, 10) 
    : 500;
  
  const enableServicePayment = ENABLE_SERVICE_PAYMENT_ONLINE === 'true';
  
  const taxRate = GST_TAX_RATE 
    ? parseFloat(GST_TAX_RATE) 
    : 0.18;
  
  const convenienceFee = CONVENIENCE_FEE 
    ? parseFloat(CONVENIENCE_FEE) 
    : 0;

  return {
    // Fixed appointment reservation fee (not percentage)
    // From: APPOINTMENT_RESERVATION_FEE env variable
    // Default: 500 INR (matches NEXT_PUBLIC_APPOINTMENT_RESERVATION_FEE)
    appointmentReservationFee: appointmentFee,
    
    // Whether to enable online payment for service fees
    // From: ENABLE_SERVICE_PAYMENT_ONLINE env variable
    // Default: false (service payment collected at clinic)
    enableServicePaymentOnline: enableServicePayment,
    
    // GST tax rate
    // From: GST_TAX_RATE env variable
    // Default: 0.18 (18% GST)
    taxRate: taxRate,
    
    // Convenience fee (if any)
    // From: CONVENIENCE_FEE env variable
    // Default: 0 (no convenience fee)
    convenienceFee: convenienceFee,
  };
};

/**
 * Format payment breakdown for display
 * Calculates appointment fee, tax, and total
 */
export const formatPaymentBreakdown = (servicePrice: number, config: PaymentConfig) => {
  const appointmentFee = config.appointmentReservationFee;
  const serviceTax = servicePrice * config.taxRate;
  const appointmentTax = appointmentFee * config.taxRate;

  return {
    appointmentReservationFee: appointmentFee,
    appointmentTax: appointmentTax,
    appointmentTotal: appointmentFee + appointmentTax,
    servicePrice: servicePrice,
    serviceTax: serviceTax,
    serviceTotal: servicePrice + serviceTax,
    totalAmount: config.enableServicePaymentOnline
      ? appointmentFee + appointmentTax + servicePrice + serviceTax
      : appointmentFee + appointmentTax,
  };
};

/**
 * Get payment description based on configuration
 */
export const getPaymentDescription = (config: PaymentConfig): string => {
  if (config.enableServicePaymentOnline) {
    return 'Complete payment for appointment reservation and service';
  } else {
    return 'Pay appointment reservation fee only. Service payment to be collected at clinic.';
  }
};
