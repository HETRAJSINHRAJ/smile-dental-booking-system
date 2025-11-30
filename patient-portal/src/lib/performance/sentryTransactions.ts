/**
 * Sentry Custom Transactions for Performance Monitoring
 * 
 * This module provides utilities for tracking performance of critical operations
 * using Sentry's performance monitoring capabilities.
 * 
 * Key operations tracked:
 * - Appointment booking flow
 * - Payment processing
 * - Receipt generation
 * - API response times
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Performance thresholds for alerting (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: 3000,      // Alert when API response > 3s
  BOOKING_FLOW: 10000,     // Alert when booking flow > 10s
  PAYMENT_PROCESSING: 5000, // Alert when payment > 5s
  RECEIPT_GENERATION: 8000, // Alert when receipt generation > 8s
  PAGE_LOAD: 4000,         // Alert when page load > 4s (LCP threshold)
};

/**
 * Transaction names for consistent tracking
 */
export const TRANSACTION_NAMES = {
  BOOKING_FLOW: 'booking.flow',
  BOOKING_SERVICE_SELECT: 'booking.service-select',
  BOOKING_PROVIDER_SELECT: 'booking.provider-select',
  BOOKING_DATE_SELECT: 'booking.date-select',
  BOOKING_CONFIRM: 'booking.confirm',
  PAYMENT_INITIATE: 'payment.initiate',
  PAYMENT_PROCESS: 'payment.process',
  PAYMENT_VERIFY: 'payment.verify',
  RECEIPT_GENERATE: 'receipt.generate',
  RECEIPT_UPLOAD: 'receipt.upload',
  API_CALL: 'api.call',
};

/**
 * Start a performance transaction for tracking
 * @param name - Transaction name
 * @param op - Operation type
 * @param description - Optional description
 * @returns Transaction object or null if Sentry is not initialized
 */
export function startTransaction(
  name: string,
  op: string,
  description?: string
) {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        description: description || name,
      },
    },
    (span) => span
  );
}

/**
 * Track a complete operation with automatic timing
 * @param name - Transaction name
 * @param op - Operation type
 * @param operation - Async operation to track
 * @returns Result of the operation
 */
export async function trackOperation<T>(
  name: string,
  op: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        startTime: new Date().toISOString(),
      },
    },
    async (span) => {
      try {
        const result = await operation();
        const duration = performance.now() - startTime;
        
        span?.setAttribute('duration_ms', duration);
        span?.setAttribute('status', 'ok');
        
        // Log warning if operation exceeds threshold
        checkPerformanceThreshold(name, duration);
        
        return result;
      } catch (error) {
        span?.setAttribute('status', 'error');
        span?.setAttribute('error', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    }
  );
}

/**
 * Track booking flow performance
 */
export function trackBookingFlow() {
  const startTime = performance.now();
  const steps: { name: string; duration: number }[] = [];
  
  return {
    /**
     * Record a step in the booking flow
     */
    recordStep(stepName: string) {
      const stepDuration = performance.now() - startTime;
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
    },
    
    /**
     * Complete the booking flow and report metrics
     */
    complete(success: boolean, appointmentId?: string) {
      const totalDuration = performance.now() - startTime;
      
      Sentry.setMeasurement('booking.total_duration', totalDuration, 'millisecond');
      
      steps.forEach((step, index) => {
        Sentry.setMeasurement(`booking.step_${index + 1}_${step.name}`, step.duration, 'millisecond');
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
  const startTime = performance.now();
  
  return Sentry.startSpan(
    {
      name: TRANSACTION_NAMES.PAYMENT_PROCESS,
      op: 'payment',
      attributes: {
        ...metadata,
      },
    },
    async (span) => {
      try {
        const result = await paymentOperation();
        const duration = performance.now() - startTime;
        
        span?.setAttribute('duration_ms', duration);
        span?.setAttribute('status', 'ok');
        
        Sentry.setMeasurement('payment.processing_time', duration, 'millisecond');
        
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
        
        return result;
      } catch (error) {
        span?.setAttribute('status', 'error');
        Sentry.captureException(error, {
          tags: { operation: 'payment_processing' },
          extra: metadata,
        });
        throw error;
      }
    }
  );
}

/**
 * Track receipt generation performance
 */
export async function trackReceiptGeneration<T>(
  generateOperation: () => Promise<T>,
  metadata?: {
    appointmentId?: string;
    patientId?: string;
  }
): Promise<T> {
  const startTime = performance.now();
  
  return Sentry.startSpan(
    {
      name: TRANSACTION_NAMES.RECEIPT_GENERATE,
      op: 'receipt',
      attributes: {
        ...metadata,
      },
    },
    async (span) => {
      try {
        const result = await generateOperation();
        const duration = performance.now() - startTime;
        
        span?.setAttribute('duration_ms', duration);
        span?.setAttribute('status', 'ok');
        
        Sentry.setMeasurement('receipt.generation_time', duration, 'millisecond');
        
        if (duration > PERFORMANCE_THRESHOLDS.RECEIPT_GENERATION) {
          Sentry.captureMessage('Slow receipt generation detected', {
            level: 'warning',
            tags: { operation: 'receipt_generation' },
            extra: {
              duration,
              threshold: PERFORMANCE_THRESHOLDS.RECEIPT_GENERATION,
              ...metadata,
            },
          });
        }
        
        return result;
      } catch (error) {
        span?.setAttribute('status', 'error');
        Sentry.captureException(error, {
          tags: { operation: 'receipt_generation' },
          extra: metadata,
        });
        throw error;
      }
    }
  );
}

/**
 * Track API call performance
 */
export async function trackApiCall<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return Sentry.startSpan(
    {
      name: `${method} ${endpoint}`,
      op: 'http.client',
      attributes: {
        'http.method': method,
        'http.url': endpoint,
      },
    },
    async (span) => {
      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;
        
        span?.setAttribute('http.response_time_ms', duration);
        span?.setAttribute('http.status_code', 200);
        
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
        
        return result;
      } catch (error) {
        span?.setAttribute('http.status_code', 500);
        throw error;
      }
    }
  );
}

/**
 * Check if operation duration exceeds threshold and log warning
 */
function checkPerformanceThreshold(operationName: string, duration: number) {
  const thresholdKey = Object.keys(PERFORMANCE_THRESHOLDS).find(
    key => operationName.toLowerCase().includes(key.toLowerCase().replace('_', ''))
  );
  
  if (thresholdKey) {
    const threshold = PERFORMANCE_THRESHOLDS[thresholdKey as keyof typeof PERFORMANCE_THRESHOLDS];
    if (duration > threshold) {
      console.warn(
        `[Performance] ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }
  }
}

/**
 * Create a performance observer for long tasks
 */
export function observeLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold (50ms)
          Sentry.addBreadcrumb({
            category: 'performance',
            message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
            level: 'warning',
            data: {
              duration: entry.duration,
              startTime: entry.startTime,
              entryType: entry.entryType,
            },
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    return () => observer.disconnect();
  } catch {
    // PerformanceObserver not supported or longtask not available
    console.warn('Long task observation not supported');
  }
}
