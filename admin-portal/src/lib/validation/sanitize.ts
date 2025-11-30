/**
 * Input Sanitization Utilities
 * 
 * Provides comprehensive sanitization for user-generated content
 * to prevent XSS attacks and other security vulnerabilities.
 */

import DOMPurify from 'isomorphic-dompurify';

// ============================================================================
// DOMPurify Configuration
// ============================================================================

/**
 * Strict configuration - removes all HTML tags
 */
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Basic configuration - allows basic formatting tags
 */
const BASIC_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Rich text configuration - allows more formatting
 */
const RICH_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  KEEP_CONTENT: true,
  ADD_ATTR: ['target'],
};

// ============================================================================
// Core Sanitization Functions
// ============================================================================

/**
 * Sanitizes user input by removing all HTML tags
 * Use for: names, notes, comments, search queries
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  
  // First, decode HTML entities to catch encoded attacks
  const decoded = decodeHTMLEntities(input);
  
  // Remove all HTML tags
  const sanitized = DOMPurify.sanitize(decoded, STRICT_CONFIG);
  
  // Additional cleanup
  return sanitized
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 10000); // Limit length
}

/**
 * Sanitizes text while preserving basic formatting
 * Use for: review comments, descriptions
 */
export function sanitizeBasicHtml(input: string | null | undefined): string {
  if (!input) return '';
  
  const decoded = decodeHTMLEntities(input);
  const sanitized = DOMPurify.sanitize(decoded, BASIC_CONFIG);
  
  return sanitized.trim().slice(0, 10000);
}

/**
 * Sanitizes rich text content
 * Use for: admin notes, detailed descriptions
 */
export function sanitizeRichHtml(input: string | null | undefined): string {
  if (!input) return '';
  
  const decoded = decodeHTMLEntities(input);
  const sanitized = DOMPurify.sanitize(decoded, RICH_CONFIG);
  
  return sanitized.trim().slice(0, 50000);
}

/**
 * Sanitizes email addresses
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .slice(0, 254);
}

/**
 * Sanitizes phone numbers
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return '';
  
  // Keep only digits, plus sign, spaces, and dashes
  return input
    .replace(/[^\d+\s\-()]/g, '')
    .trim()
    .slice(0, 20);
}

/**
 * Sanitizes URLs
 */
export function sanitizeUrl(input: string | null | undefined): string {
  if (!input) return '';
  
  const trimmed = input.trim();
  
  // Only allow http, https, and data URLs for images
  if (!/^(https?:\/\/|data:image\/)/.test(trimmed)) {
    return '';
  }
  
  // Remove javascript: and other dangerous protocols
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
    return '';
  }
  
  return trimmed.slice(0, 2048);
}

/**
 * Sanitizes file names
 */
export function sanitizeFilename(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid filename characters
    .replace(/\.\./g, '') // Prevent directory traversal
    .trim()
    .slice(0, 255);
}

// ============================================================================
// Specialized Sanitization Functions
// ============================================================================

/**
 * Sanitizes review comments
 * Removes HTML but preserves line breaks
 */
export function sanitizeReviewComment(input: string | null | undefined): string {
  if (!input) return '';
  
  const sanitized = sanitizeText(input);
  
  // Preserve intentional line breaks
  return sanitized
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .slice(0, 1000);
}

/**
 * Sanitizes appointment notes
 */
export function sanitizeAppointmentNotes(input: string | null | undefined): string {
  if (!input) return '';
  
  return sanitizeText(input).slice(0, 500);
}

/**
 * Sanitizes admin notes (allows basic formatting)
 */
export function sanitizeAdminNotes(input: string | null | undefined): string {
  if (!input) return '';
  
  return sanitizeBasicHtml(input).slice(0, 2000);
}

/**
 * Sanitizes search queries
 */
export function sanitizeSearchQuery(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/[<>'"`;]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/**
 * Sanitizes JSON data for logging
 * Removes sensitive fields and sanitizes values
 */
export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey', 'api_key',
    'authorization', 'cookie', 'session', 'creditCard',
    'cardNumber', 'cvv', 'ssn', 'socialSecurity'
  ];
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Mask sensitive fields
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// ============================================================================
// SQL/NoSQL Injection Prevention
// ============================================================================

/**
 * Escapes special characters that could be used in injection attacks
 * Note: Firestore handles this automatically, but this adds an extra layer
 */
export function escapeForQuery(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    .replace(/\$/g, '') // Remove MongoDB operators
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/\[/g, '')
    .replace(/\]/g, '')
    .trim();
}

// ============================================================================
// XSS Prevention Helpers
// ============================================================================

/**
 * Decodes HTML entities to catch encoded XSS attacks
 */
function decodeHTMLEntities(input: string): string {
  const entities: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
  };
  
  let decoded = input;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char);
  }
  
  // Handle numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return decoded;
}

/**
 * Checks if input contains potential XSS patterns
 */
export function containsXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /data:\s*text\/html/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*['"]?\s*javascript:/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Checks if input contains potential SQL injection patterns
 */
export function containsSQLInjectionPatterns(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
    /--/g,
    /;.*$/g,
    /\/\*.*\*\//g,
    /'\s*OR\s*'1'\s*=\s*'1/gi,
    /'\s*OR\s*1\s*=\s*1/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// ============================================================================
// Batch Sanitization
// ============================================================================

/**
 * Sanitizes an object's string values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    maxDepth?: number;
    currentDepth?: number;
    excludeKeys?: string[];
  } = {}
): T {
  const { maxDepth = 10, currentDepth = 0, excludeKeys = [] } = options;
  
  if (currentDepth >= maxDepth) {
    return obj;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (excludeKeys.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeText(item) 
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>, { ...options, currentDepth: currentDepth + 1 })
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, { ...options, currentDepth: currentDepth + 1 });
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// ============================================================================
// Export Default Sanitizer
// ============================================================================

export const sanitizer = {
  text: sanitizeText,
  basicHtml: sanitizeBasicHtml,
  richHtml: sanitizeRichHtml,
  email: sanitizeEmail,
  phone: sanitizePhone,
  url: sanitizeUrl,
  filename: sanitizeFilename,
  reviewComment: sanitizeReviewComment,
  appointmentNotes: sanitizeAppointmentNotes,
  adminNotes: sanitizeAdminNotes,
  searchQuery: sanitizeSearchQuery,
  forLogging: sanitizeForLogging,
  forQuery: escapeForQuery,
  object: sanitizeObject,
  containsXSS: containsXSSPatterns,
  containsSQLInjection: containsSQLInjectionPatterns,
};

export default sanitizer;
