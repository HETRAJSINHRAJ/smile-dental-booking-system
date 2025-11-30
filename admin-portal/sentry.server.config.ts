/**
 * Sentry Server Configuration
 * Error tracking for server-side errors
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
    
    // Add custom context
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        app: 'admin-portal',
        runtime: 'server',
      };
      
      return event;
    },
  });

  console.log('✅ Sentry initialized (server)');
}
