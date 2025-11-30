import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';
import ReactGA from 'react-ga4';

/**
 * Web Vitals thresholds based on Google's recommendations
 */
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint - target < 2.5s
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint - target < 200ms (replaced FID in 2024)
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift - target < 0.1
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

/**
 * Get rating for a metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to Sentry for performance monitoring
 */
function sendToSentry(metric: Metric) {
  const rating = getRating(metric.name, metric.value);
  
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
    level: rating === 'poor' ? 'warning' : 'info',
    data: {
      name: metric.name,
      value: metric.value,
      rating,
      id: metric.id,
      navigationType: metric.navigationType,
    },
  });

  // Report poor metrics as Sentry events
  if (rating === 'poor') {
    Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
      level: 'warning',
      tags: {
        webVital: metric.name,
        rating,
      },
      extra: {
        value: metric.value,
        threshold: THRESHOLDS[metric.name as keyof typeof THRESHOLDS],
        navigationType: metric.navigationType,
      },
    });
  }
}

/**
 * Send metric to Google Analytics
 */
function sendToGA(metric: Metric) {
  const rating = getRating(metric.name, metric.value);
  
  ReactGA.event({
    category: 'Web Vitals',
    action: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    label: rating,
    nonInteraction: true,
  });
}

/**
 * Report a single web vital metric
 */
function reportMetric(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const rating = getRating(metric.name, metric.value);
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`);
  }

  // Send to analytics services
  sendToSentry(metric);
  sendToGA(metric);
}

/**
 * Initialize web vitals reporting
 * Call this function once in your app's entry point
 */
export function reportWebVitals() {
  // Core Web Vitals (2024 standard)
  onLCP(reportMetric);  // Largest Contentful Paint - target < 2.5s
  onINP(reportMetric);  // Interaction to Next Paint - target < 200ms (replaced FID in 2024)
  onCLS(reportMetric);  // Cumulative Layout Shift - target < 0.1
  
  // Additional metrics
  onFCP(reportMetric);  // First Contentful Paint
  onTTFB(reportMetric); // Time to First Byte
}

/**
 * Get current performance metrics summary
 */
export function getPerformanceMetrics(): Record<string, number> {
  const metrics: Record<string, number> = {};
  
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
      metrics.loadComplete = navigation.loadEventEnd - navigation.startTime;
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.domInteractive = navigation.domInteractive - navigation.startTime;
    }
  }
  
  return metrics;
}

/**
 * Track custom performance timing
 */
export function trackTiming(name: string, startTime: number) {
  const duration = performance.now() - startTime;
  
  ReactGA.event({
    category: 'Performance',
    action: name,
    value: Math.round(duration),
    nonInteraction: true,
  });
  
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name}: ${duration.toFixed(2)}ms`,
    level: 'info',
  });
  
  return duration;
}
