/**
 * Firebase Analytics Configuration - Patient Mobile App
 */

import analytics from '@react-native-firebase/analytics';

// Initialize Firebase Analytics
export const initAnalytics = async () => {
  try {
    await analytics().setAnalyticsCollectionEnabled(true);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
};

// Track screen views
export const trackScreenView = async (screenName: string, screenClass?: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error('Failed to track screen view:', error);
  }
};

// Track custom events
export const trackEvent = async (
  eventName: string,
  params?: Record<string, any>
) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Booking funnel tracking
export const trackBookingStep = async (step: string, details?: Record<string, any>) => {
  await trackEvent('booking_step', { step, ...details });
};

export const trackServiceView = async (serviceId: string, serviceName: string) => {
  await trackEvent('view_item', {
    item_id: serviceId,
    item_name: serviceName,
    item_category: 'service',
  });
};

export const trackProviderView = async (providerId: string, providerName: string) => {
  await trackEvent('view_item', {
    item_id: providerId,
    item_name: providerName,
    item_category: 'provider',
  });
};

export const trackBookingStarted = async (serviceId: string, serviceName: string) => {
  await trackEvent('begin_checkout', {
    item_id: serviceId,
    item_name: serviceName,
  });
};

export const trackBookingCompleted = async (
  appointmentId: string,
  amount: number,
  currency: string = 'INR'
) => {
  await trackEvent('purchase', {
    transaction_id: appointmentId,
    value: amount,
    currency,
    items: [{ item_id: appointmentId }],
  });
};

export const trackPaymentInitiated = async (amount: number, currency: string = 'INR') => {
  await trackEvent('add_payment_info', {
    value: amount,
    currency,
  });
};

export const trackPaymentSuccess = async (
  transactionId: string,
  amount: number,
  currency: string = 'INR'
) => {
  await trackEvent('payment_success', {
    transaction_id: transactionId,
    value: amount,
    currency,
  });
};

export const trackPaymentFailed = async (errorMessage: string) => {
  await trackEvent('payment_failed', {
    error_message: errorMessage,
  });
};

export const trackAppointmentCancelled = async (appointmentId: string) => {
  await trackEvent('appointment_cancelled', {
    appointment_id: appointmentId,
  });
};

export const trackAppointmentRescheduled = async (appointmentId: string) => {
  await trackEvent('appointment_rescheduled', {
    appointment_id: appointmentId,
  });
};

export const trackReviewSubmitted = async (providerId: string, rating: number) => {
  await trackEvent('review_submitted', {
    provider_id: providerId,
    rating,
  });
};

export const trackProfileUpdated = async () => {
  await trackEvent('profile_updated');
};

export const trackLogin = async (method: string) => {
  await analytics().logLogin({ method });
};

export const trackSignUp = async (method: string) => {
  await analytics().logSignUp({ method });
};

export const trackSearch = async (searchTerm: string) => {
  await analytics().logSearch({ search_term: searchTerm });
};

// Set user properties
export const setUserId = async (userId: string) => {
  try {
    await analytics().setUserId(userId);
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
};

export const setUserProperty = async (name: string, value: string) => {
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.error('Failed to set user property:', error);
  }
};
