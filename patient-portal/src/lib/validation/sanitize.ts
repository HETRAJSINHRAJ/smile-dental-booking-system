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
  email: sanitizeEmail,
  phone: sanitizePhone,
  url: sanitizeUrl,
  reviewComment: sanitizeReviewComment,
  appointmentNotes: sanitizeAppointmentNotes,
  searchQuery: sanitizeSearchQuery,
  forLogging: sanitizeForLogging,
  object: sanitizeObject,
  containsXSS: containsXSSPatterns,
};

export default sanitizer;
