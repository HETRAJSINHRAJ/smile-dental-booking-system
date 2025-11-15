import { adminApp, adminDb } from '../firebase/admin';
import { getMessaging } from 'firebase-admin/messaging';
import { Timestamp } from 'firebase-admin/firestore';

export type NotificationType = 
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_success'
  | 'payment_failed'
  | 'general'
  | 'promotional';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  appointmentId?: string;
}

export interface FCMToken {
  id?: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  active: boolean;
}

class NotificationService {
  /**
   * Send push notification to a user
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      // Get user's FCM tokens
      const tokens = await this.getUserTokens(payload.userId);
      
      if (tokens.length === 0) {
        console.log('No FCM tokens found for user:', payload.userId);
        return false;
      }

      // Prepare FCM message
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          type: payload.type,
          ...payload.data,
          appointmentId: payload.appointmentId || '',
        },
        tokens: tokens.map(t => t.token),
      };

      // Send via Firebase Admin SDK
      const messaging = getMessaging(adminApp);
      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`Successfully sent ${response.successCount} notifications`);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(tokens, response.responses);
      }

      // Save notification to Firestore
      await this.saveNotification(payload);

      return response.successCount > 0;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotifications(payloads: NotificationPayload[]): Promise<number> {
    let successCount = 0;
    
    for (const payload of payloads) {
      const success = await this.sendNotification(payload);
      if (success) successCount++;
    }

    return successCount;
  }

  /**
   * Send appointment confirmation notification
   */
  async sendAppointmentConfirmation(
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Appointment Confirmed',
      body: `Your appointment for ${appointmentDetails.serviceName} with ${appointmentDetails.providerName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`,
      type: 'appointment_confirmed',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Appointment Reminder',
      body: `Reminder: You have an appointment for ${appointmentDetails.serviceName} with ${appointmentDetails.providerName} tomorrow at ${appointmentDetails.time}.`,
      type: 'appointment_reminder',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });
  }

  /**
   * Send appointment cancellation notification
   */
  async sendAppointmentCancellation(
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
      reason?: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Appointment Cancelled',
      body: `Your appointment for ${appointmentDetails.serviceName} on ${appointmentDetails.date} has been cancelled.${appointmentDetails.reason ? ` Reason: ${appointmentDetails.reason}` : ''}`,
      type: 'appointment_cancelled',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccess(
    userId: string,
    paymentDetails: {
      amount: number;
      serviceName: string;
      transactionId: string;
      appointmentId: string;
    }
  ): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Payment Successful',
      body: `Your payment of ₹${paymentDetails.amount} for ${paymentDetails.serviceName} was successful.`,
      type: 'payment_success',
      appointmentId: paymentDetails.appointmentId,
      data: paymentDetails,
    });
  }

  /**
   * Get user's active FCM tokens
   */
  private async getUserTokens(userId: string): Promise<FCMToken[]> {
    try {
      const tokensSnapshot = await adminDb
        .collection('fcmTokens')
        .where('userId', '==', userId)
        .where('active', '==', true)
        .get();

      return tokensSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FCMToken[];
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return [];
    }
  }

  /**
   * Handle failed FCM tokens
   */
  private async handleFailedTokens(
    tokens: FCMToken[],
    responses: any[]
  ): Promise<void> {
    const batch = adminDb.batch();

    responses.forEach((response, index) => {
      if (!response.success && tokens[index]?.id) {
        const error = response.error;
        
        // Deactivate invalid tokens
        if (
          error?.code === 'messaging/invalid-registration-token' ||
          error?.code === 'messaging/registration-token-not-registered'
        ) {
          const tokenRef = adminDb.collection('fcmTokens').doc(tokens[index].id!);
          batch.update(tokenRef, { active: false });
        }
      }
    });

    await batch.commit();
  }

  /**
   * Save notification to Firestore
   */
  private async saveNotification(payload: NotificationPayload): Promise<void> {
    try {
      await adminDb.collection('notifications').add({
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        data: payload.data || {},
        appointmentId: payload.appointmentId || null,
        read: false,
        createdAt: Timestamp.now(),
        sentAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Schedule appointment reminders
   * Call this daily to send reminders for next day appointments
   */
  async scheduleAppointmentReminders(): Promise<number> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      // Get appointments for tomorrow
      const appointmentsSnapshot = await adminDb
        .collection('appointments')
        .where('appointmentDate', '>=', Timestamp.fromDate(tomorrow))
        .where('appointmentDate', '<', Timestamp.fromDate(dayAfter))
        .where('status', '==', 'confirmed')
        .get();

      let sentCount = 0;

      for (const doc of appointmentsSnapshot.docs) {
        const appointment = doc.data();
        
        const success = await this.sendAppointmentReminder(
          appointment.userId,
          {
            serviceName: appointment.serviceName,
            providerName: appointment.providerName,
            date: appointment.appointmentDate.toDate().toLocaleDateString(),
            time: appointment.startTime,
            appointmentId: doc.id,
          }
        );

        if (success) sentCount++;
      }

      return sentCount;
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return 0;
    }
  }
}

export default new NotificationService();
