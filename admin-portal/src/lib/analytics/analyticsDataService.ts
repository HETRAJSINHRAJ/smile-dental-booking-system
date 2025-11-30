/**
 * Analytics Data Service for fetching and processing analytics data
 */

import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Appointment, AnalyticsEvent } from '@/types/shared';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardAnalytics {
  appointments: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    noShow: number;
  };
  revenue: {
    total: number;
    reservationFees: number;
    servicePayments: number;
    refunds: number;
  };
  conversion: {
    serviceViews: number;
    providerViews: number;
    bookingStarted: number;
    bookingCompleted: number;
    conversionRate: number;
  };
  appointmentsByDate: Array<{
    date: string;
    confirmed: number;
    cancelled: number;
    completed: number;
    total: number;
  }>;
  revenueByDate: Array<{
    date: string;
    reservationFees: number;
    servicePayments: number;
    total: number;
  }>;
}

export class AnalyticsDataService {
  /**
   * Get date range based on preset
   */
  static getDateRange(preset: 'today' | 'week' | 'month' | 'year' | 'custom', customRange?: DateRange): DateRange {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (preset) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (!customRange) {
          throw new Error('Custom range required for custom preset');
        }
        start = new Date(customRange.start);
        end = new Date(customRange.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  /**
   * Fetch dashboard analytics for a given date range
   */
  static async fetchDashboardAnalytics(dateRange: DateRange): Promise<DashboardAnalytics> {
    try {
      // Fetch appointments
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('appointmentDate', '>=', Timestamp.fromDate(dateRange.start)),
        where('appointmentDate', '<=', Timestamp.fromDate(dateRange.end))
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];

      // Fetch analytics events
      const eventsRef = collection(db, 'analyticsEvents');
      const eventsQuery = query(
        eventsRef,
        where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
        where('timestamp', '<=', Timestamp.fromDate(dateRange.end))
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => doc.data()) as AnalyticsEvent[];

      // Calculate appointment metrics
      const appointmentMetrics = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        pending: appointments.filter(a => a.status === 'pending').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        noShow: appointments.filter(a => a.status === 'no_show').length,
      };

      // Calculate revenue metrics
      const revenueMetrics = {
        reservationFees: appointments
          .filter(a => a.paymentStatus === 'reservation_paid' || a.paymentStatus === 'fully_paid')
          .reduce((sum, a) => sum + (a.paymentAmount || 0), 0),
        servicePayments: appointments
          .filter(a => a.servicePaymentStatus === 'paid')
          .reduce((sum, a) => sum + (a.servicePaymentAmount || 0), 0),
        refunds: appointments
          .filter(a => a.paymentStatus === 'refunded')
          .reduce((sum, a) => sum + (a.paymentAmount || 0), 0),
        total: 0,
      };
      revenueMetrics.total = revenueMetrics.reservationFees + revenueMetrics.servicePayments - revenueMetrics.refunds;

      // Calculate conversion metrics
      const serviceViews = events.filter(e => e.name === 'service_view').length;
      const providerViews = events.filter(e => e.name === 'provider_view').length;
      const bookingStarted = events.filter(e => e.name === 'booking_started').length;
      const bookingCompleted = events.filter(e => e.name === 'booking_completed').length;
      const conversionRate = serviceViews > 0 ? (bookingCompleted / serviceViews) * 100 : 0;

      const conversionMetrics = {
        serviceViews,
        providerViews,
        bookingStarted,
        bookingCompleted,
        conversionRate,
      };

      // Group appointments by date
      const appointmentsByDate = this.groupAppointmentsByDate(appointments, dateRange);

      // Group revenue by date
      const revenueByDate = this.groupRevenueByDate(appointments, dateRange);

      return {
        appointments: appointmentMetrics,
        revenue: revenueMetrics,
        conversion: conversionMetrics,
        appointmentsByDate,
        revenueByDate,
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Group appointments by date
   */
  private static groupAppointmentsByDate(
    appointments: Appointment[],
    dateRange: DateRange
  ): Array<{
    date: string;
    confirmed: number;
    cancelled: number;
    completed: number;
    total: number;
  }> {
    const dateMap = new Map<string, any>();

    // Initialize all dates in range
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dateMap.set(dateKey, {
        date: dateKey,
        confirmed: 0,
        cancelled: 0,
        completed: 0,
        total: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count appointments by date
    appointments.forEach(apt => {
      const aptDate = apt.appointmentDate.toDate();
      const dateKey = aptDate.toISOString().split('T')[0];
      
      if (dateMap.has(dateKey)) {
        const dayData = dateMap.get(dateKey);
        dayData.total++;
        if (apt.status === 'confirmed') dayData.confirmed++;
        if (apt.status === 'cancelled') dayData.cancelled++;
        if (apt.status === 'completed') dayData.completed++;
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Group revenue by date
   */
  private static groupRevenueByDate(
    appointments: Appointment[],
    dateRange: DateRange
  ): Array<{
    date: string;
    reservationFees: number;
    servicePayments: number;
    total: number;
  }> {
    const dateMap = new Map<string, any>();

    // Initialize all dates in range
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dateMap.set(dateKey, {
        date: dateKey,
        reservationFees: 0,
        servicePayments: 0,
        total: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sum revenue by date
    appointments.forEach(apt => {
      const aptDate = apt.appointmentDate.toDate();
      const dateKey = aptDate.toISOString().split('T')[0];
      
      if (dateMap.has(dateKey)) {
        const dayData = dateMap.get(dateKey);
        
        if (apt.paymentStatus === 'reservation_paid' || apt.paymentStatus === 'fully_paid') {
          dayData.reservationFees += apt.paymentAmount || 0;
        }
        
        if (apt.servicePaymentStatus === 'paid') {
          dayData.servicePayments += apt.servicePaymentAmount || 0;
        }
        
        dayData.total = dayData.reservationFees + dayData.servicePayments;
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
