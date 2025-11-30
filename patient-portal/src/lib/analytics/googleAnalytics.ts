/**
 * Google Analytics 4 Integration - Patient Portal
 * Track user interactions and conversions
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Initialize GA4
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️  GA_MEASUREMENT_ID not configured');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });

  console.log('✅ Google Analytics initialized');
};

// Track page views
export const trackPageView = (url: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track custom events
export const trackCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag('event', eventName, params);
};

// Booking flow tracking
export const trackBookingStep = (step: number, stepName: string) => {
  trackCustomEvent('booking_step', {
    step,
    step_name: stepName,
  });
};

export const trackServiceSelected = (serviceId: string, serviceName: string) => {
  trackCustomEvent('service_selected', {
    service_id: serviceId,
    service_name: serviceName,
  });
};

export const trackProviderSelected = (providerId: string, providerName: string) => {
  trackCustomEvent('provider_selected', {
    provider_id: providerId,
    provider_name: providerName,
  });
};

export const trackDateTimeSelected = (date: string, time: string) => {
  trackCustomEvent('datetime_selected', {
    date,
    time,
  });
};

export const trackBookingCompleted = (appointmentId: string, amount: number) => {
  trackCustomEvent('booking_completed', {
    appointment_id: appointmentId,
    value: amount,
    currency: 'INR',
  });
};

export const trackBookingCancelled = (step: string) => {
  trackCustomEvent('booking_cancelled', {
    step,
  });
};

// Payment tracking
export const trackPaymentInitiated = (amount: number, method: string) => {
  trackCustomEvent('payment_initiated', {
    value: amount,
    currency: 'INR',
    payment_method: method,
  });
};

export const trackPaymentCompleted = (
  transactionId: string,
  amount: number,
  method: string
) => {
  trackCustomEvent('purchase', {
    transaction_id: transactionId,
    value: amount,
    currency: 'INR',
    payment_method: method,
  });
};

export const trackPaymentFailed = (error: string) => {
  trackCustomEvent('payment_failed', {
    error_message: error,
  });
};

// User actions
export const trackSignUp = (method: string) => {
  trackCustomEvent('sign_up', {
    method,
  });
};

export const trackLogin = (method: string) => {
  trackCustomEvent('login', {
    method,
  });
};

export const trackSearch = (searchTerm: string) => {
  trackCustomEvent('search', {
    search_term: searchTerm,
  });
};

export const trackReviewSubmitted = (providerId: string, rating: number) => {
  trackCustomEvent('review_submitted', {
    provider_id: providerId,
    rating,
  });
};

export const trackAppointmentRescheduled = (appointmentId: string) => {
  trackCustomEvent('appointment_rescheduled', {
    appointment_id: appointmentId,
  });
};

export const trackAppointmentCancelled = (appointmentId: string, reason: string) => {
  trackCustomEvent('appointment_cancelled', {
    appointment_id: appointmentId,
    reason,
  });
};
