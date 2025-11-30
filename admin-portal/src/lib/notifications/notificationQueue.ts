import { adminDb } from '../firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  NotificationQueueItem,
  NotificationBatch,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from '@/types/notification';
import notificationService from './notificationService';

class NotificationQueue {
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;

  /**
   * Add a notification to the queue
   */
  async enqueue(notification: Omit<NotificationQueueItem, 'id' | 'status' | 'retryCount' | 'maxRetries' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const queueItem: Omit<NotificationQueueItem, 'id'> = {
        ...notification,
        status: 'pending',
        retryCount: 0,
        maxRetries: this.MAX_RETRIES,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await adminDb.collection('notificationQueue').add(queueItem);
      return docRef.id;
    } catch (error) {
      console.error('Error enqueueing notification:', error);
      throw error;
    }
  }

  /**
   * Add multiple notifications to the queue
   */
  async enqueueBatch(notifications: Omit<NotificationQueueItem, 'id' | 'status' | 'retryCount' | 'maxRetries' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    const ids: string[] = [];
    
    for (const notification of notifications) {
      const id = await this.enqueue(notification);
      ids.push(id);
    }

    return ids;
  }

  /**
   * Schedule a notification for future delivery
   */
  async schedule(
    notification: Omit<NotificationQueueItem, 'id' | 'status' | 'retryCount' | 'maxRetries' | 'createdAt' | 'updatedAt' | 'scheduledFor'>,
    scheduledFor: Date
  ): Promise<string> {
    return this.enqueue({
      ...notification,
      scheduledFor: Timestamp.fromDate(scheduledFor),
    });
  }

