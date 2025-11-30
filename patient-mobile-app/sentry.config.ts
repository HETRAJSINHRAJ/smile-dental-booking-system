/**
 * Sentry Configuration - Patient Mobile App
 * Error tracking for React Native
 */

import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.SENTRY_DSN;

export const initSentry = () => {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: __DEV__ ? 'development' : 'production',
      release: 'patient-mobile-app@1.0.0',
      
      // Performance Monitoring
      tracesSampleRate: __DEV__ ? 1.0 : 0.1,
      
      // Enable automatic session tracking
      enableAutoSessionTracking: true,
      
      // Session timeout in milliseconds
      sessionTrackingIntervalMillis: 30000,
      
      // Integrations
      integrations: [
        new Sentry.ReactNativeTracing({
          tracingOrigins: ['localhost', /^https:\/\/.*\.smiledental\.com/],
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        }),
      ],
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out non-error events
        if (event.level === 'info' || event.level === 'warning') {
          return null;
        }
        
        // Add custom context
        event.tags = {
          ...event.tags,
          app: 'patient-mobile-app',
        };
        
        return event;
      },
      
      // Ignore specific errors
      ignoreErrors: [
        'Network request failed',
        'Aborted',
        'cancelled',
      ],
    });

    console.log('✅ Sentry initialized (mobile)');
  } else {
    console.warn('⚠️  SENTRY_DSN not configured');
  }
};

export default Sentry;
