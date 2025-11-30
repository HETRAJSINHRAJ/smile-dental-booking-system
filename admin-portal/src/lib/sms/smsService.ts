/**
 * SMS Notification Service
 * Handles sending SMS messages for appointments and notifications
 * 
 * Provider: Twilio (https://www.twilio.com)
 */

import { Timestamp } from 'firebase-admin/firestore';
import { HindiSMSTemplates } from './templates/hindi';

export type SMSType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_receipt'
  | 'verification_code'
  | 'general';

export interface SMSPayload {
  to: string;
  body: string;
  from?: string;
}

export interface AppointmentSMSData {
  patientName: string;
  patientPhone: string;
  serviceName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
  confirmationNumber?: string;
  appointmentId: string;
  cancellationReason?: string;
}

export interface PaymentSMSData {
  patientName: string;
  patientPhone: string;
  amount: number;
  transactionId: string;
  serviceName: string;
}

class SMSService {
  private twilioClient: any | null;
  private fromPhone: string;
  private isConfigured: boolean;
  private hindiTemplates: HindiSMSTemplates;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromPhone = process.env.TWILIO_PHONE_NUMBER || '';
    this.hindiTemplates = new HindiSMSTemplates();

    if (!accountSid || !authToken || !this.fromPhone) {
      console.warn('⚠️  Twilio credentials not configured. SMS will not be sent.');
      this.twilioClient = null;
      this.isConfigured = false;
    } else {
      // Dynamically import Twilio only if configured
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('✅ Twilio SMS service initialized');
      } catch (error) {
        console.warn('⚠️  Twilio package not installed. Run: npm install twilio');
        this.twilioClient = null;
        this.isConfigured = false;
      }
    }
  }

  /**
   * Send SMS using Twilio SDK
   */
  private async sendSMS(payload: SMSPayload, type: SMSType = 'general'): Promise<boolean> {
    if (!this.twilioClient) {
      console.log('📱 SMS would be sent:', payload.body.substring(0, 50) + '...', 'to:', payload.to);
      return false;
    }

    try {
      // Validate phone number format
      const formattedPhone = this.formatPhoneNumber(payload.to);
      if (!formattedPhone) {
        console.error('❌ Invalid phone number format:', payload.to);
        await this.logSMS({
          to: payload.to,
          body: payload.body,
          type,
          status: 'failed',
          error: 'Invalid phone number format',
        });
        return false;
      }

      const message = await this.twilioClient.messages.create({
        body: payload.body,
        from: payload.from || this.fromPhone,
        to: formattedPhone,
      });

      console.log('✅ SMS sent successfully:', message.sid);
      
      // Log to Firestore
      await this.logSMS({
        to: formattedPhone,
        body: payload.body,
        type,
        status: 'sent',
        messageSid: message.sid,
        deliveryStatus: message.status,
      });

      return true;
    } catch (error: any) {
      console.error('❌ SMS send error:', error);
      await this.logSMS({
        to: payload.to,
        body: payload.body,
        type,
        status: 'failed',
        error: error?.message || 'Unknown error',
        errorCode: error?.code,
      });
      return false;
    }
  }

  /**
   * Format phone number to E.164 format (+[country code][number])
   * Assumes Indian phone numbers if no country code provided
   */
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If already has country code (starts with 91 and has 12 digits)
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }

    // If 10 digits, assume Indian number
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    // If starts with + and has valid length
    if (phone.startsWith('+') && cleaned.length >= 10) {
      return `+${cleaned}`;
    }

    return null;
  }

  /**
   * Get user's language preference from Firestore
   */
  private async getUserLanguageByPhone(phone: string): Promise<'en' | 'hi'> {
    try {
      const { adminDb } = await import('../firebase/admin');
      const usersSnapshot = await adminDb.collection('users')
        .where('phone', '==', phone)
        .limit(1)
        .get();
      
      if (!usersSnapshot.empty) {
        const userData = usersSnapshot.docs[0].data();
        return userData?.preferences?.language || 'en';
      }
    } catch (error) {
      console.error('Error fetching user language preference:', error);
    }
    return 'en'; // Default to English
  }

  /**
   * Send appointment confirmation SMS
   */
  async sendAppointmentConfirmation(data: AppointmentSMSData): Promise<boolean> {
    const language = await this.getUserLanguageByPhone(data.patientPhone);
    
    const body = language === 'hi'
      ? this.hindiTemplates.getAppointmentConfirmationTemplate(data)
      : this.getAppointmentConfirmationTemplate(data);

    return this.sendSMS({
      to: data.patientPhone,
      body,
    }, 'appointment_confirmation');
  }

  /**
   * Send appointment reminder SMS (24h before)
   */
  async sendAppointmentReminder(data: AppointmentSMSData): Promise<boolean> {
    const language = await this.getUserLanguageByPhone(data.patientPhone);
    
    const body = language === 'hi'
      ? this.hindiTemplates.getAppointmentReminderTemplate(data)
      : this.getAppointmentReminderTemplate(data);

    return this.sendSMS({
      to: data.patientPhone,
      body,
    }, 'appointment_reminder');
  }

  /**
   * Send appointment cancellation SMS
   */
  async sendAppointmentCancellation(data: AppointmentSMSData): Promise<boolean> {
    const language = await this.getUserLanguageByPhone(data.patientPhone);
    
    const body = language === 'hi'
      ? this.hindiTemplates.getAppointmentCancellationTemplate(data)
      : this.getAppointmentCancellationTemplate(data);

    return this.sendSMS({
      to: data.patientPhone,
      body,
    }, 'appointment_cancelled');
  }

  /**
   * Send appointment rescheduled SMS
   */
  async sendAppointmentRescheduled(data: AppointmentSMSData): Promise<boolean> {
    const language = await this.getUserLanguageByPhone(data.patientPhone);
    
    const body = language === 'hi'
      ? this.hindiTemplates.getAppointmentRescheduledTemplate(data)
      : this.getAppointmentRescheduledTemplate(data);

    return this.sendSMS({
      to: data.patientPhone,
      body,
    }, 'appointment_rescheduled');
  }

  /**
   * Send payment receipt SMS
   */
  async sendPaymentReceipt(data: PaymentSMSData): Promise<boolean> {
    const language = await this.getUserLanguageByPhone(data.patientPhone);
    
    const body = language === 'hi'
      ? this.hindiTemplates.getPaymentReceiptTemplate(data)
      : this.getPaymentReceiptTemplate(data);

    return this.sendSMS({
      to: data.patientPhone,
      body,
    }, 'payment_receipt');
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    const language = await this.getUserLanguageByPhone(phone);
    
    const body = language === 'hi'
      ? this.hindiTemplates.getVerificationCodeTemplate(code)
      : `Your verification code is: ${code}. This code will expire in 10 minutes. Do not share this code with anyone.`;

    return this.sendSMS({
      to: phone,
      body,
    }, 'verification_code');
  }

  /**
   * Send custom SMS
   */
  async sendCustomSMS(phone: string, message: string): Promise<boolean> {
    return this.sendSMS({
      to: phone,
      body: message,
    }, 'general');
  }

  /**
   * Log SMS to Firestore for tracking
   */
  async logSMS(log: {
    to: string;
    body: string;
    type: SMSType;
    status: 'sent' | 'failed' | 'delivered' | 'undelivered';
    messageSid?: string;
    deliveryStatus?: string;
    error?: string;
    errorCode?: string;
  }): Promise<void> {
    try {
      // Import adminDb only when needed to avoid circular dependencies
      const { adminDb } = await import('../firebase/admin');
      
      await adminDb.collection('smsLogs').add({
        ...log,
        sentAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to log SMS:', error);
    }
  }

  /**
   * Check SMS delivery status
   * Can be called periodically to update delivery status
   */
  async checkDeliveryStatus(messageSid: string): Promise<string | null> {
    if (!this.twilioClient) {
      return null;
    }

    try {
      const message = await this.twilioClient.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      console.error('Error checking SMS delivery status:', error);
      return null;
    }
  }

  /**
   * Get service configuration status
   */
  getStatus(): { configured: boolean; message: string } {
    if (this.isConfigured) {
      return {
        configured: true,
        message: 'Twilio SMS service is configured and ready',
      };
    }
    return {
      configured: false,
      message: 'Twilio SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.',
    };
  }

  // ==================== SMS TEMPLATE METHODS ====================

  private getAppointmentConfirmationTemplate(data: AppointmentSMSData): string {
    return `✅ Appointment Confirmed

Hi ${data.patientName},

Your appointment is confirmed:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}
👨‍⚕️ Dr. ${data.providerName}
${data.confirmationNumber ? `🔖 Ref: ${data.confirmationNumber}` : ''}

Please arrive 10 minutes early.

- Smile Dental`;
  }

  private getAppointmentReminderTemplate(data: AppointmentSMSData): string {
    return `⏰ Appointment Reminder

Hi ${data.patientName},

Reminder: You have an appointment tomorrow:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}
👨‍⚕️ Dr. ${data.providerName}

Need to reschedule? Contact us ASAP.

- Smile Dental`;
  }

  private getAppointmentCancellationTemplate(data: AppointmentSMSData): string {
    let message = `❌ Appointment Cancelled

Hi ${data.patientName},

Your appointment has been cancelled:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}`;

    if (data.cancellationReason) {
      message += `\n\nReason: ${data.cancellationReason}`;
    }

    message += '\n\nTo book a new appointment, visit our website or call us.\n\n- Smile Dental';

    return message;
  }

  private getAppointmentRescheduledTemplate(data: AppointmentSMSData): string {
    return `🔄 Appointment Rescheduled

Hi ${data.patientName},

Your appointment has been rescheduled to:
📅 ${data.appointmentDate}
🕐 ${data.appointmentTime}
🏥 ${data.serviceName}
👨‍⚕️ Dr. ${data.providerName}

See you then!

- Smile Dental`;
  }

  private getPaymentReceiptTemplate(data: PaymentSMSData): string {
    return `💳 Payment Received

Hi ${data.patientName},

Payment successful!
💰 Amount: ₹${data.amount.toFixed(2)}
🏥 Service: ${data.serviceName}
🔖 Transaction ID: ${data.transactionId}

Thank you for your payment.

- Smile Dental`;
  }
}

export default new SMSService();
