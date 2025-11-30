import { adminApp, adminDb } from '../firebase/admin';
import { getMessaging } from 'firebase-admin/messaging';
import { Timestamp } from 'firebase-admin/firestore';
import emailService from '../email/emailService';
import smsService from '../sms/smsService';
import { format } from 'date-fns';

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
   * Send appointment confirmation notification (push + email + SMS)
   */
  async sendAppointmentConfirmation(
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
      patientName: string;
      patientEmail: string;
      patientPhone?: string;
      confirmationNumber?: string;
    }
  ): Promise<boolean> {
    // Send push notification
    const pushSent = await this.sendNotification({
      userId,
      title: 'Appointment Confirmed',
      body: `Your appointment for ${appointmentDetails.serviceName} with ${appointmentDetails.providerName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`,
      type: 'appointment_confirmed',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });

    // Send email notification
    const emailSent = await emailService.sendAppointmentConfirmation({
      patientName: appointmentDetails.patientName,
      patientEmail: appointmentDetails.patientEmail,
      serviceName: appointmentDetails.serviceName,
      providerName: appointmentDetails.providerName,
      appointmentDate: appointmentDetails.date,
      appointmentTime: appointmentDetails.time,
      confirmationNumber: appointmentDetails.confirmationNumber,
      appointmentId: appointmentDetails.appointmentId,
    });

    // Send SMS notification if phone number is provided
    let smsSent = false;
    if (appointmentDetails.patientPhone) {
      smsSent = await smsService.sendAppointmentConfirmation({
        patientName: appointmentDetails.patientName,
        patientPhone: appointmentDetails.patientPhone,
        serviceName: appointmentDetails.serviceName,
        providerName: appointmentDetails.providerName,
        appointmentDate: appointmentDetails.date,
        appointmentTime: appointmentDetails.time,
        confirmationNumber: appointmentDetails.confirmationNumber,
        appointmentId: appointmentDetails.appointmentId,
      });
    }

    return pushSent || emailSent || smsSent;
  }

  /**
   * Send appointment reminder (push + email + SMS)
   */
  async sendAppointmentReminder(
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
      patientName: string;
      patientEmail: string;
      patientPhone?: string;
    }
  ): Promise<boolean> {
    // Send push notification
    const pushSent = await this.sendNotification({
      userId,
      title: 'Appointment Reminder',
      body: `Reminder: You have an appointment for ${appointmentDetails.serviceName} with ${appointmentDetails.providerName} tomorrow at ${appointmentDetails.time}.`,
      type: 'appointment_reminder',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });

    // Send email notification
    const emailSent = await emailService.sendAppointmentReminder({
      patientName: appointmentDetails.patientName,
      patientEmail: appointmentDetails.patientEmail,
      serviceName: appointmentDetails.serviceName,
      providerName: appointmentDetails.providerName,
      appointmentDate: appointmentDetails.date,
      appointmentTime: appointmentDetails.time,
      appointmentId: appointmentDetails.appointmentId,
    });

    // Send SMS notification if phone number is provided
    let smsSent = false;
    if (appointmentDetails.patientPhone) {
      smsSent = await smsService.sendAppointmentReminder({
        patientName: appointmentDetails.patientName,
        patientPhone: appointmentDetails.patientPhone,
        serviceName: appointmentDetails.serviceName,
        providerName: appointmentDetails.providerName,
        appointmentDate: appointmentDetails.date,
        appointmentTime: appointmentDetails.time,
        appointmentId: appointmentDetails.appointmentId,
      });
    }

    return pushSent || emailSent || smsSent;
  }

  /**
   * Send appointment cancellation notification (push + email + SMS)
   */
  async sendAppointmentCancellation(
    userId: string,
    appointmentDetails: {
      serviceName: string;
      providerName: string;
      date: string;
      time: string;
      appointmentId: string;
      patientName: string;
      patientEmail: string;
      patientPhone?: string;
      reason?: string;
    }
  ): Promise<boolean> {
    // Send push notification
    const pushSent = await this.sendNotification({
      userId,
      title: 'Appointment Cancelled',
      body: `Your appointment for ${appointmentDetails.serviceName} on ${appointmentDetails.date} has been cancelled.${appointmentDetails.reason ? ` Reason: ${appointmentDetails.reason}` : ''}`,
      type: 'appointment_cancelled',
      appointmentId: appointmentDetails.appointmentId,
      data: appointmentDetails,
    });

    // Send email notification
    const emailSent = await emailService.sendAppointmentCancellation({
      patientName: appointmentDetails.patientName,
      patientEmail: appointmentDetails.patientEmail,
      serviceName: appointmentDetails.serviceName,
      providerName: appointmentDetails.providerName,
      appointmentDate: appointmentDetails.date,
      appointmentTime: appointmentDetails.time,
      cancellationReason: appointmentDetails.reason,
      appointmentId: appointmentDetails.appointmentId,
    });

    // Send SMS notification if phone number is provided
    let smsSent = false;
    if (appointmentDetails.patientPhone) {
      smsSent = await smsService.sendAppointmentCancellation({
        patientName: appointmentDetails.patientName,
        patientPhone: appointmentDetails.patientPhone,
        serviceName: appointmentDetails.serviceName,
        providerName: appointmentDetails.providerName,
        appointmentDate: appointmentDetails.date,
        appointmentTime: appointmentDetails.time,
        cancellationReason: appointmentDetails.reason,
        appointmentId: appointmentDetails.appointmentId,
      });
    }

    return pushSent || emailSent || smsSent;
  }

  /**
   * Send payment success notification (push + email + SMS)
   */
  async sendPaymentSuccess(
    userId: string,
    paymentDetails: {
      amount: number;
      serviceName: string;
      transactionId: string;
      appointmentId: string;
      patientName: string;
      patientEmail: string;
      patientPhone?: string;
      receiptUrl?: string;
    }
  ): Promise<boolean> {
    // Send push notification
    const pushSent = await this.sendNotification({
      userId,
      title: 'Payment Successful',
      body: `Your payment of ₹${paymentDetails.amount} for ${paymentDetails.serviceName} was successful.`,
      type: 'payment_success',
      appointmentId: paymentDetails.appointmentId,
      data: paymentDetails,
    });

    // Send email notification with receipt
    const emailSent = await emailService.sendPaymentReceipt({
      patientName: paymentDetails.patientName,
      patientEmail: paymentDetails.patientEmail,
      amount: paymentDetails.amount,
      transactionId: paymentDetails.transactionId,
      serviceName: paymentDetails.serviceName,
      receiptUrl: paymentDetails.receiptUrl,
    });

    // Send SMS notification if phone number is provided
    let smsSent = false;
    if (paymentDetails.patientPhone) {
      smsSent = await smsService.sendPaymentReceipt({
        patientName: paymentDetails.patientName,
        patientPhone: paymentDetails.patientPhone,
        amount: paymentDetails.amount,
        transactionId: paymentDetails.transactionId,
        serviceName: paymentDetails.serviceName,
      });
    }

    return pushSent || emailSent || smsSent;
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
            date: format(appointment.appointmentDate.toDate(), 'MMMM d, yyyy'),
            time: appointment.startTime,
            appointmentId: doc.id,
            patientName: appointment.userName,
            patientEmail: appointment.userEmail,
            patientPhone: appointment.userPhone,
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
