/**
 * Google Analytics 4 Integration
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

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer
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

// Admin-specific events
export const trackAdminAction = (action: string, details?: Record<string, any>) => {
  trackCustomEvent('admin_action', {
    action,
    ...details,
  });
};

export const trackAppointmentAction = (action: string, appointmentId: string) => {
  trackCustomEvent('appointment_action', {
    action,
    appointment_id: appointmentId,
  });
};

export const trackPatientAction = (action: string, patientId: string) => {
  trackCustomEvent('patient_action', {
    action,
    patient_id: patientId,
  });
};

export const trackProviderAction = (action: string, providerId: string) => {
  trackCustomEvent('provider_action', {
    action,
    provider_id: providerId,
  });
};

export const trackServiceAction = (action: string, serviceId: string) => {
  trackCustomEvent('service_action', {
    action,
    service_id: serviceId,
  });
};

export const trackNotificationSent = (type: string, userId: string) => {
  trackCustomEvent('notification_sent', {
    notification_type: type,
    user_id: userId,
  });
};

export const trackReportGenerated = (reportType: string) => {
  trackCustomEvent('report_generated', {
    report_type: reportType,
  });
};

export const trackExport = (exportType: string, format: string) => {
  trackCustomEvent('data_export', {
    export_type: exportType,
    format,
  });
};
