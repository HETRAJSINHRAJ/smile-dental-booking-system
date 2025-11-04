export interface PaymentConfig {
  appointmentReservationFee: number;
  enableServicePaymentOnline: boolean;
  taxRate: number;
  convenienceFee: number;
}

export const getPaymentConfig = (): PaymentConfig => {
  return {
    appointmentReservationFee: parseInt(process.env.NEXT_PUBLIC_APPOINTMENT_RESERVATION_FEE || '500'),
    enableServicePaymentOnline: process.env.NEXT_PUBLIC_ENABLE_SERVICE_PAYMENT_ONLINE === 'true',
    taxRate: 0.18, // 18% GST
    convenienceFee: 0
  };
};

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
      ? (appointmentFee + appointmentTax + servicePrice + serviceTax)
      : (appointmentFee + appointmentTax)
  };
};

export const getPaymentDescription = (config: PaymentConfig) => {
  if (config.enableServicePaymentOnline) {
    return 'Complete payment for appointment reservation and service';
  } else {
    return 'Pay appointment reservation fee only. Service payment to be collected at clinic.';
  }
};