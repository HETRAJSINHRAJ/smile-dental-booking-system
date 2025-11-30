/**
 * Validation Module Index
 * 
 * Exports all validation schemas, sanitization utilities, and CSRF protection.
 */

// Zod Schemas
export * from './schemas';

// Sanitization Utilities
export * from './sanitize';
export { default as sanitizer } from './sanitize';

// CSRF Protection
export * from './csrf';
export { default as csrf } from './csrf';

// Phone Validation
export * from './phone';

// Address Validation
export * from './address';

// Indian Names Validation
export * from './indianNames';
