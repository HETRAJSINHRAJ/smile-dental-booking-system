/**
 * Performance Monitoring for React Native Mobile App
 * 
 * This module provides utilities for tracking performance metrics including:
 * - App startup time
 * - Screen navigation performance
 * - API call performance
 * - Critical operation tracking
 */

import * as Sentry from '@sentry/react-native';

/**
 * Performance thresholds for alerting (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  APP_STARTUP: 3000,       // Alert when app startup > 3s
  SCREEN_LOAD: 1000,       // Alert when screen load > 1s
  API_RESPONSE: 3000,      // Alert when API response > 3s
  BOOKING_FLOW: 10000,     // Alert when booking flow > 10s
  PAYMENT_PROCESSING: 5000, // Alert when payment > 5s
};

/**
 * Transaction names for consistent tracking
 */
export const TRANSACTION_NAMES = {
  APP_STARTUP: 'app.startup',
  SCREEN_LOAD: 'screen.load',
  BOOKING_FLOW: 'booking.flow',
  PAYMENT_PROCESS: 'payment.process',
  API_CALL: 'api.call',
};

// Store app startup time
let appStartTime: number | null = null;
let appReadyTime: number | null = null;

/**
 * Mark the app start time - call this as early as possible in index.js
 */
export function markAppStart() {
  appStartTime = Date.now();
  
  Sentry.addBreadcrumb({
    category: 'app-lifecycle',
    message: 'App start marked',
    level: 'info',
    data: {
      timestamp: appStartTime,
    },
  });
}

/**
 * Mark the app as ready - call this when the main UI is rendered
 */
export function markAppReady() {
  appReadyTime = Date.now();
  
  if (appStartTime) {
    const startupTime = appReadyTime - appStartTime;
    
    Sentry.setMeasurement('app.startup_time', startupTime, 'millisecond');
    
    Sentry.addBreadcrumb({
      category: 'app-lifecycle',
      message: `App ready - startup time: ${startupTime}ms`,
      level: 'info',
      data: {
        startupTime,
        appStartTime,
        appReadyTime,
      },
    });
    
    // Log warning if startup time exceeds threshold
    if (startupTime > PERFORMANCE_THRESHOLDS.APP_STARTUP) {
      Sentry.captureMessage('Slow app startup detected', {
        level: 'warning',
        tags: {
          operation: 'app_startup',
        },
        extra: {
          startupTime,
          threshold: PERFORMANCE_THRESHOLDS.APP_STARTUP,
        },
      });
    }
    
    if (__DEV__) {
      console.log(`[Performance] App startup time: ${startupTime}ms`);
    }
  }
}

/**
 * Get the app startup time in milliseconds
 */
export function getAppStartupTime(): number | null {
  if (appStartTime && appReadyTime) {
    return appReadyTime - appStartTime;
  }
  return null;
}

/**
 * Track screen load performance
 */
