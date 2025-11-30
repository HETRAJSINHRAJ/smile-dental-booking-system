/**
 * Analytics Service for tracking user events and conversion funnel
 * Integrates with Firebase Analytics and Google Analytics 4
 */

import { logEvent as firebaseLogEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '@/lib/firebase/config';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type AnalyticsEventName =
  | 'service_view'
  | 'provider_view'
  | 'booking_started'
  | 'booking_date_selected'
  | 'booking_completed'
  | 'payment_initiated'
  | 'payment_completed'
  | 'appointment_rescheduled'
  | 'review_submitted'
  | 'page_view';

export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;

  constructor() {
    // Generate a unique session ID
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Set the current user ID for analytics tracking
   */
  setUser(userId: string, properties?: Record<string, any>) {
    this.userId = userId;
    
    if (analytics) {
      setUserId(analytics, userId);
      
      if (properties) {
        setUserProperties(analytics, properties);
      }
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(
    eventName: AnalyticsEventName,
    properties?: AnalyticsEventProperties
  ): Promise<void> {
    try {
      const eventData = {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      };

      // Log to Firebase Analytics
      if (analytics) {
        firebaseLogEvent(analytics, eventName, eventData);
      }

      // Store in Firestore for custom reporting
      await this.storeEventInFirestore(eventName, eventData);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', eventName, eventData);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Store event in Firestore for custom analytics
   */
  private async storeEventInFirestore(
    eventName: string,
    properties: Record<string, any>
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'analyticsEvents'), {
        name: eventName,
        category: this.getCategoryForEvent(eventName),
        properties,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error storing event in Firestore:', error);
    }
  }

  /**
   * Get category for event
   */
  private getCategoryForEvent(eventName: string): string {
    if (eventName.startsWith('booking_')) return 'booking';
    if (eventName.startsWith('payment_')) return 'payment';
    if (eventName.includes('view')) return 'engagement';
    return 'user';
  }

  /**
   * Track service view event
   */
  async trackServiceView(serviceId: string, serviceName: string): Promise<void> {
    await this.trackEvent('service_view', {
      serviceId,
      serviceName,
    });
  }

  /**
   * Track provider view event
   */
  async trackProviderView(providerId: string, providerName: string, serviceId?: string): Promise<void> {
    await this.trackEvent('provider_view', {
      providerId,
      providerName,
      serviceId,
    });
  }

  /**
   * Track booking started event
   */
  async trackBookingStarted(serviceId: string, serviceName: string): Promise<void> {
    await this.trackEvent('booking_started', {
      serviceId,
      serviceName,
    });
  }

  /**
   * Track booking date selected event
   */
  async trackBookingDateSelected(
    serviceId: string,
    providerId: string,
    date: string
  ): Promise<void> {
    await this.trackEvent('booking_date_selected', {
      serviceId,
      providerId,
      date,
    });
  }

  /**
   * Track booking completed event
   */
  async trackBookingCompleted(
    appointmentId: string,
    serviceId: string,
    providerId: string,
    amount: number
  ): Promise<void> {
    await this.trackEvent('booking_completed', {
      appointmentId,
      serviceId,
      providerId,
      amount,
    });
  }

  /**
   * Track payment initiated event
   */
  async trackPaymentInitiated(
    appointmentId: string,
    amount: number,
    paymentMethod: string
  ): Promise<void> {
    await this.trackEvent('payment_initiated', {
      appointmentId,
      amount,
      paymentMethod,
    });
  }

  /**
   * Track payment completed event
   */
  async trackPaymentCompleted(
    appointmentId: string,
    amount: number,
    transactionId: string
  ): Promise<void> {
    await this.trackEvent('payment_completed', {
      appointmentId,
      amount,
      transactionId,
    });
  }

  /**
   * Track page view event
   */
  async trackPageView(pagePath: string, pageTitle: string): Promise<void> {
    await this.trackEvent('page_view', {
      pagePath,
      pageTitle,
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
