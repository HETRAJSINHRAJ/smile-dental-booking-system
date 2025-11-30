/**
 * Sentry Server Configuration - Patient Portal
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'patient-portal@1.0.0',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        app: 'patient-portal',
        runtime: 'server',
      };
      return event;
    },
  });

  console.log('✅ Sentry initialized (server)');
}