export function trackScreenLoad(screenName: string) {
  const startTime = Date.now();
  
  return {
    /**
     * Mark the screen as fully loaded
     */
    complete() {
      const loadTime = Date.now() - startTime;
      
      Sentry.setMeasurement(`screen.${screenName}.load_time`, loadTime, 'millisecond');
      
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Screen loaded: ${screenName}`,
        level: 'info',
        data: {
          screenName,
          loadTime,
        },
      });
      
      if (loadTime > PERFORMANCE_THRESHOLDS.SCREEN_LOAD) {
        Sentry.captureMessage(`Slow screen load: ${screenName}`, {
          level: 'warning',
          tags: {
            operation: 'screen_load',
            screen: screenName,
          },
          extra: {
            loadTime,
            threshold: PERFORMANCE_THRESHOLDS.SCREEN_LOAD,
          },
        });
      }
      
      if (__DEV__) {
        console.log(`[Performance] Screen ${screenName} loaded in ${loadTime}ms`);
      }
      
      return loadTime;
    },
  };
}

/**
 * Track booking flow performance
 */
export function trackBookingFlow() {
  const startTime = Date.now();
  const steps: { name: string; duration: number }[] = [];
  
  return {
    /**
     * Record a step in the booking flow
     */
    recordStep(stepName: string) {
      const stepDuration = Date.now() - startTime;
      steps.push({ name: stepName, duration: stepDuration });
      
      Sentry.addBreadcrumb({
        category: 'booking',
        message: `Booking step: ${stepName}`,
        level: 'info',
        data: {
          step: stepName,
          durationMs: stepDuration,
          totalSteps: steps.length,
        },
      });
      
      if (__DEV__) {
        console.log(`[Booking] Step ${stepName}: ${stepDuration}ms`);
      }
    },
    
    /**
     * Complete the booking flow and report metrics
     */
    complete(success: boolean, appointmentId?: string) {
      const totalDuration = Date.now() - startTime;
      
      Sentry.setMeasurement('booking.total_duration', totalDuration, 'millisecond');
      
      steps.forEach((step, index) => {
        Sentry.setMeasurement(`booking.step_${index + 1}`, step.duration, 'millisecond');
      });
      
      if (!success || totalDuration > PERFORMANCE_THRESHOLDS.BOOKING_FLOW) {
        Sentry.captureMessage(
          success ? 'Slow booking flow detected' : 'Booking flow failed',
          {
            level: success ? 'warning' : 'error',
            tags: {
              operation: 'booking_flow',
              success: String(success),
            },
            extra: {
              totalDuration,
              steps,
              appointmentId,
              threshold: PERFORMANCE_THRESHOLDS.BOOKING_FLOW,
            },
          }
        );
      }
      
      if (__DEV__) {
        console.log(`[Booking] Flow completed in ${totalDuration}ms (success: ${success})`);
      }
      
      return { totalDuration, steps };
    },
  };
}

/**
 * Track payment processing performance
 */
export async function trackPaymentProcessing<T>(
  paymentOperation: () => Promise<T>,
  metadata?: {
    appointmentId?: string;
    amount?: number;
    paymentMethod?: string;
  }
): Promise<T> {
  const startTime = Date.now();
  
  Sentry.addBreadcrumb({
    category: 'payment',
    message: 'Payment processing started',
    level: 'info',
    data: metadata,
  });
  
  try {
    const result = await paymentOperation();
    const duration = Date.now() - startTime;
    
    Sentry.setMeasurement('payment.processing_time', duration, 'millisecond');
    
    Sentry.addBreadcrumb({
      category: 'payment',
      message: 'Payment processing completed',
      level: 'info',
      data: {
        duration,
        ...metadata,
      },
    });
    
    if (duration > PERFORMANCE_THRESHOLDS.PAYMENT_PROCESSING) {
      Sentry.captureMessage('Slow payment processing detected', {
        level: 'warning',
        tags: { operation: 'payment_processing' },
        extra: {
          duration,
          threshold: PERFORMANCE_THRESHOLDS.PAYMENT_PROCESSING,
          ...metadata,
        },
      });
    }
    
    if (__DEV__) {
      console.log(`[Payment] Processing completed in ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: 'payment_processing' },
      extra: metadata,
    });
    throw error;
  }
}

/**
 * Track API call performance
 */
export async function trackApiCall<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;
    
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${method} ${endpoint}`,
      level: 'info',
      data: {
        duration,
        status: 'success',
      },
    });
    
    if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE) {
      Sentry.captureMessage('Slow API response detected', {
        level: 'warning',
        tags: {
          operation: 'api_call',
          endpoint,
          method,
        },
        extra: {
          duration,
          threshold: PERFORMANCE_THRESHOLDS.API_RESPONSE,
        },
      });
    }
    
    if (__DEV__) {
      console.log(`[API] ${method} ${endpoint}: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${method} ${endpoint} failed`,
      level: 'error',
      data: {
        duration,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    
    throw error;
  }
}

/**
 * Track a generic operation with timing
 */
export async function trackOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    Sentry.setMeasurement(`operation.${operationName}`, duration, 'millisecond');
    
    Sentry.addBreadcrumb({
      category: 'operation',
      message: `${operationName} completed`,
      level: 'info',
      data: {
        duration,
        ...metadata,
      },
    });
    
    if (__DEV__) {
      console.log(`[Operation] ${operationName}: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: operationName },
      extra: metadata,
    });
    throw error;
  }
}

/**
 * Performance metrics summary
 */
export function getPerformanceMetrics() {
  return {
    appStartupTime: getAppStartupTime(),
    appStartTime,
    appReadyTime,
  };
}
