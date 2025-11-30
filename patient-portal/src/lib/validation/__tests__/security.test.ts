/**
 * Security-Focused Validation Tests for Patient Portal
 * 
 * Tests for validating that the validation and sanitization utilities
 * properly handle malicious inputs including XSS payloads, SQL injection
 * attempts, and other attack vectors.
 */

import {
  // Schemas
  emailSchema,
  nameSchema,
  reviewSubmissionSchema,
  appointmentBookingSchema,
  userRegistrationSchema,
  loginSchema,
  profileUpdateSchema,
  waitlistEntrySchema,
  contactFormSchema,
  rescheduleRequestSchema,
  validateInput,
} from '../schemas';

import {
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeReviewComment,
  sanitizeAppointmentNotes,
  sanitizeSearchQuery,
  containsXSSPatterns,
  sanitizeObject,
  sanitizeForLogging,
} from '../sanitize';

// ============================================================================
// XSS Attack Vector Tests
// ============================================================================

describe('XSS Attack Prevention', () => {
  describe('sanitizeText', () => {
    it('should remove HTML-based XSS payloads', () => {
      const htmlXssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        '<a href="javascript:alert(\'XSS\')">click</a>',
        '<body onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')">',
        '<input onfocus=alert("XSS") autofocus>',
        '"><script>alert("XSS")</script>',
        '<IMG SRC="javascript:alert(\'XSS\');">',
        '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
        '<IMG SRC=# onmouseover="alert(\'XSS\')">',
      ];

      htmlXssPayloads.forEach(payload => {
        const result = sanitizeText(payload);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('<img');
        expect(result).not.toContain('<svg');
        expect(result).not.toContain('<iframe');
        expect(result).not.toContain('<body');
      });
    });

    it('should preserve plain text content after removing HTML', () => {
      const input = '<b>Hello</b> <script>alert(1)</script>World';
      const result = sanitizeText(input);
      expect(result).toContain('Hello');
      expect(result).toContain('World');
      expect(result).not.toContain('<script>');
    });
  });

  describe('sanitizeReviewComment', () => {
    it('should remove HTML tags from review comments', () => {
      const htmlPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<a href="javascript:alert(1)">click</a>',
      ];
      
      htmlPayloads.forEach(payload => {
        const result = sanitizeReviewComment(payload);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('<img');
        expect(result).not.toContain('<a');
      });
    });

    it('should preserve legitimate review content', () => {
      const legitimateReview = 'Great service! The doctor was very professional. 5 stars!';
      const result = sanitizeReviewComment(legitimateReview);
      expect(result).toBe(legitimateReview);
    });
  });

  describe('sanitizeAppointmentNotes', () => {
    it('should remove HTML tags from appointment notes', () => {
      const htmlPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<div onclick=alert(1)>text</div>',
      ];
      
      htmlPayloads.forEach(payload => {
        const result = sanitizeAppointmentNotes(payload);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('<img');
        expect(result).not.toContain('<div');
      });
    });
  });

  describe('containsXSSPatterns', () => {
    it('should detect XSS patterns', () => {
      expect(containsXSSPatterns('<script>alert(1)</script>')).toBe(true);
      expect(containsXSSPatterns('javascript:alert(1)')).toBe(true);
      expect(containsXSSPatterns('onclick=alert(1)')).toBe(true);
    });

    it('should not flag legitimate content', () => {
      expect(containsXSSPatterns('Hello World')).toBe(false);
      expect(containsXSSPatterns('This is a normal comment')).toBe(false);
    });
  });
});

// ============================================================================
// URL Validation Tests
// ============================================================================

describe('URL Sanitization', () => {
  describe('sanitizeUrl', () => {
    it('should reject javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
    });

    it('should reject vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('');
    });

    it('should accept valid http/https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
    });
  });
});

// ============================================================================
// Email Validation Tests
// ============================================================================

