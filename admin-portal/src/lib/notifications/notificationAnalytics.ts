import { adminDb } from '../firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationChannel, NotificationType } from '@/types/notification';

export interface NotificationAnalytics {
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  byChannel: {
    [key in NotificationChannel]: {
      sent: number;
      failed: number;
      opened: number;
      clicked: number;
      deliveryRate: number;
      openRate: number;
      clickThroughRate: number;
    };
  };
  byType: {
    [key in NotificationType]: {
      sent: number;
      failed: number;
      opened: number;
      clicked: number;
      deliveryRate: number;
      openRate: number;
      clickThroughRate: number;
    };
  };
}

export interface NotificationAnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  channel?: NotificationChannel;
  type?: NotificationType;
}

class NotificationAnalyticsService {
  /**
   * Track notification open event
   */
  async trackOpen(notificationId: string, userId: string, channel: NotificationChannel): Promise<void> {
    try {
      const logsSnapshot = await adminDb
        .collection('notificationDeliveryLogs')
        .where('notificationId', '==', notificationId)
        .where('userId', '==', userId)
        .where('channel', '==', channel)
        .limit(1)
        .get();

      if (!logsSnapshot.empty) {
        const logDoc = logsSnapshot.docs[0];
        await logDoc.ref.update({
          status: 'opened',
          openedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error tracking notification open:', error);
    }
  }

  /**
   * Track notification click event
   */
  async trackClick(notificationId: string, userId: string, channel: NotificationChannel): Promise<void> {
    try {
      const logsSnapshot = await adminDb
        .collection('notificationDeliveryLogs')
        .where('notificationId', '==', notificationId)
        .where('userId', '==', userId)
        .where('channel', '==', channel)
        .limit(1)
        .get();

      if (!logsSnapshot.empty) {
        const logDoc = logsSnapshot.docs[0];
        const currentData = logDoc.data();
        
        await logDoc.ref.update({
          status: 'clicked',
          clickedAt: Timestamp.now(),
          // Keep openedAt if it exists, otherwise set it now
          openedAt: currentData.openedAt || Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error tracking notification click:', error);
    }
  }

  /**
   * Get notification analytics for a date range
   */
  async getAnalytics(filters: NotificationAnalyticsFilters = {}): Promise<NotificationAnalytics> {
    try {
      const { startDate, endDate, userId, channel, type } = filters;

      // Build query
      let query = adminDb.collection('notificationDeliveryLogs').orderBy('createdAt', 'desc');

      if (startDate) {
        query = query.where('createdAt', '>=', Timestamp.fromDate(startDate)) as any;
      }

      if (endDate) {
        query = query.where('createdAt', '<=', Timestamp.fromDate(endDate)) as any;
      }

      if (userId) {
        query = query.where('userId', '==', userId) as any;
      }

      if (channel) {
        query = query.where('channel', '==', channel) as any;
      }

      const snapshot = await query.get();

      // Initialize analytics object
      const analytics: NotificationAnalytics = {
        totalSent: 0,
        totalFailed: 0,
        totalOpened: 0,
        totalClicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickThroughRate: 0,
        byChannel: {
          email: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          sms: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          push: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
        },
        byType: {
          appointment_confirmed: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          appointment_reminder: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          appointment_cancelled: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          appointment_rescheduled: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          payment_success: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          payment_failed: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          general: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
          promotional: { sent: 0, failed: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickThroughRate: 0 },
        },
      };

      // Get notification details for type filtering
      const notificationIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.notificationId) {
          notificationIds.add(data.notificationId);
        }
      });

      // Fetch notification types if needed
      const notificationTypes = new Map<string, NotificationType>();
      if (type || notificationIds.size > 0) {
        const notificationPromises = Array.from(notificationIds).map(async (id) => {
          const notifDoc = await adminDb.collection('notificationQueue').doc(id).get();
          if (notifDoc.exists) {
            const data = notifDoc.data();
            notificationTypes.set(id, data?.type as NotificationType);
          }
        });
        await Promise.all(notificationPromises);
      }

      // Process logs
      snapshot.docs.forEach(doc => {
        const log = doc.data();
        const notifType = notificationTypes.get(log.notificationId);

        // Skip if type filter doesn't match
        if (type && notifType !== type) {
          return;
        }

        const logChannel = log.channel as NotificationChannel;

        // Update totals
        if (log.status === 'sent' || log.status === 'opened' || log.status === 'clicked') {
          analytics.totalSent++;
          analytics.byChannel[logChannel].sent++;
          if (notifType) {
            analytics.byType[notifType].sent++;
          }
        } else if (log.status === 'failed') {
          analytics.totalFailed++;
          analytics.byChannel[logChannel].failed++;
          if (notifType) {
            analytics.byType[notifType].failed++;
          }
        }

        if (log.status === 'opened' || log.status === 'clicked') {
          analytics.totalOpened++;
          analytics.byChannel[logChannel].opened++;
          if (notifType) {
            analytics.byType[notifType].opened++;
          }
        }

        if (log.status === 'clicked') {
          analytics.totalClicked++;
          analytics.byChannel[logChannel].clicked++;
          if (notifType) {
            analytics.byType[notifType].clicked++;
          }
        }
      });

      // Calculate rates
      const totalAttempts = analytics.totalSent + analytics.totalFailed;
      analytics.deliveryRate = totalAttempts > 0 ? (analytics.totalSent / totalAttempts) * 100 : 0;
      analytics.openRate = analytics.totalSent > 0 ? (analytics.totalOpened / analytics.totalSent) * 100 : 0;
      analytics.clickThroughRate = analytics.totalOpened > 0 ? (analytics.totalClicked / analytics.totalOpened) * 100 : 0;

      // Calculate rates by channel
      Object.keys(analytics.byChannel).forEach(ch => {
        const channelData = analytics.byChannel[ch as NotificationChannel];
        const channelAttempts = channelData.sent + channelData.failed;
        channelData.deliveryRate = channelAttempts > 0 ? (channelData.sent / channelAttempts) * 100 : 0;
        channelData.openRate = channelData.sent > 0 ? (channelData.opened / channelData.sent) * 100 : 0;
        channelData.clickThroughRate = channelData.opened > 0 ? (channelData.clicked / channelData.opened) * 100 : 0;
      });

      // Calculate rates by type
      Object.keys(analytics.byType).forEach(t => {
        const typeData = analytics.byType[t as NotificationType];
        const typeAttempts = typeData.sent + typeData.failed;
        typeData.deliveryRate = typeAttempts > 0 ? (typeData.sent / typeAttempts) * 100 : 0;
        typeData.openRate = typeData.sent > 0 ? (typeData.opened / typeData.sent) * 100 : 0;
        typeData.clickThroughRate = typeData.opened > 0 ? (typeData.clicked / typeData.opened) * 100 : 0;
      });

      return analytics;
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw error;
    }
  }

  /**
   * Get notification analytics over time (daily breakdown)
   */
  async getAnalyticsTimeSeries(
    startDate: Date,
    endDate: Date,
    filters: Omit<NotificationAnalyticsFilters, 'startDate' | 'endDate'> = {}
  ): Promise<Array<{ date: string; sent: number; failed: number; opened: number; clicked: number }>> {
    try {
      const { userId, channel, type } = filters;

      // Build query
      let query = adminDb
        .collection('notificationDeliveryLogs')
        .where('createdAt', '>=', Timestamp.fromDate(startDate))
        .where('createdAt', '<=', Timestamp.fromDate(endDate))
        .orderBy('createdAt', 'asc');

      if (userId) {
        query = query.where('userId', '==', userId) as any;
      }

      if (channel) {
        query = query.where('channel', '==', channel) as any;
      }

      const snapshot = await query.get();

      // Group by date
      const dataByDate = new Map<string, { sent: number; failed: number; opened: number; clicked: number }>();

      // Get notification types if needed
      const notificationIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.notificationId) {
          notificationIds.add(data.notificationId);
        }
      });

      const notificationTypes = new Map<string, NotificationType>();
      if (type) {
        const notificationPromises = Array.from(notificationIds).map(async (id) => {
          const notifDoc = await adminDb.collection('notificationQueue').doc(id).get();
          if (notifDoc.exists) {
            const data = notifDoc.data();
            notificationTypes.set(id, data?.type as NotificationType);
          }
        });
        await Promise.all(notificationPromises);
      }

      snapshot.docs.forEach(doc => {
        const log = doc.data();
        const notifType = notificationTypes.get(log.notificationId);

        // Skip if type filter doesn't match
        if (type && notifType !== type) {
          return;
        }

        const date = log.createdAt.toDate().toISOString().split('T')[0];

        if (!dataByDate.has(date)) {
          dataByDate.set(date, { sent: 0, failed: 0, opened: 0, clicked: 0 });
        }

        const dayData = dataByDate.get(date)!;

        if (log.status === 'sent' || log.status === 'opened' || log.status === 'clicked') {
          dayData.sent++;
        } else if (log.status === 'failed') {
          dayData.failed++;
        }

        if (log.status === 'opened' || log.status === 'clicked') {
          dayData.opened++;
        }

        if (log.status === 'clicked') {
          dayData.clicked++;
        }
      });

      // Convert to array and sort by date
      return Array.from(dataByDate.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting analytics time series:', error);
      throw error;
    }
  }
}

export default new NotificationAnalyticsService();
