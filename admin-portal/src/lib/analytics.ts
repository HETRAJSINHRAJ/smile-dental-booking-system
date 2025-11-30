/**
 * Google Analytics 4 Configuration - Admin Portal
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

// Admin-specific event tracking
export const trackAdminAction = (action: string, details?: Record<string, any>) => {
  trackEvent('Admin', action, JSON.stringify(details));
};

export const trackAppointmentAction = (action: string, appointmentId?: string) => {
  trackEvent('Appointment', action, appointmentId);
};

export const trackPatientAction = (action: string, patientId?: string) => {
  trackEvent('Patient', action, patientId);
};

export const trackProviderAction = (action: string, providerId?: string) => {
  trackEvent('Provider', action, providerId);
};

export const trackPaymentAction = (action: string, amount?: number) => {
  trackEvent('Payment', action, undefined, amount);
};

export const trackSearchAction = (searchType: string, query: string) => {
  trackEvent('Search', searchType, query);
};

export const trackReportGeneration = (reportType: string) => {
  trackEvent('Report', 'Generate', reportType);
};
