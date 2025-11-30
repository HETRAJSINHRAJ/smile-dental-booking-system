/**
 * Google Analytics 4 Configuration - Patient Portal
 */

import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        siteSpeedSampleRate: 100,
      },
    });
    console.log('✅ Google Analytics initialized');
  } else {
    console.warn('⚠️  GA_MEASUREMENT_ID not configured');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Booking funnel tracking
export const trackBookingStep = (step: string, details?: Record<string, any>) => {
  trackEvent('Booking', step, JSON.stringify(details));
};

export const trackServiceView = (serviceId: string, serviceName: string) => {
  trackEvent('Service', 'View', serviceName, undefined);
};

export const trackProviderView = (providerId: string, providerName: string) => {
  trackEvent('Provider', 'View', providerName, undefined);
};

export const trackBookingStarted = (serviceId: string) => {
  trackEvent('Booking', 'Started', serviceId);
};

export const trackBookingCompleted = (appointmentId: string, amount: number) => {
  trackEvent('Booking', 'Completed', appointmentId, amount);
};

export const trackPaymentInitiated = (amount: number) => {
  trackEvent('Payment', 'Initiated', undefined, amount);
};

export const trackPaymentSuccess = (transactionId: string, amount: number) => {
  trackEvent('Payment', 'Success', transactionId, amount);
};

export const trackPaymentFailed = (errorMessage: string) => {
  trackEvent('Payment', 'Failed', errorMessage);
};

export const trackAppointmentCancelled = (appointmentId: string) => {
  trackEvent('Appointment', 'Cancelled', appointmentId);
};

export const trackAppointmentRescheduled = (appointmentId: string) => {
  trackEvent('Appointment', 'Rescheduled', appointmentId);
};

export const trackReviewSubmitted = (providerId: string, rating: number) => {
  trackEvent('Review', 'Submitted', providerId, rating);
};

export const trackProfileUpdated = () => {
  trackEvent('Profile', 'Updated');
};
