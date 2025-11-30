/**
 * Tests for Hindi Email Templates
 */

import { HindiEmailTemplates } from '../hindi';
import { AppointmentEmailData, PaymentEmailData } from '../../emailService';

describe('HindiEmailTemplates', () => {
  const templates = new HindiEmailTemplates('Smile Dental', 'http://localhost:3000');

  const mockAppointmentData: AppointmentEmailData = {
    patientName: 'राज कुमार',
    patientEmail: 'raj@example.com',
    serviceName: 'दांत की सफाई',
    providerName: 'डॉ. शर्मा',
    appointmentDate: '15 दिसंबर 2024',
    appointmentTime: '10:00 AM',
    confirmationNumber: 'APT123',
    appointmentId: 'apt123',
  };

  const mockPaymentData: PaymentEmailData = {
    patientName: 'राज कुमार',
    patientEmail: 'raj@example.com',
    amount: 500,
    transactionId: 'TXN123',
    serviceName: 'दांत की सफाई',
  };

  describe('Appointment Confirmation', () => {
    it('should generate Hindi HTML template with correct content', () => {
      const html = templates.getAppointmentConfirmationHTML(mockAppointmentData);
      
      expect(html).toContain('अपॉइंटमेंट की पुष्टि हो गई');
      expect(html).toContain('राज कुमार');
      expect(html).toContain('दांत की सफाई');
      expect(html).toContain('डॉ. शर्मा');
      expect(html).toContain('APT123');
    });

    it('should generate Hindi text template with correct content', () => {
      const text = templates.getAppointmentConfirmationText(mockAppointmentData);
      
      expect(text).toContain('अपॉइंटमेंट की पुष्टि हो गई');
      expect(text).toContain('राज कुमार');
      expect(text).toContain('दांत की सफाई');
    });
  });

  describe('Appointment Reminder', () => {
    it('should generate Hindi reminder template', () => {
      const html = templates.getAppointmentReminderHTML(mockAppointmentData);
      
      expect(html).toContain('अपॉइंटमेंट रिमाइंडर');
      expect(html).toContain('कल');
    });
  });

  describe('Payment Receipt', () => {
    it('should generate Hindi payment receipt template', () => {
      const html = templates.getPaymentReceiptHTML(mockPaymentData);
      
      expect(html).toContain('भुगतान रसीद');
      expect(html).toContain('₹500.00');
      expect(html).toContain('TXN123');
    });
  });

  describe('Welcome Email', () => {
    it('should generate Hindi welcome template', () => {
      const html = templates.getWelcomeHTML('राज कुमार');
      
      expect(html).toContain('स्वागत है');
      expect(html).toContain('राज कुमार');
    });
  });
});
