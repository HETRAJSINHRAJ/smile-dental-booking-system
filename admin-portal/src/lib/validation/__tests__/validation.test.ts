/**
 * Validation and Sanitization Tests
 * 
 * Tests for Zod schemas and sanitization utilities.
 */

import {
  // Schemas
  emailSchema,
  passwordSchema,
  loginPasswordSchema,
  nameSchema,
  indianPhoneSchema,
  pinCodeSchema,
  userRegistrationSchema,
  loginSchema,
  reviewSubmissionSchema,
  refundRequestSchema,
  appointmentBookingSchema,
  validateInput,
  formatZodErrors,
} from '../schemas';

import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeReviewComment,
  sanitizeAppointmentNotes,
  sanitizeSearchQuery,
  containsXSSPatterns,
  sanitizeObject,
} from '../sanitize';

// ============================================================================
// Schema Tests
// ============================================================================

describe('Email Schema', () => {
  it('should accept valid email addresses', () => {
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

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'invalid',
      'test@',
      '@example.com',
      'test@.com',
    ];

    invalidEmails.forEach(email => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    });
  });

  it('should transform email to lowercase', () => {
    const result = emailSchema.safeParse('TEST@EXAMPLE.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });
});

describe('Password Schema', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'Password1',
      'SecurePass123',
      'MyP@ssw0rd',
    ];

    validPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(true);
    });
  });

  it('should reject passwords without uppercase', () => {
    const result = passwordSchema.safeParse('password1');
    expect(result.success).toBe(false);
  });

  it('should reject passwords without lowercase', () => {
    const result = passwordSchema.safeParse('PASSWORD1');
    expect(result.success).toBe(false);
  });

  it('should reject passwords without numbers', () => {
    const result = passwordSchema.safeParse('Password');
    expect(result.success).toBe(false);
  });

  it('should reject short passwords', () => {
    const result = passwordSchema.safeParse('Pass1');
    expect(result.success).toBe(false);
  });
});

