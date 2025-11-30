"use client";

import { useEffect } from "react";
import { reportWebVitals } from "@/lib/performance/webVitals";
import { observeLongTasks } from "@/lib/performance/sentryTransactions";

/**
 * Client component to initialize web vitals reporting
 * This component should be included once in the app layout
 * 
 * Tracks:
 * - Core Web Vitals (LCP, FID, CLS)
 * - Additional metrics (FCP, TTFB, INP)
 * - Long tasks (> 50ms)
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize web vitals reporting
    reportWebVitals();
    
    // Start observing long tasks for performance monitoring
    const cleanup = observeLongTasks();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