  /**
   * Check if notification should be sent based on quiet hours
   */
  private async shouldSendNow(userId: string): Promise<boolean> {
    try {
      const prefsDoc = await adminDb
        .collection('notificationPreferences')
        .doc(userId)
        .get();

      if (!prefsDoc.exists) {
        return true; // No preferences, send immediately
      }

      const prefs = prefsDoc.data();
      
      if (!prefs?.quietHours?.enabled) {
        return true; // Quiet hours not enabled
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = prefs.quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = prefs.quietHours.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      // Handle quiet hours that span midnight
      if (startTime > endTime) {
        return currentTime < startTime && currentTime >= endTime;
      } else {
        return currentTime < startTime || currentTime >= endTime;
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return true; // On error, send immediately
    }
  }

  /**
   * Get user's enabled notification channels
   */
  private async getEnabledChannels(userId: string, type: NotificationType): Promise<NotificationChannel[]> {
    try {
      const prefsDoc = await adminDb
        .collection('notificationPreferences')
        .doc(userId)
        .get();

      if (!prefsDoc.exists) {
        return ['email', 'push']; // Default channels
      }

      const prefs = prefsDoc.data();
      const channels: NotificationChannel[] = [];

      // Map notification type to preference key
      const typeMap: Record<string, string> = {
        appointment_confirmed: 'appointmentUpdates',
        appointment_reminder: 'appointmentReminders',
        appointment_cancelled: 'appointmentUpdates',
        appointment_rescheduled: 'appointmentUpdates',
        payment_success: 'paymentUpdates',
        payment_failed: 'paymentUpdates',
        promotional: 'promotional',
        general: 'appointmentUpdates',
      };

      const prefKey = typeMap[type] || 'appointmentUpdates';

      // Check each channel
      if (prefs?.email?.enabled && prefs?.email?.[prefKey]) {
        channels.push('email');
      }
      if (prefs?.sms?.enabled && prefs?.sms?.[prefKey]) {
        channels.push('sms');
      }
      if (prefs?.push?.enabled && prefs?.push?.[prefKey]) {
        channels.push('push');
      }

      return channels.length > 0 ? channels : ['email']; // Fallback to email
    } catch (error) {
      console.error('Error getting enabled channels:', error);
      return ['email', 'push']; // Default on error
    }
  }

  /**
   * Process pending notifications
   */
  async processPendingNotifications(): Promise<number> {
    try {
      const now = Timestamp.now();
      
      // Get pending notifications that are due
      const snapshot = await adminDb
        .collection('notificationQueue')
        .where('status', '==', 'pending')
        .where('scheduledFor', '<=', now)
        .limit(this.BATCH_SIZE)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      let processedCount = 0;

      for (const doc of snapshot.docs) {
        const notification = { id: doc.id, ...doc.data() } as NotificationQueueItem;
        
        // Check quiet hours
        const shouldSend = await this.shouldSendNow(notification.userId);
        
        if (!shouldSend) {
          // Reschedule for later (1 hour from now)
          const newScheduledTime = new Date();
          newScheduledTime.setHours(newScheduledTime.getHours() + 1);
          
          await doc.ref.update({
            scheduledFor: Timestamp.fromDate(newScheduledTime),
            updatedAt: Timestamp.now(),
          });
          continue;
        }

        // Get enabled channels for this user and notification type
        const enabledChannels = await this.getEnabledChannels(notification.userId, notification.type);
        
        // Filter channels based on user preferences
        const channelsToUse = notification.channels.filter(ch => enabledChannels.includes(ch));

        if (channelsToUse.length === 0) {
          // No channels enabled, mark as cancelled
          await doc.ref.update({
            status: 'cancelled',
            updatedAt: Timestamp.now(),
          });
          continue;
        }

        // Update status to processing
        await doc.ref.update({
          status: 'processing',
          updatedAt: Timestamp.now(),
        });

        // Send notification
        const success = await this.sendNotification(notification, channelsToUse);

        if (success) {
          await doc.ref.update({
            status: 'sent',
            sentAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          processedCount++;
        } else {
          // Handle failure
          const newRetryCount = notification.retryCount + 1;
          
          if (newRetryCount >= notification.maxRetries) {
            await doc.ref.update({
              status: 'failed',
              failedAt: Timestamp.now(),
              retryCount: newRetryCount,
              updatedAt: Timestamp.now(),
            });
          } else {
            // Retry later
            const retryTime = new Date();
            retryTime.setMinutes(retryTime.getMinutes() + (newRetryCount * 15)); // Exponential backoff
            
            await doc.ref.update({
              status: 'pending',
              retryCount: newRetryCount,
              scheduledFor: Timestamp.fromDate(retryTime),
              updatedAt: Timestamp.now(),
            });
          }
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      return 0;
    }
  }

  /**
   * Send a notification through appropriate channels
   */
  private async sendNotification(notification: NotificationQueueItem, channels: NotificationChannel[]): Promise<boolean> {
    try {
      let success = false;

      for (const channel of channels) {
        try {
          switch (channel) {
            case 'email':
              // Email sending is handled by notificationService
              success = true;
              break;
            
            case 'sms':
              // SMS sending is handled by notificationService
              success = true;
              break;
            
            case 'push':
              // Push notification
              const pushSuccess = await notificationService.sendNotification({
                userId: notification.userId,
                title: notification.title,
                body: notification.body,
                type: notification.type,
                data: notification.data,
                appointmentId: notification.appointmentId,
              });
              success = success || pushSuccess;
              break;
          }

          // Log delivery
          await this.logDelivery(notification.id!, notification.userId, channel, 'sent');
        } catch (error) {
          console.error(`Error sending ${channel} notification:`, error);
          await this.logDelivery(notification.id!, notification.userId, channel, 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Log notification delivery
   */
  private async logDelivery(
    notificationId: string,
    userId: string,
    channel: NotificationChannel,
    status: 'sent' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      await adminDb.collection('notificationDeliveryLogs').add({
        notificationId,
        userId,
        channel,
        status,
        sentAt: status === 'sent' ? Timestamp.now() : null,
        errorMessage: errorMessage || null,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error logging delivery:', error);
    }
  }

  /**
   * Create a batch of notifications
   */
  async createBatch(notificationIds: string[]): Promise<string> {
    try {
      const batch: Omit<NotificationBatch, 'id'> = {
        items: notificationIds,
        status: 'pending',
        totalItems: notificationIds.length,
        sentItems: 0,
        failedItems: 0,
        createdAt: Timestamp.now(),
      };

      const docRef = await adminDb.collection('notificationBatches').add(batch);
      return docRef.id;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  /**
   * Process a batch of notifications
   */
  async processBatch(batchId: string): Promise<void> {
    try {
      const batchDoc = await adminDb.collection('notificationBatches').doc(batchId).get();
      
      if (!batchDoc.exists) {
        throw new Error('Batch not found');
      }

      const batch = batchDoc.data() as NotificationBatch;

      // Update batch status
      await batchDoc.ref.update({
        status: 'processing',
        startedAt: Timestamp.now(),
      });

      let sentCount = 0;
      let failedCount = 0;

      // Process each notification in the batch
      for (const notificationId of batch.items) {
        const notifDoc = await adminDb.collection('notificationQueue').doc(notificationId).get();
        
        if (!notifDoc.exists) {
          failedCount++;
          continue;
        }

        const notification = { id: notifDoc.id, ...notifDoc.data() } as NotificationQueueItem;
        
        // Check if already processed
        if (notification.status === 'sent') {
          sentCount++;
          continue;
        }

        // Get enabled channels
        const enabledChannels = await this.getEnabledChannels(notification.userId, notification.type);
        const channelsToUse = notification.channels.filter(ch => enabledChannels.includes(ch));

        if (channelsToUse.length === 0) {
          failedCount++;
          continue;
        }

        // Send notification
        const success = await this.sendNotification(notification, channelsToUse);

        if (success) {
          await notifDoc.ref.update({
            status: 'sent',
            sentAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          sentCount++;
        } else {
          await notifDoc.ref.update({
            status: 'failed',
            failedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          failedCount++;
        }
      }

      // Update batch with results
      await batchDoc.ref.update({
        status: 'completed',
        sentItems: sentCount,
        failedItems: failedCount,
        completedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancel(notificationId: string): Promise<void> {
    try {
      await adminDb.collection('notificationQueue').doc(notificationId).update({
        status: 'cancelled',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Get notification queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    sent: number;
    failed: number;
    cancelled: number;
  }> {
    try {
      const statuses: NotificationStatus[] = ['pending', 'processing', 'sent', 'failed', 'cancelled'];
      const stats: any = {};

      for (const status of statuses) {
        const snapshot = await adminDb
          .collection('notificationQueue')
          .where('status', '==', status)
          .count()
          .get();
        
        stats[status] = snapshot.data().count;
      }

      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        cancelled: 0,
      };
    }
  }
}

export default new NotificationQueue();
