/**
 * Performance Monitoring Utilities
 * 
 * This module exports all performance monitoring utilities for the admin portal.
 */

// Web Vitals tracking
export {
  reportWebVitals,
  getPerformanceMetrics,
  trackTiming,
} from './webVitals';

// Sentry custom transactions
export {
  PERFORMANCE_THRESHOLDS,
  TRANSACTION_NAMES,
  startTransaction,
  trackOperation,
  trackBookingFlow,
  trackPaymentProcessing,
  trackReceiptGeneration,
  trackApiCall,
  observeLongTasks,
} from './sentryTransactions';
