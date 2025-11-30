/**
 * Tests for Hindi SMS Templates
 */

import { HindiSMSTemplates } from '../hindi';
import { AppointmentSMSData, PaymentSMSData } from '../../smsService';

describe('HindiSMSTemplates', () => {
  const templates = new HindiSMSTemplates();

  const mockAppointmentData: AppointmentSMSData = {
    patientName: 'राज कुमार',
    patientPhone: '+919876543210',
    serviceName: 'दांत की सफाई',
    providerName: 'शर्मा',
    appointmentDate: '15 दिसंबर 2024',
    appointmentTime: '10:00 AM',
    confirmationNumber: 'APT123',
    appointmentId: 'apt123',
  };

  const mockPaymentData: PaymentSMSData = {
    patientName: 'राज कुमार',
    patientPhone: '+919876543210',
    amount: 500,
    transactionId: 'TXN123',
    serviceName: 'दांत की सफाई',
  };

  describe('Appointment Confirmation SMS', () => {
    it('should generate Hindi SMS with correct content', () => {
      const sms = templates.getAppointmentConfirmationTemplate(mockAppointmentData);
      
      expect(sms).toContain('अपॉइंटमेंट की पुष्टि');
      expect(sms).toContain('राज कुमार');
      expect(sms).toContain('दांत की सफाई');
      expect(sms).toContain('डॉ. शर्मा');
      expect(sms).toContain('APT123');
    });
  });

  describe('Appointment Reminder SMS', () => {
    it('should generate Hindi reminder SMS', () => {
      const sms = templates.getAppointmentReminderTemplate(mockAppointmentData);
      
      expect(sms).toContain('रिमाइंडर');
      expect(sms).toContain('कल');
    });
  });

  describe('Payment Receipt SMS', () => {
    it('should generate Hindi payment SMS', () => {
      const sms = templates.getPaymentReceiptTemplate(mockPaymentData);
      
      expect(sms).toContain('भुगतान प्राप्त हुआ');
      expect(sms).toContain('₹500.00');
      expect(sms).toContain('TXN123');
    });
  });

  describe('Verification Code SMS', () => {
    it('should generate Hindi verification code SMS', () => {
      const sms = templates.getVerificationCodeTemplate('123456');
      
      expect(sms).toContain('123456');
      expect(sms).toContain('सत्यापन कोड');
      expect(sms).toContain('10 मिनट');
    });
  });
});
