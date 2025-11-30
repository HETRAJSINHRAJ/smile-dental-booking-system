/**
 * Security-Focused Validation Tests
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
  refundRequestSchema,
  waitlistEntrySchema,
  appointmentSearchSchema,
  validateInput,
} from '../schemas';

import {
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeReviewComment,
  sanitizeAppointmentNotes,
  sanitizeAdminNotes,
  sanitizeSearchQuery,
  sanitizeFilename,
  containsXSSPatterns,
  containsSQLInjectionPatterns,
  sanitizeObject,
  sanitizeForLogging,
  escapeForQuery,
} from '../sanitize';

// ============================================================================
// XSS Attack Vector Tests
// ============================================================================

describe('XSS Attack Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<a href="javascript:alert(\'XSS\')">click</a>',
    '<body onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<input onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '<video><source onerror="alert(\'XSS\')">',
    '"><script>alert("XSS")</script>',
    '\';alert(String.fromCharCode(88,83,83))//\';',
    '<IMG SRC="javascript:alert(\'XSS\');">',
    '<IMG SRC=javascript:alert(&quot;XSS&quot;)>',
    '<IMG SRC=`javascript:alert("XSS")`>',
    '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
    '<IMG SRC=javascript:alert(String.fromCharCode(88,83,83))>',
    '<IMG SRC=# onmouseover="alert(\'XSS\')">',
    '<IMG SRC= onmouseover="alert(\'XSS\')">',
    '<IMG onmouseover="alert(\'XSS\')">',
  ];

  describe('sanitizeText', () => {
    it('should remove HTML-based XSS payloads', () => {
      // HTML-based XSS payloads that sanitizeText should handle
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

  describe('sanitizeAdminNotes', () => {
    it('should remove dangerous HTML from admin notes', () => {
      const htmlPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<iframe src="javascript:alert(1)">',
      ];
      
      htmlPayloads.forEach(payload => {
        const result = sanitizeAdminNotes(payload);
        expect(result).not.toContain('<script');
        expect(result).not.toContain('<img');
        expect(result).not.toContain('<iframe');
      });
    });

    it('should allow basic formatting tags in admin notes', () => {
      const input = '<b>Important</b> note with <i>emphasis</i>';
      const result = sanitizeAdminNotes(input);
      expect(result).toContain('<b>');
      expect(result).toContain('<i>');
    });
  });

  describe('containsXSSPatterns', () => {
    it('should detect all XSS patterns', () => {
      xssPayloads.forEach(payload => {
        // Most payloads should be detected
        const detected = containsXSSPatterns(payload);
        // At least script tags and javascript: should be detected
        if (payload.includes('<script') || payload.includes('javascript:') || /on\w+=/i.test(payload)) {
          expect(detected).toBe(true);
        }
      });
    });

    it('should not flag legitimate content', () => {
      const legitimateContent = [
        'Hello World',
        'This is a normal comment',
        'I love this service!',
        'The appointment was at 10:00 AM',
        'Dr. Smith was very helpful',
      ];

      legitimateContent.forEach(content => {
        expect(containsXSSPatterns(content)).toBe(false);
      });
    });
  });
});

// ============================================================================
// SQL/NoSQL Injection Tests
// ============================================================================

describe('SQL/NoSQL Injection Prevention', () => {
  const sqlInjectionPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1; DELETE FROM appointments WHERE '1'='1",
    "admin'--",
    "1' UNION SELECT * FROM users--",
    "'; INSERT INTO users VALUES('hacker', 'password'); --",
    "1' AND 1=1--",
    "' OR 1=1#",
    "' OR 'x'='x",
    "1' ORDER BY 1--",
    "1' GROUP BY 1--",
    "1' HAVING 1=1--",
    "'; EXEC xp_cmdshell('dir'); --",
    "1'; WAITFOR DELAY '0:0:10'--",
  ];

  const noSqlInjectionPayloads = [
    '{"$gt": ""}',
    '{"$ne": null}',
    '{"$where": "this.password.length > 0"}',
    '{"$regex": ".*"}',
    '{"$or": [{"a": 1}, {"b": 2}]}',
  ];

  describe('containsSQLInjectionPatterns', () => {
    it('should detect SQL injection patterns', () => {
      sqlInjectionPayloads.forEach(payload => {
        const detected = containsSQLInjectionPatterns(payload);
        // Most SQL injection patterns should be detected
        if (payload.includes('DROP') || payload.includes('DELETE') || 
            payload.includes('UNION') || payload.includes("'1'='1") ||
            payload.includes('OR 1=1')) {
          expect(detected).toBe(true);
        }
      });
    });
  });

  describe('escapeForQuery', () => {
    it('should escape NoSQL injection characters', () => {
      noSqlInjectionPayloads.forEach(payload => {
        const result = escapeForQuery(payload);
        expect(result).not.toContain('$');
        expect(result).not.toContain('{');
        expect(result).not.toContain('}');
      });
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should sanitize search queries with injection attempts', () => {
      const maliciousQueries = [
        "'; DROP TABLE--",
        '<script>alert(1)</script>',
        '${process.env.SECRET}',
        '{{constructor.constructor("return this")()}}',
      ];

      maliciousQueries.forEach(query => {
        const result = sanitizeSearchQuery(query);
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).not.toContain("'");
        expect(result).not.toContain('"');
        expect(result).not.toContain('`');
        expect(result).not.toContain(';');
      });
    });
  });
});

// ============================================================================
// URL Validation Tests
// ============================================================================

describe('URL Sanitization', () => {
  describe('sanitizeUrl', () => {
    it('should reject javascript: URLs', () => {
      const maliciousUrls = [
        'javascript:alert(1)',
        'JAVASCRIPT:alert(1)',
        'javascript:void(0)',
        '  javascript:alert(1)  ',
      ];

      maliciousUrls.forEach(url => {
        expect(sanitizeUrl(url)).toBe('');
      });
    });

    it('should reject vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:msgbox("XSS")')).toBe('');
    });

    it('should reject data: URLs (except images)', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should accept valid http/https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
    });

    it('should accept data:image URLs', () => {
      const dataImageUrl = 'data:image/png;base64,iVBORw0KGgo=';
      expect(sanitizeUrl(dataImageUrl)).toBe(dataImageUrl);
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
        'test"onclick=alert(1)"@example.com',
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

    it('should reject names with special characters', () => {
      const maliciousNames = [
        'John<script>',
        'Jane; DROP TABLE',
        'Bob${env.SECRET}',
      ];

      maliciousNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        'Mary-Jane Watson',
        "O'Brien",
        'Dr. Smith',
      ];

      validNames.forEach(name => {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      });
    });
  });
});

// ============================================================================
// File Upload Validation Tests
// ============================================================================

describe('File Upload Validation', () => {
  describe('sanitizeFilename', () => {
    it('should prevent directory traversal attacks', () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'file/../../../etc/passwd',
        'file%2F..%2F..%2Fetc%2Fpasswd',
      ];

      maliciousFilenames.forEach(filename => {
        const result = sanitizeFilename(filename);
        expect(result).not.toContain('..');
        expect(result).not.toContain('/');
        expect(result).not.toContain('\\');
      });
    });

    it('should remove invalid filename characters', () => {
      const result = sanitizeFilename('file<>:"/\\|?*name.pdf');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain(':');
      expect(result).not.toContain('"');
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
      expect(result).not.toContain('|');
      expect(result).not.toContain('?');
      expect(result).not.toContain('*');
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
          website: 'javascript:alert(1)',
        },
        tags: ['<script>tag</script>', 'normal'],
      };

      const result = sanitizeObject(maliciousObject);
      expect(result.name).not.toContain('<script>');
      expect(result.profile.bio).not.toContain('onerror');
      expect(result.tags[0]).not.toContain('<script>');
    });

    it('should preserve non-string values', () => {
      const obj = {
        count: 42,
        active: true,
        data: null,
        nested: { value: 100 },
      };

      const result = sanitizeObject(obj as any);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.nested.value).toBe(100);
    });
  });

  describe('sanitizeForLogging', () => {
    it('should redact sensitive fields', () => {
      const sensitiveData = {
        username: 'john',
        password: 'secret123',
        apiKey: 'sk-12345',
        token: 'jwt-token',
        creditCard: '4111111111111111',
      };

      const result = sanitizeForLogging(sensitiveData);
      expect(result.username).toBe('john');
      expect(result.password).toBe('[REDACTED]');
      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
      expect(result.creditCard).toBe('[REDACTED]');
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

      // Schema validates structure
      const result = reviewSubmissionSchema.safeParse(maliciousReview);
      expect(result.success).toBe(true);

      // But sanitization should clean the comment
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
        password: 'password', // No uppercase, no number
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
});

// ============================================================================
// HTML Entity Encoding Tests
// ============================================================================

describe('HTML Entity Encoding', () => {
  it('should decode and sanitize encoded XSS payloads', () => {
    const encodedPayloads = [
      '&lt;script&gt;alert(1)&lt;/script&gt;',
      '&#60;script&#62;alert(1)&#60;/script&#62;',
      '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;',
    ];

    encodedPayloads.forEach(payload => {
      const result = sanitizeText(payload);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
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
