/**
 * Email Notification Service
 * Handles sending emails for appointments, payments, and other notifications
 * 
 * Provider: Resend (https://resend.com)
 */

import { Resend } from 'resend';
import { Timestamp } from 'firebase-admin/firestore';
import { HindiEmailTemplates } from './templates/hindi';

export type EmailType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'payment_receipt'
  | 'welcome'
  | 'password_reset';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  serviceName: string;
  providerName: string;
  appointmentDate: string;
  appointmentTime: string;
  confirmationNumber?: string;
  appointmentId: string;
  cancellationReason?: string;
}

export interface PaymentEmailData {
  patientName: string;
  patientEmail: string;
  amount: number;
  transactionId: string;
  serviceName: string;
  receiptUrl?: string;
}

class EmailService {
  private resend: Resend | null;
  private fromEmail: string;
  private fromName: string;
  private patientUrl: string;
  private hindiTemplates: HindiEmailTemplates;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@smiledental.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Smile Dental';
    this.patientUrl = process.env.NEXT_PUBLIC_PATIENT_URL || 'http://localhost:3000';
    this.hindiTemplates = new HindiEmailTemplates(this.fromName, this.patientUrl);

    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured. Emails will not be sent.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Send email using Resend SDK
   */
  private async sendEmail(payload: EmailPayload, type: EmailType = 'appointment_confirmation'): Promise<boolean> {
    if (!this.resend) {
      console.log('📧 Email would be sent:', payload.subject, 'to:', payload.to);
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: payload.from || `${this.fromName} <${this.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      });

      if (error) {
        console.error('❌ Email send failed:', error);
        await this.logEmail({
          to: payload.to,
          subject: payload.subject,
          type,
          status: 'failed',
          error: error.message,
        });
        return false;
      }

      console.log('✅ Email sent successfully:', data?.id);
      
      // Log to Firestore
      await this.logEmail({
        to: payload.to,
        subject: payload.subject,
        type,
        status: 'sent',
        emailId: data?.id,
      });

      return true;
    } catch (error) {
      console.error('❌ Email send error:', error);
      await this.logEmail({
        to: payload.to,
        subject: payload.subject,
        type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get user's language preference from Firestore
   */
  private async getUserLanguage(email: string): Promise<'en' | 'hi'> {
    try {
      const { adminDb } = await import('../firebase/admin');
      const usersSnapshot = await adminDb.collection('users')
        .where('email', '==', email)
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
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(data: AppointmentEmailData): Promise<boolean> {
    const language = await this.getUserLanguage(data.patientEmail);
    
    const html = language === 'hi' 
      ? this.hindiTemplates.getAppointmentConfirmationHTML(data)
      : this.getAppointmentConfirmationHTML(data);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getAppointmentConfirmationText(data)
      : this.getAppointmentConfirmationText(data);
    
    const subject = language === 'hi'
      ? `अपॉइंटमेंट की पुष्टि - ${data.serviceName}`
      : `Appointment Confirmed - ${data.serviceName}`;

    return this.sendEmail({
      to: data.patientEmail,
      subject,
      html,
      text,
    }, 'appointment_confirmation');
  }

  /**
   * Send appointment reminder email (24h before)
   */
  async sendAppointmentReminder(data: AppointmentEmailData): Promise<boolean> {
    const language = await this.getUserLanguage(data.patientEmail);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getAppointmentReminderHTML(data)
      : this.getAppointmentReminderHTML(data);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getAppointmentReminderText(data)
      : this.getAppointmentReminderText(data);
    
    const subject = language === 'hi'
      ? `रिमाइंडर: कल अपॉइंटमेंट - ${data.serviceName}`
      : `Reminder: Appointment Tomorrow - ${data.serviceName}`;

    return this.sendEmail({
      to: data.patientEmail,
      subject,
      html,
      text,
    }, 'appointment_reminder');
  }

  /**
   * Send appointment cancellation email
   */
  async sendAppointmentCancellation(data: AppointmentEmailData): Promise<boolean> {
    const language = await this.getUserLanguage(data.patientEmail);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getAppointmentCancellationHTML(data)
      : this.getAppointmentCancellationHTML(data);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getAppointmentCancellationText(data)
      : this.getAppointmentCancellationText(data);
    
    const subject = language === 'hi'
      ? `अपॉइंटमेंट रद्द - ${data.serviceName}`
      : `Appointment Cancelled - ${data.serviceName}`;

    return this.sendEmail({
      to: data.patientEmail,
      subject,
      html,
      text,
    }, 'appointment_cancelled');
  }

  /**
   * Send appointment rescheduled email
   */
  async sendAppointmentRescheduled(data: AppointmentEmailData & { 
    oldDate: string; 
    oldTime: string;
    rescheduledBy: 'patient' | 'admin';
  }): Promise<boolean> {
    const language = await this.getUserLanguage(data.patientEmail);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getAppointmentRescheduledHTML(data)
      : this.getAppointmentRescheduledHTML(data);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getAppointmentRescheduledText(data)
      : this.getAppointmentRescheduledText(data);
    
    const subject = language === 'hi'
      ? `अपॉइंटमेंट रीशेड्यूल - ${data.serviceName}`
      : `Appointment Rescheduled - ${data.serviceName}`;

    return this.sendEmail({
      to: data.patientEmail,
      subject,
      html,
      text,
    }, 'appointment_rescheduled');
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(data: PaymentEmailData): Promise<boolean> {
    const language = await this.getUserLanguage(data.patientEmail);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getPaymentReceiptHTML(data)
      : this.getPaymentReceiptHTML(data);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getPaymentReceiptText(data)
      : this.getPaymentReceiptText(data);
    
    const subject = language === 'hi'
      ? `भुगतान रसीद - ₹${data.amount.toFixed(2)}`
      : `Payment Receipt - ₹${data.amount.toFixed(2)}`;

    return this.sendEmail({
      to: data.patientEmail,
      subject,
      html,
      text,
    }, 'payment_receipt');
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const language = await this.getUserLanguage(email);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getWelcomeHTML(name)
      : this.getWelcomeHTML(name);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getWelcomeText(name)
      : this.getWelcomeText(name);
    
    const subject = language === 'hi'
      ? 'Smile Dental में आपका स्वागत है!'
      : 'Welcome to Smile Dental!';

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    }, 'welcome');
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
    const language = await this.getUserLanguage(email);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getPasswordResetHTML(name, resetLink)
      : this.getPasswordResetHTML(name, resetLink);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getPasswordResetText(name, resetLink)
      : this.getPasswordResetText(name, resetLink);
    
    const subject = language === 'hi'
      ? 'पासवर्ड रीसेट अनुरोध - Smile Dental'
      : 'Password Reset Request - Smile Dental';

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    }, 'password_reset');
  }

  /**
   * Send refund notification email
   */
  async sendRefundNotification(email: string, data: {
    patientName: string;
    serviceName: string;
    appointmentDate: string;
    refundAmount: number;
    reason: string;
    confirmationNumber: string;
  }): Promise<boolean> {
    const language = await this.getUserLanguage(email);
    
    const html = language === 'hi'
      ? this.hindiTemplates.getRefundNotificationHTML(data)
      : this.getRefundNotificationHTML(data);
    
    const text = language === 'hi'
      ? this.hindiTemplates.getRefundNotificationText(data)
      : this.getRefundNotificationText(data);
    
    const subject = language === 'hi'
      ? `रिफंड प्रोसेस हो गया - ₹${data.refundAmount.toFixed(2)}`
      : `Refund Processed - ₹${data.refundAmount.toFixed(2)}`;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    }, 'payment_receipt');
  }

  /**
   * Log email to Firestore for tracking
   */
  async logEmail(log: {
    to: string;
    subject: string;
    type: EmailType;
    status: 'sent' | 'failed';
    emailId?: string;
    error?: string;
  }): Promise<void> {
    try {
      // Import adminDb only when needed to avoid circular dependencies
      const { adminDb } = await import('../firebase/admin');
      
      await adminDb.collection('emailLogs').add({
        ...log,
        sentAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // ==================== EMAIL TEMPLATE METHODS ====================

  private getAppointmentConfirmationHTML(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">✅ Appointment Confirmed</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.patientName},</p>
    
    <p>Your appointment has been confirmed! We look forward to seeing you.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Provider:</strong> ${data.providerName}</p>
      <p><strong>Date:</strong> ${data.appointmentDate}</p>
      <p><strong>Time:</strong> ${data.appointmentTime}</p>
      ${data.confirmationNumber ? `<p><strong>Confirmation #:</strong> ${data.confirmationNumber}</p>` : ''}
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Important:</strong> Please arrive 10 minutes early for check-in.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Appointment
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getAppointmentConfirmationText(data: AppointmentEmailData): string {
    return `
Appointment Confirmed

Dear ${data.patientName},

Your appointment has been confirmed!

Appointment Details:
- Service: ${data.serviceName}
- Provider: ${data.providerName}
- Date: ${data.appointmentDate}
- Time: ${data.appointmentTime}
${data.confirmationNumber ? `- Confirmation #: ${data.confirmationNumber}` : ''}

Please arrive 10 minutes early for check-in.

View your appointment: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }

  private getAppointmentReminderHTML(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ Appointment Reminder</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.patientName},</p>
    
    <p>This is a friendly reminder about your appointment <strong>tomorrow</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
      <h2 style="margin-top: 0; color: #f5576c;">Appointment Details</h2>
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Provider:</strong> ${data.providerName}</p>
      <p><strong>Date:</strong> ${data.appointmentDate}</p>
      <p><strong>Time:</strong> ${data.appointmentTime}</p>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Need to reschedule?</strong> Please contact us at least 24 hours in advance.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Appointment
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getAppointmentReminderText(data: AppointmentEmailData): string {
    return `
Appointment Reminder

Dear ${data.patientName},

This is a friendly reminder about your appointment tomorrow.

Appointment Details:
- Service: ${data.serviceName}
- Provider: ${data.providerName}
- Date: ${data.appointmentDate}
- Time: ${data.appointmentTime}

Need to reschedule? Please contact us at least 24 hours in advance.

View your appointment: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }

  private getAppointmentCancellationHTML(data: AppointmentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">❌ Appointment Cancelled</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.patientName},</p>
    
    <p>Your appointment has been cancelled.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fa709a;">
      <h2 style="margin-top: 0; color: #fa709a;">Cancelled Appointment</h2>
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Provider:</strong> ${data.providerName}</p>
      <p><strong>Date:</strong> ${data.appointmentDate}</p>
      <p><strong>Time:</strong> ${data.appointmentTime}</p>
      ${data.cancellationReason ? `<p><strong>Reason:</strong> ${data.cancellationReason}</p>` : ''}
    </div>
    
    <p>If you have any questions or would like to book a new appointment, please contact us.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/booking" 
         style="background: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Book New Appointment
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getAppointmentCancellationText(data: AppointmentEmailData): string {
    return `
Appointment Cancelled

Dear ${data.patientName},

Your appointment has been cancelled.

Cancelled Appointment:
- Service: ${data.serviceName}
- Provider: ${data.providerName}
- Date: ${data.appointmentDate}
- Time: ${data.appointmentTime}
${data.cancellationReason ? `- Reason: ${data.cancellationReason}` : ''}

If you have any questions or would like to book a new appointment, please contact us.

Book new appointment: ${this.patientUrl}/booking

${this.fromName}
    `.trim();
  }

  private getPaymentReceiptHTML(data: PaymentEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💳 Payment Receipt</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.patientName},</p>
    
    <p>Thank you for your payment. Your transaction was successful.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
      <h2 style="margin-top: 0; color: #4facfe;">Payment Details</h2>
      <p><strong>Amount Paid:</strong> ₹${data.amount.toFixed(2)}</p>
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
    </div>
    
    ${data.receiptUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.receiptUrl}" 
         style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Download Receipt PDF
      </a>
    </div>
    ` : ''}
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getPaymentReceiptText(data: PaymentEmailData): string {
    return `
Payment Receipt

Dear ${data.patientName},

Thank you for your payment. Your transaction was successful.

Payment Details:
- Amount Paid: ₹${data.amount.toFixed(2)}
- Service: ${data.serviceName}
- Transaction ID: ${data.transactionId}

${data.receiptUrl ? `Download receipt: ${data.receiptUrl}` : ''}

${this.fromName}
    `.trim();
  }

  private getWelcomeHTML(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🦷 Welcome to ${this.fromName}!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${name},</p>
    
    <p>Welcome to ${this.fromName}! We're excited to have you as part of our dental family.</p>
    
    <p>With your account, you can:</p>
    <ul>
      <li>Book appointments online 24/7</li>
      <li>View your appointment history</li>
      <li>Manage your profile and medical history</li>
      <li>Receive appointment reminders</li>
      <li>Access payment receipts</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/booking" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Book Your First Appointment
      </a>
    </div>
    
    <p>If you have any questions, feel free to contact us anytime.</p>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getWelcomeText(name: string): string {
    return `
Welcome to ${this.fromName}!

Dear ${name},

Welcome to ${this.fromName}! We're excited to have you as part of our dental family.

With your account, you can:
- Book appointments online 24/7
- View your appointment history
- Manage your profile and medical history
- Receive appointment reminders
- Access payment receipts

Book your first appointment: ${this.patientUrl}/booking

If you have any questions, feel free to contact us anytime.

${this.fromName}
    `.trim();
  }

  private getPasswordResetHTML(name: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔐 Password Reset Request</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${name},</p>
    
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      This link will expire in 1 hour for security reasons.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getPasswordResetText(name: string, resetLink: string): string {
    return `
Password Reset Request

Dear ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

${this.fromName}
    `.trim();
  }

  private getAppointmentRescheduledHTML(data: AppointmentEmailData & { 
    oldDate: string; 
    oldTime: string;
    rescheduledBy: 'patient' | 'admin';
  }): string {
    const rescheduledByText = data.rescheduledBy === 'admin' 
      ? 'by our clinic staff' 
      : 'as per your request';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔄 Appointment Rescheduled</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.patientName},</p>
    
    <p>Your appointment has been rescheduled ${rescheduledByText}.</p>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #856404;">Previous Appointment</h3>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${data.oldDate}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${data.oldTime}</p>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin-top: 0; color: #667eea;">New Appointment Details</h2>
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Provider:</strong> ${data.providerName}</p>
      <p><strong>Date:</strong> ${data.appointmentDate}</p>
      <p><strong>Time:</strong> ${data.appointmentTime}</p>
      ${data.confirmationNumber ? `<p><strong>Confirmation #:</strong> ${data.confirmationNumber}</p>` : ''}
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Important:</strong> Please arrive 10 minutes early for check-in.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Appointment
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getAppointmentRescheduledText(data: AppointmentEmailData & { 
    oldDate: string; 
    oldTime: string;
    rescheduledBy: 'patient' | 'admin';
  }): string {
    const rescheduledByText = data.rescheduledBy === 'admin' 
      ? 'by our clinic staff' 
      : 'as per your request';

    return `
Appointment Rescheduled

Dear ${data.patientName},

Your appointment has been rescheduled ${rescheduledByText}.

Previous Appointment:
- Date: ${data.oldDate}
- Time: ${data.oldTime}

New Appointment Details:
- Service: ${data.serviceName}
- Provider: ${data.providerName}
- Date: ${data.appointmentDate}
- Time: ${data.appointmentTime}
${data.confirmationNumber ? `- Confirmation #: ${data.confirmationNumber}` : ''}

Please arrive 10 minutes early for check-in.

View your appointment: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }

  private getRefundNotificationHTML(data: {
    patientName: string;
    serviceName: string;
    appointmentDate: string;
    refundAmount: number;
    reason: string;
    confirmationNumber: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💰 Refund Processed</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${data.patientName},</p>
    
    <p>A refund has been processed for your appointment. The amount will be credited to your original payment method within 5-7 business days.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
      <h2 style="margin-top: 0; color: #4facfe;">Refund Details</h2>
      <p><strong>Refund Amount:</strong> ₹${data.refundAmount.toFixed(2)}</p>
      <p><strong>Service:</strong> ${data.serviceName}</p>
      <p><strong>Appointment Date:</strong> ${data.appointmentDate}</p>
      <p><strong>Confirmation #:</strong> ${data.confirmationNumber}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Note:</strong> The refund will appear in your account within 5-7 business days, depending on your bank or payment provider.
    </p>
    
    <p>If you have any questions about this refund, please don't hesitate to contact us.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${this.patientUrl}/dashboard" 
         style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        View Dashboard
      </a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
      ${this.fromName}
    </p>
  </div>
</body>
</html>
    `;
  }

  private getRefundNotificationText(data: {
    patientName: string;
    serviceName: string;
    appointmentDate: string;
    refundAmount: number;
    reason: string;
    confirmationNumber: string;
  }): string {
    return `
Refund Processed

Dear ${data.patientName},

A refund has been processed for your appointment. The amount will be credited to your original payment method within 5-7 business days.

Refund Details:
- Refund Amount: ₹${data.refundAmount.toFixed(2)}
- Service: ${data.serviceName}
- Appointment Date: ${data.appointmentDate}
- Confirmation #: ${data.confirmationNumber}
- Reason: ${data.reason}

Note: The refund will appear in your account within 5-7 business days, depending on your bank or payment provider.

If you have any questions about this refund, please don't hesitate to contact us.

View your dashboard: ${this.patientUrl}/dashboard

${this.fromName}
    `.trim();
  }
}

const emailService = new EmailService();
export { emailService };
export default emailService;
