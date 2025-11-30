/**
 * Sentry Client Configuration
 * Error tracking for client-side errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'admin-portal@1.0.0',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/.*\.smiledental\.com/],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
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
        app: 'admin-portal',
      };
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
    ],
  });

  console.log('✅ Sentry initialized (client)');
} else {
  console.warn('⚠️  SENTRY_DSN not configured');
}
