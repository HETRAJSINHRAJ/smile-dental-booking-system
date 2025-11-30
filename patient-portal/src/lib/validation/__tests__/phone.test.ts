import {
  validateIndianPhoneNumber,
  formatIndianPhoneNumber,
  isValidForSMS,
  normalizeIndianPhoneNumber,
} from '../phone';

describe('Phone Validation', () => {
  describe('validateIndianPhoneNumber', () => {
    it('should validate 10-digit mobile number', () => {
      const result = validateIndianPhoneNumber('9876543210');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('mobile');
      expect(result.normalizedNumber).toBe('+919876543210');
    });

    it('should validate mobile number with +91 country code', () => {
      const result = validateIndianPhoneNumber('+919876543210');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('mobile');
      expect(result.normalizedNumber).toBe('+919876543210');
    });

    it('should validate mobile number with spaces', () => {
      const result = validateIndianPhoneNumber('+91 9876543210');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('mobile');
    });

    it('should validate mobile number with dashes', () => {
      const result = validateIndianPhoneNumber('+91-9876543210');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('mobile');
    });

    it('should validate landline number starting with 5', () => {
      const result = validateIndianPhoneNumber('5876543210');
      // This is actually a valid landline number
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('landline');
    });

    it('should reject mobile number with less than 10 digits', () => {
      const result = validateIndianPhoneNumber('987654321');
      expect(result.isValid).toBe(false);
    });

    it('should reject empty phone number', () => {
      const result = validateIndianPhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('should handle mobile numbers starting with 6, 7, 8, 9', () => {
      expect(validateIndianPhoneNumber('6123456789').isValid).toBe(true);
      expect(validateIndianPhoneNumber('7123456789').isValid).toBe(true);
      expect(validateIndianPhoneNumber('8123456789').isValid).toBe(true);
      expect(validateIndianPhoneNumber('9123456789').isValid).toBe(true);
    });
  });

  describe('formatIndianPhoneNumber', () => {
    it('should format 10-digit number with country code and spaces', () => {
      const formatted = formatIndianPhoneNumber('9876543210');
      expect(formatted).toBe('+91 98765 43210');
    });

    it('should format number that already has country code', () => {
      const formatted = formatIndianPhoneNumber('+919876543210');
      expect(formatted).toBe('+91 98765 43210');
    });

    it('should return empty string for invalid number', () => {
      const formatted = formatIndianPhoneNumber('123');
      expect(formatted).toBe('');
    });
  });

  describe('isValidForSMS', () => {
    it('should return true for valid mobile number', () => {
      expect(isValidForSMS('9876543210')).toBe(true);
      expect(isValidForSMS('+919876543210')).toBe(true);
    });

    it('should return false for invalid number', () => {
      expect(isValidForSMS('123')).toBe(false);
      expect(isValidForSMS('')).toBe(false);
    });
  });

  describe('normalizeIndianPhoneNumber', () => {
    it('should normalize 10-digit number to +91 format', () => {
      expect(normalizeIndianPhoneNumber('9876543210')).toBe('+919876543210');
    });

    it('should normalize number with spaces', () => {
      expect(normalizeIndianPhoneNumber('98765 43210')).toBe('+919876543210');
    });

    it('should return empty string for invalid number', () => {
      expect(normalizeIndianPhoneNumber('invalid')).toBe('');
    });
  });
});