describe('Indian Phone Schema', () => {
  it('should accept valid Indian mobile numbers', () => {
    const validPhones = [
      '9876543210',
      '+919876543210',
      '+91 9876543210',
      '6789012345',
    ];

    validPhones.forEach(phone => {
      const result = indianPhoneSchema.safeParse(phone);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '1234567890', // Doesn't start with 6-9
      '12345', // Too short
      '5555555555', // Doesn't start with 6-9
    ];

    invalidPhones.forEach(phone => {
      const result = indianPhoneSchema.safeParse(phone);
      expect(result.success).toBe(false);
    });
  });
});

describe('Name Schema', () => {
  it('should accept valid names', () => {
    const validNames = [
      'John Doe',
      'Priya Sharma',
      "O'Brien",
      'Mary-Jane',
    ];

    validNames.forEach(name => {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(true);
    });
  });

  it('should reject names with invalid characters', () => {
    const invalidNames = [
      'John123',
      'Test<script>',
      'Name@email',
    ];

    invalidNames.forEach(name => {
      const result = nameSchema.safeParse(name);
      expect(result.success).toBe(false);
    });
  });

  it('should reject short names', () => {
    const result = nameSchema.safeParse('A');
    expect(result.success).toBe(false);
  });
});

describe('Review Submission Schema', () => {
  it('should accept valid review data', () => {
    const validReview = {
      providerId: 'provider123',
      appointmentId: 'appointment456',
      rating: 5,
      comment: 'Great service! Very professional and friendly staff.',
    };

    const result = reviewSubmissionSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it('should reject invalid rating', () => {
    const invalidReview = {
      providerId: 'provider123',
      appointmentId: 'appointment456',
      rating: 6, // Invalid: max is 5
      comment: 'Great service!',
    };

    const result = reviewSubmissionSchema.safeParse(invalidReview);
    expect(result.success).toBe(false);
  });

  it('should reject short comments', () => {
    const invalidReview = {
      providerId: 'provider123',
      appointmentId: 'appointment456',
      rating: 5,
      comment: 'Good', // Too short
    };

    const result = reviewSubmissionSchema.safeParse(invalidReview);
    expect(result.success).toBe(false);
  });
});

describe('Refund Request Schema', () => {
  it('should accept valid refund request', () => {
    const validRefund = {
      appointmentId: 'appointment123',
      amount: 500,
      reason: 'Patient requested cancellation due to emergency',
    };

    const result = refundRequestSchema.safeParse(validRefund);
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', () => {
    const invalidRefund = {
      appointmentId: 'appointment123',
      amount: -100,
      reason: 'Test reason for refund',
    };

    const result = refundRequestSchema.safeParse(invalidRefund);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Sanitization Tests
// ============================================================================

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeText(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('should normalize whitespace', () => {
    const input = 'Hello    World';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('should decode HTML entities', () => {
    const input = '&lt;script&gt;alert("xss")&lt;/script&gt;';
    const result = sanitizeText(input);
    expect(result).not.toContain('<script>');
  });
});

describe('sanitizeEmail', () => {
  it('should lowercase and trim email', () => {
    const input = '  TEST@EXAMPLE.COM  ';
    const result = sanitizeEmail(input);
    expect(result).toBe('test@example.com');
  });

  it('should remove dangerous characters', () => {
    const input = 'test<script>@example.com';
    const result = sanitizeEmail(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });
});

describe('sanitizeUrl', () => {
  it('should accept valid http/https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should reject javascript URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('should reject invalid protocols', () => {
    expect(sanitizeUrl('ftp://example.com')).toBe('');
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
  });
});

describe('sanitizeReviewComment', () => {
  it('should remove HTML but preserve content', () => {
    const input = '<b>Great</b> service!';
    const result = sanitizeReviewComment(input);
    expect(result).toBe('Great service!');
  });

  it('should limit length to 1000 characters', () => {
    const input = 'a'.repeat(2000);
    const result = sanitizeReviewComment(input);
    expect(result.length).toBe(1000);
  });
});

describe('containsXSSPatterns', () => {
  it('should detect script tags', () => {
    expect(containsXSSPatterns('<script>alert(1)</script>')).toBe(true);
  });

  it('should detect javascript: protocol', () => {
    expect(containsXSSPatterns('javascript:alert(1)')).toBe(true);
  });

  it('should detect event handlers', () => {
    expect(containsXSSPatterns('onclick=alert(1)')).toBe(true);
    expect(containsXSSPatterns('onerror=alert(1)')).toBe(true);
  });

  it('should not flag normal text', () => {
    expect(containsXSSPatterns('Hello World')).toBe(false);
    expect(containsXSSPatterns('This is a normal comment')).toBe(false);
  });
});

describe('sanitizeObject', () => {
  it('should sanitize all string values in object', () => {
    const input = {
      name: '<script>alert(1)</script>John',
      email: 'test@example.com',
      nested: {
        comment: '<b>Bold</b> text',
      },
    };

    const result = sanitizeObject(input);
    expect(result.name).not.toContain('<script>');
    expect(result.nested.comment).not.toContain('<b>');
  });

  it('should preserve non-string values', () => {
    const input = {
      count: 42,
      active: true,
      data: null,
    };

    const result = sanitizeObject(input as any);
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
  });
});

// Note: CSRF tests are skipped in unit tests due to Next.js server dependencies
// CSRF functionality should be tested in integration/e2e tests

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('validateInput', () => {
  it('should return success for valid data', () => {
    const result = validateInput(emailSchema, 'test@example.com');
    expect(result.success).toBe(true);
    expect(result.data).toBe('test@example.com');
  });

  it('should return errors for invalid data', () => {
    const result = validateInput(emailSchema, 'invalid');
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe('formatZodErrors', () => {
  it('should format errors into object', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: '' });
    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(typeof formatted).toBe('object');
      expect(formatted.email).toBeDefined();
    }
  });
});