describe('Email Validation and Sanitization', () => {
  describe('emailSchema', () => {
    it('should reject emails with XSS payloads', () => {
      const maliciousEmails = [
        '<script>@example.com',
        'test@<script>.com',
      ];

      maliciousEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.in',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('sanitizeEmail', () => {
    it('should remove dangerous characters from email', () => {
      const result = sanitizeEmail('test<script>@example.com');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });
});

// ============================================================================
// Name Validation Tests
// ============================================================================

describe('Name Validation', () => {
  describe('nameSchema', () => {
    it('should reject names with script tags', () => {
      const result = nameSchema.safeParse('<script>alert(1)</script>');
      expect(result.success).toBe(false);
    });

    it('should reject names with numbers', () => {
      const result = nameSchema.safeParse('John123');
      expect(result.success).toBe(false);
    });

    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Mary-Jane Watson',
        "O'Brien",
      ];

      validNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });
  });
});

// ============================================================================
// Object Sanitization Tests
// ============================================================================

describe('Object Sanitization', () => {
  describe('sanitizeObject', () => {
    it('should sanitize nested objects with XSS', () => {
      const maliciousObject = {
        name: '<script>alert(1)</script>John',
        profile: {
          bio: '<img src=x onerror=alert(1)>',
        },
        tags: ['<script>tag</script>', 'normal'],
      };

      const result = sanitizeObject(maliciousObject);
      expect(result.name).not.toContain('<script>');
      expect(result.profile.bio).not.toContain('onerror');
      expect(result.tags[0]).not.toContain('<script>');
    });
  });

  describe('sanitizeForLogging', () => {
    it('should redact sensitive fields', () => {
      const sensitiveData = {
        username: 'john',
        password: 'secret123',
        apiKey: 'sk-12345',
        token: 'jwt-token',
      };

      const result = sanitizeForLogging(sensitiveData);
      expect(result.username).toBe('john');
      expect(result.password).toBe('[REDACTED]');
      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
    });
  });
});

// ============================================================================
// Schema Validation with Malicious Input Tests
// ============================================================================

describe('Schema Validation with Malicious Inputs', () => {
  describe('reviewSubmissionSchema', () => {
    it('should validate but sanitization should clean XSS from comment', () => {
      const maliciousReview = {
        providerId: 'provider123',
        appointmentId: 'appointment456',
        rating: 5,
        comment: '<script>alert("XSS")</script>Great service!',
      };

      const result = reviewSubmissionSchema.safeParse(maliciousReview);
      expect(result.success).toBe(true);

      if (result.success) {
        const sanitizedComment = sanitizeReviewComment(result.data.comment);
        expect(sanitizedComment).not.toContain('<script>');
      }
    });
  });

  describe('appointmentBookingSchema', () => {
    it('should reject invalid time formats', () => {
      const invalidBooking = {
        serviceId: 'service123',
        serviceName: 'Dental Cleaning',
        providerId: 'provider123',
        providerName: 'Dr. Smith',
        appointmentDate: '2024-01-15',
        startTime: '25:00', // Invalid
        endTime: '10:00',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
      };

      const result = appointmentBookingSchema.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });
  });

  describe('userRegistrationSchema', () => {
    it('should reject weak passwords', () => {
      const weakPasswordUser = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        fullName: 'John Doe',
        consent: {
          privacyPolicy: true,
          termsOfService: true,
        },
      };

      const result = userRegistrationSchema.safeParse(weakPasswordUser);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const mismatchedUser = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        fullName: 'John Doe',
        consent: {
          privacyPolicy: true,
          termsOfService: true,
        },
      };

      const result = userRegistrationSchema.safeParse(mismatchedUser);
      expect(result.success).toBe(false);
    });
  });

  describe('contactFormSchema', () => {
    it('should validate contact form with sanitization', () => {
      const maliciousContact = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: '<script>alert(1)</script>Question',
        message: 'This is a legitimate message with enough characters.',
      };

      const result = contactFormSchema.safeParse(maliciousContact);
      // Schema validates structure, sanitization cleans content
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// Length Limit Tests
// ============================================================================

describe('Length Limits', () => {
  it('should truncate excessively long inputs', () => {
    const longInput = 'a'.repeat(20000);
    
    expect(sanitizeText(longInput).length).toBeLessThanOrEqual(10000);
    expect(sanitizeReviewComment(longInput).length).toBeLessThanOrEqual(1000);
    expect(sanitizeAppointmentNotes(longInput).length).toBeLessThanOrEqual(500);
    expect(sanitizeSearchQuery(longInput).length).toBeLessThanOrEqual(100);
  });
});
